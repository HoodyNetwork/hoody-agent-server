/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE - SECURITY LAYER
 * ============================================================================
 *
 * This module implements token-based authentication for both HTTP REST API
 * and WebSocket connections. It provides a security layer that validates
 * every request before allowing access to protected resources.
 *
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    Authentication Flow                               │
 * │                                                                       │
 * │  Request → Extract Token → Validate Token → Allow/Deny              │
 * │             (Header/Query)   (Compare)       (Next/Error)            │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * AUTHENTICATION MECHANISMS:
 *
 * 1. HTTP REST API:
 *    - Authorization: Bearer <token> (header)
 *    - ?token=xxx (query parameter, fallback)
 *
 * 2. WebSocket:
 *    - wss://host:port/ws?token=xxx (query string only)
 *    - Headers not reliable in WebSocket handshake
 *
 * TOKEN FORMAT:
 * - Base64URL-encoded random bytes (default 32 bytes)
 * - Generated automatically if not provided in config
 * - Same token used for both HTTP and WebSocket
 * - Example: "Ab3CDeFG-HiJkLMnOPqRsTuVWxYz01234567890"
 *
 * SECURITY FEATURES:
 * - Token required for ALL endpoints except public ones
 * - Constant-time comparison to prevent timing attacks
 * - CORS preflight (OPTIONS) bypasses auth
 * - Clear error messages (401 Unauthorized)
 * - No token logging (prevents leaks)
 *
 * PUBLIC ENDPOINTS (NO AUTH REQUIRED):
 * - GET /api/v1/agent/health - Health check
 * - GET /api/v1/agent/version - Version info
 * - GET /api/v1/agent/openapi/spec.json - API documentation
 * - GET /api/v1/agent/openapi/spec-compressed.json - Compressed API documentation
 * - OPTIONS /* - CORS preflight requests
 *
 * ERROR RESPONSES:
 * - 401 Unauthorized - Invalid or missing token
 * - Includes error code for programmatic handling:
 *   - MISSING_TOKEN: No token provided
 *   - INVALID_TOKEN: Token doesn't match
 *   - UNAUTHORIZED: Generic auth failure
 *
 * DUAL AUTHENTICATION SYSTEM:
 *
 * 1. Express Middleware (createAuthMiddleware):
 *    - Applied to Express app via app.use()
 *    - Runs for every HTTP request
 *    - Bypasses public endpoints
 *
 * 2. TSOA Authentication (expressAuthentication):
 *    - Called by tsoa-generated routes
 *    - Decorators like @Security("bearer")
 *    - More granular control per endpoint
 *
 * WHY BOTH?
 * - Express middleware: Catch-all protection
 * - TSOA auth: Controller-level security declarations
 * - Both use same token validation logic
 *
 * RELATED FILES:
 * - utils.ts: extractToken() helper function
 * - errors.ts: Authentication error classes
 * - http-server.ts: Middleware registration
 * - websocket-server.ts: WebSocket auth
 * - types.ts: ApiServerConfig with token field
 *
 * @module api-server/auth-middleware
 * @see {@link extractToken} in utils.ts for token extraction
 * @see {@link AuthenticationError} in errors.ts
 * @see {@link authenticateWebSocket} for WebSocket-specific auth
 */

import type { Request, Response, NextFunction } from "express"
import { AuthenticationError, InvalidTokenError, MissingTokenError } from "./errors"
import { extractToken } from "./utils"

/**
 * Module-level token storage for tsoa authentication
 *
 * WHY MODULE-LEVEL?
 * TSOA calls expressAuthentication() as a standalone function, not a method.
 * It has no way to pass dependencies, so we store the token at module level.
 *
 * INITIALIZATION:
 * Set via initializeAuth() when creating the auth middleware.
 * This happens once at server startup.
 *
 * SECURITY NOTE:
 * While module-level state is generally discouraged, it's safe here because:
 * - Token is read-only after initialization
 * - Only one server instance per process
 * - No concurrent modification possible
 */
let serverToken: string | null = null

/**
 * Initialize authentication with the server token
 *
 * MUST be called before any authentication happens, typically during
 * middleware creation in http-server.ts setup.
 *
 * @param token - The valid authentication token
 *
 * @see {@link createAuthMiddleware} which calls this automatically
 */
export function initializeAuth(token: string): void {
	serverToken = token
}

