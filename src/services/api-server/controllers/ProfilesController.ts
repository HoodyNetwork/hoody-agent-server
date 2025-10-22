/**
 * Profiles Controller
 * 
 * Manages AI provider profiles (configurations for different AI models/providers).
 * Profiles define which AI model to use, API keys, and other provider-specific settings.
 * 
 * @tags Profiles
 */

import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Route,
	Path,
	Query,
	Body,
	Response,
	SuccessResponse,
	Security,
} from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import {
	ProfileListItem,
	ProfileDetails,
	CreateProfileRequest,
	CreateProfileResponse,
	UpdateProfileRequest,
	UpdateProfileResponse,
	DeleteProfileResponse,
	ActivateProfileResponse,
	ModeProfileResponse,
	SetModeProfileRequest,
	SetModeProfileResponse,
	ApiErrorResponse,
} from "../api-types"
import { BadRequestError, NotFoundError } from "../errors"
import { redactSecretsDeep } from "../utils"
import { mapProfileFields } from "../utils/field-mapper"

/**
 * Provider for dependency injection
 */
let providerInstance: ClineProvider | null = null

export function setProfilesControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("ProfilesController: Provider not initialized")
	}
	return providerInstance
}

@Route("profiles")
@Security("bearer")
export class ProfilesController extends Controller {
	/**
	 * List all configured provider profiles
	 *
	 * @summary Get all profiles
	 * @param includeConfig Include full configuration for each profile (default: false)
	 * @returns List of all configured profiles with basic metadata
	 */
	@Get()
	@SuccessResponse(200, "Profiles retrieved successfully")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async listProfiles(
		@Query() includeConfig?: boolean
	): Promise<ProfileListItem[]> {
		try {
			const provider = getProvider()
			const state = await provider.getState()
			const currentProfileName = state.currentApiConfigName
			
			if (includeConfig) {
				// Get full profiles with config
				const profiles = await provider.providerSettingsManager.listConfig()
				return await Promise.all(
					profiles.map(async (profileMeta) => {
						const fullProfile = await provider.providerSettingsManager.getProfile({ id: profileMeta.id })
						const isActive = fullProfile.name === currentProfileName
						
						// For active profile, merge with current state configuration
						let configToReturn = fullProfile
						if (isActive) {
							// Extract all profile-related fields from state
							// These include base settings (diffEnabled, fuzzyMatchThreshold, etc.)
							// and provider-specific settings (apiConfiguration)
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
								...fullProfile,
								...apiConfiguration, // Provider-specific settings (API keys, etc.)
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
								id: fullProfile.id, // Preserve profile ID
								name: fullProfile.name, // Preserve profile name
							}
						}
						
						// Redact secrets from full profile, then return it as config
						const redactedProfile = redactSecretsDeep(configToReturn)
						
						return {
							name: fullProfile.name,
							id: fullProfile.id || profileMeta.id,
							apiProvider: configToReturn.apiProvider || fullProfile.apiProvider,
							modelId: profileMeta.modelId,
							isActive,
							config: redactedProfile,
						}
					})
				)
			} else {
				// Lightweight list without config
				const profiles = await provider.providerSettingsManager.listConfig()
				return profiles.map(profile => ({
					name: profile.name,
					id: profile.id || 'unknown',
					apiProvider: profile.apiProvider,
					modelId: profile.modelId,
					isActive: profile.name === currentProfileName,
				}))
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to get profiles:", error)
			throw error
		}
	}

