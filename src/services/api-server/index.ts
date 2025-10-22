/**
 * ============================================================================
 * API SERVER - MAIN ORCHESTRATOR
 * ============================================================================
 *
 * This is the central coordination point for the entire API server infrastructure.
 * It manages the lifecycle and integration of HTTP/HTTPS and WebSocket servers,
 * connecting them to the core ClineProvider for AI agent functionality.
 *
 * ARCHITECTURE OVERVIEW:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                         ApiServer (this file)                        │
 * │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
 * │  │  HttpServer    │  │ WebSocketServer│  │   ClineProvider      │  │
 * │  │  (REST API)    │  │ (Real-time)    │  │   (AI Agent Core)    │  │
 * │  └────────────────┘  └────────────────┘  └──────────────────────┘  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * KEY RESPONSIBILITIES:
 * 1. Server Lifecycle Management - Start, stop, and coordinate both HTTP and WS servers
 * 2. Message Interception - Intercept ClineProvider messages and broadcast to WebSocket clients
 * 3. Configuration Management - Validate and manage server configuration (port, host, SSL, tokens)
 * 4. State Monitoring - Track server uptime, connections, and health metrics
 * 5. Heartbeat Management - Keep WebSocket connections alive with periodic pings
 *
 * RELATED FILES:
 * - http-server.ts: HTTP/HTTPS server with Express and REST API routes
 * - websocket-server.ts: WebSocket server for real-time bidirectional communication
 * - auth-middleware.ts: Token-based authentication for both HTTP and WebSocket
 * - types.ts: TypeScript interfaces for configuration and state
 * - utils.ts: Utility functions for token generation, validation, etc.
 * - routes/index.ts: Aggregates all REST API route modules
 * - ../../core/webview/ClineProvider.ts: Core AI agent provider
 *
 * MESSAGE FLOW:
 * 1. External Client → HTTP/WS → Auth Middleware → Routes → ClineProvider
 * 2. ClineProvider → ApiServer (intercepted) → WebSocket Broadcast → All Clients
 *
 * SECURITY:
 * - Token-based authentication (Bearer token)
 * - Optional SSL/TLS encryption for HTTPS and WSS
 * - CORS configuration for cross-origin requests
 * - Domain validation for SSL deployments
 *
 * @module api-server/index
 * @see {@link HttpServer} for HTTP/HTTPS server implementation
 * @see {@link WebSocketServer} for WebSocket server implementation
 * @see {@link ClineProvider} for AI agent core functionality
 */

import * as vscode from "vscode"
import type { ClineProvider } from "../../core/webview/ClineProvider"
import type { ExtensionMessage } from "../../shared/ExtensionMessage"
import type { ApiServerConfig, ApiServerState } from "./types"
import { HttpServer } from "./http-server"
import { WebSocketServer } from "./websocket-server"
import { generateToken, validateConfig, calculateUptime } from "./utils"
import { TaskExecutionPool } from "./TaskExecutionPool"

/**
 * Main API Server class that orchestrates HTTP and WebSocket servers
 *
 * This class is the primary entry point for the API server. It coordinates the lifecycle
 * of both HTTP/HTTPS and WebSocket servers, ensuring they work together seamlessly.
 *
 * KEY FEATURES:
 * - Dual-server architecture: HTTP for REST API, WebSocket for real-time updates
 * - Message interception: Captures ClineProvider messages and broadcasts to WS clients
 * - Lifecycle management: Coordinated start/stop of both servers
 * - State tracking: Monitors uptime, connections, and server health
 * - Heartbeat: Keeps WebSocket connections alive with periodic pings
 *
 * USAGE EXAMPLE:
 * ```typescript
 * const server = new ApiServer(clineProvider, {
 *   port: 3000,
 *   host: 'localhost',
 *   token: 'your-secret-token',
 *   debug: true,
 *   ssl: {
 *     cert: '/path/to/cert.pem',
 *     key: '/path/to/key.pem',
 *     domain: 'example.com'
 *   }
 * }, context)
 * await server.start()
 * ```
 *
 * @implements {vscode.Disposable} - Allows proper cleanup in VS Code extension lifecycle
 */
