/**
 * ============================================================================
 * API SERVER ERROR CLASSES - STRUCTURED ERROR HANDLING
 * ============================================================================
 *
 * This module defines a hierarchy of error classes for the API server.
 * Each error type maps to specific HTTP status codes and provides
 * consistent JSON error responses.
 *
 * ERROR HIERARCHY:
 * ```
 * Error (built-in)
 *   └── ApiServerError (base class, 500)
 *         ├── AuthenticationError (401)
 *         │     ├── InvalidTokenError (401, INVALID_TOKEN)
 *         │     └── MissingTokenError (401, MISSING_TOKEN)
 *         ├── BadRequestError (400)
 *         │     └── ValidationError (400, VALIDATION_ERROR)
 *         ├── NotFoundError (404)
 *         ├── ConflictError (409)
 *         ├── TooManyRequestsError (429)
 *         ├── InternalServerError (500)
 *         └── ServiceUnavailableError (503)
 * ```
 *
 * DESIGN PRINCIPLES:
 * 1. **Type Safety**: Each error is a distinct class for instanceof checks
 * 2. **HTTP Semantics**: Status codes match HTTP standards (RFC 7231)
 * 3. **Machine Readable**: Error codes for programmatic handling
 * 4. **Human Readable**: Clear messages for developers and logs
 * 5. **JSON Serializable**: toJSON() for consistent API responses
 *
 * ERROR RESPONSE FORMAT:
 * All errors serialize to:
 * ```json
 * {
 *   "error": "NotFoundError",
 *   "message": "Task 'abc123' not found",
 *   "code": "NOT_FOUND",
 *   "statusCode": 404
 * }
 * ```
 *
 * USAGE PATTERN:
 * ```typescript
 * // In route handlers or services:
 * if (!task) {
 *   throw new NotFoundError(`Task '${taskId}' not found`)
 * }
 *
 * // In middleware/error handler:
 * if (error instanceof ApiServerError) {
 *   res.status(error.statusCode).json(error.toJSON())
 * }
 * ```
 *
 * HTTP STATUS CODE GUIDE:
 * - 400 Bad Request: Client error (invalid input, validation failure)
 * - 401 Unauthorized: Authentication required or failed
 * - 404 Not Found: Resource doesn't exist
 * - 409 Conflict: Resource already exists or state conflict
 * - 429 Too Many Requests: Rate limit exceeded
 * - 500 Internal Server Error: Unexpected server error
 * - 503 Service Unavailable: Temporary service disruption
 *
 * RELATED FILES:
 * - error-handler.ts: Global error handler that catches and converts these
 * - auth-middleware.ts: Uses AuthenticationError, InvalidTokenError, MissingTokenError
 * - types.ts: ApiError interface for JSON responses
 * - controllers/*: Throw these errors when operations fail
 *
 * @module api-server/errors
 * @see {@link errorHandler} in error-handler.ts
 * @see {@link ApiError} in types.ts
 */

import type { ApiError } from "./types"

/**
 * Base API Server Error class
 *
 * This is the parent class for all API server errors. It provides:
 * - HTTP status code mapping
 * - Machine-readable error codes
 * - JSON serialization
 * - Stack trace capture
 *
 * SUBCLASSING:
 * Create new error types by extending this class:
 * ```typescript
 * export class CustomError extends ApiServerError {
 *   constructor(message: string) {
 *     super(message, 418, "CUSTOM_ERROR") // 418 I'm a teapot!
 *   }
 * }
 * ```
 *
 * STACK TRACES:
 * Error.captureStackTrace() captures the call stack for debugging.
 * In production, stack traces should be logged but not sent to clients.
 *
 * JSON SERIALIZATION:
 * toJSON() creates the standard error response format.
 * This is called automatically by JSON.stringify() and Express res.json().
 *
 * @param message - Human-readable error description
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Machine-readable error code (default: "INTERNAL_ERROR")
 *
 * @example
 * ```typescript
 * throw new ApiServerError("Something went wrong", 500, "INTERNAL_ERROR")
 *
 * // In error handler:
 * res.status(error.statusCode).json(error.toJSON())
 * // Sends: { error: "ApiServerError", message: "...", code: "...", statusCode: 500 }
 * ```
 */
export class ApiServerError extends Error {
	/** HTTP status code to send in response */
	public readonly statusCode: number
	
