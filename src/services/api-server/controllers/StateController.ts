/**
 * State and Configuration Controller
 * 
 * Manages application state and configuration endpoints.
 * Provides access to the extension's current state, user settings, and available modes.
 */

import { Controller, Get, Patch, Route, Query, Body, Security, SuccessResponse, Response } from "tsoa"
import type { ApiErrorResponse } from "../api-types"
import { redactSecretsDeep } from "../utils"
import type { ClineProvider } from "../../../core/webview/ClineProvider"

// Module-level provider instance (initialized via dependency injection)
let providerInstance: ClineProvider | null = null

/**
 * Initialize the StateController with required dependencies
 * Must be called before any controller methods are invoked
 */
export function setStateControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

/**
 * Get the provider instance, throwing if not initialized
 */
function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("StateController not initialized. Call setStateControllerProvider first.")
	}
	return providerInstance
}

/**
 * Complete application state
 */
export interface ApplicationState {
	/** Current context metadata */
	_metadata?: {
		/** Current mode */
		currentMode?: string
		/** Current profile name */
		currentProfile?: string
		/** Current model ID */
		currentModel?: string
		/** Current provider */
		currentProvider?: string
		/** Task currently displayed in UI (if any) */
		displayedTaskId?: string
		/** Server timestamp */
		timestamp: number
	}
	[key: string]: any
}

/**
 * Configuration subset response
 */
export interface ConfigurationResponse {
	mode?: string
	apiConfiguration?: any
	currentApiConfigName?: string
	customInstructions?: string
}

/**
 * Configuration update request
 */
export interface ConfigurationUpdateRequest {
	mode?: string
	apiConfiguration?: any
	customInstructions?: string
}

/**
 * Configuration update response
 */
export interface ConfigurationUpdateResponse {
	success: true
}

/**
 * Mode information
 */
export interface ModeInfo {
	slug: string
	name: string
	roleDefinition?: string
	groups?: string[]
	/** Whether this mode is currently active */
	isActive?: boolean
	/** Profile ID assigned to this mode */
	assignedProfileId?: string
	/** Profile name assigned to this mode */
	assignedProfileName?: string
	/** Full profile configuration (only included when includeProfileConfig=true, with secrets redacted) */
	assignedProfileConfig?: any
	[key: string]: any
}

/**
 * Current model information
 */
export interface CurrentModelInfo {
	provider: string
	modelId: string
	modelInfo?: {
		maxTokens?: number
		contextWindow?: number
		supportsImages?: boolean
		supportsPromptCache?: boolean
		inputPrice?: number
		outputPrice?: number
		cacheWritesPrice?: number
		cacheReadsPrice?: number
		description?: string
	}
}

/**
 * State and Configuration Controller
 * 
 * Provides endpoints for accessing and modifying the extension's state and configuration.
 * All endpoints require authentication.
 */
@Route("state")
@Security("bearer")
export class StateController extends Controller {
	/**
	 * Get complete application state
	 * 
	 * Returns the entire extension state including tasks, history, settings, and configuration.
	 * Secrets (like API keys) are automatically redacted for security.
	 * 
	 * @returns Complete application state with secrets redacted
	 */
	@Get()
	@SuccessResponse(200, "State retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getState(): Promise<ApplicationState> {
		const provider = getProvider()
		const state = await provider.getStateToPostToWebview()
		const task = provider.getCurrentTask()
		const modelInfo = task?.api?.getModel()
		
		// Add metadata to help remote UIs understand current state
		const stateWithMetadata = {
			...redactSecretsDeep(state),
			_metadata: {
				currentMode: state.mode,
				currentProfile: state.currentApiConfigName,
				currentModel: modelInfo?.id || state.apiConfiguration?.apiModelId,
				currentProvider: state.apiConfiguration?.apiProvider,
				displayedTaskId: task?.taskId,
				timestamp: Date.now(),
			}
		}
		
		return stateWithMetadata
	}

	/**
	 * Get configuration subset
	 * 
	 * Returns a lighter subset of the state focusing on user-configurable settings.
	 * This is more efficient than fetching the complete state when you only need configuration.
	 * 
	 * @returns Configuration settings with secrets redacted
	 */
	@Get("config")
	@SuccessResponse(200, "Configuration retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getConfig(): Promise<ConfigurationResponse> {
		const provider = getProvider()
		const state = await provider.getState()
		
		return {
			mode: state.mode,
			apiConfiguration: redactSecretsDeep(state.apiConfiguration),
			currentApiConfigName: state.currentApiConfigName,
			customInstructions: state.customInstructions,
		}
	}

