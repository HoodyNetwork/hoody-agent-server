/**
 * Tool Response Types for OpenAPI Generation
 *
 * This file contains TypeScript interfaces for all AI agent tool responses.
 * These types are consumed by TSOA to generate complete OpenAPI schemas,
 * enabling developers to understand the exact structure of every possible
 * tool response they'll receive via WebSocket or API.
 *
 * @see OPENAPI_MISSING_SCHEMAS_AUDIT.md for context
 */

// Import TodoItem from TodoController (canonical source)
import type { TodoItem } from "../controllers/TodoController"

// ============================================================================
// Base Tool Response Interface
// ============================================================================

/**
 * Base interface for all tool responses
 * This is the discriminated union base that all specific tool responses extend
 */
export interface BaseToolResponse {
	/** Tool type identifier - discriminator for the union */
	tool: ToolType
	/** File path (when applicable) */
	path?: string
	/** Whether path is outside workspace */
	isOutsideWorkspace?: boolean
	/** Whether file is write-protected */
	isProtected?: boolean
	/** Tool result content */
	content?: string
}

/**
 * All possible tool types
 * Maps directly to the AI agent's available tools
 */
export type ToolType =
	| "editedExistingFile"
	| "appliedDiff"
	| "newFileCreated"
	| "codebaseSearch"
	| "readFile"
	| "fetchInstructions"
	| "listFilesTopLevel"
	| "listFilesRecursive"
	| "listCodeDefinitionNames"
	| "searchFiles"
	| "switchMode"
	| "newTask"
	| "finishTask"
	| "searchAndReplace"
	| "insertContent"
	| "generateImage"
	| "imageGenerated"
	| "runSlashCommand"

// ============================================================================
// File Reading Tools
// ============================================================================

/**
 * Response from read_file tool
 * 
 * Returns file contents with line numbers, or special handling for:
 * - Binary files (format indicator)
 * - Image files (attached as image data URL)
 * - Large files (truncated with definitions)
 * - PDF/DOCX files (extracted text)
 */
export interface ToolResponseReadFile extends BaseToolResponse {
	tool: "readFile"
	path: string
	content: string // XML format: <files><file><path>...</path><content>...</content></file></files>
	/** For batch reads, number of additional files */
	additionalFileCount?: number
}

/**
 * Response from list_files tool (non-recursive)
 * 
 * Lists files and directories at the top level of a directory
 */
export interface ToolResponseListFilesTopLevel extends BaseToolResponse {
	tool: "listFilesTopLevel"
	path: string
	isOutsideWorkspace: boolean
	content: string // Formatted directory tree with metadata
}

/**
 * Response from list_files tool (recursive)
 * 
 * Lists all files and directories recursively
 */
export interface ToolResponseListFilesRecursive extends BaseToolResponse {
	tool: "listFilesRecursive"
	path: string
	isOutsideWorkspace: boolean
	content: string // Formatted directory tree with full structure
}

/**
 * Response from list_code_definition_names tool
 * 
 * Parses source code using Tree-sitter to extract:
 * - Function definitions
 * - Class definitions
 * - Method signatures
 * - Interface definitions
 * - Type definitions
 */
export interface ToolResponseListCodeDefinitionNames extends BaseToolResponse {
	tool: "listCodeDefinitionNames"
	path: string
	isOutsideWorkspace: boolean
	content: string // Tree-sitter parsed definitions or "No source code definitions found"
}

/**
 * Response from search_files tool
 * 
 * Performs regex search across files using ripgrep
 * Returns matches with surrounding context
 */
export interface ToolResponseSearchFiles extends BaseToolResponse {
	tool: "searchFiles"
	path: string
	regex: string
	filePattern?: string
	isOutsideWorkspace: boolean
	content: string // Ripgrep results with file paths, line numbers, and context
}

// ============================================================================
// File Writing Tools
// ============================================================================

