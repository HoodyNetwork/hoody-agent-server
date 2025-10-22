/**
 * API Request and Response Types
 *
 * These types define the contracts for all API endpoints.
 * They are used by tsoa to generate OpenAPI specs and type-safe routes.
 *
 * Complete types are imported from generated-types.ts which are
 * automatically inferred from Zod schemas in @roo-code/types
 */

import type { Mode } from "../../shared/modes"
import type {
	ProviderSettings,
	ProviderSettingsDiscriminated,
	GlobalSettings,
	ClineMessage,
	ClineAsk,
	ClineSay,
	ToolProgressStatus,
	ContextCondense,
} from "./generated-types"

// Import tool response types for OpenAPI generation
import type {
	ToolResponse,
	ToolType,
	BaseToolResponse,
	ToolResponseReadFile,
	ToolResponseReadFileBatch,
	ToolResponseListFilesTopLevel,
	ToolResponseListFilesRecursive,
	ToolResponseListCodeDefinitionNames,
	ToolResponseSearchFiles,
	ToolResponseNewFileCreated,
	ToolResponseEditedExistingFile,
	ToolResponseApplyDiff,
	ToolResponseApplyDiffSingle,
	ToolResponseApplyDiffBatch,
	ToolResponseSearchAndReplace,
	ToolResponseInsertContent,
	ToolResponseGenerateImage,
	ToolResponseNewTask,
	ToolResponseFinishTask,
	ToolResponseSwitchMode,
	ToolResponseFetchInstructions,
	ToolResponseRunSlashCommand,
	ToolResponseCodebaseSearch,
	DiffOperation,
	BatchDiffEntry,
	BatchFileEntry,
	BrowserAction,
	BrowserActionRequest,
	BrowserActionResult,
	McpServerUsageRequest,
	CommandExecutionStatus,
	ApiRequestInfo,
	ImageGenerationResult,
} from "./types/tool-responses"

// Import WebSocket message types for OpenAPI generation
import type {
	WebSocketMessage,
	WebSocketMessageType,
	TaskContextMetadata,
	MessageUpdatedMessage,
	CommandExecutionStatusMessage,
	TaskForkedMessage,
	TodoListUpdatedMessage,
	IndexingStatusUpdateMessage,
	StateMessage,
	BaseWebSocketMessage,
	IndexingStatus,
	AskType,
	SayType,
	MessageMetadata,
	GeneralMetadata,
	HoodyCodeMetadata,
	GPT5Metadata,
	ProgressStatus as WebSocketProgressStatus,
	ContextCondenseInfo,
	DigestMetadata,
	ExtensionState as WebSocketExtensionState,
} from "./types/websocket-messages"

// Re-export the complete types
export type {
	ProviderSettings,
	ProviderSettingsDiscriminated,
	GlobalSettings,
	ClineMessage,
	ClineAsk,
	ClineSay,
	ToolProgressStatus,
	ContextCondense,
}

// Re-export tool response types for OpenAPI
export type {
	ToolResponse,
	ToolType,
	BaseToolResponse,
	ToolResponseReadFile,
	ToolResponseReadFileBatch,
	ToolResponseListFilesTopLevel,
	ToolResponseListFilesRecursive,
	ToolResponseListCodeDefinitionNames,
	ToolResponseSearchFiles,
	ToolResponseNewFileCreated,
	ToolResponseEditedExistingFile,
	ToolResponseApplyDiff,
	ToolResponseApplyDiffSingle,
	ToolResponseApplyDiffBatch,
	ToolResponseSearchAndReplace,
	ToolResponseInsertContent,
	ToolResponseGenerateImage,
	ToolResponseNewTask,
	ToolResponseFinishTask,
	ToolResponseSwitchMode,
	ToolResponseFetchInstructions,
	ToolResponseRunSlashCommand,
	ToolResponseCodebaseSearch,
	DiffOperation,
	BatchDiffEntry,
	BatchFileEntry,
	BrowserAction,
	BrowserActionRequest,
	BrowserActionResult,
	McpServerUsageRequest,
	CommandExecutionStatus,
	ApiRequestInfo,
	ImageGenerationResult,
	TodoItem as ToolTodoItem,
}

