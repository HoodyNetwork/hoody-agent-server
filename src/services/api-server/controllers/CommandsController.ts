/**
 * Slash Commands Management Controller
 * 
 * Provides REST API access to manage slash commands - reusable prompt templates
 * that can be invoked with /command-name syntax.
 */

import { Controller, Route, Get, Post, Put, Delete, Path, Query, Body, Security, SuccessResponse } from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { getCommands, getCommand, getCommandNames } from "../../../services/command/commands"
import { getProjectRooDirectoryForCwd } from "../../../services/roo-config"
import { BadRequestError, NotFoundError } from "../errors"
import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

// Dependency injection
let providerInstance: ClineProvider | null = null

export function setCommandsControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("CommandsController: Provider not initialized")
	}
	return providerInstance
}

// Type definitions
interface CommandListItem {
	name: string
	source: string
	description?: string
	argumentHint?: string
	filePath: string
	content?: string
}

interface CommandsListResponse {
	commands: CommandListItem[]
	total: number
}

interface CommandNamesResponse {
	names: string[]
	total: number
}

interface CommandDetails {
	name: string
	source: string
	description?: string
	argumentHint?: string
	filePath: string
	content: string
}

interface CreateCommandRequest {
	name: string
	content: string
	description?: string
	argumentHint?: string
}

interface CreateCommandResponse {
	success: boolean
	command: CommandDetails
}

interface UpdateCommandRequest {
	content?: string
	description?: string
	argumentHint?: string
}

interface UpdateCommandResponse {
	success: boolean
	command: CommandDetails
}

interface DeleteCommandResponse {
	success: boolean
	message: string
}

interface ExecuteSlashCommandRequest {
	args?: string
	mode?: string
	images?: string[]
}

interface ExecuteSlashCommandResponse {
	success: boolean
	taskId: string
	commandName: string
	commandSource: string
}

interface ValidateCommandRequest {
	content: string
}

interface ValidateCommandResponse {
	valid: boolean
	frontmatter: Record<string, any>
	contentPreview: string
	contentLength: number
}

@Route("commands")
@Security("bearer")
export class CommandsController extends Controller {
	/**
	 * List all available slash commands from all sources
	 * @summary List all commands
	 * @param source Filter by source (built-in | global | project)
	 * @param includeContent Include full command content (default: false)
	 */
	@Get()
	@SuccessResponse(200, "Commands listed successfully")
	public async listCommands(
		@Query() source?: string,
		@Query() includeContent?: string,
	): Promise<CommandsListResponse> {
		const provider = getProvider()
		const cwd = provider.cwd
		const includeContentBool = includeContent === "true"

		// Get all commands
		let commands = await getCommands(cwd)

		// Apply source filter if provided
		if (source) {
			if (!["built-in", "global", "project"].includes(source)) {
				throw new BadRequestError("Invalid source filter. Must be: built-in, global, or project")
			}
			commands = commands.filter((cmd) => cmd.source === source)
		}

		// Format response - optionally exclude content for performance
		const formattedCommands = commands.map((cmd) => ({
			name: cmd.name,
			source: cmd.source,
			description: cmd.description,
			argumentHint: cmd.argumentHint,
			filePath: cmd.filePath,
			...(includeContentBool && { content: cmd.content }),
		}))

		return {
			commands: formattedCommands,
			total: formattedCommands.length,
		}
	}

	/**
	 * Get list of command names for autocomplete
	 * @summary Get command names
	 */
	@Get("names")
	@SuccessResponse(200, "Command names retrieved")
	public async getCommandNames(): Promise<CommandNamesResponse> {
		const provider = getProvider()
		const cwd = provider.cwd
		const names = await getCommandNames(cwd)

		return {
			names: names.sort(),
			total: names.length,
		}
	}

