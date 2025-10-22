/**
 * Request-Scoped Context Manager
 * 
 * Manages temporary mode/profile overrides for a single API request.
 * Automatically reverts to original context after request completes.
 * 
 * This enables per-request mode/profile overrides without affecting
 * the task's persistent state or global configuration.
 * 
 * @example
 * ```typescript
 * const scopedContext = new RequestScopedContext()
 * 
 * try {
 *   // Apply temporary override
 *   await scopedContext.applyOverride(provider, task, {
 *     mode: "debug",
 *     profileId: "fast-model"
 *   })
 *   
 *   // Execute request with override context
 *   task.handleWebviewAskResponse("yesButtonClicked")
 *   
 * } finally {
 *   // Always revert to original context
 *   await scopedContext.revert(provider, task)
 * }
 * ```
 */

import { buildApiHandler } from "../../api"
import type { ClineProvider } from "../webview/ClineProvider"
import type { Task } from "../task/Task"

export class RequestScopedContext {
	private originalMode?: string
	private originalProfile?: string
	private wasApplied: boolean = false

	/**
	 * Apply temporary mode/profile override for a single request.
	 * Saves the current context for later restoration.
	 * 
	 * @param provider - ClineProvider instance
	 * @param task - Task instance to update
	 * @param override - Temporary mode/profile to apply
	 * @throws Error if profile ID not found
	 */
	async applyOverride(
		provider: ClineProvider,
		task: Task,
		override: { mode?: string; profileId?: string }
	): Promise<void> {
		if (!override.mode && !override.profileId) {
			// No override specified, nothing to do
			return
		}

		// Save current context
		const state = await provider.getState()
		this.originalMode = state.mode
		this.originalProfile = state.currentApiConfigName
		this.wasApplied = true

		// Apply temporary mode override
		if (override.mode) {
			await provider.setMode(override.mode)
		}

		// Apply temporary profile override
		if (override.profileId) {
			const profile = provider.getProviderProfileEntries().find(p => p.id === override.profileId)
			
			if (!profile) {
				throw new Error(`Profile not found: ${override.profileId}`)
			}

			// Activate the profile
			await provider.activateProviderProfile({ name: profile.name })
			
			// Update task's API handler to use the new profile
			const settings = await provider.providerSettingsManager.getProfile({ id: override.profileId })
			task.api = buildApiHandler(settings)
		}
	}

	/**
	 * Revert to the original mode/profile context.
	 * Should always be called after request completes (use try/finally).
	 * 
	 * @param provider - ClineProvider instance
	 * @param task - Task instance to restore
	 */
	async revert(provider: ClineProvider, task: Task): Promise<void> {
		if (!this.wasApplied) {
			// Nothing was overridden, nothing to revert
			return
		}

		try {
			// Restore original mode
			if (this.originalMode) {
				await provider.setMode(this.originalMode)
			}

			// Restore original profile
			if (this.originalProfile) {
				await provider.activateProviderProfile({ name: this.originalProfile })
				
				// Restore task's API handler
				const settings = await provider.providerSettingsManager.getProfile({ name: this.originalProfile })
				task.api = buildApiHandler(settings)
			}
		} finally {
			// Clear state
			this.originalMode = undefined
			this.originalProfile = undefined
			this.wasApplied = false
		}
	}

	/**
	 * Check if an override was applied
	 */
	public get isActive(): boolean {
		return this.wasApplied
	}
}