/**
 * ============================================================================
 * HTTP/HTTPS SERVER WITH EXPRESS
 * ============================================================================
 *
 * This module implements the HTTP/HTTPS server using Express.js. It handles:
 * - REST API endpoint routing
 * - Request/response middleware pipeline
 * - SSL/TLS encryption for secure connections
 * - CORS (Cross-Origin Resource Sharing) configuration
 * - Authentication and error handling
 * - Static file serving for standalone UIs
 *
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                         HTTP Server                                  │
 * │                                                                       │
 * │  Request Flow (top to bottom):                                       │
 * │  1. Domain Validation (SSL only)                                     │
 * │  2. CORS Headers                                                     │
 * │  3. Body Parsers (JSON, URL-encoded)                                 │
 * │  4. Request Logging (debug mode)                                     │
 * │  5. Authentication (Bearer token)                                    │
 * │  6. Static Files (optional)                                          │
 * │  7. API Routes (/api/v1/*)                                          │
 * │  8. 404 Handler                                                      │
 * │  9. Error Handler (catches all errors)                               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * MIDDLEWARE ORDER:
 * The order of middleware registration is CRITICAL! Middleware executes in
 * the order it's registered. For example, CORS must come before body parsers,
 * and authentication must come before routes.
 *
 * SSL/TLS SUPPORT:
 * When SSL configuration is provided, the server creates an HTTPS server
 * instead of HTTP. This enables:
 * - Encrypted connections (WSS for WebSocket)
 * - Domain validation (enforces Host header)
 * - Certificate-based authentication
 *
 * CORS HANDLING:
 * We use manual CORS headers instead of the cors package for better control.
 * This allows us to:
 * - Support all origins while logging them
 * - Handle preflight OPTIONS requests correctly
 * - Add diagnostic headers for troubleshooting
 *
 * RELATED FILES:
 * - auth-middleware.ts: Token-based authentication
 * - routes/index.ts: API route aggregator
 * - error-handler.ts: Global error handling
 * - websocket-server.ts: WebSocket server (shares this HTTP server)
 * - types.ts: TypeScript interfaces
 * - ../../core/webview/ClineProvider.ts: AI agent provider
 *
 * @module api-server/http-server
 * @see {@link createAuthMiddleware} in auth-middleware.ts
 * @see {@link createApiRoutes} in routes/index.ts
 * @see {@link errorHandler} in error-handler.ts
 */

import express from "express"
import type { Express, Request, Response, NextFunction } from "express"
import * as http from "http"
import * as https from "https"
import * as fs from "fs"
import cors from "cors"
import type { ClineProvider } from "../../core/webview/ClineProvider"
import type { ApiServerConfig } from "./types"
import { createAuthMiddleware } from "./auth-middleware"
import { createApiRoutes } from "./routes"
import { errorHandler } from "./error-handler"
import { isOriginAllowed } from "./utils"
import type { TaskExecutionPool } from "./TaskExecutionPool"

/**
 * HTTP/HTTPS Server class using Express
 *
 * This class encapsulates the entire Express application and Node.js HTTP/HTTPS
 * server. It manages the middleware pipeline, route registration, and server lifecycle.
 *
 * DUAL-MODE OPERATION:
 * - HTTP Mode: Standard unencrypted HTTP server (for local development)
 * - HTTPS Mode: SSL/TLS encrypted server (for production deployment)
 *
 * The mode is determined by the presence of config.ssl at construction time.
 *
 * MIDDLEWARE PIPELINE:
 * All requests flow through these layers in order:
 * 1. Domain validation (HTTPS only) - rejects wrong domains
 * 2. CORS headers - allows cross-origin requests
 * 3. Body parsers - parse JSON and form data
 * 4. Request logging - debug mode only
 * 5. Authentication - validates Bearer token
 * 6. Static files - serves UI files if configured
 * 7. API routes - handles /api/v1/* endpoints
 * 8. 404 handler - catches unmatched routes
 * 9. Error handler - converts errors to JSON responses
 *
 * WEBSOCKET INTEGRATION:
 * The underlying Node.js HTTP/HTTPS server is exposed via getServer() so the
 * WebSocketServer can attach to it. This allows both HTTP and WS to share the
 * same port and SSL certificate.
 *
 * @see {@link ApiServerConfig} in types.ts for configuration options
 */
export class HttpServer {
	/** Express application instance with all middleware and routes */
	private app: Express
	