	/**
	 * Get a specific profile by name or ID
	 *
	 * @summary Get profile details
	 * @param nameOrId Profile name or ID
	 * @param includeConfig Include full configuration (default: false)
	 * @returns Profile details with secrets redacted
	 */
	@Get("{nameOrId}")
	@SuccessResponse(200, "Profile retrieved successfully")
	@Response<ApiErrorResponse>(400, "Bad request")
	@Response<ApiErrorResponse>(404, "Profile not found")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getProfile(
		@Path() nameOrId: string,
		@Query() includeConfig?: boolean
	): Promise<ProfileListItem> {
		try {
			const provider = getProvider()

			if (!nameOrId) {
				throw new BadRequestError("Profile name or ID is required")
			}

			// Try to get by ID first, then by name
			let profile
			try {
				profile = await provider.providerSettingsManager.getProfile({ id: nameOrId })
			} catch {
				profile = await provider.providerSettingsManager.getProfile({ name: nameOrId })
			}

			const state = await provider.getState()
			const isActive = profile.name === state.currentApiConfigName
			
			// Get profile metadata for modelId
			const profileMeta = (await provider.providerSettingsManager.listConfig()).find(
				p => p.id === profile.id || p.name === profile.name
			)

			// If includeConfig=true or this is the active profile, merge with current state
			if (includeConfig) {
				let configToReturn = profile
				
				if (isActive) {
					// For active profile, merge with current state to get latest values
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
						...apiConfiguration, // Provider-specific settings (API keys, modelIds, etc.)
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
				
				// Redact secrets and return with config
				const redactedProfile = redactSecretsDeep(configToReturn)
				
				return {
					name: profile.name,
					id: profile.id || 'unknown',
					apiProvider: configToReturn.apiProvider || profile.apiProvider,
					modelId: profileMeta?.modelId,
					isActive,
					config: redactedProfile as ProfileDetails,
				}
			} else {
				// Lightweight response without config
				return {
					name: profile.name,
					id: profile.id || 'unknown',
					apiProvider: profile.apiProvider,
					modelId: profileMeta?.modelId,
					isActive,
				}
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to get profile:", error)
			if (error instanceof NotFoundError || (error instanceof Error && error.message.includes("not found"))) {
				throw new NotFoundError(`Profile '${nameOrId}' not found`)
			}
			throw error
		}
	}

	/**
	 * Create a new profile
	 * 
	 * @summary Create profile
	 * @param request Profile creation request with name and configuration
	 * @returns Created profile metadata
	 */
	@Post()
	@SuccessResponse(201, "Profile created successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Invalid input or profile already exists")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async createProfile(@Body() request: CreateProfileRequest): Promise<CreateProfileResponse> {
		try {
			const provider = getProvider()
			const { name, config } = request

			if (!name || typeof name !== "string") {
				throw new BadRequestError("Profile name is required and must be a string")
			}

			if (!config || typeof config !== "object") {
				throw new BadRequestError("Profile config is required and must be an object")
			}

			// Check if profile already exists
			const exists = await provider.providerSettingsManager.hasConfig(name)
			if (exists) {
				throw new BadRequestError(`Profile '${name}' already exists. Use PUT to update.`)
			}

			// Map generic field names to provider-specific field names
			// This allows clients to use either:
			// - Generic: { provider: "openrouter", model: "xxx", apiKey: "yyy" }
			// - Specific: { apiProvider: "openrouter", openRouterModelId: "xxx", openRouterApiKey: "yyy" }
			const mappedConfig = mapProfileFields(config as any)

			const profileId = await provider.providerSettingsManager.saveConfig(name, mappedConfig as any)

			this.setStatus(201)
			return {
				success: true,
				message: `Profile '${name}' created`,
				id: profileId,
				name,
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to create profile:", error)
			throw error
		}
	}

	/**
	 * Update an existing profile
	 *
	 * This endpoint performs a **MERGE** operation - it preserves existing fields
	 * and only updates the fields you provide. This is safer than a full replacement.
	 *
	 * IMPORTANT: If updating the currently active profile, this will:
	 * 1. Save to disk (profile storage)
	 * 2. Update in-memory state (ContextProxy)
	 * 3. Update current task's API handler (if task exists)
	 *
	 * This ensures changes take effect immediately without needing to re-activate.
	 *
	 * @summary Update profile (merge)
	 * @param name Profile name to update
	 * @param request Profile update request with new configuration
	 * @returns Updated profile metadata
	 */
	@Put("{name}")
	@SuccessResponse(200, "Profile updated successfully")
	@Response<ApiErrorResponse>(400, "Bad request")
	@Response<ApiErrorResponse>(404, "Profile not found")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async updateProfile(
		@Path() name: string,
		@Body() request: UpdateProfileRequest,
	): Promise<UpdateProfileResponse> {
		try {
			const provider = getProvider()
			const { config } = request

			if (!name) {
				throw new BadRequestError("Profile name is required")
			}

			if (!config || typeof config !== "object") {
				throw new BadRequestError("Profile config is required and must be an object")
			}

			// Check if profile exists
			const exists = await provider.providerSettingsManager.hasConfig(name)
			if (!exists) {
				throw new NotFoundError(`Profile '${name}' not found. Use POST to create.`)
			}

			// Get current state to check if this is the active profile
			const state = await provider.getState()
			const isActiveProfile = state.currentApiConfigName === name

			// Get existing profile to merge with
			const existingProfile = await provider.providerSettingsManager.getProfile({ name })
			
			// Map generic field names to provider-specific field names
			// This allows clients to use either:
			// - Generic: { provider: "openrouter", model: "xxx", apiKey: "yyy" }
			// - Specific: { apiProvider: "openrouter", openRouterModelId: "xxx", openRouterApiKey: "yyy" }
			const mappedConfig = mapProfileFields(config as any)
			
			// Perform a proper merge that preserves all existing provider-specific fields
			// and only updates the fields provided in the request
			const mergedConfig = {
				...existingProfile,
				...mappedConfig,
				id: existingProfile.id, // Preserve ID
				name, // Preserve name
			}

			console.log(`[ProfilesController] Merged config for '${name}':`, Object.keys(mergedConfig).join(', '))

			// Save to disk (updates profile storage)
			const profileId = await provider.providerSettingsManager.saveConfig(name, mergedConfig as any)
			
			// If this is the active profile, update in-memory state immediately
			if (isActiveProfile) {
				console.log(`[ProfilesController] Updating active profile '${name}' in-memory state`)
				
				// Update ContextProxy with new settings (this updates global state)
				await provider.contextProxy.setProviderSettings(mergedConfig as any)
				
				// Update listApiConfigMeta to reflect changes
				await provider.contextProxy.setValue("listApiConfigMeta", await provider.providerSettingsManager.listConfig())
				
				// Update current task's API handler if there is one
				const task = provider.getCurrentTask()
				if (task) {
					const { buildApiHandler } = await import("../../../api")
					task.api = buildApiHandler(mergedConfig as any)
					console.log(`[ProfilesController] Updated task API handler with new profile settings`)
				}
				
				// Broadcast state update to WebSocket clients
				await provider.postStateToWebview()
			}

			// Build response config directly from mergedConfig to ensure we return what was saved
			// This avoids any timing issues with state updates
			const responseConfig = {
				...mergedConfig,
				id: profileId,
				name,
			}

			console.log(`[ProfilesController] Response config has ${Object.keys(responseConfig).length} fields`)

			// Redact secrets before returning
			const redactedConfig = redactSecretsDeep(responseConfig)
			
			console.log(`[ProfilesController] Redacted config has ${Object.keys(redactedConfig).length} fields`)

			return {
				success: true,
				message: `Profile '${name}' updated (merged)${isActiveProfile ? ' and activated' : ''}`,
				id: profileId,
				name,
				config: redactedConfig as ProfileDetails,
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to update profile:", error)
			throw error
		}
	}

	/**
	 * Delete a profile
	 * 
	 * @summary Delete profile
	 * @param name Profile name to delete
	 * @returns Deletion confirmation
	 */
	@Delete("{name}")
	@SuccessResponse(200, "Profile deleted successfully")
	@Response<ApiErrorResponse>(400, "Bad request - Cannot delete last profile")
	@Response<ApiErrorResponse>(404, "Profile not found")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async deleteProfile(@Path() name: string): Promise<DeleteProfileResponse> {
		try {
			const provider = getProvider()

			if (!name) {
				throw new BadRequestError("Profile name is required")
			}

			await provider.providerSettingsManager.deleteConfig(name)

			return {
				success: true,
				message: `Profile '${name}' deleted`,
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to delete profile:", error)
			const errorMessage = error instanceof Error ? error.message : String(error)

			if (errorMessage.includes("not found")) {
				throw new NotFoundError(`Profile '${name}' not found`)
			} else if (errorMessage.includes("last remaining")) {
				throw new BadRequestError("Cannot delete the last remaining profile")
			}
			throw error
		}
	}

	/**
	 * Activate a profile (make it the current one)
	 *
	 * @summary Activate profile
	 * @param nameOrId Profile name or ID to activate
	 * @returns Activation confirmation with profile details
	 */
	@Post("{nameOrId}/activate")
	@SuccessResponse(200, "Profile activated successfully")
	@Response<ApiErrorResponse>(400, "Bad request")
	@Response<ApiErrorResponse>(404, "Profile not found")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async activateProfile(@Path() nameOrId: string): Promise<ActivateProfileResponse> {
		try {
			const provider = getProvider()

			if (!nameOrId) {
				throw new BadRequestError("Profile name or ID is required")
			}

			// Try to activate by ID first, then by name
			let profile
			try {
				profile = await provider.providerSettingsManager.activateProfile({ id: nameOrId })
			} catch {
				profile = await provider.providerSettingsManager.activateProfile({ name: nameOrId })
			}

			// After activation, get the current state to get the full active configuration
			const state = await provider.getState()
			
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
			
			// Merge stored profile with current active configuration
			const fullConfig = {
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
			
			// Redact secrets from full profile
			const redactedProfile = redactSecretsDeep(fullConfig)
			
			return {
				success: true,
				message: `Profile '${profile.name}' activated`,
				profile: {
					name: profile.name,
					id: profile.id,
					isActive: true, // Always true after activation
					config: redactedProfile,
				},
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to activate profile:", error)
			const errorMessage = error instanceof Error ? error.message : String(error)

			if (errorMessage.includes("not found")) {
				throw new NotFoundError(`Profile '${nameOrId}' not found`)
			}
			throw error
		}
	}

	/**
	 * Get the profile assigned to a specific mode
	 * 
	 * @summary Get mode's profile
	 * @param mode Mode slug (e.g., 'code', 'architect', 'ask')
	 * @returns Mode's assigned profile details
	 */
	@Get("modes/{mode}")
	@SuccessResponse(200, "Mode profile retrieved successfully")
	@Response<ApiErrorResponse>(400, "Bad request")
	@Response<ApiErrorResponse>(404, "No profile assigned to mode")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async getModeProfile(@Path() mode: string): Promise<ModeProfileResponse> {
		try {
			const provider = getProvider()

			if (!mode) {
				throw new BadRequestError("Mode is required")
			}

			const profileId = await provider.providerSettingsManager.getModeConfigId(mode)

			if (!profileId) {
				throw new NotFoundError(`No profile assigned to mode '${mode}'`)
			}

			// Get the full profile details
			const profile = await provider.providerSettingsManager.getProfile({ id: profileId })

			// Return full profile (this endpoint is specifically for getting mode's profile details)
			return {
				mode,
				profileId: profileId || 'unknown',
				profileName: profile.name,
				profile: redactSecretsDeep(profile) as ProfileDetails,
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to get mode profile:", error)
			throw error
		}
	}

	/**
	 * Assign a profile to a specific mode
	 * 
	 * @summary Set mode's profile
	 * @param mode Mode slug to configure
	 * @param request Profile assignment request (profileId or profileName)
	 * @returns Assignment confirmation
	 */
	@Put("modes/{mode}")
	@SuccessResponse(200, "Profile assigned to mode successfully")
	@Response<ApiErrorResponse>(400, "Bad request")
	@Response<ApiErrorResponse>(404, "Profile or mode not found")
	@Response<ApiErrorResponse>(500, "Internal server error")
	public async setModeProfile(
		@Path() mode: string,
		@Body() request: SetModeProfileRequest,
	): Promise<SetModeProfileResponse> {
		try {
			const provider = getProvider()
			const { profileId, profileName } = request

			if (!mode) {
				throw new BadRequestError("Mode is required")
			}

			if (!profileId && !profileName) {
				throw new BadRequestError("Either profileId or profileName is required")
			}

			// Get the profile ID if profileName was provided
			let targetProfileId = profileId
			if (!targetProfileId && profileName) {
				const profile = await provider.providerSettingsManager.getProfile({ name: profileName })
				targetProfileId = profile.id
			}

			if (!targetProfileId) {
				throw new BadRequestError("Could not determine profile ID")
			}

			await provider.providerSettingsManager.setModeConfig(mode, targetProfileId)

			return {
				success: true,
				message: `Profile assigned to mode '${mode}'`,
				mode,
				profileId: targetProfileId,
			}
		} catch (error) {
			console.error("[ProfilesController] Failed to set mode profile:", error)
			const errorMessage = error instanceof Error ? error.message : String(error)

			if (errorMessage.includes("not found")) {
				throw new NotFoundError(errorMessage)
			}
			throw error
		}
	}
}