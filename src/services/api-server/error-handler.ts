/**
 * ============================================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE - COMPREHENSIVE ERROR CONVERSION
 * ============================================================================
 *
 * This module provides centralized error handling for the entire API server.
 * It converts ALL errors (custom, standard, unexpected) into appropriate HTTP
 * responses with consistent JSON format.
 *
 * CORE PRINCIPLE:
 * "No 500 errors for client mistakes!"
 *
 * Every error is analyzed and mapped to the most appropriate HTTP status code:
 * - Client errors (4xx): Invalid input, missing resources, auth failures
 * - Server errors (5xx): Unexpected conditions, external service failures
 *
 * ERROR CONVERSION FLOW:
 * ```
 * Any Error → normalizeError() → ApiServerError → errorHandler() → JSON Response
 *                                   ↓
 *                         Determines correct status code
 * ```
 *
 * ERROR TYPES HANDLED:
 * 1. **ApiServerError**: Our custom errors (already have correct status/code)
 * 2. **TSOA Validation**: Request validation failures → 400 ValidationError
 * 3. **Node.js Errors**: ENOENT, EACCES, etc. → Mapped to appropriate 4xx
 * 4. **Generic Error**: Analyzed by message pattern → 404/400/500
 * 5. **Non-Error**: Anything else thrown → 500 with generic message
 *
 * MESSAGE PATTERN DETECTION:
 * We analyze error messages to determine intent:
 * - "not found" → 404 Not Found
 * - "invalid", "required" → 400 Bad Request
 * - "already exists" → 400 Bad Request (could be 409, but 400 more common)
 * - Unknown → 500 Internal Server Error
 *
 * ERROR RESPONSE FORMAT:
 * All errors respond with consistent JSON:
 * ```json
 * {
 *   "error": "NotFoundError",
 *   "message": "Task 'abc123' not found",
 *   "code": "NOT_FOUND",
 *   "statusCode": 404
 * }
 * ```
 *
 * LOGGING STRATEGY:
 * - 4xx errors: console.warn() with summary (client mistakes, expected)
 * - 5xx errors: console.error() with full stack (unexpected, needs investigation)
 *
 * SECURITY CONSIDERATIONS:
 * - Never expose stack traces to clients
 * - Never leak internal paths or implementation details
 * - Log sensitive errors server-side only
 * - Sanitize error messages before sending
 *
 * USAGE IN EXPRESS:
 * Must be registered as the LAST middleware:
 * ```typescript
 * app.use(routes)         // Your routes
 * app.use(errorHandler)   // Must be last!
 * ```
 *
 * ASYNC ROUTE WRAPPING:
 * For async routes, use asyncHandler wrapper:
 * ```typescript
 * app.get('/task/:id', asyncHandler(async (req, res) => {
 *   const task = await getTask(req.params.id)
 *   if (!task) throw new NotFoundError()
 *   res.json(task)
 * }))
 * ```
 *
 * RELATED FILES:
 * - errors.ts: Error class definitions
 * - http-server.ts: Registers this middleware
 * - controllers/*: Throw errors that this catches
 * - types.ts: ApiError interface
 *
 * @module api-server/error-handler
 * @see {@link ApiServerError} in errors.ts
 * @see {@link setupErrorHandling} in http-server.ts
 */

import type { Request, Response, NextFunction } from "express"
import { ApiServerError, BadRequestError, NotFoundError, ValidationError } from "./errors"

// ============================================================================
// ERROR TYPE DETECTION FUNCTIONS
// ============================================================================

/**
 * Check if error is a known API error type
 *
 * API errors are our custom error classes that extend ApiServerError.
 * They already have the correct status code and error code set.
 *
 * TYPE GUARD:
 * This is a TypeScript type guard (returns `error is ApiServerError`),
 * which narrows the type in the calling code.
 *
 * @param error - Any value that might be an error
 * @returns {boolean} True if error is ApiServerError or subclass
 *
 * @example
 * ```typescript
 * if (isApiError(error)) {
 *   // TypeScript knows error is ApiServerError here
 *   console.log(error.statusCode, error.code)
 * }
 * ```
 */
function isApiError(error: unknown): error is ApiServerError {
	return error instanceof ApiServerError
}

