/**
 * Prompts Management Controller
 * 
 * Provides REST API access to manage and execute support prompts.
 * Support prompts are reusable templates for common operations.
 */

import { Controller, Route, Get, Post, Put, Delete, Path, Body, Security, SuccessResponse } from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { supportPrompt, type SupportPromptType } from "../../../shared/support-prompt"
import { singleCompletionHandler } from "../../../utils/single-completion-handler"
import { BadRequestError, NotFoundError } from "../errors"

// Dependency injection
let providerInstance: ClineProvider | null = null

export function setPromptsControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("PromptsController: Provider not initialized")
	}
	return providerInstance
}

// Type definitions
interface PromptTypeInfo {
	type: SupportPromptType
	description: string
	parameters: string[]
	category: "enhancement" | "code-action" | "terminal" | "git" | "task"
}

const PROMPT_TYPES: PromptTypeInfo[] = [
	{
		type: "ENHANCE",
		description: "Enhance user prompts with AI to make them more detailed and specific",
		parameters: ["userInput"],
		category: "enhancement",
	},
	{
		type: "CONDENSE",
		description: "Condense conversation context to reduce token usage",
		parameters: [],
		category: "task",
	},
	{
		type: "EXPLAIN",
		description: "Explain what selected code does",
		parameters: ["filePath", "startLine", "endLine", "selectedText", "userInput"],
		category: "code-action",
	},
	{
		type: "FIX",
		description: "Fix issues in selected code",
		parameters: ["filePath", "startLine", "endLine", "selectedText", "diagnostics", "userInput"],
		category: "code-action",
	},
	{
		type: "IMPROVE",
		description: "Suggest improvements for selected code",
		parameters: ["filePath", "startLine", "endLine", "selectedText", "userInput"],
		category: "code-action",
	},
	{
		type: "ADD_TO_CONTEXT",
		description: "Format code selection for adding to context",
		parameters: ["filePath", "startLine", "endLine", "selectedText"],
		category: "code-action",
	},
	{
		type: "TERMINAL_ADD_TO_CONTEXT",
		description: "Format terminal output for adding to context",
		parameters: ["userInput", "terminalContent"],
		category: "terminal",
	},
	{
		type: "TERMINAL_FIX",
		description: "Fix terminal command errors",
		parameters: ["userInput", "terminalContent"],
		category: "terminal",
	},
	{
		type: "TERMINAL_EXPLAIN",
		description: "Explain what a terminal command does",
		parameters: ["userInput", "terminalContent"],
		category: "terminal",
	},
	{
		type: "TERMINAL_GENERATE",
		description: "Generate terminal command from description",
		parameters: ["userInput", "operatingSystem", "currentDirectory", "shell"],
		category: "terminal",
	},
	{
		type: "NEW_TASK",
		description: "Create a new task with given input",
		parameters: ["userInput"],
		category: "task",
	},
	{
		type: "COMMIT_MESSAGE",
		description: "Generate conventional commit message from git changes",
		parameters: ["gitContext", "customInstructions"],
		category: "git",
	},
]

function validatePromptType(type: string): SupportPromptType {
	const validTypes = PROMPT_TYPES.map((p) => p.type)
	if (!validTypes.includes(type as SupportPromptType)) {
		throw new NotFoundError(`Invalid prompt type: ${type}. Valid types: ${validTypes.join(", ")}`)
	}
	return type as SupportPromptType
}

interface PromptTypesResponse {
	types: PromptTypeInfo[]
	count: number
}

interface PromptTemplate {
	template: string
	isCustom: boolean
}

interface PromptsListResponse {
	prompts: Record<string, PromptTemplate>
	count: number
}

interface PromptDetailsResponse {
	type: SupportPromptType
	template: string
	defaultTemplate: string
	isCustom: boolean
	metadata?: PromptTypeInfo
}

interface UpdatePromptRequest {
	template: string
}

interface UpdatePromptResponse {
	success: boolean
	type: SupportPromptType
	template: string
}

interface ResetPromptResponse {
	success: boolean
	type: SupportPromptType
	template: string
	message: string
}

interface ResetAllPromptsResponse {
	success: boolean
	message: string
	count: number
}

interface ExecutePromptRequest {
	type: string
	params: Record<string, string>
	execute?: boolean
}

interface ExecutePromptResponse {
	type: SupportPromptType
	formattedPrompt: string
	result?: string
	executed: boolean
}

@Route("prompts")
@Security("bearer")
export class PromptsController extends Controller {
	/**
	 * List all available prompt types with metadata
	 * @summary List prompt types
	 */
	@Get("types")
	@SuccessResponse(200, "Prompt types retrieved")
	public async getPromptTypes(): Promise<PromptTypesResponse> {
		return {
			types: PROMPT_TYPES,
			count: PROMPT_TYPES.length,
		}
	}