// Re-export WebSocket message types for OpenAPI
export type {
	WebSocketMessage,
	WebSocketMessageType,
	TaskContextMetadata,
	MessageUpdatedMessage,
	CommandExecutionStatusMessage,
	TaskForkedMessage,
	TodoListUpdatedMessage,
	IndexingStatusUpdateMessage,
	StateMessage,
	BaseWebSocketMessage,
	IndexingStatus,
	AskType,
	SayType,
	MessageMetadata,
	GeneralMetadata,
	HoodyCodeMetadata,
	GPT5Metadata,
	WebSocketProgressStatus,
	ContextCondenseInfo,
	DigestMetadata,
	WebSocketExtensionState,
}

/**
 * Extension settings (alias for GlobalSettings)
 * Used by SettingsController for semantic clarity
 */
export type ExtensionSettings = GlobalSettings

// ============================================================================
// Common Types
// ============================================================================

/**
 * Standard success response
 */
export interface SuccessResponse {
	success: true
	message?: string
}

/**
 * API Error response
 * @example {
 *   "error": "Not Found",
 *   "message": "Profile 'my-profile' not found",
 *   "code": "PROFILE_NOT_FOUND"
 * }
 */
export interface ApiErrorResponse {
	/** Error type/category */
	error: string
	/** Human-readable error message */
	message?: string
	/** Machine-readable error code */
	code?: string
	/** HTTP status code */
	statusCode?: number
}

// ============================================================================
// Health & Server Status
// ============================================================================

/**
 * Process resource usage metrics
 * Provides real-time monitoring of the server's resource consumption
 */
export interface ProcessMetrics {
	/** Memory usage in MB */
	memoryUsageMB: number
	/** Memory usage as percentage of total system memory */
	memoryPercent: number
	/** CPU usage percentage (0-100 per core, can exceed 100 on multi-core systems) */
	cpuPercent: number
	/** Process ID */
	pid: number
	/** Node.js heap used in MB */
	heapUsedMB: number
	/** Node.js heap total in MB */
	heapTotalMB: number
	/** External memory (buffers, C++ objects) in MB */
	externalMB: number
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
	/** Server health status */
	status: "ok" | "error"
	/** API version */
	version: string
	/** Server uptime in seconds */
	uptime: number
	/** Number of active WebSocket connections */
	activeConnections: number
	/** Server port */
	port: number
	/** Process resource usage metrics */
	process: ProcessMetrics
}

// ============================================================================
// Profile Management
// ============================================================================

/**
 * Profile list item (lightweight summary)
 */
export interface ProfileListItem {
	/** Profile name/identifier */
	name: string
	/** Unique profile ID */
	id: string
	/** AI provider (e.g., 'anthropic', 'openai', 'openrouter') */
	apiProvider?: string
	/** Model ID (cleaned, without provider prefix) */
	modelId?: string
	/** Whether this profile is currently active */
	isActive?: boolean
	/** Full configuration (only included when includeConfig=true, with secrets redacted) */
	config?: ProfileDetails
}

/**
 * Full profile details
 * Uses discriminated union for proper provider-specific field validation
 */
export type ProfileDetails = ProviderSettingsDiscriminated & {
	/** Profile name */
	name: string
	/** Whether this profile is currently active */
	isActive?: boolean
}

/**
 * Profile creation request
 * Uses discriminated union to ensure only valid fields per provider
 */
export interface CreateProfileRequest {
	/** Unique profile name */
	name: string
	/** Profile configuration with discriminator on apiProvider */
	config: ProviderSettingsDiscriminated
}

/**
 * Profile creation response
 */
export interface CreateProfileResponse {
	success: true
	message: string
	/** Generated profile ID */
	id: string
	/** Profile name */
	name: string
}

/**
 * Profile update request
 * Uses discriminated union to ensure only valid fields per provider
 */
export interface UpdateProfileRequest {
	/** Updated profile configuration with discriminator on apiProvider */
	config: ProviderSettingsDiscriminated
}

/**
 * Profile update response
 */
export interface UpdateProfileResponse {
	success: true
	message: string
	/** Profile ID */
	id: string
	/** Profile name */
	name: string
	/** Full updated configuration (with secrets redacted) */
	config?: ProfileDetails
}

