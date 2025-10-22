/**
 * Schema Documentation Controller
 * 
 * This controller exists solely to expose type schemas in the OpenAPI specification.
 * The endpoints return HTTP 501 "Not Implemented" and should never be called in production.
 * 
 * Purpose: TSOA scans controller method signatures to determine which types to include
 * in the OpenAPI spec. By creating endpoints that return these types, we force TSOA
 * to include all tool response and WebSocket message schemas in the specification.
 * 
 * This enables developers to:
 * - Understand complete API response structures
 * - Generate typed clients from OpenAPI
 * - Validate WebSocket messages
 * - Build robust integrations
 */

import { Controller, Route, Get, Tags } from "tsoa"
import type {
	ToolResponse,
	ToolType,
	BrowserAction,
	BrowserActionResult,
	CommandExecutionStatus,
	ApiRequestInfo,
} from "../types/tool-responses"
import type {
	WebSocketMessage,
	WebSocketMessageType,
} from "../types/websocket-messages"

/**
 * Schema documentation response wrapper
 */
interface SchemaDocumentationResponse<T> {
	/** Schema documentation notice */
	notice: string
	/** Schema example (never actually returned) */
	schema?: T
}

@Route("schemas")
@Tags("Documentation")
export class SchemasController extends Controller {
	/**
	 * Get all possible tool response schemas (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * Use the OpenAPI spec's `#/components/schemas/ToolResponse` to understand
	 * the complete structure of tool responses received via WebSocket.
	 * 
	 * @summary Tool response type schemas
	 */
	@Get("tool-responses")
	public getToolResponseSchemas(): SchemaDocumentationResponse<ToolResponse> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"Tool responses are received via WebSocket messageUpdated events. " +
				"See the OpenAPI spec for complete ToolResponse schema with all 18 tool types.",
		}
	}

	/**
	 * Get all possible WebSocket message schemas (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * Use the OpenAPI spec's `#/components/schemas/WebSocketMessage` to understand
	 * all possible WebSocket message structures.
	 * 
	 * @summary WebSocket message type schemas
	 */
	@Get("websocket-messages")
	public getWebSocketMessageSchemas(): SchemaDocumentationResponse<WebSocketMessage> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"WebSocket messages are received by connecting to ws://host:port/ws. " +
				"See the OpenAPI spec for complete WebSocketMessage schema with 70+ message types.",
		}
	}

	/**
	 * Get browser automation type schemas (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * @summary Browser automation schemas
	 */
	@Get("browser-actions")
	public getBrowserActionSchemas(): SchemaDocumentationResponse<{
		actions: BrowserAction[]
		result: BrowserActionResult
	}> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"See the OpenAPI spec for BrowserAction and BrowserActionResult schemas.",
		}
	}

	/**
	 * Get command execution status schema (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * Broadcast via WebSocket as `commandExecutionStatus` messages during terminal command execution.
	 * 
	 * @summary Command execution status schema
	 */
	@Get("command-execution-status")
	public getCommandExecutionStatusSchema(): SchemaDocumentationResponse<CommandExecutionStatus> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"Command execution status is broadcast via WebSocket during terminal commands. " +
				"See the OpenAPI spec for CommandExecutionStatus schema.",
		}
	}

	/**
	 * Get API request metadata schema (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * @summary API request metadata schema
	 */
	@Get("api-request-info")
	public getApiRequestInfoSchema(): SchemaDocumentationResponse<ApiRequestInfo> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"API request info is included in message metadata. " +
				"See the OpenAPI spec for ApiRequestInfo schema.",
		}
	}

	/**
	 * Get all tool type names (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * @summary Available tool types
	 */
	@Get("tool-types")
	public getToolTypes(): SchemaDocumentationResponse<{ tools: ToolType[] }> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"See the OpenAPI spec for ToolType enum with all 18 available tools.",
		}
	}

	/**
	 * Get all WebSocket message type names (documentation only)
	 * 
	 * ⚠️ This endpoint returns HTTP 501 and should never be called.
	 * It exists only to expose type schemas in the OpenAPI specification.
	 * 
	 * @summary Available WebSocket message types
	 */
	@Get("websocket-message-types")
	public getWebSocketMessageTypes(): SchemaDocumentationResponse<{ types: WebSocketMessageType[] }> {
		this.setStatus(501)
		return {
			notice: "This endpoint is for OpenAPI schema documentation only. " +
				"See the OpenAPI spec for WebSocketMessageType enum with 70+ message types.",
		}
	}
}