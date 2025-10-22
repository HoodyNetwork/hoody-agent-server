/**
 * Settings Management Controller
 * 
 * Provides REST API access to extension settings including auto-approval,
 * terminal configuration, and browser settings.
 */

import { Controller, Get, Patch, Put, Route, Body, Security, SuccessResponse, Response } from "tsoa"
import type { ApiErrorResponse, ExtensionSettings } from "../api-types"
import { redactSecretsDeep } from "../utils"
import { BadRequestError } from "../errors"
import type { ClineProvider } from "../../../core/webview/ClineProvider"

// Module-level provider instance (initialized via dependency injection)
let providerInstance: ClineProvider | null = null

/**
 * Initialize the SettingsController with required dependencies
 */
export function setSettingsControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

/**
 * Get the provider instance, throwing if not initialized
 */
function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("SettingsController not initialized. Call setSettingsControllerProvider first.")
	}
	return providerInstance
}

/**
 * Settings update request
 */
export interface SettingsUpdateRequest {
	[key: string]: any
}

/**
 * Settings update response
 */
export interface SettingsUpdateResponse {
	success: true
	message: string
}

/**
 * Auto-approval configuration
 */
export interface AutoApprovalSettings {
	enabled?: boolean
	readOnly?: boolean
	readOnlyOutsideWorkspace?: boolean
	write?: boolean
	writeOutsideWorkspace?: boolean
	writeProtected?: boolean
	execute?: boolean
	browser?: boolean
	mcp?: boolean
	modeSwitch?: boolean
	subtasks?: boolean
	followupQuestions?: boolean
	updateTodoList?: boolean
}

/**
 * Terminal settings
 */
export interface TerminalSettings {
	outputLineLimit?: number
	outputCharacterLimit?: number
	shellIntegrationTimeout?: number
	shellIntegrationDisabled?: boolean
	commandDelay?: number
	compressProgressBar?: boolean
	powershellCounter?: boolean
	zshClearEolMark?: boolean
	zshOhMy?: boolean
	zshP10k?: boolean
	zdotdir?: string
}

/**
 * Browser settings
 */
export interface BrowserSettings {
	enabled?: boolean
	viewportSize?: string
	screenshotQuality?: number
	remoteBrowserEnabled?: boolean
	remoteBrowserHost?: string
	cachedChromeHostUrl?: string
}

/**
 * Context condensing settings
 *
 * Controls automatic context window condensing behavior.
 * When the conversation context approaches the model's token limit,
 * the system can automatically condense (summarize) older messages
 * to free up space while preserving important information.
 */
export interface CondenseSettings {
	/** Enable automatic context condensing when threshold is reached */
	autoCondenseContext?: boolean
	
	/**
	 * Global threshold percentage (5-100) for triggering condensing.
	 * When token usage reaches this % of context window, condensing triggers.
	 * Default: 100% (only condense when context is full)
	 * Range: 5-100 (MIN_CONDENSE_THRESHOLD to MAX_CONDENSE_THRESHOLD)
	 */
	autoCondenseContextPercent?: number
	
	/**
	 * Per-profile condensing thresholds.
	 * Maps profile IDs to their specific threshold percentages.
	 * Special value -1 means "inherit from autoCondenseContextPercent"
	 *
	 * Example: { "profile-123": 75, "profile-456": -1, "profile-789": 60 }
	 * - profile-123 will condense at 75% of its context window
	 * - profile-456 will use the global autoCondenseContextPercent setting
	 * - profile-789 will condense at 60% of its context window
	 */
	profileThresholds?: Record<string, number>
	
	/**
	 * AI Profile ID to use for the condensing operation.
	 * If not specified, uses the current profile.
	 * This allows using a faster/cheaper model for condensing.
	 */
	condensingApiConfigId?: string
	
	/**
	 * Custom prompt to use for condensing instead of the default.
	 * The condensing process uses this prompt to guide how conversations
	 * should be summarized while preserving important context.
	 */
	customCondensingPrompt?: string
}

