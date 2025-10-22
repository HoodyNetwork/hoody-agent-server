/**
 * Task Management Controller
 *
 * This is the most complex and critical part of the API. It handles the entire lifecycle of a task,
 * from creation to completion, including interaction, state changes, and history management.
 */

import {
	Controller,
	Route,
	Get,
	Post,
	Put,
	Patch,
	Delete,
	Path,
	Query,
	Body,
	Security,
	SuccessResponse,
} from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { TaskStatus } from "@roo-code/types"
import { BadRequestError, NotFoundError, ConflictError } from "../errors"
import { checkpointRestore, checkpointDiff } from "../../../core/checkpoints"
import type { ClineMessage } from "../api-types"
import { RequestScopedContext } from "../../../core/context/RequestScopedContext"
import type { TaskExecutionPool } from "../TaskExecutionPool"
// Import tool response types for OpenAPI generation
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
	TaskContextMetadata,
} from "../types/websocket-messages"

/**
 * Task/History item structure (TypeScript interface for OpenAPI generation)
 * Note: This matches the Zod schema from packages/types/src/history.ts
 */
interface HistoryItem {
	id: string
	rootTaskId?: string
	parentTaskId?: string
	/** Subtask depth: 1 = root task, 2+ = subtask levels. Forks inherit from source but meaningless for them. */
	number: number
	ts: number
	task: string
	tokensIn: number
	tokensOut: number
	cacheWrites?: number
	cacheReads?: number
	totalCost: number
	contextTokens?: number
	size?: number
	workspace?: string
	isFavorited?: boolean
	fileNotfound?: boolean
	mode?: string
	modelId?: string
	modelProvider?: string
	profileName?: string
	/** Fork tracking - task this was forked from */
	sourceTaskId?: string
	/** Fork tracking - message timestamp we forked from */
	forkFromMessageTs?: number
	/** Fork tracking - when the fork was created */
	forkTimestamp?: number
	/** Task status - reflects last known state */
	status?: "running" | "interactive" | "resumable" | "idle" | "completed"
}

/**
 * Task hierarchy metadata computed from task relationships
 */
interface TaskHierarchyMetadata {
	/** Whether this task is a fork (created via fork API from another task's message) */
	isFork: boolean
	/** Whether this task is a subtask (created via new_task tool during execution) */
	isSubtask: boolean
	/** Whether this is a root-level task (not a fork or subtask) */
	isRootTask: boolean
	/** Subtask depth in execution stack (0 = root, 1 = first subtask, etc.) */
	subtaskDepth: number
	/** Fork metadata (only present if isFork=true) */
	fork?: {
		/** Task ID this was forked from */
		sourceTaskId: string
		/** Timestamp of message this was forked from */
		forkFromMessageTs: number
		/** When the fork was created */
		forkTimestamp: number
	}
	/** Subtask metadata (only present if isSubtask=true) */
	subtask?: {
		/** Direct parent task ID */
		parentTaskId: string
		/** Root task ID in the execution tree */
		rootTaskId: string
	}
}

/**
 * Extended HistoryItem with computed hierarchy and optional last message
 */
interface HistoryItemWithMetadata extends HistoryItem {
	/** Computed task hierarchy and fork metadata */
	hierarchy?: TaskHierarchyMetadata
	/** Last message if includeLastMessage=true */
	lastMessage?: {
		/** Raw API message format (with XML tool calls) */
		raw?: any
		/** Parsed UI message format (JSON) */
		parsed?: any
	}
}

// Dependency injection
let providerInstance: ClineProvider | null = null
let poolInstance: TaskExecutionPool | null = null

export function setTasksControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

export function setTasksControllerPool(pool: TaskExecutionPool) {
	poolInstance = pool
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("TasksController: Provider not initialized")
	}
	return providerInstance
}

/**
 * Get provider for a specific task
 * Uses TaskExecutionPool for parallel execution if available,
 * falls back to legacy single-provider mode with ensureTaskIsCurrent
 */
async function getTaskProvider(taskId: string): Promise<ClineProvider> {
	if (poolInstance) {
		// Pool mode: Get dedicated provider for this task
		return await poolInstance.getProviderForTask(taskId)
	}
	
	// Legacy mode: Use single provider with task switching
	const provider = getProvider()
	await provider.ensureTaskIsCurrent(taskId)
	return provider
}

/**
 * Build task context information for API responses
 */
async function buildTaskContext(provider: ClineProvider, taskId?: string): Promise<TaskContext | undefined> {
	try {
		const task = taskId
			? (provider.getCurrentTask()?.taskId === taskId ? provider.getCurrentTask() : undefined)
			: provider.getCurrentTask()
		
		if (!task) {
			return undefined
		}

		const state = await provider.getState()
		const modelInfo = task.api?.getModel()
		
		return {
			mode: await task.getTaskMode(),
			modelId: modelInfo?.id || state.apiConfiguration.apiModelId,
			modelProvider: state.apiConfiguration.apiProvider,
			profileName: state.currentApiConfigName,
		}
	} catch (error) {
		console.error("Error building task context:", error)
		return undefined
	}
}

// Helper functions
function parsePagination(page?: number, limit?: number) {
	const p = Math.max(1, page || 1)
	const l = Math.min(500, Math.max(1, limit || 50))
	return { page: p, limit: l }
}

/**
 * Compute task hierarchy metadata from raw task fields
 *
 * Determines if a task is:
 * - A fork (created via fork API from message)
 * - A subtask (created via new_task tool)
 * - A root task (neither fork nor subtask)
 *
 * Note: Forks inherit `number` from source task but it's meaningless for them.
 * Always check `sourceTaskId` + `forkFromMessageTs` to detect forks.
 */
function computeTaskHierarchy(task: HistoryItem): TaskHierarchyMetadata {
	const isFork = !!(task.sourceTaskId && task.forkFromMessageTs)
	const isSubtask = !!(task.parentTaskId || task.rootTaskId)
	const isRootTask = !isFork && !isSubtask
	
	// Compute subtask depth from number field
	// Actual values: 1 = root task, 2 = first subtask, 3 = second subtask, etc.
	// Convert to depth: root=0, first subtask=1, second subtask=2, etc.
	const subtaskDepth = task.number !== undefined && task.number > 1 ? task.number - 1 : 0
	
	const metadata: TaskHierarchyMetadata = {
		isFork,
		isSubtask,
		isRootTask,
		subtaskDepth,
	}
	
	// Add fork metadata if this is a fork
	if (isFork) {
		metadata.fork = {
			sourceTaskId: task.sourceTaskId!,
			forkFromMessageTs: task.forkFromMessageTs!,
			forkTimestamp: task.forkTimestamp || task.ts,
		}
	}
	
	// Add subtask metadata if this is a subtask
	if (isSubtask) {
		metadata.subtask = {
			parentTaskId: task.parentTaskId || "",
			rootTaskId: task.rootTaskId || "",
		}
	}
	
	return metadata
}

