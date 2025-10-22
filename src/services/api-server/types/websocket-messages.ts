/**
 * WebSocket Message Types for OpenAPI Generation
 *
 * This file contains complete TypeScript definitions for all WebSocket messages
 * that can be broadcast from the Hoody Agent Server to connected clients.
 *
 * These types enable developers to:
 * - Parse WebSocket messages with full type safety
 * - Generate typed clients from OpenAPI spec
 * - Understand all possible message structures
 * - Build robust error handling
 *
 * @see OPENAPI_MISSING_SCHEMAS_AUDIT.md for context
 */

// Import ClineMessage from generated types (canonical source from Zod schemas)
import type { ClineMessage, ClineAsk, ClineSay } from "../generated-types"

// Import TodoItem from TodoController (canonical source for TODO types)
import type { TodoItem } from "../controllers/TodoController"

// ============================================================================
// WebSocket Message Base Types
// ============================================================================

/**
 * All possible WebSocket message types
 * 
 * This enum represents every message type that can be sent from the
 * agent server to connected WebSocket clients.
 */
export type WebSocketMessageType =
	| "action"
	| "state"
	| "selectedImages"
	| "theme"
	| "workspaceUpdated"
	| "invoke"
	| "messageUpdated" // ⚠️ MOST IMPORTANT - contains all tool updates and AI responses
	| "mcpServers"
	| "enhancedPrompt"
	| "commitSearchResults"
	| "listApiConfig"
	| "routerModels"
	| "openAiModels"
	| "ollamaModels"
	| "lmStudioModels"
	| "vsCodeLmModels"
	| "huggingFaceModels"
	| "vsCodeLmApiAvailable"
	| "updatePrompt"
	| "systemPrompt"
	| "autoApprovalEnabled"
	| "updateCustomMode"
	| "deleteCustomMode"
	| "exportModeResult"
	| "importModeResult"
	| "checkRulesDirectoryResult"
	| "deleteCustomModeCheck"
	| "currentCheckpointUpdated"
	| "showHumanRelayDialog"
	| "humanRelayResponse"
	| "humanRelayCancel"
	| "insertTextToChatArea"
	| "browserToolEnabled"
	| "browserConnectionResult"
	| "remoteBrowserEnabled"
	| "ttsStart"
	| "ttsStop"
	| "maxReadFileLine"
	| "fileSearchResults"
	| "toggleApiConfigPin"
	| "mcpMarketplaceCatalog"
	| "mcpDownloadDetails"
	| "showSystemNotification"
	| "openInBrowser"
	| "acceptInput"
	| "focusChatInput"
	| "setHistoryPreviewCollapsed"
	| "commandExecutionStatus" // ⚠️ Critical for terminal command tracking
	| "mcpExecutionStatus"
	| "vsCodeSetting"
	| "profileDataResponse"
	| "balanceDataResponse"
	| "updateProfileData"
	| "authenticatedUser"
	| "condenseTaskContextResponse"
	| "singleRouterModelFetchResponse"
	| "indexingStatusUpdate" // ⚠️ Code indexing progress
	| "indexCleared"
	| "codebaseIndexConfig"
	| "rulesData"
	| "marketplaceInstallResult"
	| "marketplaceRemoveResult"
	| "marketplaceData"
	| "mermaidFixResponse"
	| "tasksByIdResponse"
	| "taskHistoryResponse"
	| "forkCountsResponse"
	| "shareTaskSuccess"
	| "codeIndexSettingsSaved"
	| "codeIndexSecretStatus"
	| "showDeleteMessageDialog"
	| "showEditMessageDialog"
	| "hoodycodeNotificationsResponse"
	| "usageDataResponse"
	| "keybindingsResponse"
	| "commands"
	| "insertTextIntoTextarea"
	| "dismissedUpsells"
	| "showTimestamps"
	| "organizationSwitchResult"
	| "todoListUpdated" // ⚠️ TODO CRUD operations
	| "taskForked" // ⚠️ Task fork notifications
	| "taskModeChanged" // ⚠️ Task mode/profile changes

// ============================================================================
// Task Context Metadata
// ============================================================================

/**
 * Task context information
 * 
 * Included in most WebSocket messages to indicate which task
 * the message is related to and what mode/profile it's using
 */