/**
	* Agent Digest settings
	*
	* Controls LLM-powered ultra-compact message summaries for tiny UI contexts.
	* When enabled, each agent message gets an optional 50-200 character digest
	* suitable for notifications, mobile views, status bars, and task previews.
	*
	* The AI agent maintains full context - digests are purely for UI display.
	*/
export interface DigestSettings {
	/** Enable Agent Digest feature globally */
	digestEnabled?: boolean
	
	/**
	 * AI Profile ID to use for digest generation.
	 * Should be a cheap/fast model (e.g., gpt-3.5-turbo, gemini-flash).
	 * If not specified, digest generation will fail.
	 */
	digestProfileId?: string
	
	/**
	 * Auto-generate digests for new messages.
	 * Only applies when digestEnabled is true.
	 * Default: true (when digest is enabled)
	 */
	autoDigestEnabled?: boolean
	
	/**
	 * Maximum length of generated digests in characters.
	 * Range: 20-500 characters
	 * Default: 200
	 */
	digestMaxLength?: number
	
	/**
	 * Custom prompt template for digest generation.
	 * Placeholders: {maxLength}, {content}
	 * If not provided, uses default digest prompt.
	 */
	customDigestPrompt?: string
	
	/**
	 * Per-task digest overrides.
	 * Maps task IDs to their specific digest settings.
	 *
	 * Example: {
	 *   "task-123": { enabled: false },
	 *   "task-456": { enabled: true, maxLength: 50 }
	 * }
	 */
	digestTaskOverrides?: Record<string, {
		enabled: boolean
		maxLength?: number
		profileId?: string
	}>
}

/**
	* Settings Management Controller
 * 
 * Provides endpoints for reading and updating extension settings.
 * All endpoints require authentication.
 */
@Route("settings")
@Security("bearer")
export class SettingsController extends Controller {
	/**
	 * Get all settings
	 * 
	 * Returns all extension settings with secrets redacted for security.
	 * This includes the complete GlobalSettings with all 100+ fields including
	 * experiments.powerSteering and other experimental features.
	 * 
	 * @returns All settings with secrets redacted
	 */
	@Get()
	@SuccessResponse(200, "Settings retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getSettings(): Promise<ExtensionSettings> {
		const provider = getProvider()
		const settings = provider.getValues()
		return redactSecretsDeep(settings) as ExtensionSettings
	}

	/**
	 * Update settings
	 * 
	 * Allows partial updates to extension settings. Only the fields provided
	 * in the request will be updated.
	 * 
	 * @param request Settings update request with key-value pairs
	 * @returns Success confirmation
	 */
	@Patch()
	@SuccessResponse(200, "Settings updated successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Invalid settings object")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async updateSettings(
		@Body() request: SettingsUpdateRequest
	): Promise<SettingsUpdateResponse> {
		const provider = getProvider()
		
		if (!request || typeof request !== "object") {
			throw new BadRequestError("Settings object is required")
		}

		await provider.setValues(request)

		return {
			success: true,
			message: "Settings updated",
		}
	}

