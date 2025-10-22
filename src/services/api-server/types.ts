/**
 * API Server Types and Interfaces
 */

import type { ExtensionMessage } from "../../shared/ExtensionMessage"
import type { WebviewMessage } from "../../shared/WebviewMessage"
import type { ClineProvider } from "../../core/webview/ClineProvider"
import type * as http from "http"
import type WebSocket from "ws"

/**
 * API Server configuration
 */
export interface ApiServerConfig {
	/** Port to listen on (default: 3000) */
	port: number

	/** Host to bind to (default: localhost) */
	host: string

	/** Authentication token */
	token: string

	/** Directory containing static files for standalone UI */
	staticDir?: string

	/** Allowed CORS origins */
	allowedOrigins?: string[]

	/** Enable verbose logging */
	debug?: boolean

	/** SSL/TLS configuration */
	ssl?: {
		/** Path to SSL certificate file (PEM format) */
		cert: string
		/** Path to SSL private key file (PEM format) */
		key: string
		/** Optional path to CA certificate file */
		ca?: string
		/** Domain name that must match the Host header (enforced when SSL is enabled) */
		domain?: string
	}
}

/**
 * WebSocket client information
 */
export interface WebSocketClient {
	/** Unique client identifier */
	id: string

	/** WebSocket connection */
	socket: WebSocket

	/** Client connection timestamp */
	connectedAt: number

	/** Last activity timestamp */
	lastActivity: number

	/** Client metadata (e.g., IP, user agent) */
	metadata?: {
		ip?: string
		userAgent?: string
	}
}

/**
 * API Server state
 */
export interface ApiServerState {
	/** Server start timestamp */
	startedAt: number

	/** Number of active connections */
	activeConnections: number

	/** Total messages sent */
	messagesSent: number

	/** Total messages received */
	messagesReceived: number

	/** Server uptime in seconds */
	uptime: number
}

/**
 * API Error response
 */
export interface ApiError {
	error: string
	message?: string
	code?: string
	statusCode?: number
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
	status: "ok" | "error"
	version: string
	uptime: number
	activeConnections: number
	port: number
}

/**
 * Task creation request
 */
export interface CreateTaskRequest {
	text: string
	images?: string[]
	mode?: string
}

/**
 * Task creation response
 */
export interface CreateTaskResponse {
	taskId: string
	status: "active" | "waiting"
}

/**
 * API Server dependencies
 */
export interface ApiServerDependencies {
	/** ClineProvider instance */
	provider: ClineProvider

	/** HTTP server instance */
	httpServer?: http.Server

	/** Extension context for accessing secrets and storage */
	context: any
}

/**
 * Message broadcast options
 */
export interface BroadcastOptions {
	/** Exclude specific client IDs from broadcast */
	excludeClients?: string[]

	/** Only send to specific client IDs */
	includeClients?: string[]
}

/**
 * WebSocket message wrapper
 */
export interface WebSocketMessageWrapper {
	/** Message type for routing */
	type: "webview" | "extension" | "ping" | "pong" | "error"

	/** Message payload */
	payload: WebviewMessage | ExtensionMessage | any

	/** Message timestamp */
	timestamp: number
}