/**
 * Profile deletion response
 */
export interface DeleteProfileResponse {
	success: true
	message: string
}

/**
 * Profile activation response
 */
export interface ActivateProfileResponse {
	success: true
	message: string
	/** Activated profile details (with secrets redacted) */
	profile: {
		/** Profile name */
		name: string
		/** Profile ID */
		id: string
		/** Whether this profile is now active (always true after activation) */
		isActive: true
		/** Full configuration (with secrets redacted) */
		config: ProfileDetails
	}
}

// ============================================================================
// Mode-to-Profile Mapping
// ============================================================================

/**
 * Mode profile assignment request
 */
export interface SetModeProfileRequest {
	/** Profile ID to assign */
	profileId?: string
	/** Profile name to assign (alternative to profileId) */
	profileName?: string
}

/**
 * Mode profile assignment response
 */
export interface SetModeProfileResponse {
	success: true
	message: string
	/** Mode slug */
	mode: string
	/** Assigned profile ID */
	profileId: string
}

/**
 * Mode profile details response
 */
export interface ModeProfileResponse {
	/** Mode slug */
	mode: string
	/** Assigned profile ID */
	profileId: string
	/** Assigned profile name */
	profileName: string
	/** Full profile details (with secrets redacted) */
	profile: ProfileDetails
}

// ============================================================================
// Application State & Configuration
// ============================================================================

/**
 * Configuration subset response
 */
export interface ConfigResponse {
	/** Current mode */
	mode?: string
	/** API configuration (secrets redacted) */
	apiConfiguration?: any
	/** Current API config name */
	currentApiConfigName?: string
	/** Custom instructions */
	customInstructions?: string
}

/**
 * Configuration update request
 */
export interface UpdateConfigRequest {
	/** Mode to switch to */
	mode?: string
	/** API configuration to update */
	apiConfiguration?: any
	/** Custom instructions to set */
	customInstructions?: string
}

/**
 * Mode definition
 */
export interface ModeInfo {
	/** Mode slug (e.g., 'code', 'architect', 'ask') */
	slug: string
	/** Display name */
	name: string
	/** Mode description */
	description?: string
	/** Model to use for this mode */
	model?: string
	/** System prompt template */
	systemPrompt?: string
}

// ============================================================================
// Task Management
// ============================================================================

/**
 * Task creation request
 */
export interface CreateTaskRequest {
	/** Task text/prompt */
	text: string
	/** Optional image attachments (base64 encoded) */
	images?: string[]
	/** Mode to use for this task */
	mode?: string
}

/**
 * Task creation response
 */
export interface CreateTaskResponse {
	/** Created task ID */
	taskId: string
	/** Task status */
	status: "active" | "waiting"
}

/**
 * Task state response
 */
export interface TaskStateResponse {
	/** Task ID */
	taskId: string
	/** Task status */
	status: "active" | "completed" | "error" | "waiting"
	/** Task messages/history */
	messages?: any[]
	/** Current task state */
	state?: any
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * File content response
 */
export interface FileContentResponse {
	/** File path */
	path: string
	/** File content */
	content: string
	/** File size in bytes */
	size?: number
	/** Last modified timestamp */
	modified?: number
}

/**
 * File list response
 */
export interface FileListResponse {
	/** List of file paths */
	files: string[]
	/** Total file count */
	count: number
}

/**
 * Directory tree node
 */
export interface DirectoryTreeNode {
	/** File/directory name */
	name: string
	/** Full path */
	path: string
	/** Is directory */
	isDirectory: boolean
	/** Children (if directory) */
	children?: DirectoryTreeNode[]
}

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * WebSocket connection info
 */
export interface WebSocketConnectionInfo {
	/** Connection ID */
	id: string
	/** Connected timestamp */
	connectedAt: number
	/** Last activity timestamp */
	lastActivity: number
	/** Client IP */
	ip?: string
}

/**
 * WebSocket connections list response
 */
export interface WebSocketConnectionsResponse {
	/** Active connections */
	connections: WebSocketConnectionInfo[]
	/** Total connection count */
	count: number
}