	/** Underlying Node.js HTTP or HTTPS server */
	private server?: http.Server | https.Server
	
	/** Server configuration including port, host, SSL, etc. */
	private config: ApiServerConfig
	
	/** ClineProvider instance for AI agent functionality (legacy single-provider mode) */
	private provider: ClineProvider
	
	/** TaskExecutionPool for parallel task execution */
	private taskExecutionPool?: TaskExecutionPool
	
	/** Server start timestamp for uptime tracking */
	private startTime: number
	
	/** Whether this server is running in HTTPS mode */
	private isHttps: boolean

	/**
	 * Create a new HTTP/HTTPS server instance
	 *
	 * INITIALIZATION FLOW:
	 * 1. Store configuration and dependencies
	 * 2. Create Express app
	 * 3. Set up middleware pipeline (order matters!)
	 * 4. Register API routes
	 * 5. Set up error handling (must be last)
	 *
	 * NOTE: Server is NOT started in constructor. Call start() to begin listening.
	 *
	 * @param provider - ClineProvider for accessing AI agent functionality (legacy mode)
	 * @param config - Server configuration (port, host, SSL, etc.)
	 * @param getConnectionCount - Function to get current WebSocket connection count
	 * @param taskExecutionPool - Optional pool for parallel task execution
	 *
	 * @see {@link setupMiddleware} for middleware pipeline details
	 * @see {@link setupRoutes} for route registration
	 * @see {@link start} to actually start the server
	 */
	constructor(
		provider: ClineProvider,
		config: ApiServerConfig,
		getConnectionCount: () => number,
		taskExecutionPool?: TaskExecutionPool
	) {
		this.provider = provider
		this.config = config
		this.taskExecutionPool = taskExecutionPool
		this.startTime = Date.now()
		this.isHttps = !!config.ssl
		this.app = express()

		// Debug: Log SSL config for troubleshooting
		console.log('[HttpServer] Constructor - SSL config:', config.ssl ? 'PROVIDED' : 'NOT PROVIDED')
		if (config.ssl) {
			console.log('[HttpServer] SSL cert path:', config.ssl.cert)
			console.log('[HttpServer] SSL key path:', config.ssl.key)
		}

		// Set up Express middleware, routes, and error handling
		// ORDER MATTERS! Each method must be called in this specific sequence
		this.setupMiddleware(getConnectionCount)
		this.setupRoutes(getConnectionCount)
		this.setupErrorHandling()
	}