function applyFilters(tasks: HistoryItem[], filters: TaskFilters, cwd?: string): HistoryItem[] {
	let filtered = [...tasks]

	if (filters.workspace === "current" && cwd) {
		filtered = filtered.filter((task) => task.workspace === cwd)
	} else if (filters.workspace && filters.workspace !== "all") {
		filtered = filtered.filter((task) => task.workspace === filters.workspace)
	}

	if (filters.favorites === "true") {
		filtered = filtered.filter((task) => task.isFavorited === true)
	}

	if (filters.mode) {
		filtered = filtered.filter((task) => task.mode === filters.mode)
	}

	if (filters.dateFrom) {
		const fromDate = new Date(filters.dateFrom).getTime()
		filtered = filtered.filter((task) => task.ts >= fromDate)
	}
	if (filters.dateTo) {
		const toDate = new Date(filters.dateTo).getTime()
		filtered = filtered.filter((task) => task.ts <= toDate)
	}

	if (filters.search) {
		const searchLower = filters.search.toLowerCase()
		filtered = filtered.filter((task) => task.task?.toLowerCase().includes(searchLower))
	}

	return filtered
}

function applySorting(tasks: HistoryItem[], sortBy?: string): HistoryItem[] {
	const sorted = [...tasks]
	switch (sortBy) {
		case "oldest":
			sorted.sort((a, b) => a.ts - b.ts)
			break
		case "cost":
		case "mostExpensive":
			sorted.sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
			break
		case "tokens":
		case "mostTokens":
			sorted.sort((a, b) => {
				const aTokens = (a.tokensIn || 0) + (a.tokensOut || 0)
				const bTokens = (b.tokensIn || 0) + (b.tokensOut || 0)
				return bTokens - aTokens
			})
			break
		case "newest":
		default:
			sorted.sort((a, b) => b.ts - a.ts)
			break
	}
	return sorted
}

function paginate<T>(items: T[], page: number, limit: number) {
	const offset = (page - 1) * limit
	const paginated = items.slice(offset, offset + limit)
	return {
		data: paginated,
		pagination: {
			page,
			limit,
			total: items.length,
			totalPages: Math.ceil(items.length / limit),
			hasNext: page < Math.ceil(items.length / limit),
			hasPrev: page > 1,
		},
	}
}

// Type definitions

/**
 * Task context information included in responses
 */
interface TaskContext {
	mode?: string
	modelId?: string
	modelProvider?: string
	profileName?: string
}

interface CreateTaskRequest {
	text: string
	images?: string[]
	mode?: string
}

interface CreateTaskResponse {
	taskId: string
	status: string
	context?: TaskContext
}

interface TaskFilters {
	workspace?: string
	favorites?: string
	mode?: string
	dateFrom?: string
	dateTo?: string
	search?: string
}

interface TaskListResponse {
	data: HistoryItemWithMetadata[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
	links: {
		self: string
		next: string | null
		prev: string | null
		first: string
		last: string
	}
}

interface TaskDetailsResponse {
	historyItem: HistoryItemWithMetadata
	/** Raw API messages in Anthropic/OpenAI XML format */
	messages?: any[]
	/** Parsed UI messages in ClineMessage JSON format - fully typed for OpenAPI generation */
	uiMessages?: ClineMessage[]
	context?: TaskContext
}

interface ResumeTaskResponse {
	success: boolean
	taskId: string
	status: string
	context?: TaskContext
}

interface RespondToTaskRequest {
	/**
	 * Response type:
	 * - "approve" or "yes" → Approve the current request (same as /resume)
	 * - "deny" or "no" → Reject the current request
	 * - Any other text → Send as message response to followup questions
	 */
	response: string
	/** Optional images to include with response */
	images?: string[]
	/** Optional text to include with denial (for context) */
	text?: string
	/** Temporary mode override for this request only (does not persist to task) */
	mode?: string
	/** Temporary profile override for this request only (does not persist to task) */
	profileId?: string
}

interface RespondToTaskResponse {
	success: boolean
	taskId: string
	response: string
	context?: TaskContext
}

interface CancelTaskResponse {
	success: boolean
	taskId: string
}

interface ToggleFavoriteResponse {
	success: boolean
	taskId: string
}

interface ExportTaskResponse {
	success: boolean
	message: string
}

interface CondenseTaskResponse {
	success: boolean
	taskId: string
}

interface QueueMessage {
	id: string
	text: string
	images?: string[]
}

interface MessageQueueResponse {
	taskId: string
	messages: QueueMessage[]
	count: number
}

interface AddToQueueRequest {
	text: string
	images?: string[]
}

interface AddToQueueResponse {
	success: boolean
	taskId: string
	message: QueueMessage
}

interface UpdateQueueMessageRequest {
	text: string
	images?: string[]
}

interface UpdateQueueMessageResponse {
	success: boolean
	taskId: string
	messageId: string
}

interface ClearQueueResponse {
	success: boolean
	taskId: string
	cleared: number
}

interface BatchDeleteRequest {
	taskIds: string[]
}

interface BatchDeleteResponse {
	success: boolean
	deleted: number
	failed: number
	total: number
}

interface ForkTaskRequest {
	messageTimestamp: number
	makeActive?: boolean
	mode?: string
	providerProfile?: string
}

interface ForkTaskResponse {
	success: boolean
	forkedTaskId: string
	sourceTaskId: string
	forkFromMessageTs: number
	messagesIncluded: number
	isActive: boolean
	context?: TaskContext
}

interface EditMessageRequest {
	/** Updated message text */
	text: string
	/** Updated images (optional) */
	images?: string[]
}

interface EditMessageResponse {
	success: boolean
	taskId: string
	messageTimestamp: number
	message: string
}

interface DigestMessageRequest {
	/** Maximum digest length in characters (20-500, default: from settings) */
	maxLength?: number
	/** AI profile ID to use for digest generation (default: from settings) */
	profileId?: string
	/** Force regeneration even if digest exists */
	force?: boolean
}

interface DigestMessageResponse {
	success: boolean
	taskId: string
	messageTimestamp: number
	digest: string
	metadata: {
		generatedAt: number
		profileId: string
		tokensUsed?: number
		maxLength: number
	}
}

interface ToggleTaskDigestRequest {
	/** Enable or disable digest for this task */
	enabled: boolean
	/** Override max length for this task */
	maxLength?: number
	/** Override profile ID for this task */
	profileId?: string
}

interface ToggleTaskDigestResponse {
	success: boolean
	taskId: string
	settings: {
		enabled: boolean
		maxLength?: number
		profileId?: string
	}
}

interface Checkpoint {
	hash: string
	timestamp: number
	from?: string
	to?: string
	suppressMessage?: boolean
}

interface CheckpointListResponse {
	taskId: string
	checkpoints: Checkpoint[]
	count: number
	currentCheckpoint?: string
}

interface RestoreCheckpointRequest {
	hash: string
}

interface RestoreCheckpointResponse {
	success: boolean
	taskId: string
	restoredToHash: string
	message: string
}

interface CheckpointDiffResponse {
	taskId: string
	fromHash: string
	toHash?: string
	changes: Array<{
		path: string
		before: string
		after: string
	}>
}

/**
 * Complete task export data structure
 */
interface TaskExportData {
	/** Task metadata and history item */
	historyItem: any
	/** Raw API messages (Anthropic/OpenAI format) */
	apiMessages: any[]
	/** Parsed UI messages (ClineMessage format) */
	uiMessages: ClineMessage[]
	/** Export metadata */
	exportMetadata: {
		exportedAt: number
		exportVersion: string
		sourceTaskId: string
	}
}

/**
 * Task JSON export response
 */
interface TaskExportJsonResponse {
	success: boolean
	taskId: string
	data: TaskExportData
}

/**
 * Task import request
 */
interface ImportTaskRequest {
	/** Complete task data from export */
	data: TaskExportData
	/** Whether to make the imported task active (default: true) */
	makeActive?: boolean
	/** Optional: Override mode for imported task */
	mode?: string
}

/**
 * Task import response
 */
interface ImportTaskResponse {
	success: boolean
	taskId: string
	sourceTaskId: string
	message: string
	isActive: boolean
}

/**
 * Task mode update request
 */
interface UpdateTaskModeRequest {
	/** New mode for this task (persists to history) */
	mode: string
	/** Optional: also change task's profile (persists to history) */
	profileId?: string
}

/**
 * Task mode update response
 */
interface UpdateTaskModeResponse {
	success: boolean
	taskId: string
	mode: string
	profileId?: string
	message: string
	context?: TaskContext
}

@Route("tasks")
@Security("bearer")
export class TasksController extends Controller {
	/**
	 * Create a new task
	 * @summary Create task
	 */
	@Post()
	@SuccessResponse(201, "Task created")
	public async createTask(@Body() body: CreateTaskRequest): Promise<CreateTaskResponse> {
		const provider = getProvider()

		// Validate request body
		if (!body || typeof body !== "object") {
			throw new BadRequestError("Request body is required")
		}

		if (!body.text || typeof body.text !== "string") {
			throw new BadRequestError(
				'Field "text" is required and must be a string. ' +
				'Note: Use "text" not "message" for the task description.'
			)
		}

		// Validate images if provided
		if (body.images !== undefined) {
			if (!Array.isArray(body.images)) {
				throw new BadRequestError('Field "images" must be an array of base64 strings')
			}
			if (!body.images.every((img) => typeof img === "string")) {
				throw new BadRequestError('All items in "images" array must be strings')
			}
		}

		// Validate mode if provided
		if (body.mode !== undefined && typeof body.mode !== "string") {
			throw new BadRequestError('Field "mode" must be a string')
		}

		// Switch mode if requested
		if (body.mode) {
			await provider.setMode(body.mode)
		}

		// Create the task
		const task = await provider.createTask(body.text, body.images)
		const context = await buildTaskContext(provider, task.taskId)

		this.setStatus(201)
		return {
			taskId: task.taskId,
			status: "active",
			context,
		}
	}