/**
 * Response from write_to_file tool (new file)
 */
export interface ToolResponseNewFileCreated extends BaseToolResponse {
	tool: "newFileCreated"
	path: string
	content: string // Full file content for new files
	isOutsideWorkspace: boolean
	isProtected: boolean
}

/**
 * Response from write_to_file tool (existing file)
 */
export interface ToolResponseEditedExistingFile extends BaseToolResponse {
	tool: "editedExistingFile"
	path: string
	diff?: string // Unified diff format
	isOutsideWorkspace: boolean
	isProtected: boolean
}

/**
 * Single diff operation within apply_diff
 */
export interface DiffOperation {
	content: string
	startLine?: number
}

/**
 * Batch diff file entry
 */
export interface BatchDiffEntry {
	path: string
	changeCount: number
	key: string
	content: string
	diffs?: DiffOperation[]
}

/**
 * Response from apply_diff tool (single file)
 */
export interface ToolResponseApplyDiffSingle extends BaseToolResponse {
	tool: "appliedDiff"
	path: string
	diff: string
	isProtected: boolean
}

/**
 * Response from apply_diff tool (multi-file batch)
 */
export interface ToolResponseApplyDiffBatch extends BaseToolResponse {
	tool: "appliedDiff"
	batchDiffs: BatchDiffEntry[]
	isProtected: boolean
}

/**
 * Union type for apply_diff responses
 */
export type ToolResponseApplyDiff = ToolResponseApplyDiffSingle | ToolResponseApplyDiffBatch

/**
 * Response from search_and_replace tool
 */
export interface ToolResponseSearchAndReplace extends BaseToolResponse {
	tool: "searchAndReplace"
	path: string
	search: string
	replace: string
	useRegex: boolean
	ignoreCase: boolean
	startLine?: number
	endLine?: number
	diff: string
	isProtected: boolean
}

/**
 * Response from insert_content tool
 */
export interface ToolResponseInsertContent extends BaseToolResponse {
	tool: "insertContent"
	path: string
	diff?: string // For existing files
	content?: string // For new files
	lineNumber: number
	isProtected: boolean
}

// ============================================================================
// AI & Generation Tools
// ============================================================================

/**
 * Response from generate_image tool (request)
 */
export interface ToolResponseGenerateImage extends BaseToolResponse {
	tool: "generateImage"
	path: string
	content: string // The image generation prompt
	isOutsideWorkspace: boolean
	isProtected: boolean
	inputImage?: string // Path to input image if editing
}

/**
 * Image generation result data
 */
export interface ImageGenerationResult {
	imageUri: string // Webview URI with cache-busting
	imagePath: string // Full file system path
}

/**
 * Response from codebase_search tool
 */
export interface ToolResponseCodebaseSearch extends BaseToolResponse {
	tool: "codebaseSearch"
	query: string
	content: string // Search results from vector database
}

// ============================================================================
// Task Management Tools
// ============================================================================

/**
 * Response from new_task tool
 */
export interface ToolResponseNewTask extends BaseToolResponse {
	tool: "newTask"
	mode: string // Mode display name (e.g., "💻 Code")
	content: string // Initial task message
	todos: TodoItem[]
}

/**
 * Response from attempt_completion tool
 */
export interface ToolResponseFinishTask extends BaseToolResponse {
	tool: "finishTask"
	content: string // Completion result text
}

/**
 * Response from switch_mode tool
 */
export interface ToolResponseSwitchMode extends BaseToolResponse {
	tool: "switchMode"
	mode: string // Target mode slug
	reason?: string // Reason for switching
}

/**
 * Response from fetch_instructions tool
 */
export interface ToolResponseFetchInstructions extends BaseToolResponse {
	tool: "fetchInstructions"
	content: string // Instructions for the requested task type
}

/**
 * Response from run_slash_command tool
 */