	/**
	 * Set up Express middleware pipeline
	 *
	 * This method configures all Express middleware in the correct order.
	 * The order is CRITICAL - changing it can break functionality!
	 *
	 * MIDDLEWARE EXECUTION ORDER:
	 * 1. Security headers (X-Powered-By disabled)
	 * 2. Domain validation (HTTPS only) - MUST be before CORS
	 * 3. CORS headers - MUST be before body parsers
	 * 4. Body parsers (JSON, URL-encoded)
	 * 5. Request/response logging (debug mode)
	 * 6. Authentication (Bearer token)
	 * 7. Static files (if configured)
	 *
	 * WHY THIS ORDER?
	 * - Domain validation first: reject wrong domains before any processing
	 * - CORS before parsers: ensure preflight requests work
	 * - Parsers before routes: routes need parsed body data
	 * - Auth before routes: protect all endpoints
	 * - Static files last: don't interfere with API routes
	 *
	 * SECURITY CONSIDERATIONS:
	 * - X-Powered-By disabled: prevents server fingerprinting
	 * - Domain validation: prevents DNS rebinding attacks
	 * - CORS configured: prevents unauthorized cross-origin access
	 * - Auth required: all endpoints protected except health check
	 *
	 * @param getConnectionCount - Function to get WebSocket connection count for logging
	 *
	 * @see {@link createAuthMiddleware} in auth-middleware.ts
	 * @see {@link isOriginAllowed} in utils.ts
	 */
	private setupMiddleware(getConnectionCount: () => number): void {
		// =====================================================================
		// 1. SECURITY HEADERS
		// =====================================================================
		
		// Disable X-Powered-By header to prevent server fingerprinting
		// Without this, Express sends "X-Powered-By: Express" which helps attackers
		this.app.disable('x-powered-by')
		
		// =====================================================================
		// 2. DOMAIN ENFORCEMENT (HTTPS ONLY)
		// =====================================================================
		
		// Domain enforcement for HTTPS (MUST be first - before CORS)
		// This prevents DNS rebinding attacks and ensures clients connect to the right domain
		if (this.config.ssl?.domain) {
			const requiredDomain = this.config.ssl.domain
			this.app.use((req: Request, res: Response, next: NextFunction) => {
				const host = req.headers.host
				
				// Extract hostname (remove port if present)
				const hostname = host?.split(':')[0]
				
				if (!hostname || hostname !== requiredDomain) {
					console.log(`[HTTPS] Domain validation failed - Expected: ${requiredDomain}, Got: ${hostname || 'none'}`)
					res.status(421).json({
						error: 'Misdirected Request',
						message: `This server only accepts requests for domain: ${requiredDomain}`,
						code: 'DOMAIN_MISMATCH',
						expected: requiredDomain,
						received: hostname || null
					})
					return
				}
				
				next()
			})
		}
		
		// =====================================================================
		// 3. CORS (CROSS-ORIGIN RESOURCE SHARING)
		// =====================================================================
		
		// Manual CORS handler - MUST come before body parsers
		// We handle CORS manually instead of using the cors package for better control
		// and troubleshooting capabilities (diagnostic headers, detailed logging)
		this.app.use((req: Request, res: Response, next: NextFunction) => {
			const origin = req.headers.origin
			const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
			
			// Log OPTIONS requests for debugging
			if (req.method === 'OPTIONS') {
				console.log(`[CORS] OPTIONS ${req.path} from ${clientIp} - Origin: ${origin || 'none'}`)
			}
			
			// Set CORS headers for all requests
			if (origin) {
				res.setHeader('Access-Control-Allow-Origin', origin)
			} else {
				res.setHeader('Access-Control-Allow-Origin', '*')
			}
			
			res.setHeader('Access-Control-Allow-Credentials', 'true')
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
			res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization')
			res.setHeader('Vary', 'Origin')
			
			// Diagnostic header to prove our code is running
			res.setHeader('X-Hoodycode-CORS', 'v4.103.52-manual')
			
			// Handle OPTIONS preflight
			if (req.method === 'OPTIONS') {
				console.log(`[CORS] Responding to OPTIONS with headers - Origin: ${origin || '*'}`)
				res.status(204).end()
				return
			}
			
			next()
		})

		// =====================================================================
		// 4. BODY PARSERS
		// =====================================================================
		
		// Parse JSON request bodies (up to 50MB for large file operations)
		// This middleware makes req.body available as a JavaScript object
		this.app.use(express.json({ limit: "50mb" }))
		
		// Parse URL-encoded form data (also 50MB limit)
		// extended: true allows nested objects in form data
		this.app.use(express.urlencoded({ extended: true, limit: "50mb" }))

		// =====================================================================
		// 5. REQUEST/RESPONSE LOGGING (DEBUG MODE ONLY)
		// =====================================================================
		
		// Enhanced request/response logging for debugging
		// Logs complete request details including headers, body, and response timing
		if (this.config.debug) {
			this.app.use((req: Request, res: Response, next: NextFunction) => {
				const startTime = Date.now()
				const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
				
				// Use process.stdout.write to bypass console interception
				const log = (msg: string) => process.stdout.write(msg + '\n')
				
				// Log incoming request
				log('\n' + '='.repeat(80))
				log(`[HTTP Request] ${req.method} ${req.path}`)
				log(`[Client] ${clientIp}`)
				log(`[Origin] ${req.headers.origin || 'none'}`)
				log(`[User-Agent] ${req.headers['user-agent'] || 'none'}`)
				
				// Log query parameters
				if (Object.keys(req.query).length > 0) {
					log(`[Query] ${JSON.stringify(req.query)}`)
				}
				
				// Log request headers (excluding common ones)
				const relevantHeaders = { ...req.headers }
				delete relevantHeaders['user-agent']
				delete relevantHeaders['accept']
				delete relevantHeaders['accept-encoding']
				delete relevantHeaders['connection']
				delete relevantHeaders['host']
				if (Object.keys(relevantHeaders).length > 0) {
					log(`[Headers] ${JSON.stringify(relevantHeaders, null, 2)}`)
				}
				
				// Log request body (truncate if too large)
				if (req.body && Object.keys(req.body).length > 0) {
					const bodyStr = JSON.stringify(req.body, null, 2)
					if (bodyStr.length > 1000) {
						log(`[Body] ${bodyStr.substring(0, 1000)}... (truncated)`)
					} else {
						log(`[Body] ${bodyStr}`)
					}
				}
				
				// Capture response
				const originalSend = res.send
				const originalJson = res.json
				
				res.send = function(body: any) {
					const duration = Date.now() - startTime
					log(`[Response] Status: ${res.statusCode} | Duration: ${duration}ms`)
					
					// Log response body (truncate if too large)
					if (body) {
						const bodyStr = typeof body === 'string' ? body : JSON.stringify(body, null, 2)
						if (bodyStr.length > 1000) {
							log(`[Response Body] ${bodyStr.substring(0, 1000)}... (truncated)`)
						} else {
							log(`[Response Body] ${bodyStr}`)
						}
					}
					log('='.repeat(80) + '\n')
					
					return originalSend.call(this, body)
				}
				
				res.json = function(body: any) {
					const duration = Date.now() - startTime
					log(`[Response] Status: ${res.statusCode} | Duration: ${duration}ms`)
					log(`[Response Body] ${JSON.stringify(body, null, 2)}`)
					log('='.repeat(80) + '\n')
					
					return originalJson.call(this, body)
				}
				
				next()
			})
		}

		// =====================================================================
		// 6. AUTHENTICATION
		// =====================================================================
		
		// Authentication middleware (applied to all routes except public endpoints)
		// Validates Bearer token in Authorization header or token query parameter
		// Public endpoints (health, version, OpenAPI spec) bypass authentication
		this.app.use(createAuthMiddleware(this.config.token))

		// =====================================================================
		// 7. STATIC FILE SERVING (OPTIONAL)
		// =====================================================================
		
		// Static file serving (for standalone UI)
		// If staticDir is configured, serves files from that directory
		// This allows hosting a custom web UI without a separate web server
		if (this.config.staticDir) {
			this.app.use(express.static(this.config.staticDir))
		}
	}