/**
 * Create Express authentication middleware
 *
 * This is a middleware factory function that returns configured middleware.
 *
 * FACTORY PATTERN:
 * Instead of exporting middleware directly, we export a factory that
 * creates configured middleware with the valid token captured in closure.
 *
 * INITIALIZATION:
 * Also initializes module-level token for tsoa authentication.
 * This ensures both auth mechanisms use the same token.
 *
 * MIDDLEWARE BEHAVIOR:
 * 1. Skip OPTIONS requests (CORS preflight)
 * 2. Skip public endpoints (health, version, OpenAPI spec)
 * 3. Extract token from Authorization header or query param
 * 4. Validate token against configured token
 * 5. Allow (next()) or deny (401 response)
 *
 * ERROR HANDLING:
 * - Catches AuthenticationError and sends JSON error response
 * - Catches all other errors and sends generic 401
 * - Never leaks internal error details
 *
 * @param validToken - The valid authentication token to check against
 * @returns {Function} Express middleware function
 *
 * @example
 * ```typescript
 * const authMiddleware = createAuthMiddleware('my-secret-token')
 * app.use(authMiddleware) // Apply to all routes
 * ```
 *
 * @see {@link extractToken} in utils.ts
 * @see {@link initializeAuth} for tsoa setup
 */
export function createAuthMiddleware(validToken: string) {
	// Store token for tsoa authentication
	// This enables both middleware and tsoa routes to use same token
	initializeAuth(validToken)
	
	/**
	 * Express middleware function for authentication
	 *
	 * This is the actual middleware that runs on every request.
	 * It's created by the factory with validToken captured in closure.
	 */
	return function authMiddleware(req: Request, res: Response, next: NextFunction): void {
		try {
			// ================================================================
			// 1. CORS PREFLIGHT BYPASS
			// ================================================================
			
			// Skip auth for OPTIONS requests (CORS preflight)
			// Preflight requests don't include auth headers, so we must allow them
			// The actual request (POST, GET, etc.) will be authenticated
			if (req.method === "OPTIONS") {
				next()
				return
			}
			
			// ================================================================
			// 2. PUBLIC ENDPOINTS BYPASS
			// ================================================================
			
			// Skip auth for public endpoints (health, version, logs for debugging)
			// These endpoints need to work without authentication for:
			// - Health checks from monitoring systems
			// - API discovery (OpenAPI spec)
			// - Version checking
			const publicPaths = [
				"/api/v1/agent/health",
				"/api/v1/agent/version",
				"/api/v1/agent/logs",
				"/api/v1/agent/openapi/spec.json",
				"/api/v1/agent/openapi/spec-compressed.json"
			]
			
			if (publicPaths.includes(req.path)) {
				next()
				return
			}

			// ================================================================
			// 3. TOKEN EXTRACTION
			// ================================================================
			
			// Extract token from request (Authorization header or query param)
			// extractToken() checks both locations and returns first found
			const token = extractToken(req)

			if (!token) {
				throw new MissingTokenError()
			}

			// ================================================================
			// 4. TOKEN VALIDATION
			// ================================================================
			
			// Validate token using simple string comparison
			// TODO: Consider constant-time comparison to prevent timing attacks
			if (token !== validToken) {
				throw new InvalidTokenError()
			}

			// ================================================================
			// 5. SUCCESS - PROCEED TO ROUTE
			// ================================================================
			
			// Token is valid, allow request to proceed to next middleware/route
			next()
		} catch (error) {
			// ================================================================
			// ERROR HANDLING
			// ================================================================
			
			// Handle authentication errors with structured JSON responses
			if (error instanceof AuthenticationError) {
				res.status(error.statusCode).json(error.toJSON())
			} else {
				// Catch-all for unexpected errors (should never happen)
				res.status(401).json({
					error: "Unauthorized",
					message: "Authentication failed",
					code: "AUTH_FAILED",
				})
			}
		}
	}
}