	/**
	 * Get auto-approval configuration
	 * 
	 * Returns the current auto-approval settings that control which operations
	 * can be executed without explicit user confirmation.
	 * 
	 * @returns Auto-approval configuration
	 */
	@Get("auto-approval")
	@SuccessResponse(200, "Auto-approval settings retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getAutoApproval(): Promise<AutoApprovalSettings> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			enabled: state.autoApprovalEnabled,
			readOnly: state.alwaysAllowReadOnly,
			readOnlyOutsideWorkspace: state.alwaysAllowReadOnlyOutsideWorkspace,
			write: state.alwaysAllowWrite,
			writeOutsideWorkspace: state.alwaysAllowWriteOutsideWorkspace,
			writeProtected: state.alwaysAllowWriteProtected,
			execute: state.alwaysAllowExecute,
			browser: state.alwaysAllowBrowser,
			mcp: state.alwaysAllowMcp,
			modeSwitch: state.alwaysAllowModeSwitch,
			subtasks: state.alwaysAllowSubtasks,
			followupQuestions: state.alwaysAllowFollowupQuestions,
			updateTodoList: state.alwaysAllowUpdateTodoList,
		}
	}

	/**
	 * Update auto-approval configuration
	 *
	 * Updates which operations can be auto-approved without user confirmation.
	 *
	 * @param request Auto-approval settings update
	 * @returns Success confirmation
	 */
	@Put("auto-approval")
	@SuccessResponse(200, "Auto-approval settings updated successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Invalid auto-approval settings")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async updateAutoApproval(
		@Body() request: AutoApprovalSettings
	): Promise<SettingsUpdateResponse> {
		const provider = getProvider()

		if (!request || typeof request !== "object") {
			throw new BadRequestError("Auto-approval settings object is required")
		}

		// Map API field names to internal setting names
		const updates: Record<string, any> = {}
		
		if (request.enabled !== undefined) {
			updates.autoApprovalEnabled = request.enabled
		}
		if (request.readOnly !== undefined) {
			updates.alwaysAllowReadOnly = request.readOnly
		}
		if (request.readOnlyOutsideWorkspace !== undefined) {
			updates.alwaysAllowReadOnlyOutsideWorkspace = request.readOnlyOutsideWorkspace
		}
		if (request.write !== undefined) {
			updates.alwaysAllowWrite = request.write
		}
		if (request.writeOutsideWorkspace !== undefined) {
			updates.alwaysAllowWriteOutsideWorkspace = request.writeOutsideWorkspace
		}
		if (request.writeProtected !== undefined) {
			updates.alwaysAllowWriteProtected = request.writeProtected
		}
		if (request.execute !== undefined) {
			updates.alwaysAllowExecute = request.execute
		}
		if (request.browser !== undefined) {
			updates.alwaysAllowBrowser = request.browser
		}
		if (request.mcp !== undefined) {
			updates.alwaysAllowMcp = request.mcp
		}
		if (request.modeSwitch !== undefined) {
			updates.alwaysAllowModeSwitch = request.modeSwitch
		}
		if (request.subtasks !== undefined) {
			updates.alwaysAllowSubtasks = request.subtasks
		}
		if (request.followupQuestions !== undefined) {
			updates.alwaysAllowFollowupQuestions = request.followupQuestions
		}
		if (request.updateTodoList !== undefined) {
			updates.alwaysAllowUpdateTodoList = request.updateTodoList
		}

		await provider.setValues(updates)

		return {
			success: true,
			message: "Auto-approval settings updated",
		}
	}

	/**
	 * Get terminal settings
	 * 
	 * Returns configuration for terminal behavior including output limits,
	 * shell integration, and terminal-specific features.
	 * 
	 * @returns Terminal configuration
	 */
	@Get("terminal")
	@SuccessResponse(200, "Terminal settings retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getTerminalSettings(): Promise<TerminalSettings> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			outputLineLimit: state.terminalOutputLineLimit,
			outputCharacterLimit: state.terminalOutputCharacterLimit,
			shellIntegrationTimeout: state.terminalShellIntegrationTimeout,
			shellIntegrationDisabled: state.terminalShellIntegrationDisabled,
			commandDelay: state.terminalCommandDelay,
			compressProgressBar: state.terminalCompressProgressBar,
			powershellCounter: state.terminalPowershellCounter,
			zshClearEolMark: state.terminalZshClearEolMark,
			zshOhMy: state.terminalZshOhMy,
			zshP10k: state.terminalZshP10k,
			zdotdir: state.terminalZdotdir,
		}
	}

	/**
	 * Get browser settings
	 * 
	 * Returns configuration for browser automation features including
	 * viewport size, screenshot quality, and remote browser settings.
	 * 
	 * @returns Browser configuration
	 */
	@Get("browser")
	@SuccessResponse(200, "Browser settings retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getBrowserSettings(): Promise<BrowserSettings> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			enabled: state.browserToolEnabled,
			viewportSize: state.browserViewportSize,
			screenshotQuality: state.screenshotQuality,
			remoteBrowserEnabled: state.remoteBrowserEnabled,
			remoteBrowserHost: state.remoteBrowserHost,
			cachedChromeHostUrl: state.cachedChromeHostUrl,
		}
	}

	/**
	 * Get context condensing settings
	 *
	 * Returns configuration for automatic context window condensing behavior.
	 * This includes global thresholds, per-profile overrides, and the AI profile
	 * to use for condensing operations.
	 *
	 * The condensing system helps manage long conversations by automatically
	 * summarizing older messages when token usage approaches limits.
	 *
	 * @returns Condensing configuration including global and per-profile thresholds
	 */
	@Get("condense")
	@SuccessResponse(200, "Condense settings retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getCondenseSettings(): Promise<CondenseSettings> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			autoCondenseContext: state.autoCondenseContext,
			autoCondenseContextPercent: state.autoCondenseContextPercent,
			profileThresholds: state.profileThresholds,
			condensingApiConfigId: state.condensingApiConfigId,
			customCondensingPrompt: state.customCondensingPrompt,
		}
	}

	/**
	 * Update context condensing settings
	 *
	 * Updates configuration for automatic context condensing.
	 * You can update global settings and/or per-profile thresholds.
	 *
	 * **Global Settings:**
	 * - `autoCondenseContext`: Enable/disable auto-condensing
	 * - `autoCondenseContextPercent`: Global threshold (5-100%)
	 * - `condensingApiConfigId`: AI profile ID to use for condensing
	 * - `customCondensingPrompt`: Custom condensing prompt
	 *
	 * **Per-Profile Thresholds:**
	 * - `profileThresholds`: Map of profile IDs to threshold percentages
	 * - Use -1 to inherit from global setting
	 * - Use 5-100 for specific percentage thresholds
	 *
	 * **Example Request:**
	 * ```json
	 * {
	 *   "autoCondenseContext": true,
	 *   "autoCondenseContextPercent": 80,
	 *   "profileThresholds": {
	 *     "claude-profile-123": 75,
	 *     "gpt-profile-456": -1,
	 *     "gemini-profile-789": 60
	 *   },
	 *   "condensingApiConfigId": "fast-model-id",
	 *   "customCondensingPrompt": "Condense while preserving key technical details"
	 * }
	 * ```
	 *
	 * @param request Condense settings update
	 * @returns Success confirmation
	 */
	@Put("condense")
	@SuccessResponse(200, "Condense settings updated successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Invalid condense settings")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async updateCondenseSettings(
		@Body() request: CondenseSettings
	): Promise<SettingsUpdateResponse> {
		const provider = getProvider()

		if (!request || typeof request !== "object") {
			throw new BadRequestError("Condense settings object is required")
		}

		// Validate threshold percentages if provided
		if (request.autoCondenseContextPercent !== undefined) {
			const threshold = request.autoCondenseContextPercent
			if (threshold < 5 || threshold > 100) {
				throw new BadRequestError("autoCondenseContextPercent must be between 5 and 100")
			}
		}

		// Validate profile thresholds if provided
		if (request.profileThresholds) {
			for (const [profileId, threshold] of Object.entries(request.profileThresholds)) {
				if (threshold !== -1 && (threshold < 5 || threshold > 100)) {
					throw new BadRequestError(
						`Invalid threshold ${threshold} for profile "${profileId}". Must be -1 (inherit) or 5-100 (percentage)`
					)
				}
			}
		}

		// Build update object with only provided fields
		const updates: Record<string, any> = {}
		
		if (request.autoCondenseContext !== undefined) {
			updates.autoCondenseContext = request.autoCondenseContext
		}
		if (request.autoCondenseContextPercent !== undefined) {
			updates.autoCondenseContextPercent = request.autoCondenseContextPercent
		}
		if (request.profileThresholds !== undefined) {
			updates.profileThresholds = request.profileThresholds
		}
		if (request.condensingApiConfigId !== undefined) {
			updates.condensingApiConfigId = request.condensingApiConfigId
		}
		if (request.customCondensingPrompt !== undefined) {
			updates.customCondensingPrompt = request.customCondensingPrompt
		}

		await provider.setValues(updates)

		return {
			success: true,
			message: "Condense settings updated",
		}
	}

	/**
		* Get Agent Digest settings
		*
		* Returns configuration for the Agent Digest feature which provides
		* ultra-compact LLM-generated message summaries for tiny UI contexts
		* like notifications and mobile views.
		*
		* Agent Digest maintains full context for the AI while providing
		* compressed summaries (50-200 chars) for human-readable UI display.
		*
		* @returns Digest configuration including global and per-task settings
		*/
	@Get("digest")
	@SuccessResponse(200, "Digest settings retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getDigestSettings(): Promise<DigestSettings> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			digestEnabled: state.digestEnabled,
			digestProfileId: state.digestProfileId,
			autoDigestEnabled: state.autoDigestEnabled,
			digestMaxLength: state.digestMaxLength,
			customDigestPrompt: state.customDigestPrompt,
			digestTaskOverrides: state.digestTaskOverrides,
		}
	}

	/**
		* Update Agent Digest settings
		*
		* Updates configuration for the Agent Digest feature.
		* You can update global settings and/or per-task overrides.
		*
		* **Global Settings:**
		* - `digestEnabled`: Enable/disable digest feature
		* - `digestProfileId`: AI profile ID to use (should be cheap/fast model)
		* - `autoDigestEnabled`: Auto-generate digests for new messages
		* - `digestMaxLength`: Max digest length (20-500 chars)
		* - `customDigestPrompt`: Custom prompt template
		*
		* **Per-Task Overrides:**
		* - `digestTaskOverrides`: Map of task IDs to task-specific settings
		*
		* **Example Request:**
		* ```json
		* {
		*   "digestEnabled": true,
		*   "digestProfileId": "gpt-3.5-turbo-profile",
		*   "autoDigestEnabled": true,
		*   "digestMaxLength": 150,
		*   "digestTaskOverrides": {
		*     "task-123": { "enabled": false },
		*     "task-456": { "enabled": true, "maxLength": 50 }
		*   }
		* }
		* ```
		*
		* @param request Digest settings update
		* @returns Success confirmation
		*/
	@Put("digest")
	@SuccessResponse(200, "Digest settings updated successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Invalid digest settings")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async updateDigestSettings(
		@Body() request: DigestSettings
	): Promise<SettingsUpdateResponse> {
		const provider = getProvider()

		if (!request || typeof request !== "object") {
			throw new BadRequestError("Digest settings object is required")
		}

		// Validate digestMaxLength if provided
		if (request.digestMaxLength !== undefined) {
			const maxLength = request.digestMaxLength
			if (maxLength < 20 || maxLength > 500) {
				throw new BadRequestError("digestMaxLength must be between 20 and 500")
			}
		}

		// Validate task overrides if provided
		if (request.digestTaskOverrides) {
			for (const [taskId, override] of Object.entries(request.digestTaskOverrides)) {
				if (override.maxLength !== undefined) {
					if (override.maxLength < 20 || override.maxLength > 500) {
						throw new BadRequestError(
							`Invalid maxLength ${override.maxLength} for task "${taskId}". Must be 20-500 characters`
						)
					}
				}
			}
		}

		// Build update object with only provided fields
		const updates: Record<string, any> = {}
		
		if (request.digestEnabled !== undefined) {
			updates.digestEnabled = request.digestEnabled
		}
		if (request.digestProfileId !== undefined) {
			updates.digestProfileId = request.digestProfileId
		}
		if (request.autoDigestEnabled !== undefined) {
			updates.autoDigestEnabled = request.autoDigestEnabled
		}
		if (request.digestMaxLength !== undefined) {
			updates.digestMaxLength = request.digestMaxLength
		}
		if (request.customDigestPrompt !== undefined) {
			updates.customDigestPrompt = request.customDigestPrompt
		}
		if (request.digestTaskOverrides !== undefined) {
			updates.digestTaskOverrides = request.digestTaskOverrides
		}

		await provider.setValues(updates)

		return {
			success: true,
			message: "Digest settings updated",
		}
	}
}