	/**
	 * Get a specific slash command by name
	 * @summary Get command by name
	 * @param name Command name
	 */
	@Get("{name}")
	@SuccessResponse(200, "Command retrieved")
	public async getCommand(@Path() name: string): Promise<CommandDetails> {
		const provider = getProvider()
		const cwd = provider.cwd

		if (!name || typeof name !== "string") {
			throw new BadRequestError("Command name is required")
		}

		const command = await getCommand(cwd, name)

		if (!command) {
			throw new NotFoundError(`Command '${name}' not found`)
		}

		return command as CommandDetails
	}

	/**
	 * Create or update a project-level slash command
	 * @summary Create command
	 */
	@Post()
	@SuccessResponse(201, "Command created")
	public async createCommand(@Body() body: CreateCommandRequest): Promise<CreateCommandResponse> {
		const provider = getProvider()
		const cwd = provider.cwd
		const { name, content, description, argumentHint } = body

		// Validation
		if (!name || typeof name !== "string") {
			throw new BadRequestError("Command name is required")
		}
		if (!content || typeof content !== "string") {
			throw new BadRequestError("Command content is required")
		}

		// Validate name (no slashes, no special chars except hyphen/underscore)
		if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
			throw new BadRequestError("Invalid command name. Use only letters, numbers, hyphens, and underscores")
		}

		// Get project commands directory
		const projectDir = getProjectRooDirectoryForCwd(cwd)
		const commandsDir = path.join(projectDir, "commands")
		const filePath = path.join(commandsDir, `${name}.md`)

		// Create commands directory if it doesn't exist
		await fs.mkdir(commandsDir, { recursive: true })

		// Build file content with frontmatter if metadata provided
		let fileContent = content.trim()

		if (description || argumentHint) {
			const frontmatter: Record<string, string> = {}
			if (description) frontmatter.description = description
			if (argumentHint) frontmatter.argumentHint = argumentHint

			// Use gray-matter to generate frontmatter
			fileContent = matter.stringify(content.trim(), frontmatter)
		}

		// Write command file (using queue for concurrency protection)
		await fileWriteQueue.writeFile(filePath, fileContent, "utf-8")

		// Return created command
		const createdCommand = await getCommand(cwd, name)

