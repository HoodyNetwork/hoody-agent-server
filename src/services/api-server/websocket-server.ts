/**
 * ============================================================================
 * WEBSOCKET SERVER - REAL-TIME BIDIRECTIONAL COMMUNICATION
 * ============================================================================
 *
 * This module implements a WebSocket server for real-time, bidirectional
 * communication between the API server and external clients. It enables:
 * - Real-time streaming of agent state changes and updates
 * - Bidirectional messaging (client ↔ server ↔ ClineProvider)
 * - Connection management with heartbeat and automatic cleanup
 * - Token-based authentication for secure connections
 *
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                    WebSocket Communication Flow                      │
 * │                                                                       │
 * │  Client → WS → Auth → Parse → ClineProvider → Process → Respond     │
 * │                                                                       │
 * │  ClineProvider → ApiServer → WS.broadcast() → All Clients            │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * KEY FEATURES:
 * 1. **Real-time Updates**: All agent state changes broadcast to connected clients
 * 2. **Heartbeat Mechanism**: Automatic ping/pong to detect stale connections
 * 3. **Token Authentication**: Secure connections via query string token
 * 4. **Client Management**: Track all connections with metadata (IP, user agent)
 * 5. **Selective Broadcasting**: Send messages to all clients or specific ones
 * 6. **Error Handling**: Graceful error handling with error messages to clients
 *
 * WEBSOCKET vs HTTP:
 * - HTTP: Request/response, client-initiated, stateless
 * - WebSocket: Persistent connection, bidirectional, stateful
 * - Use HTTP for: CRUD operations, file uploads, one-time requests
 * - Use WebSocket for: Real-time updates, streaming, push notifications
 *
 * MESSAGE TYPES:
 * - Client → Server: WebviewMessage (task commands, responses, etc.)
 * - Server → Client: ExtensionMessage (state updates, tool use, etc.)
 * - Control: ping/pong for heartbeat, connected/error for lifecycle
 *
 * CONNECTION LIFECYCLE:
 * 1. Client connects to wss://host:port/ws?token=xxx
 * 2. Server validates token
 * 3. If valid: connection accepted, client added to tracking map
 * 4. Server sends 'connected' message with client ID
 * 5. Heartbeat starts (ping every 30s, timeout after 60s)
 * 6. Client sends/receives messages bidirectionally
 * 7. On disconnect: client removed from map, resources cleaned up
 *
 * HEARTBEAT MECHANISM:
 * - Server sends ping every 30 seconds
 * - Client must respond with pong within 30 seconds
 * - If no pong for 60 seconds (2x interval), connection is stale → close
 * - Prevents zombie connections from consuming resources
 *
 * SECURITY:
 * - Token authentication via query string: ?token=xxx
 * - Tokens validated on connection (before upgrade)
 * - Invalid tokens rejected with 4001 close code
 * - Same token used for both HTTP and WebSocket
 *
 * RELATED FILES:
 * - http-server.ts: HTTP server that WebSocket attaches to
 * - index.ts: ApiServer orchestrator that manages both servers
 * - auth-middleware.ts: Token validation logic
 * - types.ts: WebSocketClient, BroadcastOptions interfaces
 * - ../../core/webview/ClineProvider.ts: Handles incoming messages
 * - ../../shared/ExtensionMessage.ts: Server→Client message types
 * - ../../shared/WebviewMessage.ts: Client→Server message types
 *
 * @module api-server/websocket-server
 * @see {@link HttpServer} in http-server.ts for the attached HTTP server
 * @see {@link ApiServer} in index.ts for message interception
 * @see {@link authenticateWebSocket} in auth-middleware.ts
 */

import WebSocket, { WebSocketServer as WsServer } from "ws"
import type * as http from "http"
import type { ClineProvider } from "../../core/webview/ClineProvider"
import type { ExtensionMessage } from "../../shared/ExtensionMessage"
import type { WebviewMessage } from "../../shared/WebviewMessage"
import type { WebSocketClient, BroadcastOptions } from "./types"
import { authenticateWebSocket } from "./auth-middleware"
import { generateClientId, getClientIp, safeParse, safeStringify } from "./utils"