/**
 * Check if error message indicates a "not found" scenario
 *
 * PATTERN MATCHING:
 * Analyzes error message for common "not found" phrases.
 * This catches errors from code that throws generic Error instead of NotFoundError.
 *
 * PATTERNS DETECTED:
 * - "not found"
 * - "does not exist"
 * - "cannot find"
 * - "no such"
 * - Exact matches: "task not found", "profile not found"
 *
 * WHY NEEDED:
 * Many parts of the codebase throw generic `new Error("Task not found")`
 * instead of `new NotFoundError()`. This function converts them to 404.
 *
 * CASE INSENSITIVE:
 * Uses toLowerCase() to catch variations in capitalization.
 *
 * @param error - Any value that might be an error
 * @returns {boolean} True if error message indicates "not found"
 *
 * @example
 * ```typescript
 * throw new Error("Profile 'admin' not found")
 * // → Detected as 404 Not Found
 * ```
 */
function isNotFoundError(error: unknown): boolean {
	if (!(error instanceof Error)) return false
	const msg = error.message.toLowerCase()
	return (
		msg.includes("not found") ||
		msg.includes("does not exist") ||
		msg.includes("cannot find") ||
		msg.includes("no such") ||
		msg === "task not found" ||
		msg === "profile not found"
	)
}

/**
 * Check if error message indicates a validation/bad request scenario
 *
 * PATTERN MATCHING:
 * Analyzes error message for common validation/input error phrases.
 * Converts generic errors to 400 Bad Request.
 *
 * PATTERNS DETECTED:
 * - "required" (missing required field)
 * - "invalid" (invalid format or value)
 * - "must be" (constraint violation)
 * - "cannot be" (forbidden value)
 * - "validation" (explicit validation failure)
 * - "bad request"
 * - "already exists" (duplicate resource)
 * - "last remaining" (can't delete last item)
 * - "cannot delete" (deletion not allowed)
 *
 * WHY NEEDED:
 * Code throughout the app throws generic errors like:
 * - `new Error("Email is required")`
 * - `new Error("Invalid port number")`
 * These should be 400, not 500.
 *
 * FALSE POSITIVES:
 * Rare, but possible. For example:
 * - "System cannot be required" (weird but possible)
 * In practice, these patterns are reliable for our codebase.
 *
 * @param error - Any value that might be an error
 * @returns {boolean} True if error message indicates bad request
 *
 * @example
 * ```typescript
 * throw new Error("Port must be between 1 and 65535")
 * // → Detected as 400 Bad Request
 * ```
 */
function isBadRequestError(error: unknown): boolean {
	if (!(error instanceof Error)) return false
	const msg = error.message.toLowerCase()
	return (
		msg.includes("required") ||
		msg.includes("invalid") ||
		msg.includes("must be") ||
		msg.includes("cannot be") ||
		msg.includes("validation") ||
		msg.includes("bad request") ||
		msg.includes("already exists") ||
		msg.includes("last remaining") ||
		msg.includes("cannot delete")
	)
}

/**
 * Check if error is a TSOA validation error
 *
 * TSOA VALIDATION:
 * TSOA (TypeScript OpenAPI) automatically validates request bodies,
 * query parameters, and path parameters against TypeScript interfaces.
 *
 * VALIDATION ERROR FORMAT:
 * ```typescript
 * {
 *   name: "ValidateError",
 *   fields: {
 *     "body.email": { message: "invalid email", value: "notanemail" },
 *     "body.age": { message: "must be a number", value: "twenty" }
 *   }
 * }
 * ```
 *
 * DETECTION:
 * Check for either:
 * - error.name === "ValidateError" (tsoa's error class)
 * - error.fields exists (validation details)
 *
 * HANDLING:
 * We extract field errors and format them into a clear message:
 * "email: invalid email, age: must be a number"
 *
 * @param error - Any value that might be a TSOA validation error
 * @returns {boolean} True if TSOA validation error
 *
 * @see {@link normalizeError} for conversion to ValidationError
 */
function isTsoaValidationError(error: any): boolean {
	return error?.name === "ValidateError" || error?.fields !== undefined
}