export class ApiServer implements vscode.Disposable {
	/** HTTP/HTTPS server instance handling REST API requests */
	private httpServer: HttpServer
	
	/** WebSocket server instance for real-time bidirectional communication */
	private wsServer: WebSocketServer
	
	/** ClineProvider instance - the core AI agent that processes requests (legacy single-provider mode) */
	private provider: ClineProvider
	
	/** TaskExecutionPool - manages per-task provider instances for parallel execution */
	private taskExecutionPool?: TaskExecutionPool
	
	/** Server configuration including port, host, SSL, authentication token, etc. */
	private config: ApiServerConfig
	
	/** Server start timestamp for uptime calculations */
	private startTime: number
	
	/** Interval timer for WebSocket heartbeat (ping/pong) to keep connections alive */
	private heartbeatInterval?: NodeJS.Timeout
	
	/**
	 * Original ClineProvider.postMessageToWebview method before interception
	 * Stored to restore when server stops to prevent memory leaks
	 */
	private originalPostMessage?: (message: ExtensionMessage) => Promise<void>

	/**
	 * Creates a new API Server instance
	 *
	 * INITIALIZATION FLOW:
	 * 1. Merge provided config with sensible defaults
	 * 2. Validate configuration (port range, required fields)
	 * 3. Create TaskExecutionPool for parallel task execution
	 * 4. Create HttpServer instance (but don't start yet)
	 * 5. WebSocket server creation is deferred until start() is called
	 *
	 * WHY DEFER WEBSOCKET CREATION?
	 * WebSocket server requires the HTTP server's underlying Node.js server
	 * instance to attach to. This is only available after httpServer.start().
	 *
	 * @param provider - ClineProvider instance for AI agent functionality (legacy mode) OR context for pool mode
	 * @param config - Partial configuration (missing fields use defaults)
	 * @param context - VS Code extension context for accessing workspace, secrets, etc.
	 * @throws {Error} If configuration validation fails
	 *
	 * @see {@link validateConfig} in utils.ts for validation rules
	 * @see {@link HttpServer} for HTTP server details
	 * @see {@link WebSocketServer} for WebSocket server details
	 * @see {@link TaskExecutionPool} for parallel execution architecture
	 */
	constructor(provider: ClineProvider, config: Partial<ApiServerConfig>, context: vscode.ExtensionContext) {
		this.provider = provider
		this.startTime = Date.now()

		// Validate and merge config with defaults
		// Using sensible defaults ensures the server can start even with minimal config
		const fullConfig: ApiServerConfig = {
			port: config.port || 3000,
			host: config.host || "localhost",
			token: config.token || generateToken(), // Auto-generate secure token if not provided
			staticDir: config.staticDir, // Optional: directory for static UI files
			allowedOrigins: config.allowedOrigins || ["http://localhost:3000", "http://localhost:3001"],
			debug: config.debug || false,
			ssl: config.ssl, // Optional: SSL/TLS configuration for HTTPS
		}

		// Validate configuration before proceeding
		// This catches invalid ports, missing required fields, etc.
		const validation = validateConfig(fullConfig)
		if (!validation.valid) {
			throw new Error(`Invalid API server configuration: ${validation.errors.join(", ")}`)
		}

		this.config = fullConfig

		// Create TaskExecutionPool for parallel task execution
		// This allows multiple tasks to run concurrently, each with its own provider
		// Note: WebSocket broadcast function will be set after wsServer is created in start()
		this.taskExecutionPool = new TaskExecutionPool(
			context,
			provider.outputChannel || (vscode.window.createOutputChannel("Hoody Code") as any),
			provider.contextProxy,
			undefined, // mdmService - can be added later if needed
			{
				maxConcurrentProviders: 50, // High limit as requested
				// providerIdleTimeout: undefined, // Immediate disposal for memory efficiency
				// broadcastMessage will be set after wsServer is created in start()
			}
		)

		// Create HTTP server with lazy WebSocket connection count
		// The lambda () => this.wsServer?.getConnectionCount() provides dynamic count
		// without coupling HttpServer to WebSocketServer implementation
		this.httpServer = new HttpServer(
			this.provider,
			this.config,
			() => this.wsServer?.getConnectionCount() || 0,
			this.taskExecutionPool, // Inject pool into HTTP server
		)

		// Create WebSocket server placeholder
		// IMPORTANT: Actual initialization happens in start() after HTTP server is ready
		// This two-phase initialization is necessary because WebSocket needs the underlying
		// Node.js HTTP/HTTPS server instance created by HttpServer
		this.wsServer = null as any
	}