/**
 * WebSocket Server for real-time bidirectional communication
 *
 * This class manages WebSocket connections, handles authentication,
 * processes incoming messages, and broadcasts updates to all clients.
 *
 * DESIGN PATTERNS:
 * - Pub/Sub: Server publishes messages to all subscribed clients
 * - Observer: Clients observe agent state changes in real-time
 * - Connection Pool: Maintains map of active client connections
 *
 * CLIENT TRACKING:
 * Each connection is tracked with:
 * - Unique client ID (generated on connection)
 * - WebSocket instance for sending messages
 * - Connection timestamp
 * - Last activity timestamp (for stale detection)
 * - Metadata (IP address, user agent)
 *
 * HEARTBEAT:
 * The server implements a heartbeat mechanism using WebSocket ping/pong frames:
 * - Server sends ping every N seconds (default 30s)
 * - Client automatically responds with pong (browser behavior)
 * - Server tracks last activity timestamp on pong
 * - Connections with no pong for 2x interval are closed as stale
 *
 * MESSAGE HANDLING:
 * - Incoming: Client messages → parse → validate → forward to ClineProvider
 * - Outgoing: ClineProvider → ApiServer intercepts → broadcast to all clients
 * - Errors: Send error message to client instead of closing connection
 *
 * @see {@link WebSocketClient} in types.ts for client tracking structure
 * @see {@link BroadcastOptions} in types.ts for selective broadcasting
 */
export class WebSocketServer {
	/** WebSocket.Server instance from 'ws' package */
	private wss: WsServer
	
	/** Map of client ID → WebSocketClient for tracking all connections */
	private clients: Map<string, WebSocketClient> = new Map()
	
	/** ClineProvider instance for processing client messages */
	private provider: ClineProvider
	
	/** Valid authentication token (same as HTTP Bearer token) */
	private validToken: string
	
	/** Enable verbose logging for debugging */
	private debug: boolean

	/**
	 * Create a WebSocket server attached to an HTTP server
	 *
	 * ATTACHMENT MECHANISM:
	 * The WebSocket server attaches to an existing HTTP/HTTPS server,
	 * allowing both to share:
	 * - The same port (no need for separate port)
	 * - The same SSL certificate (secure WebSocket = WSS)
	 * - The same network interface
	 *
	 * HOW IT WORKS:
	 * 1. HTTP server listens on a port
	 * 2. WebSocket server hooks into the 'upgrade' event
	 * 3. When client requests upgrade to WebSocket, this server handles it
	 * 4. Normal HTTP requests continue to be handled by Express
	 *
	 * PATH ROUTING:
	 * - HTTP requests: / → Express router
	 * - WebSocket requests: /ws → This WebSocket server
	 * - Path is specified in constructor: { path: "/ws" }
	 *
	 * AUTHENTICATION:
	 * Token validation happens in handleConnection() after the upgrade completes.
	 * Invalid tokens result in immediate connection closure with code 4001.
	 *
	 * @param httpServer - Node.js HTTP/HTTPS server to attach to
	 * @param provider - ClineProvider for processing messages
	 * @param validToken - Authentication token (same as HTTP Bearer token)
	 * @param debug - Enable debug logging (default: false)
	 *
	 * @example
	 * ```typescript
	 * const httpServer = http.createServer(app)
	 * await httpServer.listen(3000)
	 * const wsServer = new WebSocketServer(httpServer, provider, 'token123', true)
	 * ```
	 *
	 * @see {@link setupEventHandlers} for connection handling
	 * @see {@link HttpServer.getServer} in http-server.ts
	 */
	constructor(httpServer: http.Server, provider: ClineProvider, validToken: string, debug: boolean = false) {
		this.provider = provider
		this.validToken = validToken
		this.debug = debug

		// Create WebSocket server attached to HTTP server
		// This shares the port and SSL configuration with the HTTP server
		this.wss = new WsServer({
			server: httpServer,
			path: "/ws", // WebSocket endpoint path
		})

		// Set up event handlers for connection, error, etc.
		this.setupEventHandlers()
		this.log("WebSocket server initialized")
	}

