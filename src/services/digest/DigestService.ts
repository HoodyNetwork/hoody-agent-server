/**
 * ============================================================================
 * AGENT DIGEST SERVICE
 * ============================================================================
 * 
 * Provides LLM-powered ultra-compact message summaries for tiny UI contexts.
 * 
 * PURPOSE:
 * Generate 50-200 character digests of agent messages for:
 * - Desktop notifications
 * - Mobile compact views  
 * - Status bars
 * - Task previews
 * 
 * KEY FEATURES:
 * - Uses configurable cheap/fast LLM (not the main AI model)
 * - Caches digests to avoid redundant API calls
 * - Supports custom digest prompts
 * - Extracts tool summaries automatically
 * - Non-blocking (doesn't slow down agent)
 * 
 * USAGE:
 * ```typescript
 * const digestService = new DigestService(contextProxy)
 * const result = await digestService.digestMessage(message, {
 *   maxLength: 150,
 *   profileId: 'gpt-3.5-turbo'
 * })
 * message.digest = result.digest
 * ```
 * 
 * @module services/digest
 */

import { ClineMessage } from "@roo-code/types"
import { ApiHandler, buildApiHandler } from "../../api"
import { ContextProxy } from "../../core/config/ContextProxy"
import type { ClineProvider } from "../../core/webview/ClineProvider"

/**
 * Options for digest generation
 */
export interface DigestOptions {
	/** Maximum length of digest in characters (default: from settings or 200) */
	maxLength?: number
	
	/** AI profile ID to use for digest generation (default: from settings) */
	profileId?: string
	
	/** Force regeneration even if digest exists in cache */
	force?: boolean
	
	/** Custom prompt template to use instead of default */
	customPrompt?: string
}

/**
 * Result of digest generation
 */
export interface DigestResult {
	/** The generated digest text */
	digest: string
	
	/** Whether result came from cache */
	cached: boolean
	
	/** Metadata about digest generation */
	metadata?: {
		generatedAt: number
		profileId: string
		tokensUsed?: number
		maxLength: number
	}
}

/**
 * DigestService - Generates ultra-compact message summaries
 * 
 * This service uses a configurable LLM to generate short digests of agent messages.
 * It's designed to be non-blocking and efficient, with aggressive caching to minimize
 * API calls.
 * 
 * DESIGN PRINCIPLES:
 * - Non-critical: Digest generation failures don't break the agent
 * - Fast: Uses cheap/fast models, aggressive caching
 * - Flexible: Supports custom prompts and per-message options
 * - Transparent: Full metadata about generation process
 * 
 * CACHING STRATEGY:
 * - Cache key: messageTimestamp + maxLength + profileId
 * - Cache invalidation: Never (digests don't change)
 * - Cache size: LRU with 1000 entry limit (~200KB)
 * - Cache persistence: In-memory only (regenerate on restart)
 */
export class DigestService {
	/** In-memory cache for generated digests */
	private cache: Map<string, string> = new Map()
	
	/** Maximum cache size (LRU eviction) */
	private readonly MAX_CACHE_SIZE = 1000
	
	/** ContextProxy for accessing settings */
	private contextProxy: ContextProxy
	
	/** ClineProvider for accessing profiles */
	private provider: ClineProvider

	/**
	 * Creates a new DigestService instance
	 *
	 * @param contextProxy - Context proxy for accessing global settings
	 * @param provider - Cline provider for accessing profile manager
	 */
	constructor(contextProxy: ContextProxy, provider: ClineProvider) {
		this.contextProxy = contextProxy
		this.provider = provider
	}

