/**
 * API Server Utility Functions
 */

import * as crypto from "crypto"
import type { Request } from "express"
import * as path from "path"

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
	return crypto.randomBytes(length).toString("base64url")
}

/**
 * Extract token from request headers or query parameters
 */
export function extractToken(req: Request): string | undefined {
	// Check Authorization header
	const authHeader = req.headers.authorization
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.substring(7)
	}

	// Check query parameter (for WebSocket connections)
	if (req.query?.token && typeof req.query.token === "string") {
		return req.query.token
	}

	return undefined
}

/**
 * Generate a unique client ID
 */
export function generateClientId(): string {
	return `client_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string | undefined {
	// Check X-Forwarded-For header (proxy/load balancer)
	const forwardedFor = req.headers["x-forwarded-for"]
	if (forwardedFor) {
		const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
		return ips.split(",")[0].trim()
	}

	// Check X-Real-IP header
	const realIp = req.headers["x-real-ip"]
	if (realIp) {
		return Array.isArray(realIp) ? realIp[0] : realIp
	}

	// Fall back to socket address
	return req.socket.remoteAddress
}

/**
 * Validate API server configuration
 */
export function validateConfig(config: any): { valid: boolean; errors: string[] } {
	const errors: string[] = []

	if (!config.port || typeof config.port !== "number" || config.port < 1 || config.port > 65535) {
		errors.push("Port must be a number between 1 and 65535")
	}

	if (!config.host || typeof config.host !== "string") {
		errors.push("Host must be a valid string")
	}

	if (!config.token || typeof config.token !== "string") {
		errors.push("Token must be a valid string")
	}

	return {
		valid: errors.length === 0,
		errors,
	}
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringify(obj: any): string {
	try {
		return JSON.stringify(obj)
	} catch (error) {
		console.error("Failed to stringify object:", error)
		return JSON.stringify({ error: "Failed to serialize data" })
	}
}

/**
 * Safe JSON parse with error handling
 */
export function safeParse<T = any>(str: string): T | null {
	try {
		return JSON.parse(str) as T
	} catch (error) {
		console.error("Failed to parse JSON:", error)
		return null
	}
}

/**
 * Calculate uptime in seconds
 */
export function calculateUptime(startTime: number): number {
	return Math.floor((Date.now() - startTime) / 1000)
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes"

	const k = 1024
	const sizes = ["Bytes", "KB", "MB", "GB"]
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

/**
 * Sanitize error message for client
 */
export function sanitizeErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}
	return "An unexpected error occurred"
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
	if (!origin) return true // Allow requests without origin (e.g., same-origin)

	// Allow localhost with any port
	if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
		return true
	}

	// Check against allowed origins list
	return allowedOrigins.some((allowed) => {
		if (allowed === "*") return true
		if (allowed === origin) return true

		// Support wildcard subdomains (e.g., *.example.com)
		if (allowed.startsWith("*.")) {
			const domain = allowed.substring(2)
			return origin.endsWith(domain)
		}

		return false
	})
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null

	return function (this: any, ...args: Parameters<T>) {
		const context = this

		if (timeout) {
			clearTimeout(timeout)
		}

		timeout = setTimeout(() => {
			func.apply(context, args)
		}, wait)
	}
}

/**
 * Create a rate limiter
 */
export class RateLimiter {
	private requests: Map<string, number[]> = new Map()

	constructor(
		private maxRequests: number,
		private windowMs: number,
	) {}

	/**
	 * Check if request is allowed
	 */
	isAllowed(key: string): boolean {
		const now = Date.now()
		const requests = this.requests.get(key) || []

		// Remove expired requests
		const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs)

		if (validRequests.length >= this.maxRequests) {
			return false
		}

		// Add current request
		validRequests.push(now)
		this.requests.set(key, validRequests)

		return true
	}

	/**
	 * Clear all rate limit data
	 */
	clear(): void {
		this.requests.clear()
	}

	/**
	 * Get remaining requests for a key
	 */
	getRemaining(key: string): number {
		const now = Date.now()
		const requests = this.requests.get(key) || []
		const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs)

		return Math.max(0, this.maxRequests - validRequests.length)
	}
}

/**
 * Get first value of a possibly-array query param as string
 */
export function getFirstQueryParam<T extends string | string[] | undefined>(v: T, fallback: string = ""): string {
	if (Array.isArray(v)) return v[0] ?? fallback
	if (v === undefined || v === null) return fallback
	return String(v)
}

/**
 * Parse a boolean-like query param into a boolean
 */
export function parseBoolParam(v: unknown, fallback: boolean = false): boolean {
	const val = Array.isArray(v) ? v[0] : v
	if (typeof val === "boolean") return val
	if (typeof val === "string") {
		const s = val.toLowerCase().trim()
		if (["1", "true", "yes", "y", "on"].includes(s)) return true
		if (["0", "false", "no", "n", "off"].includes(s)) return false
	}
	return fallback
}

/**
 * Safely resolve a target path within a base directory
 */
export function safeResolvePath(baseDir: string, targetPath: string): { fullPath: string; relative: string } {
	const base = path.resolve(baseDir)
	const full = path.resolve(base, targetPath)
	const relative = path.relative(base, full)
	return { fullPath: full, relative }
}

/**
 * Check if target path is inside base directory
 */
export function isPathInside(baseDir: string, targetFullPath: string): boolean {
	const base = path.resolve(baseDir)
	const target = path.resolve(targetFullPath)
	const relative = path.relative(base, target)
	return relative && !relative.startsWith("..") && !path.isAbsolute(relative)
}

/**
 * Deeply redact secrets (apiKey/token/password/secret/authorization) from any object
 */
export function redactSecretsDeep<T = any>(input: T): T {
	// Match actual secret field names, not fields that just contain these words
	// Use word boundaries and specific patterns to avoid false positives
	const secretKeyRegex = /^(.*apiKey|.*token|.*password|.*secret|.*authorization)$/i
	
	// Whitelist: fields that contain these words but are NOT secrets
	const whitelistRegex = /^(maxTokens|modelMaxTokens|includeMaxTokens|modelMaxThinkingTokens|claudeCodeMaxOutputTokens|contextWindow|supportsPromptCache|rateLimitSeconds|diffEnabled|fuzzyMatchThreshold|todoListEnabled|consecutiveMistakeLimit|taskAutoInitEnabled|taskAutoInitSlashCommand|taskAutoInitMessage)$/i

	function redact(value: any): any {
		if (value === null || value === undefined) return value
		if (Array.isArray(value)) return value.map(redact)
		if (typeof value === "object") {
			const out: Record<string, any> = {}
			for (const [k, v] of Object.entries(value)) {
				// Skip whitelisted fields
				if (whitelistRegex.test(k)) {
					out[k] = redact(v)
				} else if (secretKeyRegex.test(k)) {
					out[k] = "***REDACTED***"
				} else {
					out[k] = redact(v)
				}
			}
			return out as any
		}
		return value
	}

	return redact(input)
}