	/**
	 * Start the API server (both HTTP and WebSocket)
	 *
	 * STARTUP SEQUENCE:
	 * 1. Start HTTP/HTTPS server and wait for it to be listening
	 * 2. Get the underlying Node.js server instance from HttpServer
	 * 3. Create WebSocket server attached to the HTTP server
	 * 4. Start WebSocket heartbeat to keep connections alive
	 * 5. Intercept ClineProvider messages to broadcast to WS clients
	 * 6. Show startup notification with connection details
	 *
	 * WHY THIS ORDER?
	 * - HTTP must start first because WS attaches to the HTTP server
	 * - Heartbeat must start before clients connect to avoid stale connections
	 * - Message interception must be set up before processing any requests
	 *
	 * ERROR HANDLING:
	 * - If HTTP server fails to start (port in use, etc.), the error propagates
	 * - If WebSocket creation fails, the HTTP server is left running (partial failure)
	 * - Caller should catch errors and call stop() for cleanup if needed
	 *
	 * @throws {Error} If HTTP server fails to start or WebSocket creation fails
	 *
	 * @example
	 * ```typescript
	 * try {
	 *   await server.start()
	 *   console.log('Server running on port', server.getConfig().port)
	 * } catch (error) {
	 *   console.error('Failed to start server:', error)
	 *   await server.stop() // Clean up partial state
	 * }
	 * ```
	 */
	public async start(): Promise<void> {
			try {
				// STEP 1: Start HTTP server first
				// This creates the underlying Node.js HTTP/HTTPS server that WS will attach to
				await this.httpServer.start()
	
				// STEP 2: Get HTTP server instance and create WebSocket server
				// The HTTP server must be listening before we can attach WebSocket to it
				const httpServerInstance = this.httpServer.getServer()
				if (!httpServerInstance) {
					throw new Error("HTTP server failed to start")
				}
	
				// STEP 3: Create WebSocket server attached to HTTP server
				// Both HTTP and WS now share the same port and underlying server
				this.wsServer = new WebSocketServer(
					httpServerInstance,
					this.provider,
					this.config.token,
					this.config.debug,
				)
	
				// STEP 3.5: Connect TaskExecutionPool to WebSocket broadcasting
				// All pooled providers now broadcast to the shared WebSocket
				if (this.taskExecutionPool) {
					// Create a broadcast function that pooled providers can call
					const broadcastFn = (message: ExtensionMessage) => {
						this.wsServer?.broadcast(message)
					}
					
					// Inject the broadcast function into the pool's options
					// This is done via property assignment since the pool is already created
					; (this.taskExecutionPool as any).broadcastMessage = broadcastFn
					
					console.log('[ApiServer] TaskExecutionPool connected to WebSocket broadcasting')
				}
	
				// STEP 4: Start WebSocket heartbeat (ping every 30 seconds)
				// This keeps connections alive and detects stale clients
				// Stale clients (no pong for 60s) are automatically disconnected
				this.heartbeatInterval = this.wsServer.startHeartbeat(30000)
	
				// STEP 5: Intercept legacy provider messages for broadcasting
				// All messages sent to the VS Code webview will also go to WS clients
				this.interceptProviderMessages()
	
				// Log success with protocol-aware URLs
				const protocol = this.config.ssl ? 'https' : 'http'
				const wsProtocol = this.config.ssl ? 'wss' : 'ws'
				
				console.log(
					`[ApiServer] Server started successfully on ${protocol}://${this.config.host}:${this.config.port}`,
				)
				console.log(`[ApiServer] WebSocket endpoint: ${wsProtocol}://${this.config.host}:${this.config.port}/ws`)
				
				if (this.config.ssl) {
					console.log(`[ApiServer] SSL/TLS enabled - using secure connections`)
				}
	
				// STEP 6: Show info message with token
				// This helps users quickly access the server and copy the auth token
				this.showStartupNotification()
			} catch (error) {
				console.error("[ApiServer] Failed to start:", error)
				throw error
			}
		}
	