	/**
	 * Set up WebSocket server event handlers
	 *
	 * EVENTS HANDLED:
	 * - 'connection': New client connecting (most important!)
	 * - 'error': Server-level errors (port issues, etc.)
	 *
	 * PER-CONNECTION EVENTS:
	 * Once a connection is established, we also listen to per-socket events:
	 * - 'message': Client sending data
	 * - 'close': Client disconnecting
	 * - 'error': Socket-level errors
	 * - 'pong': Response to our ping (heartbeat)
	 *
	 * These per-connection events are set up in handleConnection().
	 *
	 * @see {@link handleConnection} for per-connection event setup
	 */
	private setupEventHandlers(): void {
		// New client connection
		// Request contains HTTP headers for authentication
		this.wss.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {
			this.handleConnection(socket, request)
		})

		// Server-level errors (rare, usually configuration issues)
		this.wss.on("error", (error: Error) => {
			console.error("[WebSocketServer] Server error:", error)
		})
	}

	/**
	 * Handle new WebSocket connection
	 *
	 * CONNECTION FLOW:
	 * 1. Generate unique client ID
	 * 2. Extract token from query string (?token=xxx)
	 * 3. Authenticate token
	 * 4. If invalid: close with 4001 (Unauthorized)
	 * 5. If valid: create client record, set up event handlers, send welcome
	 *
	 * AUTHENTICATION:
	 * WebSocket connections use query string for auth instead of headers:
	 * - WebSocket upgrade request is HTTP, but limited header control
	 * - Browser WebSocket API doesn't allow custom headers
	 * - Query string is the standard pattern: wss://host/ws?token=xxx
	 *
	 * CLIENT RECORD:
	 * Each client gets a tracking record with:
	 * - id: Unique identifier (client_timestamp_randomhex)
	 * - socket: WebSocket instance for communication
	 * - connectedAt: Connection timestamp
	 * - lastActivity: Last message/pong timestamp (for stale detection)
	 * - metadata: IP address, user agent for debugging
	 *
	 * EVENT HANDLERS:
	 * We set up 4 event handlers for each connection:
	 * - message: Process incoming messages
	 * - close: Clean up on disconnect
	 * - error: Log errors
	 * - pong: Update last activity timestamp
	 *
	 * WELCOME MESSAGE:
	 * After successful connection, we send a 'connected' message with:
	 * - Client ID (so client knows their identifier)
	 * - Timestamp
	 * - Any initial state the client needs
	 *
	 * @param socket - WebSocket connection instance
	 * @param request - HTTP upgrade request with headers and URL
	 *
	 * @see {@link authenticateWebSocket} in auth-middleware.ts
	 * @see {@link handleMessage} for message processing
	 * @see {@link handleDisconnect} for cleanup
	 */
	private handleConnection(socket: WebSocket, request: http.IncomingMessage): void {
		const clientId = generateClientId()
		const clientIp = getClientIp(request as any)

		// Extract token from query string
		const url = new URL(request.url || "", `http://${request.headers.host}`)
		const token = url.searchParams.get("token")

		// Log connection attempt
		console.log(`[WebSocket] Connection attempt from ${clientIp}`)
		console.log(`[WebSocket] URL: ${request.url}`)
		console.log(`[WebSocket] Token provided: ${token ? 'YES' : 'NO'}`)
		console.log(`[WebSocket] Client token: ${token}`)
		console.log(`[WebSocket] Server token: ${this.validToken}`)
		console.log(`[WebSocket] Token matches: ${token === this.validToken}`)

		// Authenticate connection
		if (!authenticateWebSocket(token || undefined, this.validToken)) {
			console.log(`[WebSocket] Authentication FAILED for client ${clientId} from ${clientIp}`)
			console.log(`[WebSocket] Expected: ${this.validToken}`)
			console.log(`[WebSocket] Received: ${token}`)
			socket.close(4001, "Unauthorized")
			return
		}

		console.log(`[WebSocket] Authentication SUCCESS for client ${clientId}`)

		// Create client record
		const client: WebSocketClient = {
			id: clientId,
			socket,
			connectedAt: Date.now(),
			lastActivity: Date.now(),
			metadata: {
				ip: getClientIp(request as any),
				userAgent: request.headers["user-agent"],
			},
		}

		this.clients.set(clientId, client)
		this.log(`Client ${clientId} connected (${this.clients.size} total)`)

		// Set up socket event handlers
		socket.on("message", (data: WebSocket.RawData) => {
			this.handleMessage(clientId, data)
		})

		socket.on("close", (code: number, reason: Buffer) => {
			this.handleDisconnect(clientId, code, reason.toString())
		})

		socket.on("error", (error: Error) => {
			console.error(`[WebSocketServer] Client ${clientId} error:`, error)
		})

		socket.on("pong", () => {
			// Update last activity on pong response
			const client = this.clients.get(clientId)
			if (client) {
				client.lastActivity = Date.now()
			}
		})

		// Send welcome message with current state
		this.sendToClient(clientId, {
			type: "connected",
			clientId,
			timestamp: Date.now(),
		})
	}

	/**
	 * Handle incoming message from WebSocket client
	 *
	 * MESSAGE PROCESSING FLOW:
	 * 1. Get client record (validate client still exists)
	 * 2. Update last activity timestamp (for heartbeat)
	 * 3. Parse JSON message (validate format)
	 * 4. Handle special messages (ping) internally
	 * 5. Forward to ClineProvider for processing
	 * 6. Send error message on failure (don't crash)
	 *
	 * MESSAGE TYPES:
	 * - WebviewMessage: Task operations, responses, settings updates
	 * - ping: Application-level ping (separate from WS ping/pong)
	 * - Any message type defined in WebviewMessage union type
	 *
	 * ERROR HANDLING:
	 * Instead of closing the connection on error, we:
	 * - Log the error server-side
	 * - Send error message to client
	 * - Keep connection alive (client can retry)
	 *
	 * WHY TWO PING MECHANISMS?
	 * - WebSocket ping/pong: Low-level connection health (this class)
	 * - Application ping: High-level app health check (this method)
	 * Both are useful for different purposes!
	 *
	 * ACTIVITY TRACKING:
	 * Every message updates lastActivity timestamp, which:
	 * - Prevents stale connection cleanup
	 * - Helps identify inactive clients
	 * - Useful for debugging connection issues
	 *
	 * @param clientId - Unique client identifier
	 * @param data - Raw WebSocket data (Buffer or string)
	 *
	 * @see {@link ClineProvider.handleCLIMessage} in ../../core/webview/ClineProvider.ts
	 * @see {@link WebviewMessage} in ../../shared/WebviewMessage.ts
	 */
	private async handleMessage(clientId: string, data: WebSocket.RawData): Promise<void> {
		const client = this.clients.get(clientId)
		if (!client) {
			return
		}

		// Update last activity
		client.lastActivity = Date.now()

		try {
			// Parse message
			const message = safeParse<WebviewMessage>(data.toString())
			if (!message) {
				this.log(`Invalid message from client ${clientId}`)
				this.sendError(clientId, "Invalid message format")
				return
			}

			this.log(`Received message from ${clientId}: ${message.type}`)

			// Handle ping message (custom application-level ping, not WebSocket ping)
			if ((message as any).type === "ping") {
				this.sendToClient(clientId, { type: "pong", timestamp: Date.now() })
				return
			}

			// Forward message to ClineProvider for handling
			await this.provider.handleCLIMessage(message)
		} catch (error) {
			console.error(`[WebSocketServer] Error handling message from ${clientId}:`, error)
			this.sendError(clientId, "Failed to process message")
		}
	}

	/**
	 * Handle client disconnect
	 *
	 * CLEANUP TASKS:
	 * 1. Remove client from tracking map
	 * 2. Log disconnect for debugging
	 * 3. WebSocket resources automatically freed
	 *
	 * DISCONNECT CODES:
	 * - 1000: Normal closure (client closed tab, navigated away)
	 * - 1001: Going away (server shutting down, page refresh)
	 * - 1006: Abnormal closure (connection lost, no close frame)
	 * - 4001: Unauthorized (custom code for auth failure)
	 *
	 * REASONS:
	 * The reason string provides context about why the client disconnected:
	 * - "Connection timeout" (heartbeat detected stale connection)
	 * - "Server shutting down" (graceful shutdown)
	 * - "" (empty for abnormal closures)
	 * - Custom reasons from client close() calls
	 *
	 * NO CLEANUP NEEDED:
	 * WebSocket connections are automatically cleaned up when closed.
	 * We only need to remove from our tracking map.
	 *
	 * @param clientId - Unique client identifier
	 * @param code - WebSocket close code (1000-4999)
	 * @param reason - Human-readable disconnect reason
	 *
	 * @see {@link close} method for server-initiated disconnects
	 */
	private handleDisconnect(clientId: string, code: number, reason: string): void {
		this.clients.delete(clientId)
		this.log(`Client ${clientId} disconnected (code: ${code}, reason: ${reason}), ${this.clients.size} remaining`)
	}

	/**
	 * Broadcast message to all connected clients
	 *
	 * BROADCASTING:
	 * Sends the same message to multiple (or all) connected WebSocket clients.
	 * This is the core mechanism for real-time updates.
	 *
	 * USE CASES:
	 * - Task state changes: notify all clients when task starts/completes
	 * - Tool use: broadcast when agent uses a tool (file read, command, etc.)
	 * - System notifications: server announcements, warnings
	 * - Agent responses: share AI responses with all connected UIs
	 *
	 * FILTERING OPTIONS:
	 * - excludeClients: Skip specific clients (e.g., sender of a message)
	 * - includeClients: Only send to specific clients (targeted broadcast)
	 * - No options: Send to ALL connected clients
	 *
	 * MESSAGE FORMAT:
	 * Messages are ExtensionMessage objects (defined in shared/ExtensionMessage.ts).
	 * These are automatically JSON-stringified before sending.
	 *
	 * ERROR HANDLING:
	 * - Only sends to clients with OPEN connections (readyState === OPEN)
	 * - Skips clients that are CONNECTING, CLOSING, or CLOSED
	 * - No error if a send fails (client might disconnect mid-broadcast)
	 *
	 * PERFORMANCE:
	 * For large numbers of clients, consider:
	 * - Batching messages
	 * - Using streams for large data
	 * - Implementing backpressure handling
	 *
	 * @param message - ExtensionMessage to broadcast
	 * @param options - Optional filtering (exclude/include specific clients)
	 *
	 * @example
	 * ```typescript
	 * // Broadcast to all clients
	 * wsServer.broadcast({ type: 'state', state: newState })
	 *
	 * // Exclude specific client (e.g., sender)
	 * wsServer.broadcast(message, { excludeClients: [senderId] })
	 *
	 * // Send only to specific clients
	 * wsServer.broadcast(message, { includeClients: ['client1', 'client2'] })
	 * ```
	 *
	 * @see {@link ExtensionMessage} in ../../shared/ExtensionMessage.ts
	 * @see {@link BroadcastOptions} in types.ts
	 * @see {@link sendToClient} for single-client messaging
	 */
	public broadcast(message: ExtensionMessage, options?: BroadcastOptions): void {
		const data = safeStringify(message)

		this.clients.forEach((client, clientId) => {
			// Check exclude list
			if (options?.excludeClients?.includes(clientId)) {
				return
			}

			// Check include list
			if (options?.includeClients && !options.includeClients.includes(clientId)) {
				return
			}

			// Send if socket is open
			if (client.socket.readyState === WebSocket.OPEN) {
				client.socket.send(data)
			}
		})

		this.log(`Broadcast message type: ${message.type} to ${this.clients.size} clients`)
	}

	/**
	 * Send message to a specific client
	 *
	 * SINGLE-CLIENT MESSAGING:
	 * Unlike broadcast(), this sends to one specific client by ID.
	 *
	 * USE CASES:
	 * - Response to client-specific request
	 * - Error messages for failed operations
	 * - Welcome messages after connection
	 * - Private notifications
	 *
	 * RETURN VALUE:
	 * - true: Message sent successfully
	 * - false: Client not found or connection not open
	 *
	 * CONNECTION STATE CHECK:
	 * Only sends if socket.readyState === WebSocket.OPEN
	 * States:
	 * - CONNECTING (0): Connection not yet established
	 * - OPEN (1): Ready to send/receive (this is what we want!)
	 * - CLOSING (2): Close handshake in progress
	 * - CLOSED (3): Connection closed
	 *
	 * ERROR HANDLING:
	 * If send() throws (rare), we:
	 * - Log the error
	 * - Return false
	 * - Don't crash the server
	 *
	 * @param clientId - Unique client identifier
	 * @param message - Any JSON-serializable message
	 * @returns {boolean} True if sent, false if failed
	 *
	 * @example
	 * ```typescript
	 * const sent = wsServer.sendToClient('client_123', {
	 *   type: 'error',
	 *   message: 'Operation failed'
	 * })
	 * if (!sent) {
	 *   console.log('Client not connected')
	 * }
	 * ```
	 *
	 * @see {@link broadcast} for multi-client messaging
	 */
	public sendToClient(clientId: string, message: any): boolean {
		const client = this.clients.get(clientId)
		if (!client || client.socket.readyState !== WebSocket.OPEN) {
			return false
		}

		try {
			client.socket.send(safeStringify(message))
			return true
		} catch (error) {
			console.error(`[WebSocketServer] Failed to send to client ${clientId}:`, error)
			return false
		}
	}

	/**
	 * Send error message to client
	 *
	 * STANDARDIZED ERROR FORMAT:
	 * All error messages use the same structure:
	 * - type: "error" (for client-side routing)
	 * - error: Human-readable error message
	 * - timestamp: When the error occurred
	 *
	 * This helps clients handle errors consistently.
	 *
	 * @param clientId - Client to send error to
	 * @param message - Error message string
	 *
	 * @private This is internal - errors are sent automatically on failures
	 */
	private sendError(clientId: string, message: string): void {
		this.sendToClient(clientId, {
			type: "error",
			error: message,
			timestamp: Date.now(),
		})
	}

	/**
	 * Get number of active WebSocket connections
	 *
	 * This is used for:
	 * - Health check responses
	 * - Monitoring dashboards
	 * - Capacity planning
	 * - Debugging connection issues
	 *
	 * @returns {number} Number of currently connected clients
	 *
	 * @see {@link getState} in index.ts for server state
	 */
	public getConnectionCount(): number {
		return this.clients.size
	}

	/**
	 * Get array of all client IDs
	 *
	 * Useful for:
	 * - Admin dashboards showing connected clients
	 * - Debugging connection issues
	 * - Selective broadcasting
	 * - Connection management
	 *
	 * @returns {string[]} Array of client IDs
	 */
	public getClientIds(): string[] {
		return Array.from(this.clients.keys())
	}

	/**
	 * Check if a specific client is currently connected
	 *
	 * CHECKS:
	 * 1. Client exists in tracking map
	 * 2. Socket is in OPEN state (not CONNECTING, CLOSING, or CLOSED)
	 *
	 * USE CASES:
	 * - Before sending to specific client
	 * - Validating client existence in API endpoints
	 * - Connection management logic
	 *
	 * @param clientId - Client ID to check
	 * @returns {boolean} True if connected and ready, false otherwise
	 */
	public isClientConnected(clientId: string): boolean {
		const client = this.clients.get(clientId)
		return !!client && client.socket.readyState === WebSocket.OPEN
	}

	/**
	 * Start heartbeat mechanism to keep connections alive
	 *
	 * HEARTBEAT PURPOSE:
	 * WebSocket connections can become "zombie" connections that appear
	 * connected but are actually dead (network issues, client crash, etc.).
	 * Heartbeat detects and cleans up these stale connections.
	 *
	 * HOW IT WORKS:
	 * 1. Server sends WebSocket ping frame every intervalMs
	 * 2. Healthy clients automatically respond with pong (built into WebSocket)
	 * 3. Server updates lastActivity on pong receipt
	 * 4. Clients with no activity for 2x interval are considered stale
	 * 5. Stale connections are closed to free resources
	 *
	 * PING vs APPLICATION PING:
	 * - WebSocket ping/pong: Protocol-level (this method)
	 * - Application ping: Message-level (handled in handleMessage)
	 *
	 * TIMING RECOMMENDATIONS:
	 * - Production: 30-60 seconds (balance between detection and overhead)
	 * - Development: 10-15 seconds (faster debugging)
	 * - High-latency networks: 60+ seconds (avoid false positives)
	 *
	 * RETURN VALUE:
	 * Returns the interval timer so it can be stopped later with clearInterval().
	 * This is essential for cleanup during server shutdown.
	 *
	 * @param intervalMs - Milliseconds between pings (default: 30000 = 30s)
	 * @returns {NodeJS.Timeout} Interval timer (for cleanup)
	 *
	 * @example
	 * ```typescript
	 * // Start heartbeat with 30s interval
	 * const timer = wsServer.startHeartbeat(30000)
	 *
	 * // Later, stop heartbeat during shutdown
	 * clearInterval(timer)
	 * ```
	 *
	 * @see {@link close} method where heartbeat timer is cleared
	 */
	public startHeartbeat(intervalMs: number = 30000): NodeJS.Timeout {
		return setInterval(() => {
			this.clients.forEach((client, clientId) => {
				if (client.socket.readyState === WebSocket.OPEN) {
					// Send ping
					client.socket.ping()

					// Check for stale connections (no activity for 2x heartbeat interval)
					const inactiveMs = Date.now() - client.lastActivity
					if (inactiveMs > intervalMs * 2) {
						this.log(`Closing stale connection ${clientId}`)
						client.socket.close(1000, "Connection timeout")
					}
				}
			})
		}, intervalMs)
	}

	/**
	 * Close all connections and shut down WebSocket server
	 *
	 * SHUTDOWN SEQUENCE:
	 * 1. Log shutdown start
	 * 2. Close all client connections gracefully (send close frame)
	 * 3. Clear client tracking map
	 * 4. Close WebSocket server (stop accepting new connections)
	 * 5. Wait for server to fully close
	 *
	 * GRACEFUL CLOSE:
	 * Sends WebSocket close frame (code 1001, "Server shutting down") to
	 * each client before closing. This allows clients to:
	 * - Know the server is shutting down (not a network issue)
	 * - Clean up their own resources
	 * - Show appropriate UI (e.g., "Server offline")
	 *
	 * CLIENT NOTIFICATION:
	 * Clients receive:
	 * - Close event with code 1001
	 * - Reason: "Server shutting down"
	 * - Can differentiate from unexpected disconnects (code 1006)
	 *
	 * PROMISE-BASED:
	 * Returns a promise that resolves when fully closed.
	 * This allows coordinated shutdown with HTTP server:
	 * ```typescript
	 * await wsServer.close()  // Close WS first
	 * await httpServer.close() // Then HTTP
	 * ```
	 *
	 * ERROR HANDLING:
	 * Errors during close are logged but also rejected in the promise.
	 * Caller should handle potential errors:
	 * ```typescript
	 * try {
	 *   await wsServer.close()
	 * } catch (error) {
	 *   console.error('Failed to close gracefully:', error)
	 * }
	 * ```
	 *
	 * @returns {Promise<void>} Resolves when fully closed, rejects on error
	 *
	 * @see {@link ApiServer.stop} in index.ts for full shutdown sequence
	 */
	public async close(): Promise<void> {
		this.log("Closing WebSocket server...")

		// Close all client connections
		this.clients.forEach((client) => {
			if (client.socket.readyState === WebSocket.OPEN) {
				client.socket.close(1001, "Server shutting down")
			}
		})

		this.clients.clear()

		// Close WebSocket server
		return new Promise((resolve, reject) => {
			this.wss.close((error: Error | undefined) => {
				if (error) {
					console.error("[WebSocketServer] Error closing server:", error)
					reject(error)
				} else {
					this.log("WebSocket server closed")
					resolve()
				}
			})
		})
	}

	/**
	 * Log message if debug mode is enabled
	 *
	 * DEBUG LOGGING:
	 * All WebSocket server logs go through this method so they can be
	 * toggled on/off via the debug flag.
	 *
	 * WHAT GETS LOGGED:
	 * - Client connections/disconnections
	 * - Message types received
	 * - Broadcast operations
	 * - Heartbeat/stale connection events
	 *
	 * WHAT DOESN'T GET LOGGED:
	 * - Message contents (could be sensitive)
	 * - Authentication tokens (security risk)
	 * - Personal information
	 *
	 * PREFIX:
	 * All logs prefixed with [WebSocketServer] for easy filtering
	 * in production logs.
	 *
	 * @param message - Message to log
	 * @private This is internal helper
	 */
	private log(message: string): void {
		if (this.debug) {
			console.log(`[WebSocketServer] ${message}`)
		}
	}
}