	/** Machine-readable error code for client handling */
	public readonly code: string

	constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
		super(message)
		this.name = "ApiServerError"
		this.statusCode = statusCode
		this.code = code
		// Capture stack trace for debugging (excludes constructor from trace)
		Error.captureStackTrace(this, this.constructor)
	}

	/**
	 * Convert error to JSON-serializable object
	 *
	 * This creates the standard error response format used throughout the API.
	 * Called automatically by JSON.stringify() and Express res.json().
	 *
	 * @returns {ApiError} JSON-serializable error object
	 */
	toJSON(): ApiError {
		return {
			error: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
		}
	}
}

// ============================================================================
// AUTHENTICATION ERRORS (401 Unauthorized)
// ============================================================================

/**
 * Base authentication error (401 Unauthorized)
 *
 * Used when authentication is required but failed or missing.
 * Parent class for more specific auth errors.
 *
 * HTTP 401 SEMANTICS:
 * "The request has not been applied because it lacks valid authentication
 * credentials for the target resource."
 *
 * WHEN TO USE:
 * - Generic authentication failures
 * - When more specific error (InvalidToken, MissingToken) doesn't apply
 *
 * @example
 * ```typescript
 * throw new AuthenticationError("Session expired")
 * ```
 *
 * @see {@link InvalidTokenError} for invalid token
 * @see {@link MissingTokenError} for missing token
 */
export class AuthenticationError extends ApiServerError {
	constructor(message: string = "Unauthorized") {
		super(message, 401, "UNAUTHORIZED")
	}
}

/**
 * Invalid authentication token error (401 Unauthorized, INVALID_TOKEN)
 *
 * Thrown when client provides a token but it doesn't match the valid token.
 *
 * COMMON CAUSES:
 * - Token was rotated/regenerated on server
 * - Client using old cached token
 * - Token was manually modified
 * - Typo in token value
 *
 * CLIENT HANDLING:
 * Clients should:
 * 1. Clear cached token
 * 2. Request new token from user/config
 * 3. Retry with new token
 *
 * @example
 * ```typescript
 * if (token !== validToken) {
 *   throw new InvalidTokenError()
 * }
 * ```
 *
 * @see {@link createAuthMiddleware} in auth-middleware.ts
 */
export class InvalidTokenError extends AuthenticationError {
	public override readonly code = "INVALID_TOKEN"

	constructor(message: string = "Invalid authentication token") {
		super(message)
	}
}

/**
 * Missing authentication token error (401 Unauthorized, MISSING_TOKEN)
 *
 * Thrown when client makes a request without providing any token.
 *
 * COMMON CAUSES:
 * - Forgot to include Authorization header
 * - Forgot to include ?token= query parameter
 * - Client-side auth logic bug
 *
 * CLIENT HANDLING:
 * Clients should:
 * 1. Check if they have a token stored
 * 2. If yes: retry with proper Authorization header
 * 3. If no: show login/token input UI
 *
 * @example
 * ```typescript
 * if (!token) {
 *   throw new MissingTokenError()
 * }
 * ```
 *
 * @see {@link createAuthMiddleware} in auth-middleware.ts
 */
export class MissingTokenError extends AuthenticationError {
	public override readonly code = "MISSING_TOKEN"

	constructor(message: string = "Missing authentication token") {
		super(message)
	}
}

// ============================================================================
// CLIENT ERRORS (4xx)
// ============================================================================

/**
 * Resource not found error (404 Not Found)
 *
 * Thrown when requested resource doesn't exist.
 *
 * HTTP 404 SEMANTICS:
 * "The origin server did not find a current representation for the
 * target resource or is not willing to disclose that one exists."
 *
 * COMMON SCENARIOS:
 * - Task ID doesn't exist: `throw new NotFoundError(\`Task '\${id}' not found\`)`
 * - Profile not found: `throw new NotFoundError(\`Profile '\${name}' not found\`)`
 * - File doesn't exist: `throw new NotFoundError(\`File '\${path}' not found\`)`
 *
 * vs 400 BAD REQUEST:
 * - 404: Resource genuinely doesn't exist
 * - 400: Request is malformed or invalid
 *
 * @example
 * ```typescript
 * const task = await getTask(taskId)
 * if (!task) {
 *   throw new NotFoundError(`Task '${taskId}' not found`)
 * }
 * ```
 */