	/**
	 * Set up API routes and fallback handlers
	 *
	 * ROUTE HIERARCHY:
	 * 1. /api/v1/* - All REST API endpoints (67 total)
	 * 2. / - Root path (serves index.html or API info)
	 * 3. * - 404 handler for unmatched routes
	 *
	 * API ROUTES:
	 * All API routes are mounted under /api/v1 prefix for versioning.
	 * The actual route definitions are in routes/index.ts which aggregates
	 * routes from multiple controller files.
	 *
	 * ROOT PATH BEHAVIOR:
	 * - If staticDir configured: serves index.html
	 * - Otherwise: returns JSON with API information
	 *
	 * 404 HANDLING:
	 * Any request that doesn't match a route gets a JSON 404 response,
	 * not an HTML error page. This is API-first design.
	 *
	 * @param getConnectionCount - Function to get WebSocket connection count
	 *
	 * @see {@link createApiRoutes} in routes/index.ts
	 */
	private setupRoutes(getConnectionCount: () => number): void {
		// Mount all API routes under /api/v1 prefix
		// This allows for API versioning (v1, v2, etc. in the future)
		this.app.use(
			"/api/v1",
			createApiRoutes(
				this.provider,
				this.startTime,
				getConnectionCount,
				this.config.port,
				this.taskExecutionPool // Pass pool to routes for controller injection
			)
		)

		// Root path handler - serves UI or API information
		this.app.get("/", (req: Request, res: Response) => {
			if (this.config.staticDir) {
				res.sendFile("index.html", { root: this.config.staticDir })
			} else {
				res.status(200).json({
					name: "Hoody Code API",
					version: "1.0.0",
					status: "running",
					endpoints: {
						health: "/api/v1/agent/health",
						version: "/api/v1/agent/version",
						openapi: "/api/v1/agent/openapi/spec.json",
						openapiCompressed: "/api/v1/agent/openapi/spec-compressed.json",
						profiles: "/api/v1/agent/profiles",
						state: "/api/v1/agent/state",
						settings: "/api/v1/agent/settings",
					},
				})
			}
		})

		// 404 handler
		this.app.use((req: Request, res: Response) => {
			res.status(404).json({
				error: "Not Found",
				message: `Cannot ${req.method} ${req.path}`,
				code: "NOT_FOUND",
			})
		})
	}