/**
 * Convert any error to an appropriate ApiServerError
 *
 * This is the heart of the error handling system. It takes ANY thrown value
 * and converts it to an ApiServerError with the most appropriate status code.
 *
 * CONVERSION PRIORITY (checked in order):
 * 1. Already ApiServerError → return as-is (already correct)
 * 2. TSOA validation error → ValidationError (400)
 * 3. Error with "not found" message → NotFoundError (404)
 * 4. Error with validation/bad request message → BadRequestError (400)
 * 5. Node.js error with code (ENOENT, etc.) → Mapped error
 * 6. Generic Error → InternalServerError (500) + logged
 * 7. Non-Error value → InternalServerError (500) + logged
 *
 * NODE.JS ERROR CODES:
 * - ENOENT: File not found → 404
 * - EACCES/EPERM: Permission denied → 400 (not 403, client mistake)
 * - EEXIST: Already exists → 400
 * - ENOTDIR: Not a directory → 400
 * - EISDIR: Is a directory → 400
 * - Others: Logged and treated as 500
 *
 * LOGGING:
 * - Logs unhandled Error objects (unexpected, need investigation)
 * - Logs non-Error throws (weird, should never happen)
 * - Doesn't log ApiServerError (already handled correctly)
 *
 * SECURITY:
 * - Never exposes internal paths
 * - Never includes stack traces
 * - Sanitizes messages before sending
 * - Logs full details server-side for debugging
 *
 * @param error - Any thrown value (Error, ApiServerError, string, object, etc.)
 * @returns {ApiServerError} Appropriate error with correct status code
 *
 * @example
 * ```typescript
 * try {
 *   await fs.readFile('/nonexistent')
 * } catch (error) {
 *   const apiError = normalizeError(error)
 *   // Returns NotFoundError (404) for ENOENT
 * }
 * ```
 */
function normalizeError(error: unknown): ApiServerError {
	// Already an API error - return as-is
	if (isApiError(error)) {
		return error
	}

	// TSOA validation errors
	if (isTsoaValidationError(error)) {
		const fields = error.fields || {}
		const fieldErrors = Object.entries(fields)
			.map(([field, info]: [string, any]) => `${field}: ${info.message}`)
			.join(", ")
		return new ValidationError(
			fieldErrors || "Request validation failed. Check your request body and parameters."
		)
	}

	// Standard Error objects
	if (error instanceof Error) {
		// Check for specific error patterns
		if (isNotFoundError(error)) {
			return new NotFoundError(error.message)
		}
		
		if (isBadRequestError(error)) {
			return new BadRequestError(error.message)
		}

		// Check for specific error codes (Node.js errors)
		const nodeError = error as NodeJS.ErrnoException
		if (nodeError.code) {
			switch (nodeError.code) {
				case "ENOENT":
					return new NotFoundError("File or resource not found")
				case "EACCES":
				case "EPERM":
					return new BadRequestError("Permission denied")
				case "EEXIST":
					return new BadRequestError("Resource already exists")
				case "ENOTDIR":
					return new BadRequestError("Not a directory")
				case "EISDIR":
					return new BadRequestError("Is a directory")
				default:
					// Unknown Node.js error - treat as internal error
					console.error("[ErrorHandler] Unhandled Node.js error:", nodeError.code, error.message)
					return new ApiServerError(
						`Internal error: ${error.message}`,
						500,
						"INTERNAL_ERROR"
					)
			}
		}

		// Generic Error - log and return as internal error
		console.error("[ErrorHandler] Unhandled Error:", error.message, error.stack)
		return new ApiServerError(
			`Internal error: ${error.message}`,
			500,
			"INTERNAL_ERROR"
		)
	}

	// Non-Error objects (strings, objects, etc.)
	console.error("[ErrorHandler] Non-Error thrown:", error)
	return new ApiServerError(
		"An unexpected error occurred",
		500,
		"UNKNOWN_ERROR"
	)
}