	/**
	 * Generate digest for a message
	 * 
	 * PROCESS:
	 * 1. Check cache first (unless force=true)
	 * 2. Get AI profile from settings or options
	 * 3. Extract message content to digest
	 * 4. Build digest prompt
	 * 5. Call LLM to generate digest
	 * 6. Cache result
	 * 7. Return digest with metadata
	 * 
	 * ERROR HANDLING:
	 * - Throws if no profile configured
	 * - Throws if LLM call fails
	 * - Caller should handle errors gracefully
	 * 
	 * @param message - ClineMessage to digest
	 * @param options - Optional digest configuration
	 * @returns DigestResult with generated digest and metadata
	 * @throws Error if profile not found or LLM call fails
	 */
	async digestMessage(
		message: ClineMessage,
		options?: DigestOptions
	): Promise<DigestResult> {
		// Check cache first
		const cacheKey = this.getCacheKey(message, options)
		if (!options?.force && this.cache.has(cacheKey)) {
			return {
				digest: this.cache.get(cacheKey)!,
				cached: true,
			}
		}

		// Get digest profile ID
		const profileId = options?.profileId || this.contextProxy.getValue("digestProfileId")
		if (!profileId) {
			throw new Error("No digest profile configured. Set digestProfileId in settings.")
		}

		// Get profile configuration from providerSettingsManager
		let profile
		try {
			profile = await this.provider.providerSettingsManager.getProfile({ id: profileId })
		} catch (error) {
			throw new Error(`Digest profile "${profileId}" not found`)
		}

		// Build API handler for this profile
		const handler = buildApiHandler(profile as any)

		// Extract content to digest
		const contentToDigest = this.extractContent(message)

		// Get max length
		const maxLength = options?.maxLength || this.contextProxy.getValue("digestMaxLength") || 200

		// Build prompt
		const prompt = options?.customPrompt || this.buildDigestPrompt(contentToDigest, maxLength)

		// Call LLM
		const startTime = Date.now()
		const digest = await this.callLLM(handler, prompt, maxLength)
		const generationTime = Date.now() - startTime

		// Cache result (with LRU eviction)
		this.addToCache(cacheKey, digest)

		// Build metadata
		const metadata = {
			generatedAt: Date.now(),
			profileId,
			maxLength,
			tokensUsed: undefined, // TODO: Track token usage if available
		}

		console.log(`[DigestService] Generated digest in ${generationTime}ms (${digest.length} chars)`)

		return {
			digest,
			cached: false,
			metadata,
		}
	}

	/**
	 * Build digest prompt
	 * 
	 * Creates a prompt that instructs the LLM to generate an ultra-compact summary.
	 * Uses custom prompt from settings if available, otherwise uses default template.
	 * 
	 * DEFAULT TEMPLATE FOCUSES ON:
	 * - Actions taken (files created/edited, commands run)
	 * - Key results or outcomes
	 * - Important errors or warnings
	 * 
	 * REMOVES:
	 * - Verbose explanations
	 * - Tool names and technical details
	 * - Redundant information
	 * 
	 * @param content - Message content to digest
	 * @param maxLength - Maximum digest length
	 * @returns Prompt string for LLM
	 */
	private buildDigestPrompt(content: string, maxLength: number): string {
		// Check for custom prompt in settings
		const customPrompt = this.contextProxy.getValue("customDigestPrompt")
		
		if (customPrompt) {
			// Replace placeholders in custom prompt
			return customPrompt
				.replace(/\{maxLength\}/g, String(maxLength))
				.replace(/\{content\}/g, content)
		}

		// Default digest prompt template
		return `You are a concise message summarizer. Create an ultra-compact summary of the following agent message.

REQUIREMENTS:
- Maximum ${maxLength} characters (STRICT LIMIT)
- Focus on: actions taken, files modified, key results, errors
- Remove: verbose explanations, tool names, redundant info
- Style: Direct, informative, no fluff

MESSAGE:
${content.substring(0, 2000)}

DIGEST (max ${maxLength} chars):`.trim()
	}