	/**
	 * Set up error handling middleware
	 *
	 * This MUST be the last middleware registered! Express error handlers
	 * only catch errors from middleware registered before them.
	 *
	 * ERROR HANDLING STRATEGY:
	 * - Use global error handler for consistent error responses
	 * - Convert all errors to appropriate HTTP status codes
	 * - Never leak 500 errors for client mistakes (validation, not found, etc.)
	 * - Log detailed errors server-side while sending safe messages to clients
	 *
	 * ERROR TYPES HANDLED:
	 * - ApiServerError (401, 404, 400, etc.) - our custom errors
	 * - Node.js errors (ENOENT, EACCES, etc.) - filesystem errors
	 * - TSOA validation errors - request validation failures
	 * - Generic Error objects - unexpected errors
	 * - Non-Error throws - catch-all for any thrown value
	 *
	 * WHY LAST?
	 * Error handlers in Express use 4 parameters (err, req, res, next).
	 * They only catch errors from middleware registered BEFORE them.
	 * If you register this too early, errors from routes won't be caught.
	 *
	 * @see {@link errorHandler} in error-handler.ts for implementation
	 * @see {@link ApiServerError} in errors.ts for custom error types
	 */
	private setupErrorHandling(): void {
		// Use the comprehensive error handler that converts all errors to JSON responses
		// This ensures consistent error format: { error, message, code, statusCode }
		this.app.use(errorHandler)
	}

	/**
	 * Start the HTTP/HTTPS server and begin listening for requests
	 *
	 * STARTUP SEQUENCE:
	 * 1. Determine HTTP vs HTTPS mode based on SSL config
	 * 2. If HTTPS: Load SSL certificates from filesystem
	 * 3. Create Node.js HTTP/HTTPS server with Express app
	 * 4. Start listening on configured host and port
	 * 5. Set up error handlers (port in use, etc.)
	 *
	 * SSL/TLS SETUP:
	 * When SSL config is provided, this method:
	 * - Reads certificate files as Buffers (not strings!)
	 * - Creates HTTPS server with cert, key, and optional CA
	 * - Validates certificate files exist and are readable
	 * - Logs certificate paths for troubleshooting
	 *
	 * ERROR SCENARIOS:
	 * - Port already in use (EADDRINUSE)
	 * - Permission denied (EACCES) - need sudo for ports < 1024
	 * - Certificate files not found or unreadable
	 * - Invalid certificate format
	 *
	 * WEBSOCKET ATTACHMENT:
	 * After this method completes, getServer() returns the underlying
	 * Node.js server which WebSocketServer can attach to. Both HTTP and
	 * WebSocket then share the same port and SSL certificate.
	 *
	 * @returns {Promise<void>} Resolves when server is listening
	 * @throws {Error} If server fails to start or certificates are invalid
	 *
	 * @example
	 * ```typescript
	 * try {
	 *   await httpServer.start()
	 *   console.log('Server listening on port', config.port)
	 * } catch (error) {
	 *   if (error.code === 'EADDRINUSE') {
	 *     console.error('Port already in use!')
	 *   }
	 * }
	 * ```
	 *
	 * @see {@link getServer} to get the Node.js server for WebSocket
	 */
	public async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Create HTTPS server if SSL config provided
				console.log('[HttpServer] start() - Checking SSL config:', this.config.ssl ? 'EXISTS' : 'MISSING')
				
				if (this.config.ssl) {
					console.log('[HttpServer] Creating HTTPS server...')
					try {
						// Read certificates as buffers (not utf8 strings)
						// PEM files can contain binary data that shouldn't be decoded
						const sslOptions: https.ServerOptions = {
							cert: fs.readFileSync(this.config.ssl.cert),
							key: fs.readFileSync(this.config.ssl.key),
						}

						// Add CA certificate if provided
						if (this.config.ssl.ca) {
							sslOptions.ca = fs.readFileSync(this.config.ssl.ca)
						}

						this.server = https.createServer(sslOptions, this.app)
						console.log(`[HttpServer] ✅ HTTPS server created successfully`)
						console.log(`[HttpServer] SSL/TLS enabled`)
						console.log(`[HttpServer] Certificate: ${this.config.ssl.cert}`)
						console.log(`[HttpServer] Private key: ${this.config.ssl.key}`)
						if (this.config.ssl.ca) {
							console.log(`[HttpServer] CA certificate: ${this.config.ssl.ca}`)
						}
					} catch (error) {
						const err = error as Error
						console.error('[HttpServer] ❌ Failed to create HTTPS server:', err.message)
						reject(new Error(`Failed to load SSL certificates: ${err.message}`))
						return
					}
				} else {
					// Create regular HTTP server
					console.log('[HttpServer] Creating HTTP server (no SSL config)')
					this.server = http.createServer(this.app)
				}