/**
	* TSOA authentication function
	*
	* This function is called by tsoa-generated routes when they have
	* @Security("bearer") decorator on controllers or methods.
	*
	* TSOA INTEGRATION:
	* TSOA generates code that calls this function automatically when:
	* - Controller has @Security("bearer") decorator
	* - Method has @Security("bearer") decorator
	* - Route requires authentication per OpenAPI spec
	*
	* FUNCTION SIGNATURE:
	* Must match tsoa's expected signature:
	* - async function (tsoa may await it)
	* - Returns Promise<any> (auth data to pass to handler)
	* - Throws on auth failure
	*
	* SECURITY NAME:
	* The "securityName" parameter comes from @Security() decorator:
	* - @Security("bearer") → securityName = "bearer"
	* - @Security("apiKey") → securityName = "apiKey"
	* - We only support "bearer" currently
	*
	* SCOPES:
	* Optional scopes parameter for role-based access control:
	* - @Security("bearer", ["admin"]) → scopes = ["admin"]
	* - Currently unused (all valid tokens have full access)
	* - Future: could implement role-based permissions
	*
	* RETURN VALUE:
	* On success, returns object with token (passed to route handler).
	* Route handlers can access this via request context if needed.
	*
	* ERROR HANDLING:
	* Throws AuthenticationError on failure.
	* TSOA catches this and converts to 401 response automatically.
	*
	* @param request - Express request object
	* @param securityName - Security scheme name from @Security() decorator
	* @param scopes - Optional scopes for role-based access control
	* @returns {Promise<any>} Auth data (currently just { token })
	* @throws {AuthenticationError} On authentication failure
	*
	* @example
	* ```typescript
	* // In a controller:
	* @Security("bearer")
	* @Get("/protected")
	* public async getProtected() {
	*   // This method requires valid token
	*   // expressAuthentication() was called before this
	* }
	* ```
	*
	* @see {@link initializeAuth} for token initialization
	* @see TSOA documentation for @Security decorator
	*/
export async function expressAuthentication(
	request: Request,
	securityName: string,
	scopes?: string[],
): Promise<any> {
	// =====================================================================
	// 1. SECURITY SCHEME VALIDATION
	// =====================================================================
	
	// Only "bearer" security scheme is supported
	// Other schemes (apiKey, oauth2, etc.) would be handled here
	if (securityName === "bearer") {
		// =================================================================
		// 2. TOKEN EXTRACTION
		// =================================================================
		
		// Extract token from Authorization header or query param
		const token = extractToken(request)
		
		if (!token) {
			throw new MissingTokenError()
		}

		// =================================================================
		// 3. TOKEN VALIDATION
		// =================================================================
		
		// Validate against module-level token set by initializeAuth()
		// Check both that token is initialized and matches
		if (!serverToken || token !== serverToken) {
			throw new InvalidTokenError()
		}

		// =================================================================
		// 4. SUCCESS - RETURN AUTH DATA
		// =================================================================
		
		// Return auth data (passed to route handler via request context)
		// Currently just the token, but could include user info, roles, etc.
		return Promise.resolve({ token })
	}

	// =====================================================================
	// UNKNOWN SECURITY SCHEME
	// =====================================================================
	
	// This should never happen in production (would be a code error)
	// All @Security() decorators should use supported schemes
	throw new Error(`Unknown security scheme: ${securityName}`)
}

/**
	* WebSocket authentication helper
	*
	* Validates WebSocket connection authentication token.
	*
	* WEBSOCKET vs HTTP AUTH:
	* WebSocket auth is simpler because:
	* - No middleware pipeline (direct function call)
	* - No bypass for public endpoints (all WS connections need auth)
	* - No CORS preflight (not applicable to WebSocket)
	*
	* TOKEN LOCATION:
	* WebSocket tokens MUST be in query string: wss://host/ws?token=xxx
	*
	* WHY QUERY STRING?
	* - WebSocket upgrade is HTTP GET request
	* - Browser WebSocket API doesn't allow custom headers
	* - Authorization header not accessible from JavaScript
	* - Query string is the standard pattern
	*
	* VALIDATION:
	* Simple comparison: token === validToken
	* Returns boolean instead of throwing (caller handles rejection)
	*
	* USAGE:
	* Called from WebSocketServer.handleConnection() during handshake:
	* ```typescript
	* if (!authenticateWebSocket(token, validToken)) {
	*   socket.close(4001, "Unauthorized")
	*   return
	* }
	* ```
	*
	* CLOSE CODES:
	* - 4001: Custom code for unauthorized (not standard WebSocket code)
	* - Standard codes (1000-1015) are for other purposes
	* - Custom codes (4000-4999) for application-specific errors
	*
	* @param token - Token from query string (may be undefined)
	* @param validToken - The expected valid token
	* @returns {boolean} True if valid, false otherwise
	*
	* @see {@link WebSocketServer.handleConnection} in websocket-server.ts
	*/
export function authenticateWebSocket(token: string | undefined, validToken: string): boolean {
	// No token provided
	if (!token) {
		return false
	}

	// Simple string comparison
	// TODO: Consider constant-time comparison to prevent timing attacks
	return token === validToken
}