	/**
	 * Extract digestible content from message
	 * 
	 * Intelligently extracts the user-visible content from different message types.
	 * For tool messages, generates human-readable summaries instead of raw XML.
	 * 
	 * MESSAGE TYPE HANDLING:
	 * - Text messages: Use text field directly
	 * - Tool messages: Extract tool summary (e.g., "Created app.ts")
	 * - Error messages: Use error text
	 * - Other types: Fallback to text or JSON
	 * 
	 * @param message - ClineMessage to extract content from
	 * @returns Extracted content string
	 */
	private extractContent(message: ClineMessage): string {
		// Text messages (most common)
		if (message.say === "text" && message.text) {
			return message.text
		}

		// Tool messages - extract tool summary
		if (message.type === "ask" && message.ask === "tool" && message.text) {
			return this.extractToolSummary(message.text)
		}

		// Error messages
		if (message.say === "error" && message.text) {
			return `Error: ${message.text}`
		}

		// Command output
		if (message.say === "command_output" && message.text) {
			return `Output: ${message.text.substring(0, 500)}`
		}

		// API request started
		if (message.say === "api_req_started" && message.text) {
			return "AI processing request..."
		}

		// Completion result
		if (message.say === "completion_result" && message.text) {
			return `Completed: ${message.text}`
		}

		// Fallback to text or stringified message
		return message.text || JSON.stringify(message).substring(0, 500)
	}

	/**
	 * Extract human-readable summary from tool messages
	 * 
	 * Tool messages contain JSON with tool details. This method converts
	 * technical tool data into human-readable action summaries.
	 * 
	 * EXAMPLES:
	 * - {"tool": "newFileCreated", "path": "app.ts"} → "Created app.ts"
	 * - {"tool": "appliedDiff", "path": "utils.ts"} → "Modified utils.ts"
	 * - {"tool": "executeCommand", "command": "npm test"} → "Ran: npm test"
	 * 
	 * @param toolText - JSON string from tool message
	 * @returns Human-readable tool summary
	 */
	private extractToolSummary(toolText: string): string {
		try {
			const toolData = JSON.parse(toolText)
			const tool = toolData.tool
			const path = toolData.path
			const command = toolData.command

			switch (tool) {
				case "newFileCreated":
					return `Created ${path}`
				case "appliedDiff":
					return `Modified ${path}`
				case "fileEdited":
					return `Edited ${path}`
				case "insertedContent":
					return `Updated ${path}`
				case "searchAndReplaced":
					return `Updated ${path}`
				case "readFile":
					return `Read ${path}`
				case "listFilesTopLevel":
				case "listFilesRecursive":
					return `Listed files in ${path || 'workspace'}`
				case "listCodeDefinitionNames":
					return `Listed code definitions in ${path}`
				case "searchFiles":
					return `Searched files in ${path || 'workspace'}`
				case "executeCommand":
					return `Ran: ${command}`
				case "switchMode":
					return `Switched to ${toolData.mode} mode`
				case "newTask":
					return `Created subtask in ${toolData.mode} mode`
				case "attemptCompletion":
					return "Completed task"
				default:
					return `${tool}: ${path || command || ''}`
			}
		} catch (error) {
			// If JSON parsing fails, return the text as-is
			return toolText.substring(0, 200)
		}
	}

	/**
	 * Call LLM to generate digest
	 * 
	 * Streams the LLM response and collects the generated text.
	 * Enforces maximum length by truncating if needed.
	 * 
	 * STREAMING PROCESS:
	 * 1. Create message stream with prompt
	 * 2. Collect all text chunks
	 * 3. Trim and validate result
	 * 4. Enforce max length if exceeded
	 * 
	 * @param handler - API handler for the digest profile
	 * @param prompt - Digest generation prompt
	 * @param maxLength - Maximum allowed digest length
	 * @returns Generated digest text
	 */
	private async callLLM(handler: ApiHandler, prompt: string, maxLength: number): Promise<string> {
		const stream = handler.createMessage("", [
			{ role: "user", content: [{ type: "text", text: prompt }] }
		])

		let digest = ""
		
		try {
			for await (const chunk of stream) {
				if (chunk.type === "text" && chunk.text) {
					digest += chunk.text
				}
			}
		} catch (error) {
			console.error("[DigestService] LLM call failed:", error)
			throw new Error(`Failed to generate digest: ${error instanceof Error ? error.message : String(error)}`)
		}

		// Clean and validate
		digest = digest.trim()
		
		if (!digest) {
			throw new Error("LLM returned empty digest")
		}

		// Enforce max length (truncate with ellipsis if needed)
		if (digest.length > maxLength) {
			digest = digest.substring(0, maxLength - 3) + "..."
		}

		return digest
	}

