/**
 * TaskExecutionPool - Provider-per-task pool for parallel task execution
 * 
 * Manages ClineProvider instances for concurrent task execution. Each task gets
 * its own isolated provider instance, enabling true parallel execution without
 * task switching overhead.
 * 
 * Key Features:
 * - One provider per active task
 * - Automatic provider lifecycle management
 * - Configurable concurrent task limit
 * - Memory-efficient immediate disposal
 * - Per-provider state isolation (mode/profile)
 * - Shared global settings (via contextProxy)
 */

import * as vscode from "vscode"
import { ClineProvider } from "../../core/webview/ClineProvider"
import { ContextProxy } from "../../core/context/ContextProxy"
import { MdmService } from "../../integrations/mdm/MdmService"
import type { ExtensionMessage } from "../../shared/ExtensionMessage"

export interface TaskExecutionPoolOptions {
	/**
	 * Maximum number of concurrent providers allowed.
	 * Default: 50 (high limit for most use cases)
	 *
	 * Each provider uses ~250MB RAM, so:
	 * - 10 providers = ~2.5GB
	 * - 50 providers = ~12.5GB
	 * - 100 providers = ~25GB
	 */
	maxConcurrentProviders?: number

	/**
	 * Auto-cleanup idle providers after N milliseconds.
	 * Default: undefined (immediate disposal)
	 *
	 * If set, providers stay in memory for faster resume.
	 * Example: 1800000 (30 minutes)
	 */
	providerIdleTimeout?: number
	
	/**
	 * Broadcast function for WebSocket messaging.
	 * Called by pooled providers to send messages to WebSocket clients.
	 *
	 * This enables parallel task execution while maintaining a single
	 * shared WebSocket connection for all tasks.
	 */
	broadcastMessage?: (message: ExtensionMessage) => void
}

export class TaskExecutionPool {
	private providers: Map<string, ClineProvider> = new Map()
	private providerCreationTimes: Map<string, number> = new Map()
	
	private readonly maxConcurrentProviders: number
	private readonly providerIdleTimeout?: number
	private readonly broadcastMessage?: (message: ExtensionMessage) => void
	
	private sharedContext: vscode.ExtensionContext
	private sharedOutputChannel: vscode.OutputChannel
	private sharedContextProxy: ContextProxy
	private mdmService?: MdmService
	
	constructor(
		context: vscode.ExtensionContext,
		outputChannel: vscode.OutputChannel,
		contextProxy: ContextProxy,
		mdmService?: MdmService,
		options: TaskExecutionPoolOptions = {}
	) {
		this.sharedContext = context
		this.sharedOutputChannel = outputChannel
		this.sharedContextProxy = contextProxy
		this.mdmService = mdmService
		
		// Set pool configuration
		this.maxConcurrentProviders = options.maxConcurrentProviders ?? 50
		this.providerIdleTimeout = options.providerIdleTimeout
		this.broadcastMessage = options.broadcastMessage
		
		console.log(`[TaskExecutionPool] Initialized with max ${this.maxConcurrentProviders} concurrent providers`)
		console.log(`[TaskExecutionPool] WebSocket broadcasting: ${this.broadcastMessage ? 'ENABLED' : 'DISABLED'}`)
		
		// Start idle timeout cleanup if enabled
		if (this.providerIdleTimeout) {
			this.startIdleCleanup()
		}
	}
	
	/**
	 * Get or create a ClineProvider instance for a specific task
	 *
	 * Each task gets its own provider for complete isolation. The provider
	 * maintains its own task stack, mode, and profile settings.
	 *
	 * Also sets up automatic cleanup listeners for task lifecycle events.
	 *
	 * @param taskId - Task ID to get provider for
	 * @returns ClineProvider instance for this task
	 * @throws Error if max concurrent limit reached
	 */
	async getProviderForTask(taskId: string): Promise<ClineProvider> {
		// Check if task already has a provider
		const existingProvider = this.providers.get(taskId)
		if (existingProvider) {
			console.log(`[TaskExecutionPool] Reusing existing provider for task ${taskId}`)
			// Update last access time for idle cleanup
			this.providerCreationTimes.set(taskId, Date.now())
			return existingProvider
		}
		
		// Check concurrent limit
		if (this.providers.size >= this.maxConcurrentProviders) {
			throw new Error(
				`Maximum concurrent providers limit reached (${this.maxConcurrentProviders}). ` +
				`Please complete or cancel some tasks before starting new ones.`
			)
		}
		
		console.log(`[TaskExecutionPool] Creating new provider for task ${taskId} (${this.providers.size + 1}/${this.maxConcurrentProviders})`)
		
		// Create new isolated provider instance
		const provider = new ClineProvider(
			this.sharedContext,
			this.sharedOutputChannel,
			"headless", // New render context for API-only providers
			this.sharedContextProxy,
			this.mdmService
		)
		
		// Initialize provider with mock webview (same as CLI does)
		const mockWebview = this.createMockWebview()
		const mockWebviewView = {
			webview: mockWebview,
			visible: true, // Important: marks provider as "visible" for getInstance()
			show: () => {},
			onDidDispose: () => ({ dispose: () => {} }),
			onDidChangeVisibility: () => ({ dispose: () => {} }),
		} as any
		
		await provider.resolveWebviewView(mockWebviewView)
		
		// Load the task into this provider
		// This sets up the task's conversation history, mode, and profile
		await provider.showTaskWithId(taskId)
		
		// Set up auto-cleanup listeners for task lifecycle events
		// This ensures providers are released when tasks complete/abort
		this.setupTaskLifecycleListeners(provider, taskId)
		
		// Cache the provider
		this.providers.set(taskId, provider)
		this.providerCreationTimes.set(taskId, Date.now())
		
		console.log(`[TaskExecutionPool] Provider created and task ${taskId} loaded successfully`)
		
		return provider
	}
	