	/**
	 * Update configuration
	 * 
	 * Allows partial updates to mode, API configuration, and custom instructions.
	 * Only the fields provided in the request will be updated.
	 * 
	 * @param request Configuration update request
	 * @returns Success confirmation
	 */
	@Patch("config")
	@SuccessResponse(200, "Configuration updated successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Invalid configuration")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async updateConfig(
		@Body() request: ConfigurationUpdateRequest
	): Promise<ConfigurationUpdateResponse> {
		const provider = getProvider()
		const { mode, apiConfiguration, customInstructions } = request

		if (mode) {
			await provider.setMode(mode)
		}

		if (customInstructions !== undefined) {
			await provider.updateCustomInstructions(customInstructions)
		}

		if (apiConfiguration) {
			const { currentApiConfigName } = await provider.getState()
			await provider.upsertProviderProfile(currentApiConfigName || "default", apiConfiguration)
		}

		return { success: true }
	}

	/**
	 * List available modes
	 *
	 * Returns all modes that the user can switch to (e.g., code, architect, ask, debug).
	 * Each mode has different capabilities and behavior optimized for specific tasks.
	 *
	 * @param includeProfileConfig Include full profile configuration for each mode (default: false)
	 * @returns Array of available modes with metadata
	 */
	@Get("modes")
	@SuccessResponse(200, "Modes retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getModes(
		@Query() includeProfileConfig?: boolean
	): Promise<ModeInfo[]> {
		const provider = getProvider()
		const modes = await provider.getModes()
		const state = await provider.getState()
		const currentMode = state.mode
		
		// Enrich modes with metadata
		const enrichedModes = await Promise.all(
			modes.map(async (mode) => {
				// Get assigned profile for this mode
				const assignedProfileId = await provider.providerSettingsManager.getModeConfigId(mode.slug)
				let assignedProfileName: string | undefined
				let assignedProfileConfig: any = undefined
				
				if (assignedProfileId) {
					try {
						const profile = await provider.providerSettingsManager.getProfile({ id: assignedProfileId })
						assignedProfileName = profile.name
						
						// Include full config if requested
						if (includeProfileConfig) {
							// If this is the active mode, merge with current state configuration
							let configToReturn = profile
							if (mode.slug === currentMode) {
								// Extract all profile-related fields from state
								const {
									diffEnabled,
									fuzzyMatchThreshold,
									rateLimitSeconds,
									todoListEnabled,
									consecutiveMistakeLimit,
									includeMaxTokens,
									modelTemperature,
									enableReasoningEffort,
									reasoningEffort,
									modelMaxTokens,
									modelMaxThinkingTokens,
									verbosity,
									apiConfiguration,
								} = state
								
								configToReturn = {
									...profile,
									...apiConfiguration, // Provider-specific settings
									// Base settings from state
									diffEnabled,
									fuzzyMatchThreshold,
									rateLimitSeconds,
									todoListEnabled,
									consecutiveMistakeLimit,
									includeMaxTokens,
									modelTemperature,
									enableReasoningEffort,
									reasoningEffort,
									modelMaxTokens,
									modelMaxThinkingTokens,
									verbosity,
									id: profile.id, // Preserve profile ID
									name: profile.name, // Preserve profile name
								}
							}
							assignedProfileConfig = redactSecretsDeep(configToReturn)
						}
					} catch {
						// Profile might have been deleted
					}
				}
				
				return {
					...mode,
					isActive: mode.slug === currentMode,
					assignedProfileId,
					assignedProfileName,
					...(includeProfileConfig && assignedProfileConfig ? { assignedProfileConfig } : {}),
				}
			})
		)
		
		return enrichedModes
	}

	/**
	 * Get current model information
	 *
	 * Returns information about the currently configured AI model including
	 * provider, model ID, and model capabilities (context window, pricing, etc.).
	 *
	 * @returns Current model configuration and capabilities
	 */
	@Get("model")
	@SuccessResponse(200, "Model information retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getCurrentModel(): Promise<CurrentModelInfo> {
		const provider = getProvider()
		const state = await provider.getState()
		const task = provider.getCurrentTask()
		
		// Get model info from the API handler
		const apiHandler = task?.api || provider.getCurrentTask()?.api
		const modelInfo = apiHandler?.getModel()
		
		return {
			provider: state.apiConfiguration.apiProvider || "unknown",
			modelId: modelInfo?.id || state.apiConfiguration.apiModelId || "unknown",
			modelInfo: modelInfo?.info ? {
				maxTokens: modelInfo.info.maxTokens ?? undefined,
				contextWindow: modelInfo.info.contextWindow,
				supportsImages: modelInfo.info.supportsImages,
				supportsPromptCache: modelInfo.info.supportsPromptCache,
				inputPrice: modelInfo.info.inputPrice,
				outputPrice: modelInfo.info.outputPrice,
				cacheWritesPrice: modelInfo.info.cacheWritesPrice,
				cacheReadsPrice: modelInfo.info.cacheReadsPrice,
				description: modelInfo.info.description,
			} : undefined,
		}
	}
}