export class NotFoundError extends ApiServerError {
	constructor(message: string = "Resource not found") {
		super(message, 404, "NOT_FOUND")
	}
}

/**
 * Bad request error (400 Bad Request)
 *
 * Thrown when client request is malformed or contains invalid data.
 *
 * HTTP 400 SEMANTICS:
 * "The server cannot or will not process the request due to something
 * that is perceived to be a client error."
 *
 * COMMON SCENARIOS:
 * - Invalid request format: malformed JSON
 * - Missing required fields: no 'text' in create task request
 * - Invalid field values: negative port number
 * - Business logic violations: can't delete last profile
 *
 * vs VALIDATION ERROR:
 * - BadRequestError: General client errors
 * - ValidationError: Specific validation failures (extends BadRequestError)
 *
 * @example
 * ```typescript
 * if (port < 1 || port > 65535) {
 *   throw new BadRequestError('Port must be between 1 and 65535')
 * }
 * ```
 */
export class BadRequestError extends ApiServerError {
	constructor(message: string = "Bad request") {
		super(message, 400, "BAD_REQUEST")
	}
}

/**
 * Validation error (400 Bad Request, VALIDATION_ERROR)
 *
 * Specific type of BadRequestError for validation failures.
 *
 * WHEN TO USE:
 * - Request body validation fails
 * - Field type mismatches
 * - Required fields missing
 * - Field constraints violated (min/max, regex, etc.)
 *
 * TSOA INTEGRATION:
 * TSOA automatically throws ValidationError when:
 * - Request body doesn't match interface
 * - Query params have wrong type
 * - Path params are invalid
 *
 * ERROR MESSAGES:
 * Should be specific and actionable:
 * - Bad: "Validation failed"
 * - Good: "Field 'email' must be a valid email address"
 *
 * @example
 * ```typescript
 * if (!isValidEmail(email)) {
 *   throw new ValidationError("Invalid email format")
 * }
 * ```
 *
 * @see {@link errorHandler} in error-handler.ts for TSOA validation handling
 */
export class ValidationError extends BadRequestError {
	public override readonly code = "VALIDATION_ERROR"

	constructor(message: string = "Validation failed") {
		super(message)
	}
}

/**
 * Conflict error (409 Conflict)
 *
 * Thrown when request conflicts with current server state.
 *
 * HTTP 409 SEMANTICS:
 * "The request could not be completed due to a conflict with the
 * current state of the target resource."
 *
 * COMMON SCENARIOS:
 * - Creating resource that already exists: duplicate profile name
 * - Concurrent modification: optimistic locking failure
 * - State conflicts: can't start task that's already running
 *
 * vs 400 BAD REQUEST:
 * - 409: Resource exists OR state prevents action
 * - 400: Request is malformed or invalid
 *
 * @example
 * ```typescript
 * if (profileExists(name)) {
 *   throw new ConflictError(`Profile '${name}' already exists`)
 * }
 *
 * if (task.status === 'running') {
 *   throw new ConflictError('Task is already running')
 * }
 * ```
 */
export class ConflictError extends ApiServerError {
	constructor(message: string = "Resource conflict") {
		super(message, 409, "CONFLICT")
	}
}

/**
 * Too many requests error (429 Too Many Requests)
 *
 * Thrown when client exceeds rate limits.
 *
 * HTTP 429 SEMANTICS:
 * "The user has sent too many requests in a given amount of time."
 *
 * RATE LIMITING:
 * Can be applied at different levels:
 * - Global: requests per IP
 * - User: requests per token
 * - Endpoint: requests per endpoint
 *
 * RESPONSE HEADERS:
 * Should include Retry-After header:
 * ```typescript
 * res.setHeader('Retry-After', '60') // Try again in 60 seconds
 * throw new TooManyRequestsError()
 * ```
 *
 * CLIENT HANDLING:
 * Clients should:
 * 1. Respect Retry-After header
 * 2. Implement exponential backoff
 * 3. Show "rate limited" message to user
 *
 * @example
 * ```typescript
 * if (!rateLimiter.isAllowed(clientIp)) {
 *   throw new TooManyRequestsError('Rate limit exceeded. Try again in 60s')
 * }
 * ```
 *
 * @see {@link RateLimiter} in utils.ts
 */
export class TooManyRequestsError extends ApiServerError {
	constructor(message: string = "Too many requests") {
		super(message, 429, "TOO_MANY_REQUESTS")
	}
}

