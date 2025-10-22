/**
 * TODO List Management Controller
 *
 * Provides REST API access to manage task TODO lists - step-by-step task tracking
 * that helps organize complex tasks and monitor progress.
 */

import {
	Controller,
	Route,
	Get,
	Post,
	Patch,
	Delete,
	Path,
	Body,
	Security,
	SuccessResponse,
	Response,
} from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import type { ApiErrorResponse } from "../api-types"
import { BadRequestError, NotFoundError } from "../errors"
import {
	addTodoToTask,
	updateTodoStatusForTask,
	removeTodoFromTask,
	getTodoListForTask,
	setTodoListForTask,
	parseMarkdownChecklist,
} from "../../../core/tools/updateTodoListTool"
import type { Task } from "../../../core/task/Task"
import type { TaskExecutionPool } from "../TaskExecutionPool"

// ============================================================================
// Type Definitions (Local for TSOA)
// ============================================================================

/**
 * TODO item status
 */
export type TodoStatus = "pending" | "in_progress" | "completed"

/**
 * TODO item
 */
export interface TodoItem {
	/** Unique TODO ID */
	id: string
	/** TODO content/description */
	content: string
	/** TODO status */
	status: TodoStatus
}

// Dependency injection
let providerInstance: ClineProvider | null = null
let poolInstance: TaskExecutionPool | null = null

export function setTodoControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