	/**
	 * List all tasks from history with filtering, sorting, and pagination
	 * @summary List tasks
	 * @param page Page number (default: 1)
	 * @param limit Items per page (default: 50, max: 500)
	 * @param sort Sort order (newest, oldest, cost, tokens)
	 * @param workspace Filter by workspace (current, all, or specific path)
	 * @param favorites Filter favorites only (true/false)
	 * @param mode Filter by mode
	 * @param dateFrom Filter from date (ISO 8601)
	 * @param dateTo Filter to date (ISO 8601)
	 * @param search Search in task text
	 * @param includeLastMessage Include last message (raw and parsed) for each task (default: false)
	 * @param includeHierarchy Include computed fork/subtask hierarchy metadata (default: true)
	 */
	@Get()
	@SuccessResponse(200, "Tasks listed")
	public async listTasks(
		@Query() page?: number,
		@Query() limit?: number,
		@Query() sort?: string,
		@Query() workspace?: string,
		@Query() favorites?: string,
		@Query() mode?: string,
		@Query() dateFrom?: string,
		@Query() dateTo?: string,
		@Query() search?: string,
		@Query() includeLastMessage?: boolean,
		@Query() includeHierarchy?: boolean,
	): Promise<TaskListResponse> {
		const provider = getProvider()
		const { page: p, limit: l } = parsePagination(page, limit)

		let taskHistory = provider.getTaskHistory()
		const filters: TaskFilters = { workspace, favorites, mode, dateFrom, dateTo, search }
		taskHistory = applyFilters(taskHistory, filters, provider.cwd)
		taskHistory = applySorting(taskHistory, sort)
		const result = paginate(taskHistory, p, l)

		// Add computed hierarchy metadata (default: true for better UX)
		const shouldIncludeHierarchy = includeHierarchy !== false
		let enrichedData: HistoryItemWithMetadata[] = result.data
		
		if (shouldIncludeHierarchy) {
			enrichedData = result.data.map(task => ({
				...task,
				hierarchy: computeTaskHierarchy(task)
			}))
		}

		// Optionally enrich with last message
		if (includeLastMessage) {
			const fs = await import("fs/promises")
			enrichedData = await Promise.all(
				enrichedData.map(async (task) => {
					try {
						const { apiConversationHistoryFilePath, uiMessagesFilePath } = await provider.getTaskWithId(task.id)
						
						// Read both message formats
						const [apiMessages, uiMessages] = await Promise.all([
							fs.readFile(apiConversationHistoryFilePath, "utf8").then(JSON.parse),
							fs.readFile(uiMessagesFilePath, "utf8").then(JSON.parse)
						])
						
						// Get last messages
						const lastApiMessage = apiMessages[apiMessages.length - 1]
						const lastUiMessage = uiMessages[uiMessages.length - 1]
						
						return {
							...task,
							lastMessage: {
								raw: lastApiMessage,      // Raw API format (with XML)
								parsed: lastUiMessage     // Parsed UI format (JSON)
							}
						}
					} catch (error) {
						// If we can't read messages, return task without lastMessage
						return task
					}
				})
			)
		}

		const basePath = "/api/v1/agent/tasks"
		return {
			data: enrichedData,
			pagination: result.pagination,
			links: {
				self: `${basePath}?page=${p}`,
				next: result.pagination.hasNext ? `${basePath}?page=${p + 1}` : null,
				prev: result.pagination.hasPrev ? `${basePath}?page=${p - 1}` : null,
				first: `${basePath}?page=1`,
				last: `${basePath}?page=${result.pagination.totalPages}`,
			},
		}
	}