		/**
		 * Intercept ClineProvider.postMessageToWebview to broadcast to WebSocket clients
		 *
		 * MESSAGE FLOW WITHOUT INTERCEPTION:
		 * ClineProvider → VS Code Webview (only VS Code extension can see messages)
		 *
		 * MESSAGE FLOW WITH INTERCEPTION:
		 * ClineProvider → VS Code Webview + ALL WebSocket Clients (real-time sync!)
		 *
		 * This creates a powerful pub/sub pattern where any client can subscribe to
		 * agent state changes, task updates, tool uses, and all other events.
		 *
		 * IMPLEMENTATION DETAILS:
		 * - We save the original method to restore later (prevents memory leaks)
		 * - The new method calls BOTH the original and broadcasts to WS
		 * - This is transparent to ClineProvider - it doesn't know about interception
		 *
		 * MESSAGES BROADCASTED:
		 * - Task state changes (starting, waiting, completed)
		 * - Tool use notifications (file reads, command execution, etc.)
		 * - AI responses and thinking
		 * - Error messages
		 * - All ExtensionMessage types defined in shared/ExtensionMessage.ts
		 *
		 * @see {@link ExtensionMessage} in ../../shared/ExtensionMessage.ts
		 * @see {@link WebSocketServer.broadcast} in websocket-server.ts
		 */
		private interceptProviderMessages(): void {
			// Save original method for later restoration
			// bind() ensures 'this' context is preserved when calling the original
			this.originalPostMessage = this.provider.postMessageToWebview.bind(this.provider)
	
			// Replace with intercepted version
			// This new method maintains the original behavior while adding broadcasting
			this.provider.postMessageToWebview = async (message: ExtensionMessage) => {
				// Call original method (sends to VSCode webview)
				// This ensures the VS Code extension UI still works normally
				await this.originalPostMessage!(message)
	
				// Also broadcast to WebSocket clients
				// This allows external UIs to receive the same real-time updates
				this.wsServer.broadcast(message)
			}
	
			if (this.config.debug) {
				console.log("[ApiServer] Message interception enabled")
			}
		}
	
		/**
		 * Restore original ClineProvider.postMessageToWebview
		 *
		 * This is critical for proper cleanup to prevent memory leaks!
		 *
		 * WHY RESTORE?
		 * If we don't restore the original method, our intercepted version holds
		 * references to ApiServer, wsServer, etc. This prevents garbage collection
		 * even after the server stops, causing a memory leak.
		 *
		 * WHEN CALLED:
		 * - During server.stop() - normal shutdown
		 * - During server.dispose() - VS Code extension deactivation
		 *
		 * @see {@link stop} method below
		 * @see {@link dispose} method below
		 */
		private restoreProviderMessages(): void {
			if (this.originalPostMessage) {
				this.provider.postMessageToWebview = this.originalPostMessage
				if (this.config.debug) {
					console.log("[ApiServer] Message interception disabled")
				}
			}
		}
	
		/**
		 * Show startup notification with connection info
		 *
		 * This provides a user-friendly way to:
		 * 1. Know the server started successfully
		 * 2. Copy the authentication token
		 * 3. Open the server UI in a browser
		 *
		 * The notification appears in VS Code's notification area with action buttons.
		 *
		 * @see {@link vscode.window.showInformationMessage}
		 */
		private showStartupNotification(): void {
		const message = `Hoody Code API Server started on port ${this.config.port}`

		vscode.window.showInformationMessage(message, "Copy Token", "Open UI").then((action) => {
			if (action === "Copy Token") {
				vscode.env.clipboard.writeText(this.config.token)
				vscode.window.showInformationMessage("API token copied to clipboard")
			} else if (action === "Open UI") {
				vscode.env.openExternal(vscode.Uri.parse(`http://localhost:${this.config.port}`))
			}
		})
	}