export interface TaskContextMetadata {
	/** Current operating mode (code, architect, ask, debug, orchestrator) */
	mode?: string
	/** Current AI model ID */
	modelId?: string
	/** Current AI provider (anthropic, openai, openrouter, etc.) */
	modelProvider?: string
	/** Current profile name */
	profileName?: string
}

// ============================================================================
// Base WebSocket Message
// ============================================================================

/**
 * Base WebSocket message structure
 * 
 * All WebSocket messages extend this base interface
 */
export interface BaseWebSocketMessage {
	/** Message type - discriminator for the union */
	type: WebSocketMessageType
	/** Task ID (if message is task-related) */
	taskId?: string
	/** Task context metadata */
	taskContext?: TaskContextMetadata
	/** Message text content (optional) */
	text?: string
	/** Associated image data URLs */
	images?: string[]
}

// ============================================================================
// Critical Message Types
// ============================================================================

/**
 * Message updated event
 * 
 * THIS IS THE MOST IMPORTANT MESSAGE TYPE
 * 
 * Broadcast whenever:
 * - AI sends a new message
 * - Tool is being used
 * - Tool completes
 * - User provides feedback
 * - Any conversation update occurs
 * 
 * Contains the complete ClineMessage structure with all metadata
 */
export interface MessageUpdatedMessage extends BaseWebSocketMessage {
	type: "messageUpdated"
	taskId: string
	/** Complete ClineMessage with all tool data, metadata, etc. */
	clineMessage: ClineMessage
}

/**
 * Command execution status update
 * 
 * Real-time updates during terminal command execution
 * Broadcast multiple times per command:
 * 1. "started" - Command begins
 * 2. "output" - Output available (can occur multiple times)
 * 3. "exited" - Command completed with exit code
 * 4. "timeout" - Command exceeded timeout
 */
export interface CommandExecutionStatusMessage extends BaseWebSocketMessage {
	type: "commandExecutionStatus"
	taskId: string
	/** JSON stringified CommandExecutionStatus */
	text: string
}

/**
 * Task forked notification
 * 
 * Broadcast when a task is successfully forked from a message
 */
export interface TaskForkedMessage extends BaseWebSocketMessage {
	type: "taskForked"
	taskId: string // New forked task ID
	forkedTaskId: string
	sourceTaskId: string
	forkFromMessageTs: number
	messagesIncluded: number
	isActive: boolean
}

/**
 * Task mode/profile changed notification
 * 
 * Broadcast when a task's mode or profile is permanently changed via PATCH /tasks/{taskId}/mode
 * This notifies all clients about the change, even if the task is not currently active
 */
export interface TaskModeChangedMessage extends BaseWebSocketMessage {
	type: "taskModeChanged"
	taskId: string
	/** New mode slug */
	mode: string
	/** New profile ID (if changed) */
	profileId?: string
	/** New profile name (if changed) */
	profileName?: string
	/** Whether this task is currently active/displayed */
	isActive: boolean
}

/**
 * TODO list updated notification
 * 
 * Broadcast when TODO items are created, updated, or deleted
 */
export interface TodoListUpdatedMessage extends BaseWebSocketMessage {
	type: "todoListUpdated"
	taskId: string
	/** Updated TODO items */
	text: string // JSON stringified TodoItemWebSocket[]
}

/**
 * Indexing status update
 * 
 * Real-time updates during code indexing operations
 */
export interface IndexingStatusUpdateMessage extends BaseWebSocketMessage {
	type: "indexingStatusUpdate"
	values: IndexingStatus
}

/**
 * State change notification
 * 
 * Broadcast when application state changes
 * Contains complete ExtensionState
 */
export interface StateMessage extends BaseWebSocketMessage {
	type: "state"
	state: ExtensionState
}

// ============================================================================
// Supporting Types
// ============================================================================

/**
 * Code indexing status
 */
export interface IndexingStatus {
	systemStatus: string
	message?: string
	processedItems: number
	totalItems: number
	currentItemUnit?: string
	workspacePath?: string
}

/**
 * ClineMessage structure
 * 
 * The complete message structure used in conversations
 * This is imported from @roo-code/types but re-exported here
 * for OpenAPI generation
 */
export interface ClineMessage {
	type: "ask" | "say"
	ts: number
	
	// Ask-specific fields
	ask?: AskType
	
	// Say-specific fields
	say?: SayType
	
	// Common fields
	text?: string
	images?: string[]
	partial?: boolean
	
	// Metadata
	metadata?: MessageMetadata
	