// ============================================================================
// SERVER ERRORS (5xx)
// ============================================================================

/**
 * Internal server error (500 Internal Server Error)
 *
 * Generic server error for unexpected conditions.
 *
 * HTTP 500 SEMANTICS:
 * "The server encountered an unexpected condition that prevented it
 * from fulfilling the request."
 *
 * WHEN TO USE:
 * - Unexpected exceptions (caught in error handler)
 * - External service failures (database, AI provider)
 * - Programming errors (should be fixed!)
 *
 * WHEN NOT TO USE:
 * - Client errors (use 4xx instead)
 * - Known error conditions (use specific error classes)
 *
 * LOGGING:
 * 500 errors should ALWAYS be logged with full stack trace
 * for investigation and fixing.
 *
 * CLIENT HANDLING:
 * Clients should:
 * 1. Show generic error message
 * 2. Offer retry option
 * 3. Don't expose details to user
 *
 * @example
 * ```typescript
 * try {
 *   await externalService.call()
 * } catch (error) {
 *   throw new InternalServerError('External service failed')
 * }
 * ```
 */
export class InternalServerError extends ApiServerError {
	constructor(message: string = "Internal server error") {
		super(message, 500, "INTERNAL_SERVER_ERROR")
	}
}

/**
 * Service unavailable error (503 Service Unavailable)
 *
 * Thrown when service is temporarily unable to handle requests.
 *
 * HTTP 503 SEMANTICS:
 * "The server is currently unable to handle the request due to a
 * temporary overload or scheduled maintenance."
 *
 * COMMON SCENARIOS:
 * - Server is starting up
 * - Server is shutting down gracefully
 * - Dependency is down (database, cache, etc.)
 * - Resource exhaustion (out of memory, threads)
 *
 * vs 500 INTERNAL ERROR:
 * - 503: Temporary, service should recover
 * - 500: Unexpected error, may require fix
 *
 * RESPONSE HEADERS:
 * Should include Retry-After header when known:
 * ```typescript
 * res.setHeader('Retry-After', '300') // Try again in 5 minutes
 * throw new ServiceUnavailableError('Server maintenance')
 * ```
 *
 * CLIENT HANDLING:
 * Clients should:
 * 1. Respect Retry-After header
 * 2. Implement retry with backoff
 * 3. Show "service unavailable" message
 *
 * @example
 * ```typescript
 * if (isShuttingDown) {
 *   throw new ServiceUnavailableError('Server is shutting down')
 * }
 *
 * if (!database.isConnected()) {
 *   throw new ServiceUnavailableError('Database connection lost')
 * }
 * ```
 */
export class ServiceUnavailableError extends ApiServerError {
	constructor(message: string = "Service temporarily unavailable") {
		super(message, 503, "SERVICE_UNAVAILABLE")
	}
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format any error as API response object
 *
 * This utility converts any thrown value into a standardized ApiError object.
 * It's used by the global error handler to ensure consistent error responses.
 *
 * CONVERSION LOGIC:
 * 1. ApiServerError → use toJSON() (already formatted)
 * 2. Error object → extract message, set 500 status
 * 3. Other values → convert to string, set 500 status
 *
 * ERROR SANITIZATION:
 * For non-ApiServerError errors, we:
 * - Don't expose stack traces to clients
 * - Use generic error codes
 * - Log full details server-side
 *
 * USE CASES:
 * - Global error handler middleware
 * - Catch-all error formatting
 * - Logging and monitoring
 *
 * @param error - Any thrown value (Error, ApiServerError, string, etc.)
 * @returns {ApiError} Standardized API error object
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation
 * } catch (error) {
 *   const apiError = formatError(error)
 *   res.status(apiError.statusCode || 500).json(apiError)
 * }
 * ```
 *
 * @see {@link errorHandler} in error-handler.ts
 * @see {@link ApiError} in types.ts
 */
export function formatError(error: unknown): ApiError {
	if (error instanceof ApiServerError) {
		return error.toJSON()
	}

	if (error instanceof Error) {
		return {
			error: "Error",
			message: error.message,
			code: "UNKNOWN_ERROR",
			statusCode: 500,
		}
	}

	return {
		error: "Unknown Error",
		message: String(error),
		code: "UNKNOWN_ERROR",
		statusCode: 500,
	}
}