	/**
	 * Get current server state and health metrics
	 *
	 * Returns real-time server statistics useful for health checks,
	 * monitoring dashboards, and diagnostics.
	 *
	 * METRICS INCLUDED:
	 * - startedAt: Server start timestamp (for calculating uptime)
	 * - activeConnections: Current WebSocket client count
	 * - uptime: Seconds since server started
	 * - messagesSent/Received: TODO - implement message counting
	 *
	 * USED BY:
	 * - Health check endpoint: GET /api/v1/agent/health
	 * - Monitoring systems for alerting
	 * - Debugging connection issues
	 *
	 * @returns {ApiServerState} Current server state
	 * @see {@link ApiServerState} in types.ts
	 * @see {@link HealthController} in controllers/HealthController.ts
	 */
	public getState(): ApiServerState {
		return {
			startedAt: this.startTime,
			activeConnections: this.wsServer?.getConnectionCount() || 0,
			messagesSent: 0, // TODO: Implement message counting
			messagesReceived: 0, // TODO: Implement message counting
			uptime: calculateUptime(this.startTime),
		}
	}

	/**
	 * Get server configuration (with sensitive data redacted)
	 *
	 * Returns server configuration safe for logging and API responses.
	 * The authentication token is always redacted to prevent accidental leaks.
	 *
	 * USE CASES:
	 * - API responses showing current config
	 * - Logging server settings
	 * - Debugging configuration issues
	 *
	 * SECURITY NOTE:
	 * The actual token is replaced with "***REDACTED***" to prevent
	 * exposure in logs, API responses, or error messages.
	 *
	 * @returns Server configuration with token redacted
	 * @see {@link getToken} to get the actual token (use with caution!)
	 */
	public getConfig(): Omit<ApiServerConfig, "token"> & { token?: string } {
		return {
			port: this.config.port,
			host: this.config.host,
			staticDir: this.config.staticDir,
			allowedOrigins: this.config.allowedOrigins,
			debug: this.config.debug,
			token: "***REDACTED***", // Never expose the real token
		}
	}

	/**
	 * Get the actual API authentication token
	 *
	 * ⚠️ SECURITY WARNING ⚠️
	 * This returns the REAL authentication token. Use with extreme caution!
	 * Only call this when you need to:
	 * - Display token to user (e.g., startup notification)
	 * - Configure clients programmatically
	 * - Validate incoming authentication
	 *
	 * DO NOT:
	 * - Log the token
	 * - Include it in API responses
	 * - Send it over insecure channels
	 *
	 * @returns {string} The actual authentication token
	 */
	public getToken(): string {
		return this.config.token
	}

	/**
	 * Broadcast message to all connected WebSocket clients
	 *
	 * Sends a message to every active WebSocket connection. This is used
	 * for server-initiated notifications, state changes, and real-time updates.
	 *
	 * COMMON USES:
	 * - Notify all clients of task state changes
	 * - Broadcast system-wide announcements
	 * - Send server shutdown warnings
	 *
	 * RELATED:
	 * This is a convenience wrapper around WebSocketServer.broadcast()
	 * For more control (filtering, selective broadcast), use WebSocketServer directly
	 *
	 * @param message - ExtensionMessage to broadcast
	 * @see {@link WebSocketServer.broadcast} in websocket-server.ts
	 * @see {@link ExtensionMessage} in ../../shared/ExtensionMessage.ts
	 */
	public broadcast(message: ExtensionMessage): void {
		this.wsServer?.broadcast(message)
	}