	// Special fields
	progressStatus?: ProgressStatus
	contextCondense?: ContextCondenseInfo
	checkpoint?: Record<string, any>
	reasoning?: string
	digest?: string
	digestMetadata?: DigestMetadata
	isAnswered?: boolean
	apiProtocol?: "openai" | "anthropic"
	isProtected?: boolean
	conversationHistoryIndex?: number
}

/**
 * Ask types - messages requesting user interaction
 */
export type AskType =
	| "followup"
	| "command"
	| "command_output"
	| "completion_result"
	| "tool"
	| "api_req_failed"
	| "resume_task"
	| "resume_completed_task"
	| "mistake_limit_reached"
	| "browser_action_launch"
	| "use_mcp_server"
	| "auto_approval_max_req_reached"
	| "payment_required_prompt"
	| "invalid_model"
	| "report_bug"
	| "condense"

/**
 * Say types - informational messages
 */
export type SayType =
	| "error"
	| "api_req_started"
	| "api_req_finished"
	| "api_req_retried"
	| "api_req_retry_delayed"
	| "api_req_deleted"
	| "text"
	| "image"
	| "reasoning"
	| "completion_result"
	| "user_feedback"
	| "user_feedback_diff"
	| "command_output"
	| "shell_integration_warning"
	| "browser_action"
	| "browser_action_result"
	| "mcp_server_request_started"
	| "mcp_server_response"
	| "subtask_result"
	| "checkpoint_saved"
	| "rooignore_error"
	| "diff_error"
	| "condense_context"
	| "condense_context_error"
	| "codebase_search_result"
	| "user_edit_todos"

/**
 * Message metadata
 */
export interface MessageMetadata {
	general?: GeneralMetadata
	hoodyCode?: HoodyCodeMetadata
	gpt5?: GPT5Metadata
}

/**
 * General message metadata
 */
export interface GeneralMetadata {
	cumulativeTokensOut?: number
	cumulativeTokensIn?: number
	cumulativeCost?: number
	cost?: number
	cacheReads?: number
	cacheWrites?: number
	tokensOut?: number
	tokensIn?: number
	mode?: string
	profileId?: string
	profileName?: string
	provider?: string
	modelId?: string
}

/**
 * Hoody Code specific metadata
 */
export interface HoodyCodeMetadata {
	commitRange?: {
		from: string
		to: string
		fromTimeStamp?: number
	}
}

/**
 * GPT-5 reasoning metadata
 */
export interface GPT5Metadata {
	reasoning_summary?: string
	instructions?: string
	previous_response_id?: string
}

/**
 * Tool execution progress status
 */
export interface ProgressStatus {
	text: string
	icon?: string
}

/**
 * Context condensing information
 */
export interface ContextCondenseInfo {
	summary: string
	newContextTokens: number
	prevContextTokens: number
	cost: number
}

/**
 * Digest metadata
 */
export interface DigestMetadata {
	maxLength: number
	tokensUsed?: number
	profileId: string
	generatedAt: number
}

/**
 * Extension state structure
 * 
 * This is a placeholder - the complete structure is defined in
 * the main types but re-exported here for OpenAPI
 */
export interface ExtensionState {
	version: string
	clineMessages: ClineMessage[]
	currentTaskItem?: any // HistoryItem
	currentTaskTodos?: TodoItem[]
	apiConfiguration: any
	mode: string
	// ... many more fields (100+ total)
	// See GlobalSettings in @roo-code/types for complete definition
}

// ============================================================================
// Complete WebSocket Message Union
// ============================================================================

/**
 * Complete union of all possible WebSocket messages
 *
 * Use the `type` field to discriminate between message types
 */
export type WebSocketMessage =
	| MessageUpdatedMessage
	| CommandExecutionStatusMessage
	| TaskForkedMessage
	| TaskModeChangedMessage
	| TodoListUpdatedMessage
	| IndexingStatusUpdateMessage
	| StateMessage
	| BaseWebSocketMessage // Fallback for other message types

// ============================================================================
// Export all types for TSOA
// ============================================================================

export {
	WebSocketMessageType,
	TaskContextMetadata,
	BaseWebSocketMessage,
	ClineMessage,
	AskType,
	SayType,
	MessageMetadata,
	GeneralMetadata,
	HoodyCodeMetadata,
	GPT5Metadata,
	ProgressStatus,
	ContextCondenseInfo,
	DigestMetadata,
	IndexingStatus,
	ExtensionState,
}