export function setTodoControllerPool(pool: TaskExecutionPool) {
	poolInstance = pool
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("TodoController: Provider not initialized")
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

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * TODO list response
 */
export interface TodoListResponse {
	/** Task ID */
	taskId: string
	/** TODO items */
	todos: TodoItem[]
	/** Total count */
	count: number
	/** Statistics */
	stats: {
		total: number
		completed: number
		inProgress: number
		pending: number
	}
}

/**
 * Create TODO request
 */
export interface CreateTodoRequest {
	/** TODO content/description */
	content: string
	/** Initial status (default: pending) */
	status?: TodoStatus
	/** Position to insert at (0-based index, default: append to end) */
	position?: number
}

/**
 * Create TODO response
 */
export interface CreateTodoResponse {
	success: true
	message: string
	/** Created TODO item */
	todo: TodoItem
}

/**
 * Update TODO request
 */
export interface UpdateTodoRequest {
	/** Updated content */
	content?: string
	/** Updated status */
	status?: TodoStatus
}

/**
 * Update TODO response
 */
export interface UpdateTodoResponse {
	success: true
	message: string
	/** Updated TODO item */
	todo: TodoItem
}

/**
 * Delete TODO response
 */
export interface DeleteTodoResponse {
	success: true
	message: string
}

/**
 * Bulk update TODOs request
 */
export interface BulkUpdateTodosRequest {
	/** Array of TODO items */
	todos: TodoItem[]
}

/**
 * Bulk update TODOs response
 */
export interface BulkUpdateTodosResponse {
	success: true
	message: string
	/** Updated TODO list */
	todos: TodoItem[]
}

/**
 * Import TODOs request (deprecated - use bulk update instead)
 * @deprecated Use POST /todos/{taskId}/bulk for consistent JSON-based TODO management
 */
export interface ImportTodosRequest {
	/** Array of TODO items to import */
	todos: TodoItem[]
}

/**
 * Import TODOs response (deprecated - use bulk update instead)
 * @deprecated Use POST /todos/{taskId}/bulk for consistent JSON-based TODO management
 */
export interface ImportTodosResponse {
	success: true
	message: string
	/** Imported TODO items */
	todos: TodoItem[]
}

/**
 * Export TODOs response
 */
export interface ExportTodosResponse {
	/** Task ID */
	taskId: string
	/** TODO items */
	todos: TodoItem[]
	/** Total count */
	count: number
	/** Statistics */
	stats: {
		total: number
		completed: number
		inProgress: number
		pending: number
	}
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate TODO statistics
 */
function calculateTodoStats(todos: TodoItem[]) {
	return {
		total: todos.length,
		completed: todos.filter(t => t.status === "completed").length,
		inProgress: todos.filter(t => t.status === "in_progress").length,
		pending: todos.filter(t => t.status === "pending").length,
	}
}

/**
 * Convert TODO list to markdown checklist
 */
function todosToMarkdown(todos: TodoItem[]): string {
	return todos
		.map(t => {
			let box = "[ ]"
			if (t.status === "completed") box = "[x]"
			else if (t.status === "in_progress") box = "[-]"
			return `${box} ${t.content}`
		})
		.join("\n")
}

/**
 * Trigger auto-init if enabled and task has empty/placeholder initial message
 */
async function triggerAutoInitIfNeeded(provider: ClineProvider, task: Task): Promise<void> {
	// Use robust gating: allow provider/system messages (api_req_*), but
	// only trigger if the user hasn't sent anything yet and the initial text is blank.
	const messages = task.clineMessages ?? []

	// If a user-submitted message already exists, do not trigger.
	const hasUserFeedback = messages.some(m => m.type === "say" && m.say === "user_feedback")
	if (hasUserFeedback) {
		return
	}

	// The initial task text is recorded as say:"text". Find it.
	const firstTextMessage = messages.find(m => m.type === "say" && m.say === "text")
	const firstText = (firstTextMessage?.text ?? "").trim()

	// Only trigger for empty/whitespace initial text.
	if (firstTextMessage && firstText.length > 0) {
		return
	}

	// Get the current profile settings and ensure auto-init is enabled.
	const currentProfile = await provider.providerSettingsManager.getCurrentProfile()
	if (!currentProfile?.taskAutoInitEnabled) {
		return
	}

	// Build the auto-init message.
	let message = currentProfile.taskAutoInitMessage || "Please begin working on these TODOs"

	// If a slash command is specified, prepend it.
	if (currentProfile.taskAutoInitSlashCommand) {
		message = `/${currentProfile.taskAutoInitSlashCommand} ${message}`
	}

	// Route through the task to ensure proper message flow.
	await task.submitUserMessage(message)
}

// ============================================================================
// Controller
// ============================================================================

@Route("todos")
@Security("bearer")
export class TodoController extends Controller {
	/**
	 * Get TODO list for a task
	 * @summary Get TODO list
	 * @param taskId Task ID
	 */
	@Get("{taskId}")
	@SuccessResponse(200, "TODO list retrieved")
	@Response<ApiErrorResponse>(404, "Task not found")
	public async getTodoList(@Path() taskId: string): Promise<TodoListResponse> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const todos = getTodoListForTask(task) || []

			return {
				taskId,
				todos,
				count: todos.length,
				stats: calculateTodoStats(todos),
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Create a new TODO item
	 * @summary Create TODO
	 * @param taskId Task ID
	 */
	@Post("{taskId}")
	@SuccessResponse(201, "TODO created")
	@Response<ApiErrorResponse>(404, "Task not found")
	public async createTodo(
		@Path() taskId: string,
		@Body() request: CreateTodoRequest,
	): Promise<CreateTodoResponse> {
		if (!request.content || typeof request.content !== "string") {
			throw new BadRequestError("content is required")
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const todo = addTodoToTask(task, request.content, request.status || "pending")

			// If position specified, reorder the list
			if (request.position !== undefined && task.todoList) {
				const position = Math.max(0, Math.min(request.position, task.todoList.length - 1))
				
				// Remove the newly added todo (it's at the end)
				const newTodo = task.todoList.pop()!
				
				// Insert at specified position
				task.todoList.splice(position, 0, newTodo)
			}

			this.setStatus(201)
			
			// Broadcast TODO list update via WebSocket
			const todos = getTodoListForTask(task) || []
			await provider.postMessageToWebview({
				type: "todoListUpdated",
				taskId,
				todos,
				todoOperation: "create",
			}).catch(() => {
				// Silently fail - don't block TODO creation
			})
			
			// Trigger auto-init if this is a brand new task
			await triggerAutoInitIfNeeded(provider, task).catch(() => {
				// Silently fail - don't block TODO creation
			})
			
			return {
				success: true,
				message: `TODO created successfully${request.position !== undefined ? ` at position ${request.position}` : ''}`,
				todo,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Update a TODO item
	 * @summary Update TODO
	 * @param taskId Task ID
	 * @param todoId TODO ID
	 */
	@Patch("{taskId}/{todoId}")
	@SuccessResponse(200, "TODO updated")
	@Response<ApiErrorResponse>(404, "Task or TODO not found")
	public async updateTodo(
		@Path() taskId: string,
		@Path() todoId: string,
		@Body() request: UpdateTodoRequest,
	): Promise<UpdateTodoResponse> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const todos = getTodoListForTask(task) || []
			const todoIndex = todos.findIndex(t => t.id === todoId)

			if (todoIndex === -1) {
				throw new NotFoundError(`TODO '${todoId}' not found`)
			}

			const todo = todos[todoIndex]

			// Update content if provided
			if (request.content !== undefined) {
				todo.content = request.content
			}

			// Update status if provided
			if (request.status !== undefined) {
				if (!["pending", "in_progress", "completed"].includes(request.status)) {
					throw new BadRequestError("Invalid status. Must be: pending, in_progress, or completed")
				}
				todo.status = request.status
			}

			// Update the task's todo list
			todos[todoIndex] = todo
			await setTodoListForTask(task, todos)

			return {
				success: true,
				message: "TODO updated successfully",
				todo,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Delete a TODO item
	 * @summary Delete TODO
	 * @param taskId Task ID
	 * @param todoId TODO ID
	 */
	@Delete("{taskId}/{todoId}")
	@SuccessResponse(204, "TODO deleted")
	@Response<ApiErrorResponse>(404, "Task or TODO not found")
	public async deleteTodo(@Path() taskId: string, @Path() todoId: string): Promise<void> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const success = removeTodoFromTask(task, todoId)

			if (!success) {
				throw new NotFoundError(`TODO '${todoId}' not found`)
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
	 * Replace entire TODO list
	 * @summary Replace TODO list
	 * @param taskId Task ID
	 */
	@Post("{taskId}/bulk")
	@SuccessResponse(200, "TODO list replaced")
	@Response<ApiErrorResponse>(404, "Task not found")
	public async bulkUpdateTodos(
		@Path() taskId: string,
		@Body() request: BulkUpdateTodosRequest,
	): Promise<BulkUpdateTodosResponse> {
		if (!Array.isArray(request.todos)) {
			throw new BadRequestError("todos must be an array")
		}

		// Validate all TODOs
		for (const todo of request.todos) {
			if (!todo.id || !todo.content) {
				throw new BadRequestError("Each TODO must have id and content")
			}
			if (todo.status && !["pending", "in_progress", "completed"].includes(todo.status)) {
				throw new BadRequestError("Invalid TODO status")
			}
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			await setTodoListForTask(task, request.todos)

			// Trigger auto-init if this is a brand new task
			await triggerAutoInitIfNeeded(provider, task).catch(() => {
				// Silently fail - don't block TODO bulk update
			})

			return {
				success: true,
				message: `TODO list updated with ${request.todos.length} items`,
				todos: request.todos,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Import TODOs (deprecated - use bulk update instead)
	 * @summary Import TODOs
	 * @param taskId Task ID
	 * @deprecated Use POST /todos/{taskId}/bulk for consistent JSON-based TODO management
	 */
	@Post("{taskId}/import")
	@SuccessResponse(200, "TODOs imported")
	@Response<ApiErrorResponse>(400, "Invalid TODO data")
	@Response<ApiErrorResponse>(404, "Task not found")
	public async importTodos(
		@Path() taskId: string,
		@Body() request: ImportTodosRequest,
	): Promise<ImportTodosResponse> {
		if (!Array.isArray(request.todos)) {
			throw new BadRequestError("todos must be an array")
		}

		// Validate all TODOs
		for (const todo of request.todos) {
			if (!todo.id || !todo.content) {
				throw new BadRequestError("Each TODO must have id and content")
			}
			if (todo.status && !["pending", "in_progress", "completed"].includes(todo.status)) {
				throw new BadRequestError("Invalid TODO status")
			}
		}

		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			await setTodoListForTask(task, request.todos)

			// Trigger auto-init if this is a brand new task
			await triggerAutoInitIfNeeded(provider, task).catch(() => {
				// Silently fail - don't block TODO import
			})

			return {
				success: true,
				message: `Imported ${request.todos.length} TODOs`,
				todos: request.todos,
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}

	/**
	 * Export TODO list as JSON
	 * @summary Export TODO list
	 * @param taskId Task ID
	 */
	@Get("{taskId}/export")
	@SuccessResponse(200, "TODOs exported")
	@Response<ApiErrorResponse>(404, "Task not found")
	public async exportTodos(@Path() taskId: string): Promise<ExportTodosResponse> {
		try {
			const provider = await getTaskProvider(taskId)
			const task = provider.getCurrentTask()
			
			if (!task || task.taskId !== taskId) {
				throw new NotFoundError("Task not loaded in provider")
			}
			
			const todos = getTodoListForTask(task) || []

			return {
				taskId,
				todos,
				count: todos.length,
				stats: calculateTodoStats(todos),
			}
		} catch (error) {
			if (error instanceof Error && error.message === "Task not found") {
				throw new NotFoundError("Task not found")
			}
			throw error
		}
	}
}