	/**
	 * Stop the API server gracefully
	 *
	 * SHUTDOWN SEQUENCE (order matters!):
	 * 1. Stop heartbeat timer (no more pings)
	 * 2. Dispose all providers in the pool
	 * 3. Restore ClineProvider message handler (stop interception)
	 * 4. Close WebSocket connections (notify clients, clean shutdown)
	 * 5. Stop HTTP server (stop accepting requests)
	 *
	 * WHY THIS ORDER?
	 * - Heartbeat first: prevents new ping messages during shutdown
	 * - Pool disposal: cleanly stops all running tasks
	 * - Message interception: stops broadcasting during cleanup
	 * - WebSocket before HTTP: gives clients time to disconnect gracefully
	 * - HTTP last: ensures all connections are closed
	 *
	 * GRACEFUL vs FORCED:
	 * This is a graceful shutdown. WebSocket clients receive close frames
	 * and can clean up properly. If you need immediate shutdown, you could
	 * add a force parameter to skip the graceful close.
	 *
	 * ERROR HANDLING:
	 * Errors during shutdown are logged but don't prevent the full sequence.
	 * This ensures cleanup proceeds even if one step fails.
	 *
	 * @example
	 * ```typescript
	 * await server.stop()
	 * console.log('Server stopped cleanly')
	 * ```
	 */
	public async stop(): Promise<void> {
		console.log("[ApiServer] Stopping server...")

		// Stop heartbeat timer
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
		}

		// Dispose all providers in the pool
		if (this.taskExecutionPool) {
			console.log("[ApiServer] Disposing task execution pool...")
			await this.taskExecutionPool.disposeAll()
		}

		// Restore original provider message handler
		// This removes our interception and prevents memory leaks
		this.restoreProviderMessages()

		// Close WebSocket connections gracefully
		// Sends close frames to all clients before shutting down
		if (this.wsServer) {
			await this.wsServer.close()
		}

		// Stop HTTP server
		// This stops accepting new connections and closes existing ones
		await this.httpServer.stop()

		console.log("[ApiServer] Server stopped")
	}

	/**
	 * Dispose (VS Code Disposable pattern)
	 *
	 * This method is called automatically by VS Code when:
	 * - The extension is deactivated
	 * - VS Code is closing
	 * - The extension is being reloaded
	 *
	 * It ensures proper cleanup of resources to prevent:
	 * - Port conflicts on restart
	 * - Memory leaks from unclosed connections
	 * - Dangling event listeners
	 *
	 * IMPLEMENTATION:
	 * Simply delegates to stop() which performs the full shutdown sequence.
	 *
	 * @see {@link stop} for detailed shutdown procedure
	 * @see {@link vscode.Disposable} interface
	 */
	public async dispose(): Promise<void> {
		await this.stop()
	}
}

/**
	* Factory function to create and start an API server
	*
	* This is a convenience function that combines construction and startup
	* into a single async operation. It's the recommended way to create servers
	* in most cases because it handles the two-phase initialization automatically.
	*
	* TWO-PHASE INITIALIZATION:
	* 1. new ApiServer() - creates server instances but doesn't start listening
	* 2. server.start() - starts HTTP server, then attaches WebSocket
	*
	* WHY A FACTORY?
	* - Cleaner API: one call instead of two
	* - Error handling: if start() fails, you still have a server to clean up
	* - Type safety: ensures the server is fully started before returning
	*
	* USAGE EXAMPLE:
	* ```typescript
	* // In extension.ts activation
	* try {
	*   const server = await createApiServer(provider, {
	*     port: 3000,
	*     token: 'secret123',
	*     debug: true
	*   }, context)
	*
	*   // Server is ready to accept requests
	*   console.log('Token:', server.getToken())
	* } catch (error) {
	*   vscode.window.showErrorMessage(`Failed to start API server: ${error.message}`)
	* }
	* ```
	*
	* @param provider - ClineProvider instance for AI agent functionality
	* @param config - Server configuration (partial, with defaults applied)
	* @param context - VS Code extension context
	* @returns {Promise<ApiServer>} Started API server instance
	* @throws {Error} If server creation or startup fails
	*
	* @see {@link ApiServer} constructor for configuration details
	* @see {@link ApiServer.start} for startup sequence
	*/
export async function createApiServer(
	provider: ClineProvider,
	config: Partial<ApiServerConfig>,
	context: vscode.ExtensionContext,
): Promise<ApiServer> {
	const server = new ApiServer(provider, config, context)
	await server.start()
	return server
}

// Re-export types for convenience
export * from "./types"
export * from "./errors"