	/**
	 * Get all current prompt templates (custom + defaults)
	 * @summary Get all prompts
	 */
	@Get()
	@SuccessResponse(200, "Prompts retrieved")
	public async getAllPrompts(): Promise<PromptsListResponse> {
		const provider = getProvider()
		const state = await provider.getState()
		const customSupportPrompts = state.customSupportPrompts || {}

		// Build response with both custom and default prompts
		const prompts: Record<string, PromptTemplate> = {}

		for (const { type } of PROMPT_TYPES) {
			const template = supportPrompt.get(customSupportPrompts, type)
			const isCustom = !!customSupportPrompts[type]

			prompts[type] = {
				template,
				isCustom,
			}
		}

		return {
			prompts,
			count: Object.keys(prompts).length,
		}
	}

	/**
	 * Get a specific prompt template
	 * @summary Get prompt by type
	 * @param type Prompt type (e.g., ENHANCE, FIX, EXPLAIN)
	 */
	@Get("{type}")
	@SuccessResponse(200, "Prompt retrieved")
	public async getPrompt(@Path() type: string): Promise<PromptDetailsResponse> {
		const provider = getProvider()
		const promptType = validatePromptType(type)
		const state = await provider.getState()
		const customSupportPrompts = state.customSupportPrompts || {}

		const template = supportPrompt.get(customSupportPrompts, promptType)
		const defaultTemplate = supportPrompt.default[promptType]
		const isCustom = !!customSupportPrompts[promptType]
		const metadata = PROMPT_TYPES.find((p) => p.type === promptType)

		return {
			type: promptType,
			template,
			defaultTemplate,
			isCustom,
			metadata,
		}
	}

	/**
	 * Update a specific prompt template
	 * @summary Update prompt
	 * @param type Prompt type
	 */
	@Put("{type}")
	@SuccessResponse(200, "Prompt updated")
	public async updatePrompt(
		@Path() type: string,
		@Body() body: UpdatePromptRequest,
	): Promise<UpdatePromptResponse> {
		const provider = getProvider()
		const promptType = validatePromptType(type)
		const { template } = body

		if (!template || typeof template !== "string") {
			throw new BadRequestError("template is required and must be a string")
		}

		// Get current prompts and update
		const state = await provider.getState()
		const customSupportPrompts = state.customSupportPrompts || {}

		const updatedPrompts = {
			...customSupportPrompts,
			[promptType]: template,
		}

		await provider.setValues({ customSupportPrompts: updatedPrompts })

		return {
			success: true,
			type: promptType,
			template,
		}
	}

	/**
	 * Reset a specific prompt to default
	 * @summary Reset prompt to default
	 * @param type Prompt type
	 */
	@Delete("{type}")
	@SuccessResponse(200, "Prompt reset to default")
	public async resetPrompt(@Path() type: string): Promise<ResetPromptResponse> {
		const provider = getProvider()
		const promptType = validatePromptType(type)

		// Get current prompts and remove this one
		const state = await provider.getState()
		const customSupportPrompts = state.customSupportPrompts || {}

		const updatedPrompts = { ...customSupportPrompts }
		delete updatedPrompts[promptType]

		await provider.setValues({ customSupportPrompts: updatedPrompts })

		return {
			success: true,
			type: promptType,
			template: supportPrompt.default[promptType],
			message: "Prompt reset to default",
		}
	}

	/**
	 * Reset all prompts to defaults
	 * @summary Reset all prompts
	 */
	@Delete()
	@SuccessResponse(200, "All prompts reset to defaults")
	public async resetAllPrompts(): Promise<ResetAllPromptsResponse> {
		const provider = getProvider()
		await provider.setValues({ customSupportPrompts: {} })

		return {
			success: true,
			message: "All prompts reset to defaults",
			count: PROMPT_TYPES.length,
		}
	}

	/**
	 * Execute a prompt template with parameters
	 * @summary Execute prompt
	 */
	@Post("execute")
	@SuccessResponse(200, "Prompt executed or formatted")
	public async executePrompt(@Body() body: ExecutePromptRequest): Promise<ExecutePromptResponse> {
		const provider = getProvider()
		const { type, params, execute = false } = body

		if (!type || typeof type !== "string") {
			throw new BadRequestError("type is required and must be a string")
		}

		if (!params || typeof params !== "object") {
			throw new BadRequestError("params is required and must be an object")
		}

		const promptType = validatePromptType(type)
		const state = await provider.getState()
		const customSupportPrompts = state.customSupportPrompts || {}

		// Generate the formatted prompt
		const formattedPrompt = supportPrompt.create(promptType, params, customSupportPrompts)

		// If execute=false, just return the formatted prompt
		if (!execute) {
			return {
				type: promptType,
				formattedPrompt,
				executed: false,
			}
		}

		// Execute the prompt with AI
		// Determine which API config to use
		let apiConfig = state.apiConfiguration

		// For ENHANCE type, use enhancement-specific config if available
		if (promptType === "ENHANCE" && state.enhancementApiConfigId) {
			const profile = await provider.providerSettingsManager.getProfile({
				id: state.enhancementApiConfigId,
			})
			if (profile) {
				apiConfig = profile
			}
		}

		// Execute the prompt
		const result = await singleCompletionHandler(apiConfig, formattedPrompt)

		return {
			type: promptType,
			formattedPrompt,
			result,
			executed: true,
		}
	}
}