	/**
	 * Get task details with conversation history
	 *
	 * Supports flexible message retrieval:
	 * - Default: Raw API messages only (backward compatible)
	 * - includeParsed=true: Include parsed UI messages
	 * - includeRaw=false: Exclude raw API messages (only when includeParsed=true)
	 *
	 * @summary Get task by ID
	 * @param taskId Task ID
	 * @param includeParsed Include parsed UI messages (default: false)
	 * @param includeRaw Include raw API messages (default: true). Set to false for smaller responses when only UI messages are needed.
	 */
	@Get("{taskId}")
	@SuccessResponse(200, "Task retrieved")
	public async getTask(
		@Path() taskId: string,
		@Query() includeParsed?: boolean,
		@Query() includeRaw?: boolean,
	): Promise<TaskDetailsResponse> {
		const provider = getProvider()

		try {
			const { historyItem, apiConversationHistory, uiMessagesFilePath } = await provider.getTaskWithId(taskId)
			
			// Build task context if this is the current task
			const context = await buildTaskContext(provider, taskId)
			
			// Default: includeRaw=true for backward compatibility
			const shouldIncludeRaw = includeRaw !== false
			
			// Validate: If exclud<br>ing raw messages, must include parsed messages
			if (!shouldIncludeRaw && !includeParsed) {
				throw new BadRequestError(
					"Cannot exclude raw messages (includeRaw=false) without including parsed messages (includeParsed=true). " +
					"At least one message format must be included in the response."
				)
			}
			
			const response: TaskDetailsResponse = {
				historyItem,
				context,
			}

			// Conditionally include raw API messages
			if (shouldIncludeRaw) {
				response.messages = apiConversationHistory
			}

			// Optionally include parsed UI messages
			if (includeParsed) {
				const fs = await import("fs/promises")
				const uiMessages = JSON.parse(await fs.readFile(uiMessagesFilePath, "utf8"))
				response.uiMessages = uiMessages
			}

			return response
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Delete a task permanently
	 * @summary Delete task
	 * @param taskId Task ID
	 */
	@Delete("{taskId}")
	@SuccessResponse(204, "Task deleted")
	public async deleteTask(@Path() taskId: string): Promise<void> {
		const provider = getProvider()

		try {
			await provider.deleteTaskWithId(taskId)
			
			// Release provider from pool if using pool mode
			if (poolInstance && poolInstance.hasProviderForTask(taskId)) {
				console.log(`[TasksController] Releasing provider for deleted task ${taskId}`)
				await poolInstance.releaseProvider(taskId)
			}
			
			this.setStatus(204)
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Resume a paused task
	 * @summary Resume task
	 * @param taskId Task ID
	 */
	@Post("{taskId}/resume")
	@SuccessResponse(200, "Task resumed")
	public async resumeTask(@Path() taskId: string): Promise<ResumeTaskResponse> {
		const provider = await getTaskProvider(taskId)

		try {
			const task = provider.getCurrentTask()
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const startTime = Date.now()
			while (task.taskStatus !== TaskStatus.Resumable && Date.now() - startTime < 10000) {
				await new Promise((resolve) => setTimeout(resolve, 50))
			}
			if (task.taskStatus !== TaskStatus.Resumable) {
				throw new BadRequestError(`Task cannot be resumed - current status: ${task.taskStatus}.`)
			}
			task.handleWebviewAskResponse("yesButtonClicked")
			const context = await buildTaskContext(provider, taskId)
			
			return {
				success: true,
				taskId,
				status: "resumed",
				context,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Send a response/message to a task
	 *
	 * This endpoint handles three different scenarios:
	 *
	 * 1. **Approve**: Send "approve" or "yes" to approve the current tool/action request
	 * 2. **Deny**: Send "deny" or "no" to reject the current tool/action request
	 * 3. **Message**: Send any other text as a message response to followup questions
	 *
	 * Supports optional mode/profile overrides for temporary context switching:
	 * - `mode`: Temporarily use a different mode for this request only
	 * - `profileId`: Temporarily use a different profile for this request only
	 * - Overrides do NOT persist - task reverts to its original mode/profile after request
	 *
	 * @summary Respond to task
	 * @param taskId Task ID
	 * @param body Response details
	 *
	 * @example
	 * // Approve a tool request
	 * { "response": "approve" }
	 *
	 * @example
	 * // Deny a tool request
	 * { "response": "deny" }
	 *
	 * @example
	 * // Answer a followup question
	 * { "response": "Use approach #2 with error handling" }
	 *
	 * @example
	 * // Approve with temporary mode override
	 * { "response": "approve", "mode": "debug", "profileId": "fast-model" }
	 */
	@Post("{taskId}/respond")
	@SuccessResponse(200, "Response sent")
	public async respondToTask(
		@Path() taskId: string,
		@Body() body: RespondToTaskRequest,
	): Promise<RespondToTaskResponse> {
		if (!body.response || typeof body.response !== "string") {
			throw new BadRequestError("response is required and must be a string")
		}

		// Validate optional mode/profile overrides
		if (body.mode !== undefined && typeof body.mode !== "string") {
			throw new BadRequestError("mode must be a string")
		}

		if (body.profileId !== undefined && typeof body.profileId !== "string") {
			throw new BadRequestError("profileId must be a string")
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			// Handle temporary mode/profile override if specified
			let scopedContext: RequestScopedContext | undefined
			if (body.mode || body.profileId) {
				scopedContext = new RequestScopedContext()
				await scopedContext.applyOverride(provider, task, {
					mode: body.mode,
					profileId: body.profileId
				})
			}

			try {
				// Handle different response types
				const responseLower = body.response.toLowerCase().trim()
				
				if (responseLower === "approve" || responseLower === "yes") {
					// Approve the current request (same as /resume endpoint)
					task.handleWebviewAskResponse("yesButtonClicked", body.text, body.images || [])
				} else if (responseLower === "deny" || responseLower === "no") {
					// Deny/reject the current request
					task.handleWebviewAskResponse("noButtonClicked", body.text, body.images || [])
				} else {
					// Send as message response (for followup questions)
					task.handleWebviewAskResponse("messageResponse", body.response, body.images || [])
				}
				
				const context = await buildTaskContext(provider, taskId)
				
				return {
					success: true,
					taskId,
					response: body.response,
					context,
				}
			} finally {
				// Always revert context override
				if (scopedContext) {
					await scopedContext.revert(provider, task)
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Cancel the currently active task
	 * @summary Cancel task
	 * @param taskId Task ID
	 */
	@Post("{taskId}/cancel")
	@SuccessResponse(200, "Task cancelled")
	public async cancelTask(@Path() taskId: string): Promise<CancelTaskResponse> {
		const provider = getProvider()
		const currentTask = provider.getCurrentTask()

		if (!currentTask || currentTask.taskId !== taskId) {
			throw new BadRequestError(`Task ${taskId} is not currently active. Only the active task can be cancelled.`)
		}

		await provider.cancelTask()
		return { success: true, taskId }
	}

	/**
	 * Toggle task favorite status
	 * @summary Toggle favorite
	 * @param taskId Task ID
	 */
	@Post("{taskId}/favorite")
	@SuccessResponse(200, "Favorite toggled")
	public async toggleFavorite(@Path() taskId: string): Promise<ToggleFavoriteResponse> {
		const provider = getProvider()
		await provider.toggleTaskFavorite(taskId)
		return { success: true, taskId }
	}

	/**
	 * Export task as JSON (complete backup)
	 *
	 * Returns complete task data including history item, API messages, and UI messages.
	 * This provides a lossless backup that can be imported to restore the exact task state.
	 *
	 * @summary Export task as JSON
	 * @param taskId Task ID to export
	 */
	@Get("{taskId}/export/json")
	@SuccessResponse(200, "Task exported as JSON")
	public async exportTaskJson(@Path() taskId: string): Promise<TaskExportJsonResponse> {
		const provider = getProvider()

		try {
			const { historyItem, apiConversationHistory, uiMessagesFilePath } = await provider.getTaskWithId(taskId)
			
			// Read UI messages
			const fs = await import("fs/promises")
			const uiMessages = JSON.parse(await fs.readFile(uiMessagesFilePath, "utf8"))

			return {
				success: true,
				taskId,
				data: {
					historyItem,
					apiMessages: apiConversationHistory,
					uiMessages,
					exportMetadata: {
						exportedAt: Date.now(),
						exportVersion: "1.0.0",
						sourceTaskId: taskId,
					}
				}
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Export task to Markdown file (legacy)
	 * @summary Export task as Markdown (legacy)
	 * @param taskId Task ID
	 */
	@Post("{taskId}/export")
	@SuccessResponse(200, "Task exported")
	public async exportTask(@Path() taskId: string): Promise<ExportTaskResponse> {
		const provider = getProvider()

		try {
			await provider.exportTaskWithId(taskId)
			return {
				success: true,
				message: "Task exported successfully to markdown",
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Import task from JSON export
	 *
	 * Creates a new task from exported JSON data, restoring the complete conversation
	 * history and state. The imported task gets a new ID but preserves the source
	 * task reference.
	 *
	 * @summary Import task from JSON
	 * @param body Task import request with export data
	 */
	@Post("import/json")
	@SuccessResponse(201, "Task imported successfully")
	public async importTaskJson(@Body() body: ImportTaskRequest): Promise<ImportTaskResponse> {
		const provider = getProvider()

		// Validate request
		if (!body.data) {
			throw new BadRequestError("data field is required")
		}

		const { historyItem, apiMessages, uiMessages, exportMetadata } = body.data

		if (!historyItem || !apiMessages || !uiMessages) {
			throw new BadRequestError(
				"Invalid export data: must include historyItem, apiMessages, and uiMessages"
			)
		}

		if (!Array.isArray(apiMessages) || !Array.isArray(uiMessages)) {
			throw new BadRequestError("apiMessages and uiMessages must be arrays")
		}

		try {
			const crypto = await import("crypto")
			const newTaskId = crypto.randomUUID()
			const importTimestamp = Date.now()

			// Create new history item with import metadata
			const importedHistoryItem: any = {
				...historyItem,
				id: newTaskId,
				ts: importTimestamp,
				// Clear parent/child relationships - imported tasks are independent
				rootTaskId: undefined,
				parentTaskId: undefined,
				// Track import source
				sourceTaskId: exportMetadata?.sourceTaskId || historyItem.id,
				importedAt: importTimestamp,
				importVersion: exportMetadata?.exportVersion || "unknown",
				// Override mode if requested
				mode: body.mode || historyItem.mode,
			}

			// Get current state for configuration
			const state = await provider.getState()

			// Create task instance
			const { Task } = await import("../../../core/task/Task")
			const task = new Task({
				context: provider.context,
				provider,
				apiConfiguration: state.apiConfiguration,
				enableDiff: state.diffEnabled,
				enableCheckpoints: state.enableCheckpoints,
				enableBridge: false,
				fuzzyMatchThreshold: state.fuzzyMatchThreshold,
				consecutiveMistakeLimit: state.apiConfiguration.consecutiveMistakeLimit,
				historyItem: importedHistoryItem,
				startTask: false,
				workspacePath: historyItem.workspace || provider.cwd,
				onCreated: (provider as any).taskCreationCallback,
				experiments: state.experiments,
			})

			// Restore conversation state
			await task.overwriteClineMessages(uiMessages)
			await task.overwriteApiConversationHistory(apiMessages)

			// Mark as initialized
			task.isInitialized = true

			// Save to persistent storage
			await provider.updateTaskHistory(importedHistoryItem)

			// Optionally make active
			const makeActive = body.makeActive !== false
			if (makeActive) {
				await (provider as any).removeClineFromStack()
				await (provider as any).addClineToStack(task)

				if (body.mode) {
					await provider.setMode(body.mode)
				}

				await provider.postStateToWebview()
			}

			this.setStatus(201)
			return {
				success: true,
				taskId: newTaskId,
				sourceTaskId: exportMetadata?.sourceTaskId || historyItem.id,
				message: `Task imported successfully from ${exportMetadata?.sourceTaskId || historyItem.id}`,
				isActive: makeActive,
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new BadRequestError(`Failed to import task: ${error.message}`)
			}
			throw error
		}
	}

	/**
	 * Condense task context (advanced feature)
	 * @summary Condense task
	 * @param taskId Task ID
	 */
	@Post("{taskId}/condense")
	@SuccessResponse(200, "Task condensed")
	public async condenseTask(@Path() taskId: string): Promise<CondenseTaskResponse> {
		const provider = getProvider()

		try {
			await provider.condenseTaskContext(taskId)
			return { success: true, taskId }
		} catch (error) {
			if (error instanceof Error && error.message.includes("not found")) {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Get task's message queue
	 * @summary Get message queue
	 * @param taskId Task ID
	 */
	@Get("{taskId}/queue")
	@SuccessResponse(200, "Queue retrieved")
	public async getMessageQueue(@Path() taskId: string): Promise<MessageQueueResponse> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const messages = task.messageQueueService?.messages || []
			return {
				taskId,
				messages,
				count: messages.length,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Add message to task's queue
	 * @summary Add to queue
	 * @param taskId Task ID
	 */
	@Post("{taskId}/queue")
	@SuccessResponse(201, "Message added to queue")
	public async addToQueue(@Path() taskId: string, @Body() body: AddToQueueRequest): Promise<AddToQueueResponse> {
		if (!body.text || typeof body.text !== "string") {
			throw new BadRequestError("text is required and must be a string")
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const message = task.messageQueueService?.addMessage(body.text, body.images)
			if (!message) {
				throw new BadRequestError("Failed to add message to queue")
			}

			this.setStatus(201)
			return {
				success: true,
				taskId,
				message,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Update a queued message
	 * @summary Update queued message
	 * @param taskId Task ID
	 * @param messageId Message ID
	 */
	@Put("{taskId}/queue/{messageId}")
	@SuccessResponse(200, "Message updated")
	public async updateQueuedMessage(
		@Path() taskId: string,
		@Path() messageId: string,
		@Body() body: UpdateQueueMessageRequest,
	): Promise<UpdateQueueMessageResponse> {
		if (!body.text || typeof body.text !== "string") {
			throw new BadRequestError("text is required and must be a string")
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const success = task.messageQueueService?.updateMessage(messageId, body.text, body.images)
			if (!success) {
				throw new NotFoundError("Message not found in queue")
			}
			return { success: true, taskId, messageId }
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Delete a queued message
	 * @summary Delete queued message
	 * @param taskId Task ID
	 * @param messageId Message ID
	 */
	@Delete("{taskId}/queue/{messageId}")
	@SuccessResponse(204, "Message deleted")
	public async deleteQueuedMessage(@Path() taskId: string, @Path() messageId: string): Promise<void> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const success = task.messageQueueService?.removeMessage(messageId)
			if (!success) {
				throw new NotFoundError("Message not found in queue")
			}
			this.setStatus(204)
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Clear all queued messages
	 * @summary Clear message queue
	 * @param taskId Task ID
	 */
	@Delete("{taskId}/queue")
	@SuccessResponse(200, "Queue cleared")
	public async clearMessageQueue(@Path() taskId: string): Promise<ClearQueueResponse> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const messages = task.messageQueueService?.messages || []
			const count = messages.length
			messages.forEach((message) => task.messageQueueService?.removeMessage(message.id))
			return {
				success: true,
				taskId,
				cleared: count,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Delete multiple tasks in batch
	 * @summary Batch delete tasks
	 */
	@Delete("batch")
	@SuccessResponse(200, "Batch delete completed")
	public async batchDeleteTasks(@Body() body: BatchDeleteRequest): Promise<BatchDeleteResponse> {
		const provider = getProvider()

		if (!Array.isArray(body.taskIds) || !body.taskIds.every((id) => typeof id === "string")) {
			throw new BadRequestError("taskIds must be an array of strings.")
		}

		try {
			// Use the dedicated batch delete method which has proper favorite protection
			await provider.deleteMultipleTasks(body.taskIds)
			
			// Explicitly set status to 200 to ensure proper response
			this.setStatus(200)
			
			return {
				success: true,
				deleted: body.taskIds.length,
				failed: 0,
				total: body.taskIds.length,
			}
		} catch (error) {
			// If any task is favorited, the whole batch fails with a clear error
			if (error instanceof Error && error.message.includes("favorited")) {
				throw new BadRequestError(error.message)
			}
			throw error
		}
	}

	/**
	 * List all checkpoints for a task
	 * @summary List checkpoints
	 * @param taskId Task ID
	 */
	@Get("{taskId}/checkpoints")
	@SuccessResponse(200, "Checkpoints listed")
	public async listCheckpoints(@Path() taskId: string): Promise<CheckpointListResponse> {
		const provider = getProvider()

		try {
			const { uiMessagesFilePath } = await provider.getTaskWithId(taskId)
			
			// Read UI messages (clineMessages) which contain checkpoint_saved messages
			const fs = await import("fs/promises")
			const uiMessages = JSON.parse(await fs.readFile(uiMessagesFilePath, "utf8"))
			
			// Extract checkpoints from UI messages
			const checkpoints: Checkpoint[] = uiMessages
				.filter((msg: any) => msg.say === "checkpoint_saved")
				.map((msg: any) => ({
					hash: msg.text || "",
					timestamp: msg.ts || 0,
					from: msg.checkpoint?.from,
					to: msg.checkpoint?.to,
					suppressMessage: msg.checkpoint?.suppressMessage,
				}))

			// Get current checkpoint from the task if it's active
			const currentTask = provider.getCurrentTask()
			const currentCheckpoint = currentTask?.taskId === taskId
				? checkpoints[checkpoints.length - 1]?.hash
				: undefined

			return {
				taskId,
				checkpoints,
				count: checkpoints.length,
				currentCheckpoint,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Restore task to a specific checkpoint (rollback)
	 * @summary Restore checkpoint
	 * @param taskId Task ID
	 */
	@Post("{taskId}/checkpoints/restore")
	@SuccessResponse(200, "Checkpoint restored")
	public async restoreCheckpoint(
		@Path() taskId: string,
		@Body() body: RestoreCheckpointRequest,
	): Promise<RestoreCheckpointResponse> {
		if (!body.hash || typeof body.hash !== "string") {
			throw new BadRequestError("hash is required and must be a string")
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}

			// Find the checkpoint message
			const checkpointMsg = task.clineMessages.find(
				(msg) => msg.say === "checkpoint_saved" && msg.text === body.hash
			)

			if (!checkpointMsg) {
				throw new NotFoundError(`Checkpoint with hash ${body.hash} not found`)
			}

			// Restore the checkpoint
			await checkpointRestore(task, {
				ts: checkpointMsg.ts,
				commitHash: body.hash,
				mode: "restore",
				operation: "delete",
			})

			return {
				success: true,
				taskId,
				restoredToHash: body.hash,
				message: "Checkpoint restored successfully. Files and conversation rolled back.",
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Task not found") {
					throw new NotFoundError("Task not found")
				}
				if (error.message.includes("not found")) {
					throw new NotFoundError(error.message)
				}
			}
			throw error
		}
	}

	/**
	 * Get diff/changes for a checkpoint
	 * @summary Get checkpoint diff
	 * @param taskId Task ID
	 * @param hash Checkpoint hash
	 */
	@Get("{taskId}/checkpoints/{hash}/diff")
	@SuccessResponse(200, "Diff retrieved")
	public async getCheckpointDiff(
		@Path() taskId: string,
		@Path() hash: string,
	): Promise<CheckpointDiffResponse> {
		try {
			const provider = await getTaskProvider(taskId)
			
			// Read UI messages to get checkpoints
			const { uiMessagesFilePath } = await provider.getTaskWithId(taskId)
			const fs = await import("fs/promises")
			const uiMessages = JSON.parse(await fs.readFile(uiMessagesFilePath, "utf8"))

			// Find the checkpoint message
			const checkpointMsg = uiMessages.find(
				(msg: any) => msg.say === "checkpoint_saved" && msg.text === hash
			)

			if (!checkpointMsg) {
				throw new NotFoundError(`Checkpoint with hash ${hash} not found`)
			}

			// Get all checkpoints to find the next one
			const checkpoints = uiMessages
				.filter((msg: any) => msg.say === "checkpoint_saved")
				.map((msg: any) => msg.text!)

			const idx = checkpoints.indexOf(hash)
			const nextHash = idx !== -1 && idx < checkpoints.length - 1 ? checkpoints[idx + 1] : undefined

			// Load task to get checkpoint service
			const task = provider.getCurrentTask()
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const service = task.checkpointService
			if (!service) {
				throw new BadRequestError("Checkpoints are not enabled for this task")
			}

			// Get the diff
			const changes = await service.getDiff({ from: hash, to: nextHash })

			return {
				taskId,
				fromHash: hash,
				toHash: nextHash,
				changes: changes.map((change) => ({
					path: change.paths.relative,
					before: change.content.before || "",
					after: change.content.after || "",
				})),
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Task not found") {
					throw new NotFoundError("Task not found")
				}
				if (error.message.includes("not found")) {
					throw new NotFoundError(error.message)
				}
			}
			throw error
		}
	}

	/**
	 * Fork a task from a specific message.
	 * Creates a new conversation branch starting from the specified message.
	 *
	 * @summary Fork task from message
	 * @param taskId Source task ID to fork from
	 * @param body Fork request parameters
	 * @returns Information about the newly created fork
	 */
	@Post("{taskId}/fork")
	@SuccessResponse(201, "Task forked successfully")
	public async forkTask(
		@Path() taskId: string,
		@Body() body: ForkTaskRequest
	): Promise<ForkTaskResponse> {
		const provider = getProvider()

		// Validate request body
		if (!body || typeof body !== "object") {
			throw new BadRequestError("Request body is required")
		}

		if (typeof body.messageTimestamp !== "number") {
			throw new BadRequestError("messageTimestamp is required and must be a number")
		}

		// Validate optional fields
		if (body.makeActive !== undefined && typeof body.makeActive !== "boolean") {
			throw new BadRequestError("makeActive must be a boolean")
		}

		if (body.mode !== undefined && typeof body.mode !== "string") {
			throw new BadRequestError("mode must be a string")
		}

		if (body.providerProfile !== undefined && typeof body.providerProfile !== "string") {
			throw new BadRequestError("providerProfile must be a string")
		}

		try {
			// Fork the task
			const forkedTask = await provider.forkTaskFromMessage(
				taskId,
				body.messageTimestamp,
				{
					makeActive: body.makeActive ?? true,
					mode: body.mode,
					providerProfile: body.providerProfile,
				}
			)

			// Build context if task is active
			const context = (body.makeActive ?? true)
				? await buildTaskContext(provider, forkedTask.taskId)
				: undefined

			// Count messages included
			const messagesCount = forkedTask.clineMessages.length

			// Broadcast fork notification via WebSocket
			await provider.postMessageToWebview({
				type: "taskForked",
				taskId: taskId,
				taskContext: context,
				forkedTaskId: forkedTask.taskId,
				sourceTaskId: taskId,
				forkFromMessageTs: body.messageTimestamp,
				messagesIncluded: messagesCount,
				isActive: body.makeActive ?? true,
			})

			this.setStatus(201)
			return {
				success: true,
				forkedTaskId: forkedTask.taskId,
				sourceTaskId: taskId,
				forkFromMessageTs: body.messageTimestamp,
				messagesIncluded: messagesCount,
				isActive: body.makeActive ?? true,
				context,
			}
		} catch (error) {
			// Handle specific errors
			if (error instanceof Error) {
				if (error.message === "Task not found") {
					throw new NotFoundError("Task not found")
				}
				if (error.message.includes("Message") && error.message.includes("not found")) {
					throw new NotFoundError(error.message)
				}
				if (error.message.includes("partial") || error.message.includes("streaming")) {
					throw new ConflictError(error.message)
				}
			}
			
			// Re-throw unexpected errors
			throw error
		}
	}

	/**
		* Edit a user message in the conversation history.
		* Only user messages (type: "ask") can be edited for safety.
		*
		* This updates the uiMessages file only - raw API messages remain unchanged
		* for historical accuracy. The edit will be visible in the UI and affect
		* future conversation context if the task is resumed.
		*
		* @summary Edit user message
		* @param taskId Task ID
		* @param timestamp Message timestamp (used as unique identifier)
		* @param body Updated message content
		*/
	@Patch("{taskId}/messages/{timestamp}")
	@SuccessResponse(200, "Message edited successfully")
	public async editMessage(
		@Path() taskId: string,
		@Path() timestamp: number,
		@Body() body: EditMessageRequest
	): Promise<EditMessageResponse> {
		const provider = getProvider()

		// Validate request
		if (!body.text || typeof body.text !== "string") {
			throw new BadRequestError("text is required and must be a string")
		}

		if (body.images !== undefined && !Array.isArray(body.images)) {
			throw new BadRequestError("images must be an array of base64 strings")
		}

		try {
			// Get task files
			const { uiMessagesFilePath } = await provider.getTaskWithId(taskId)
			
			// Read UI messages
			const fs = await import("fs/promises")
			const uiMessages = JSON.parse(await fs.readFile(uiMessagesFilePath, "utf8"))

			// Find the message by timestamp
			const messageIndex = uiMessages.findIndex((msg: any) => msg.ts === timestamp)
			
			if (messageIndex === -1) {
				throw new NotFoundError(`Message with timestamp ${timestamp} not found`)
			}

			const message = uiMessages[messageIndex]

			// Validate it's a user message (ask type)
			if (message.type !== "ask") {
				throw new BadRequestError(
					"Only user messages (type: 'ask') can be edited. " +
					`This message has type: '${message.type}'`
				)
			}

			// Update the message
			const originalText = message.text
			message.text = body.text
			
			if (body.images !== undefined) {
				message.images = body.images
			}

			// Write updated messages back to file
			await fs.writeFile(uiMessagesFilePath, JSON.stringify(uiMessages, null, 2), "utf8")

			// If this is the current task, update in-memory messages
			const currentTask = provider.getCurrentTask()
			if (currentTask?.taskId === taskId) {
				const memoryMsgIndex = currentTask.clineMessages.findIndex(msg => msg.ts === timestamp)
				if (memoryMsgIndex !== -1) {
					currentTask.clineMessages[memoryMsgIndex].text = body.text
					if (body.images !== undefined) {
						currentTask.clineMessages[memoryMsgIndex].images = body.images
					}
				}
			}

			// Broadcast update via WebSocket (external UIs expect clineMessage payload)
			const taskContext = await buildTaskContext(provider, taskId)
			await provider.postMessageToWebview({
				type: "messageUpdated",
				taskId,
				taskContext,
				clineMessage: message,
			})

			return {
				success: true,
				taskId,
				messageTimestamp: timestamp,
				message: `Message edited successfully. Changed from "${originalText.substring(0, 50)}..." to "${body.text.substring(0, 50)}..."`,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
		* Generate digest for a specific message (on-demand)
		*
		* Creates an ultra-compact LLM-generated summary for a message.
		* The digest is stored in the message's `digest` field and broadcast
		* via WebSocket to all connected clients.
		*
		* @summary Generate message digest
		* @param taskId Task ID
		* @param timestamp Message timestamp
		* @param body Digest generation options
		*/
	@Post("{taskId}/messages/{timestamp}/digest")
	@SuccessResponse(200, "Digest generated successfully")
	public async digestMessage(
		@Path() taskId: string,
		@Path() timestamp: number,
		@Body() body: DigestMessageRequest
	): Promise<DigestMessageResponse> {
		const provider = getProvider()

		// Validate optional parameters
		if (body.maxLength !== undefined) {
			if (typeof body.maxLength !== "number" || body.maxLength < 20 || body.maxLength > 500) {
				throw new BadRequestError("maxLength must be a number between 20 and 500")
			}
		}

		if (body.profileId !== undefined && typeof body.profileId !== "string") {
			throw new BadRequestError("profileId must be a string")
		}

		if (body.force !== undefined && typeof body.force !== "boolean") {
			throw new BadRequestError("force must be a boolean")
		}

		try {
			// Get task and message
			const { uiMessagesFilePath } = await provider.getTaskWithId(taskId)
			const fs = await import("fs/promises")
			const uiMessages = JSON.parse(await fs.readFile(uiMessagesFilePath, "utf8"))

			// Find message by timestamp
			const messageIndex = uiMessages.findIndex((msg: any) => msg.ts === timestamp)
			
			if (messageIndex === -1) {
				throw new NotFoundError(`Message with timestamp ${timestamp} not found`)
			}

			const message = uiMessages[messageIndex]

			// Import DigestService
			const { DigestService } = await import("../../digest/DigestService")
			const digestService = new DigestService(provider.contextProxy, provider)

			// Generate digest
			const result = await digestService.digestMessage(message, {
				maxLength: body.maxLength,
				profileId: body.profileId,
				force: body.force,
			})

			// Update message with digest
			message.digest = result.digest
			message.digestMetadata = result.metadata

			// Save updated messages
			await fs.writeFile(uiMessagesFilePath, JSON.stringify(uiMessages, null, 2), "utf8")

			// If this is the current task, update in-memory message
			const currentTask = provider.getCurrentTask()
			if (currentTask?.taskId === taskId) {
				const memoryMsgIndex = currentTask.clineMessages.findIndex(msg => msg.ts === timestamp)
				if (memoryMsgIndex !== -1) {
					currentTask.clineMessages[memoryMsgIndex].digest = result.digest
					currentTask.clineMessages[memoryMsgIndex].digestMetadata = result.metadata
				}
			}

			// Broadcast update via WebSocket
			const taskContext = await buildTaskContext(provider, taskId)
			await provider.postMessageToWebview({
				type: "messageUpdated",
				taskId,
				taskContext,
				clineMessage: message,
			})

			return {
				success: true,
				taskId,
				messageTimestamp: timestamp,
				digest: result.digest,
				metadata: result.metadata!,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
		* Toggle Agent Digest for a specific task
		*
		* Sets task-specific digest override settings. This allows enabling/disabling
		* digest for individual tasks or customizing digest parameters per-task.
		*
		* Task overrides take precedence over global settings.
		*
		* @summary Toggle task digest
		* @param taskId Task ID
		* @param body Digest settings for this task
		*/
	@Post("{taskId}/digest/toggle")
	@SuccessResponse(200, "Task digest settings updated")
	public async toggleTaskDigest(
		@Path() taskId: string,
		@Body() body: ToggleTaskDigestRequest
	): Promise<ToggleTaskDigestResponse> {
		const provider = getProvider()

		// Validate request
		if (typeof body.enabled !== "boolean") {
			throw new BadRequestError("enabled is required and must be a boolean")
		}

		if (body.maxLength !== undefined) {
			if (typeof body.maxLength !== "number" || body.maxLength < 20 || body.maxLength > 500) {
				throw new BadRequestError("maxLength must be a number between 20 and 500")
			}
		}

		if (body.profileId !== undefined && typeof body.profileId !== "string") {
			throw new BadRequestError("profileId must be a string")
		}

		try {
			// Verify task exists
			await provider.getTaskWithId(taskId)

			// Get current overrides
			const currentOverrides = provider.contextProxy.getValue("digestTaskOverrides") || {}

			// Build new override for this task
			const taskOverride: any = {
				enabled: body.enabled,
			}

			if (body.maxLength !== undefined) {
				taskOverride.maxLength = body.maxLength
			}

			if (body.profileId !== undefined) {
				taskOverride.profileId = body.profileId
			}

			// Update overrides
			const updatedOverrides = {
				...currentOverrides,
				[taskId]: taskOverride,
			}

			// Save to settings
			await provider.setValues({
				digestTaskOverrides: updatedOverrides,
			})

			return {
				success: true,
				taskId,
				settings: taskOverride,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
		* Update a task's mode permanently
	 *
	 * Changes the task's mode and optionally its profile. The changes are persisted
	 * to the task's history and will be restored when the task is resumed in the future.
	 *
	 * If the task is currently active, the global mode/profile state is also updated
	 * to keep the UI in sync.
	 *
	 * @summary Update task mode
	 * @param taskId Task ID
	 * @param body Mode update request
	 */
	@Patch("{taskId}/mode")
	@SuccessResponse(200, "Task mode updated")
	public async updateTaskMode(
		@Path() taskId: string,
		@Body() body: UpdateTaskModeRequest
	): Promise<UpdateTaskModeResponse> {
		const provider = getProvider()

		// Validate request
		if (!body.mode || typeof body.mode !== "string") {
			throw new BadRequestError("mode is required and must be a string")
		}

		// Validate mode exists
		const modes = await provider.getModes()
		if (!modes.find(m => m.slug === body.mode)) {
			throw new BadRequestError(`Invalid mode: ${body.mode}`)
		}

		// Validate profile if provided
		let profileId: string | undefined
		let profileName: string | undefined
		if (body.profileId) {
			if (typeof body.profileId !== "string") {
				throw new BadRequestError("profileId must be a string")
			}
			const profile = provider.getProviderProfileEntries().find(p => p.id === body.profileId)
			if (!profile) {
				throw new NotFoundError(`Profile not found: ${body.profileId}`)
			}
			profileId = body.profileId
			profileName = profile.name
		}

		try {
			// Get task from history
			const history = provider.getTaskHistory()
			const taskHistoryItem = history.find(item => item.id === taskId)
			
			if (!taskHistoryItem) {
				throw new NotFoundError("Task not found")
			}

			// Update mode in history
			taskHistoryItem.mode = body.mode
			if (profileName) {
				taskHistoryItem.profileName = profileName
			}
			await provider.updateTaskHistory(taskHistoryItem)

			// If this is the current task, update runtime mode and global state
			const currentTask = provider.getCurrentTask()
			const isActive = currentTask?.taskId === taskId
			
			if (isActive) {
				// Update task's runtime mode
				;(currentTask as any)._taskMode = body.mode
				
				// Update global state to match
				await provider.setMode(body.mode)
				
				// Update profile if specified
				if (profileName) {
					await provider.setProviderProfile(profileName)
				}

				// Broadcast state change
				await provider.postStateToWebview()
			}

			// Broadcast dedicated taskModeChanged notification (for ALL tasks, active or not)
			const taskContext = await buildTaskContext(provider, taskId)
			await provider.postMessageToWebview({
				type: "taskModeChanged",
				taskId,
				taskContext,
				mode: body.mode,
				profileId,
				profileName,
				isActive,
			})

			return {
				success: true,
				taskId,
				mode: body.mode,
				profileId,
				message: `Task mode updated to '${body.mode}'${profileId ? ` with profile '${profileId}'` : ''}`,
				context: taskContext,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}
}