		this.setStatus(201)
		return {
			success: true,
			command: createdCommand as CommandDetails,
		}
	}

	/**
	 * Update an existing project-level slash command
	 * @summary Update command
	 * @param name Command name
	 */
	@Put("{name}")
	@SuccessResponse(200, "Command updated")
	public async updateCommand(
		@Path() name: string,
		@Body() body: UpdateCommandRequest,
	): Promise<UpdateCommandResponse> {
		const provider = getProvider()
		const cwd = provider.cwd
		const { content, description, argumentHint } = body

		if (!name) {
			throw new BadRequestError("Command name is required")
		}

		// Check if command exists
		const existingCommand = await getCommand(cwd, name)
		if (!existingCommand) {
			throw new NotFoundError(`Command '${name}' not found`)
		}

		// Only allow updating project commands
		if (existingCommand.source !== "project") {
			throw new BadRequestError(
				`Cannot update ${existingCommand.source} command. Only project commands can be modified.`,
			)
		}

		// At least one field must be provided
		if (!content && !description && argumentHint === undefined) {
			throw new BadRequestError("At least one of content, description, or argumentHint must be provided")
		}

		// Parse existing file to preserve frontmatter
		const existingFileContent = await fs.readFile(existingCommand.filePath, "utf-8")
		let parsed
		try {
			parsed = matter(existingFileContent)
		} catch {
			// If parsing fails, treat as plain content
			parsed = { data: {}, content: existingFileContent }
		}

		// Update fields
		const newContent = content !== undefined ? content.trim() : parsed.content.trim()
		const newFrontmatter = { ...parsed.data }
		if (description !== undefined) {
			if (description.trim()) {
				newFrontmatter.description = description.trim()
			} else {
				delete newFrontmatter.description
			}
		}
		if (argumentHint !== undefined) {
			if (argumentHint.trim()) {
				newFrontmatter.argumentHint = argumentHint.trim()
			} else {
				delete newFrontmatter.argumentHint
			}
		}

		// Generate new file content
		const newFileContent =
			Object.keys(newFrontmatter).length > 0 ? matter.stringify(newContent, newFrontmatter) : newContent

		// Write updated file (using queue for concurrency protection)
		await fileWriteQueue.writeFile(existingCommand.filePath, newFileContent, "utf-8")

		// Return updated command
		const updatedCommand = await getCommand(cwd, name)

		return {
			success: true,
			command: updatedCommand as CommandDetails,
		}
	}

	/**
	 * Delete a project-level slash command
	 * @summary Delete command
	 * @param name Command name
	 */
	@Delete("{name}")
	@SuccessResponse(200, "Command deleted")
	public async deleteCommand(@Path() name: string): Promise<DeleteCommandResponse> {
		const provider = getProvider()
		const cwd = provider.cwd

		if (!name) {
			throw new BadRequestError("Command name is required")
		}

		// Check if command exists
		const existingCommand = await getCommand(cwd, name)
		if (!existingCommand) {
			throw new NotFoundError(`Command '${name}' not found`)
		}

		// Only allow deleting project commands
		if (existingCommand.source !== "project") {
			throw new BadRequestError(
				`Cannot delete ${existingCommand.source} command. Only project commands can be deleted.`,
			)
		}

		// Delete the file
		await fs.unlink(existingCommand.filePath)

		return {
			success: true,
			message: `Command '${name}' deleted successfully`,
		}
	}

	/**
	 * Execute a slash command by creating a task
	 * @summary Execute command
	 * @param name Command name
	 */
	@Post("{name}/execute")
	@SuccessResponse(201, "Command executed")
	public async executeCommand(
		@Path() name: string,
		@Body() body: ExecuteSlashCommandRequest,
	): Promise<ExecuteSlashCommandResponse> {
		const provider = getProvider()
		const cwd = provider.cwd
		const { args, mode, images } = body

		if (!name) {
			throw new BadRequestError("Command name is required")
		}

		// Get the command
		const command = await getCommand(cwd, name)
		if (!command) {
			throw new NotFoundError(`Command '${name}' not found`)
		}

		// Build task message from command content
		let taskMessage = command.content

		// If args provided, append them
		if (args && typeof args === "string" && args.trim()) {
			taskMessage = `${taskMessage}\n\n**Args**: ${args}`
		}

		// Create task with command content
		await provider.postMessageToWebview({
			type: "newTask",
			text: taskMessage,
			images: images || [],
			mode: mode,
		})

		// Get the task ID from provider state
		const state = await provider.getStateToPostToWebview()
		const taskId = state.taskId

		this.setStatus(201)
		return {
			success: true,
			taskId: taskId || "unknown",
			commandName: name,
			commandSource: command.source,
		}
	}

	/**
	 * Validate command content without executing
	 * @summary Validate command
	 * @param name Command name
	 */
	@Post("{name}/validate")
	@SuccessResponse(200, "Command validated")
	public async validateCommand(
		@Path() name: string,
		@Body() body: ValidateCommandRequest,
	): Promise<ValidateCommandResponse> {
		const { content } = body

		if (!name) {
			throw new BadRequestError("Command name is required")
		}
		if (!content || typeof content !== "string") {
			throw new BadRequestError("Content is required for validation")
		}

		// Validate name format
		if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
			throw new BadRequestError("Invalid command name. Use only letters, numbers, hyphens, and underscores")
		}

		// Try to parse frontmatter
		let parsedFrontmatter: Record<string, any> = {}
		let processedContent = content.trim()

		try {
			const parsed = matter(content)
			parsedFrontmatter = parsed.data
			processedContent = parsed.content.trim()
		} catch (error) {
			// Frontmatter parsing failed - content will be used as-is
		}

		return {
			valid: true,
			frontmatter: parsedFrontmatter,
			contentPreview: processedContent.substring(0, 200) + (processedContent.length > 200 ? "..." : ""),
			contentLength: processedContent.length,
		}
	}
}