export interface ToolResponseRunSlashCommand extends BaseToolResponse {
	tool: "runSlashCommand"
	command: string
	args?: string
	source: "global" | "project" | "built-in"
	description?: string
}

// ============================================================================
// Browser Automation Types
// ============================================================================

/**
 * Browser action types
 */
export type BrowserAction = "launch" | "click" | "hover" | "type" | "scroll_down" | "scroll_up" | "resize" | "close"

/**
 * Browser action request
 */
export interface BrowserActionRequest {
	action: BrowserAction
	coordinate?: string // For click/hover (e.g., "500,300")
	size?: string // For resize (e.g., "1920x1080")
	text?: string // For type action
}

/**
 * Browser action result
 * 
 * Returned after executing browser automation actions
 * Includes screenshot and console logs for analysis
 */
export interface BrowserActionResult {
	screenshot?: string // Base64 encoded screenshot data URL
	logs?: string // Browser console logs
	currentUrl?: string // Current page URL
	currentMousePosition?: string // Mouse coordinates
}

// ============================================================================
// MCP Integration Types
// ============================================================================

/**
 * MCP server usage request
 * 
 * When the AI agent wants to use an MCP tool or resource
 */
export interface McpServerUsageRequest {
	serverName: string
	type: "use_mcp_tool" | "access_mcp_resource"
	toolName?: string
	arguments?: string
	uri?: string
	response?: string
}

// ============================================================================
// Command Execution Types
// ============================================================================

/**
 * Terminal command execution status
 * 
 * Real-time updates broadcast via WebSocket during command execution
 */
export interface CommandExecutionStatus {
	executionId: string
	status: "started" | "output" | "exited" | "timeout" | "fallback"
	pid?: number
	command?: string
	exitCode?: number
	output?: string // Compressed terminal output
}

// ============================================================================
// API Request Metadata
// ============================================================================

/**
 * API request information
 * 
 * Metadata about AI model API calls including token usage and costs
 */
export interface ApiRequestInfo {
	request?: string
	tokensIn?: number
	tokensOut?: number
	cacheWrites?: number
	cacheReads?: number
	cost?: number
	usageMissing?: boolean
	inferenceProvider?: string
	cancelReason?: "streaming_failed" | "user_cancelled"
	streamingFailedMessage?: string
	apiProtocol?: "anthropic" | "openai"
}

// ============================================================================
// Batch File Operations
// ============================================================================

/**
 * Batch file entry for multi-file read operations
 */
export interface BatchFileEntry {
	path: string
	lineSnippet: string
	isOutsideWorkspace?: boolean
	key: string
	content?: string
}

/**
 * Response from read_file tool with batch reads
 */
export interface ToolResponseReadFileBatch extends BaseToolResponse {
	tool: "readFile"
	batchFiles: BatchFileEntry[]
}

// ============================================================================
// Complete Tool Response Union
// ============================================================================

/**
 * Complete union of all possible tool responses
 * 
 * This is the discriminated union that represents ANY tool response
 * the AI agent can generate. Use the `tool` field to discriminate.
 */
export type ToolResponse =
	| ToolResponseReadFile
	| ToolResponseReadFileBatch
	| ToolResponseListFilesTopLevel
	| ToolResponseListFilesRecursive
	| ToolResponseListCodeDefinitionNames
	| ToolResponseSearchFiles
	| ToolResponseNewFileCreated
	| ToolResponseEditedExistingFile
	| ToolResponseApplyDiff
	| ToolResponseSearchAndReplace
	| ToolResponseInsertContent
	| ToolResponseGenerateImage
	| ToolResponseNewTask
	| ToolResponseFinishTask
	| ToolResponseSwitchMode
	| ToolResponseFetchInstructions
	| ToolResponseRunSlashCommand
	| ToolResponseCodebaseSearch

// ============================================================================
// Export all types for TSOA consumption
// ============================================================================

export {
	BaseToolResponse,
	ToolType,
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
}