	/**
	 * Add digest to cache with LRU eviction
	 * 
	 * Maintains cache size limit by removing oldest entries when full.
	 * Uses Map iteration order (insertion order) for LRU behavior.
	 * 
	 * @param key - Cache key
	 * @param digest - Digest to cache
	 */
	private addToCache(key: string, digest: string): void {
		// If cache is full, remove oldest entry
		if (this.cache.size >= this.MAX_CACHE_SIZE) {
			const firstKey = this.cache.keys().next().value
			if (firstKey) {
				this.cache.delete(firstKey)
			}
		}

		this.cache.set(key, digest)
	}

	/**
	 * Generate cache key for a message
	 * 
	 * Cache key includes message timestamp and digest parameters to ensure
	 * different digest requests for the same message are cached separately.
	 * 
	 * KEY FORMAT: `{timestamp}-{maxLength}-{profileId}`
	 * 
	 * @param message - ClineMessage to cache
	 * @param options - Digest options
	 * @returns Cache key string
	 */
	private getCacheKey(message: ClineMessage, options?: DigestOptions): string {
		const maxLength = options?.maxLength || this.contextProxy.getValue("digestMaxLength") || 200
		const profileId = options?.profileId || this.contextProxy.getValue("digestProfileId") || "default"
		return `${message.ts}-${maxLength}-${profileId}`
	}

	/**
	 * Clear all cached digests
	 * 
	 * Useful for:
	 * - Memory management
	 * - Testing
	 * - After profile changes
	 */
	public clearCache(): void {
		this.cache.clear()
		console.log("[DigestService] Cache cleared")
	}

	/**
	 * Get cache statistics
	 * 
	 * @returns Cache size and hit rate
	 */
	public getCacheStats(): { size: number; maxSize: number } {
		return {
			size: this.cache.size,
			maxSize: this.MAX_CACHE_SIZE,
		}
	}

	/**
	 * Check if digest is enabled globally
	 * 
	 * @returns True if digest feature is enabled
	 */
	public isEnabled(): boolean {
		return this.contextProxy.getValue("digestEnabled") || false
	}

	/**
	 * Check if auto-digest is enabled
	 * 
	 * @returns True if auto-digest is enabled
	 */
	public isAutoDigestEnabled(): boolean {
		const digestEnabled = this.isEnabled()
		const autoDigestEnabled = this.contextProxy.getValue("autoDigestEnabled")
		return digestEnabled && (autoDigestEnabled !== false) // Default true if digestEnabled
	}

	/**
	 * Check if digest is enabled for a specific task
	 * 
	 * Checks task-specific overrides first, falls back to global setting.
	 * 
	 * @param taskId - Task ID to check
	 * @returns True if digest should be generated for this task
	 */
	public isEnabledForTask(taskId: string): boolean {
		if (!this.isEnabled()) {
			return false
		}

		// Check task-specific override
		const overrides = this.contextProxy.getValue("digestTaskOverrides") || {}
		const taskOverride = overrides[taskId]

		if (taskOverride !== undefined) {
			return taskOverride.enabled
		}

		// Fall back to global auto-digest setting
		return this.isAutoDigestEnabled()
	}

	/**
	 * Get effective digest settings for a task
	 * 
	 * Returns merged settings considering global defaults and task-specific overrides.
	 * 
	 * @param taskId - Task ID
	 * @returns Effective settings for this task
	 */
	public getTaskSettings(taskId: string): {
		enabled: boolean
		maxLength: number
		profileId?: string
	} {
		const globalMaxLength = this.contextProxy.getValue("digestMaxLength") || 200
		const globalProfileId = this.contextProxy.getValue("digestProfileId")
		const overrides = this.contextProxy.getValue("digestTaskOverrides") || {}
		const taskOverride = overrides[taskId]

		return {
			enabled: this.isEnabledForTask(taskId),
			maxLength: taskOverride?.maxLength || globalMaxLength,
			profileId: taskOverride?.profileId || globalProfileId,
		}
	}
}