	/**
	 * Release a provider when task completes or is no longer needed
	 * 
	 * Performs cleanup and removes from pool. Provider is disposed immediately
	 * for memory efficiency (100ms reload on resume is acceptable).
	 * 
	 * @param taskId - Task ID to release provider for
	 */
	async releaseProvider(taskId: string): Promise<void> {
		const provider = this.providers.get(taskId)
		if (!provider) {
			console.log(`[TaskExecutionPool] No provider to release for task ${taskId}`)
			return
		}
		
		console.log(`[TaskExecutionPool] Releasing provider for task ${taskId} (${this.providers.size - 1}/${this.maxConcurrentProviders} remaining)`)
		
		try {
			// Dispose the provider (cleans up resources, saves state)
			await provider.dispose()
		} catch (error) {
			console.error(`[TaskExecutionPool] Error disposing provider for task ${taskId}:`, error)
		}
		
		// Remove from pool
		this.providers.delete(taskId)
		this.providerCreationTimes.delete(taskId)
	}
	
	/**
	 * Get all active task IDs currently in the pool
	 * 
	 * Useful for monitoring and debugging.
	 * 
	 * @returns Array of task IDs with active providers
	 */
	getActiveTaskIds(): string[] {
		return Array.from(this.providers.keys())
	}
	
	/**
	 * Get current provider count
	 * 
	 * @returns Number of providers currently in the pool
	 */
	getProviderCount(): number {
		return this.providers.size
	}
	
	/**
	 * Get pool statistics
	 * 
	 * @returns Pool statistics object
	 */
	getStats() {
		return {
			activeProviders: this.providers.size,
			maxConcurrentProviders: this.maxConcurrentProviders,
			utilizationPercent: (this.providers.size / this.maxConcurrentProviders) * 100,
			activeTaskIds: this.getActiveTaskIds(),
		}
	}
	
	/**
	 * Check if a task has an active provider
	 * 
	 * @param taskId - Task ID to check
	 * @returns true if provider exists for this task
	 */
	hasProviderForTask(taskId: string): boolean {
		return this.providers.has(taskId)
	}
	
	/**
	 * Dispose all providers and clear the pool
	 * 
	 * Used for graceful shutdown or cleanup.
	 */
	async disposeAll(): Promise<void> {
		console.log(`[TaskExecutionPool] Disposing all ${this.providers.size} providers`)
		
		const disposePromises = Array.from(this.providers.keys()).map(taskId =>
			this.releaseProvider(taskId)
		)
		
		await Promise.all(disposePromises)
		
		console.log(`[TaskExecutionPool] All providers disposed`)
	}
	
	/**
	 * Create mock webview for headless provider
	 *
	 * Providers need a webview interface even in headless mode.
	 * This mock provides the minimum required interface.
	 *
	 * If a broadcast function is configured, messages are sent to the
	 * shared WebSocket server. Otherwise, messages are silently discarded.
	 */
	private createMockWebview() {
		return {
			postMessage: async (message: ExtensionMessage) => {
				// Broadcast to WebSocket if function is available
				if (this.broadcastMessage) {
					this.broadcastMessage(message)
				}
				// Otherwise silently discard (headless mode without WebSocket)
			},
			asWebviewUri: (uri: vscode.Uri) => uri,
			cspSource: "none",
			onDidReceiveMessage: () => ({
				dispose: () => {},
			}),
		}
	}
	
	/**
	 * Set up lifecycle listeners for automatic provider cleanup
	 *
	 * Listens to task completion and abortion events to automatically
	 * release providers when tasks finish.
	 *
	 * @param provider - Provider instance to monitor
	 * @param taskId - Task ID being monitored
	 */
	private setupTaskLifecycleListeners(provider: ClineProvider, taskId: string): void {
		// Auto-release on task completion
		const onTaskCompleted = async () => {
			console.log(`[TaskExecutionPool] Task ${taskId} completed - auto-releasing provider`)
			await this.releaseProvider(taskId)
		}
		
		// Auto-release on task abortion (includes cancellation)
		const onTaskAborted = async () => {
			console.log(`[TaskExecutionPool] Task ${taskId} aborted - auto-releasing provider`)
			await this.releaseProvider(taskId)
		}
		
		// Attach listeners
		provider.on("taskCompleted", onTaskCompleted)
		provider.on("taskAborted", onTaskAborted)
		
		console.log(`[TaskExecutionPool] Lifecycle listeners attached for task ${taskId}`)
	}
	
	/**
	 * Start periodic cleanup of idle providers
	 *
	 * Only runs if providerIdleTimeout is configured.
	 * Checks every 60 seconds for providers that have been idle.
	 */
	private startIdleCleanup(): void {
		if (!this.providerIdleTimeout) return
		
		const cleanupInterval = 60000 // Check every 60 seconds
		
		setInterval(async () => {
			const now = Date.now()
			const timeout = this.providerIdleTimeout!
			
			for (const [taskId, creationTime] of this.providerCreationTimes.entries()) {
				const idleTime = now - creationTime
				
				if (idleTime > timeout) {
					console.log(`[TaskExecutionPool] Auto-releasing idle provider for task ${taskId} (idle for ${Math.round(idleTime / 1000)}s)`)
					await this.releaseProvider(taskId)
				}
			}
		}, cleanupInterval)
	}
}