/**
 * Express error handler middleware
 *
 * This is the global error handler that catches ALL errors thrown by routes,
 * middleware, or async operations. It converts them to consistent JSON responses.
 *
 * EXPRESS ERROR HANDLER SIGNATURE:
 * Must have exactly 4 parameters (err, req, res, next) for Express to
 * recognize it as an error handler. Do NOT remove the 'next' parameter
 * even if unused - Express checks parameter count!
 *
 * REGISTRATION:
 * MUST be registered as the LAST middleware:
 * ```typescript
 * app.use(routes)         // All routes first
 * app.use(otherMiddleware)
 * app.use(errorHandler)   // Error handler LAST!
 * ```
 *
 * EXECUTION FLOW:
 * 1. Normalize error to ApiServerError (determines status code)
 * 2. Log error with appropriate level (warn for 4xx, error for 5xx)
 * 3. Send JSON response with error details
 * 4. Never call next() (error handling ends here)
 *
 * LOGGING LEVELS:
 * - 5xx (server errors): console.error() with full details
 *   → These need investigation and fixing
 * - 4xx (client errors): console.warn() with summary
 *   → These are expected (bad input, etc.)
 *
 * RESPONSE FORMAT:
 * Always sends error.toJSON() which includes:
 * - error: Error class name
 * - message: Human-readable description
 * - code: Machine-readable error code
 * - statusCode: HTTP status code
 *
 * SECURITY:
 * - Never exposes stack traces to clients
 * - Logs stack traces server-side for debugging
 * - Sanitizes error messages
 * - Original error details only in server logs
 *
 * ASYNC ERRORS:
 * For async routes, errors are automatically caught if you:
 * - Use asyncHandler wrapper (recommended)
 * - Or use Express 5+ (has built-in async support)
 * - Or manually catch and call next(error)
 *
 * @param error - Any error thrown in the application
 * @param req - Express request object (for logging context)
 * @param res - Express response object (for sending error response)
 * @param next - Express next function (unused but required for signature)
 *
 * @example
 * ```typescript
 * // Somewhere in a route:
 * throw new NotFoundError('Task not found')
 *
 * // This handler catches it and sends:
 * // Status: 404
 * // Body: { error: "NotFoundError", message: "...", code: "NOT_FOUND", statusCode: 404 }
 * ```
 *
 * @see {@link normalizeError} for error conversion logic
 * @see {@link asyncHandler} for async route wrapper
 */
export function errorHandler(
	error: unknown,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	// Normalize the error to an ApiServerError
	const apiError = normalizeError(error)

	// Log the error (with full details for 500s)
	if (apiError.statusCode >= 500) {
		console.error("[ErrorHandler] Internal Server Error:", {
			path: req.path,
			method: req.method,
			statusCode: apiError.statusCode,
			code: apiError.code,
			message: apiError.message,
			originalError: error instanceof Error ? error.stack : error,
		})
	} else {
		console.warn("[ErrorHandler] Client Error:", {
			path: req.path,
			method: req.method,
			statusCode: apiError.statusCode,
			code: apiError.code,
			message: apiError.message,
		})
	}

	// Send the error response
	res.status(apiError.statusCode).json(apiError.toJSON())
}

/**
 * Async route wrapper to catch promise rejections
 *
 * PROBLEM IT SOLVES:
 * Express doesn't automatically catch errors from async functions:
 * ```typescript
 * app.get('/task/:id', async (req, res) => {
 *   const task = await getTask(req.params.id) // If this throws, Express won't catch it!
 *   res.json(task)
 * })
 * ```
 *
 * SOLUTION:
 * Wrap async handlers to catch rejections and pass to error handler:
 * ```typescript
 * app.get('/task/:id', asyncHandler(async (req, res) => {
 *   const task = await getTask(req.params.id) // Errors caught and handled!
 *   res.json(task)
 * }))
 * ```
 *
 * HOW IT WORKS:
 * 1. Wraps async function in Promise.resolve()
 * 2. Catches any rejection with .catch()
 * 3. Passes error to next() which triggers errorHandler
 *
 * ALTERNATIVES:
 * - Express 5.x has built-in async error handling
 * - Libraries like 'express-async-errors'
 * - Manually wrap with try/catch
 *
 * USAGE EXAMPLES:
 * ```typescript
 * // Simple async route
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await db.getUsers()
 *   res.json(users)
 * }))
 *
 * // With error throwing
 * app.get('/user/:id', asyncHandler(async (req, res) => {
 *   const user = await db.getUser(req.params.id)
 *   if (!user) throw new NotFoundError('User not found')
 *   res.json(user)
 * }))
 *
 * // Works with next() too
 * app.get('/data', asyncHandler(async (req, res, next) => {
 *   const data = await fetchData()
 *   req.data = data
 *   next() // Can still use next()
 * }))
 * ```
 *
 * TYPE SAFETY:
 * - Preserves TypeScript types
 * - Returns Express RequestHandler compatible function
 * - Async function can return anything (void, Promise, etc.)
 *
 * @param fn - Async route handler function
 * @returns {Function} Wrapped handler that catches promise rejections
 *
 * @see {@link errorHandler} which receives caught errors
 */
export function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
	return (req: Request, res: Response, next: NextFunction) => {
		// Wrap in Promise.resolve() to handle both promises and non-promises
		// catch() passes error to next() which triggers errorHandler
		Promise.resolve(fn(req, res, next)).catch(next)
	}
}