				// Start listening
				this.server.listen(this.config.port, this.config.host, () => {
					const protocol = this.isHttps ? 'https' : 'http'
					console.log(`[HttpServer] Listening on ${protocol}://${this.config.host}:${this.config.port}`)
					resolve()
				})

				this.server.on("error", (error: NodeJS.ErrnoException) => {
					if (error.code === "EADDRINUSE") {
						reject(new Error(`Port ${this.config.port} is already in use`))
					} else {
						reject(error)
					}
				})
			} catch (error) {
				reject(error)
			}
		})
	}

	/**
	 * Stop the HTTP/HTTPS server gracefully
	 *
	 * SHUTDOWN SEQUENCE:
	 * 1. Check if server exists (might not if start() failed)
	 * 2. Call server.close() to stop accepting new connections
	 * 3. Wait for existing connections to finish
	 * 4. Resolve promise when fully stopped
	 *
	 * GRACEFUL vs FORCED:
	 * This is a graceful shutdown - it waits for in-flight requests to complete.
	 * Existing connections are allowed to finish, new ones are rejected.
	 *
	 * For immediate shutdown, you could:
	 * - Track all sockets and destroy them
	 * - Set a timeout and force-close after N seconds
	 * - Use server.closeAllConnections() (Node.js 18.2+)
	 *
	 * WEBSOCKET COORDINATION:
	 * If WebSocketServer is attached, it should be closed BEFORE calling
	 * this method. Otherwise, WebSocket connections will be abruptly terminated.
	 *
	 * @returns {Promise<void>} Resolves when server is fully stopped
	 *
	 * @see {@link ApiServer.stop} in index.ts for full shutdown sequence
	 */
	public async stop(): Promise<void> {
		if (!this.server) {
			return
		}

		return new Promise((resolve, reject) => {
			this.server!.close((error) => {
				if (error) {
					console.error("[HttpServer] Error closing server:", error)
					reject(error)
				} else {
					console.log("[HttpServer] Server closed")
					resolve()
				}
			})
		})
	}

	/**
	 * Get the underlying Node.js HTTP/HTTPS server instance
	 *
	 * This exposes the raw Node.js server so WebSocketServer can attach to it.
	 * Both HTTP and WebSocket can then share:
	 * - The same port
	 * - The same SSL certificate
	 * - The same network interface
	 *
	 * USAGE:
	 * ```typescript
	 * await httpServer.start()
	 * const nodeServer = httpServer.getServer()
	 * const wsServer = new WebSocketServer(nodeServer, ...)
	 * ```
	 *
	 * RETURNS:
	 * - http.Server if running in HTTP mode
	 * - https.Server if running in HTTPS mode
	 * - undefined if start() hasn't been called yet
	 *
	 * @returns {http.Server | https.Server | undefined} The Node.js server instance
	 *
	 * @see {@link WebSocketServer} constructor in websocket-server.ts
	 */
	public getServer(): http.Server | https.Server | undefined {
		return this.server
	}

	/**
	 * Check if server is using HTTPS (SSL/TLS encryption)
	 *
	 * Returns true if the server was created with SSL configuration,
	 * false for plain HTTP mode.
	 *
	 * USAGE:
	 * ```typescript
	 * const protocol = httpServer.isSecure() ? 'https' : 'http'
	 * console.log(`Server running on ${protocol}://...`)
	 * ```
	 *
	 * @returns {boolean} True if HTTPS, false if HTTP
	 */
	public isSecure(): boolean {
		return this.isHttps
	}

	/**
	 * Get the Express application instance
	 *
	 * Exposes the Express app for advanced use cases like:
	 * - Adding custom middleware after construction
	 * - Accessing Express settings
	 * - Testing (injecting test routes)
	 *
	 * CAUTION:
	 * Modifying the Express app after construction can break things!
	 * The middleware pipeline order is critical.
	 *
	 * @returns {Express} The Express application instance
	 */
	public getApp(): Express {
		return this.app
	}
}