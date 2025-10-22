/**
 * FileWriteQueue - In-Memory File Write Coordination
 * 
 * Provides safe concurrent file write operations without creating lock files.
 * Uses promise-based queuing to serialize writes to the same file path.
 * 
 * **Benefits:**
 * - No lock files created on disk (cleaner than proper-lockfile)
 * - Automatic cleanup (no orphaned locks)
 * - Zero filesystem overhead
 * 
 * **Limitations:**
 * - Only works within a single Node.js process
 * - Lock state lost on process restart
 * - Won't coordinate across multiple server instances
 * 
 * **Use Cases:**
 * - Single-instance Hoody Agent Server deployments
 * - Preventing concurrent agent writes to same file
 * - Coordinating file operations across multiple tasks
 */

import fs from "fs/promises"
import path from "path"

interface QueueEntry {
	promise: Promise<void>
	release: () => void  // ← CRITICAL: Must store this to resolve on cleanup
	timestamp: number
}

export class FileWriteQueue {
	private static instance: FileWriteQueue | null = null
	private locks: Map<string, QueueEntry> = new Map()
	private readonly STALE_LOCK_TIMEOUT_MS = 60000 // 60 seconds

	private constructor() {
		// Start periodic cleanup of stale locks
		this.startStaleCleanup()
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): FileWriteQueue {
		if (!FileWriteQueue.instance) {
			FileWriteQueue.instance = new FileWriteQueue()
		}
		return FileWriteQueue.instance
	}

	/**
	 * Normalize file path for consistent lock key
	 */
	private normalizePath(filePath: string): string {
		return path.normalize(path.resolve(filePath))
	}

	/**
	 * Acquire exclusive access to write a file
	 * Returns a release function that MUST be called when done
	 */
	public async acquireLock(filePath: string): Promise<() => void> {
		const normalizedPath = this.normalizePath(filePath)
		
		// Wait for any existing lock to be released
		const existingLock = this.locks.get(normalizedPath)
		if (existingLock) {
			try {
				await existingLock.promise
			} catch {
				// Previous write failed, but we can proceed
			}
		}

		// Create a new lock
		let releaseFn: () => void
		const lockPromise = new Promise<void>((resolve) => {
			releaseFn = resolve
		})

		const release = () => {
			this.locks.delete(normalizedPath)
			releaseFn!()
		}

		this.locks.set(normalizedPath, {
			promise: lockPromise,
			release,  // ← CRITICAL: Store release function
			timestamp: Date.now(),
		})

		// Return release function
		return release
	}

	/**
	 * Safe file write with automatic locking
	 * 
	 * @param filePath - Absolute or relative file path
	 * @param content - Content to write
	 * @param encoding - File encoding (default: 'utf-8')
	 */
	public async writeFile(
		filePath: string,
		content: string | Buffer,
		encoding: BufferEncoding = "utf-8",
	): Promise<void> {
		const release = await this.acquireLock(filePath)

		try {
			// Perform the actual write
			if (typeof content === "string") {
				await fs.writeFile(filePath, content, encoding)
			} else {
				await fs.writeFile(filePath, content)
			}
		} finally {
			// Always release the lock
			release()
		}
	}

	/**
	 * Safe file read-modify-write with automatic locking
	 * 
	 * @param filePath - File path
	 * @param modifier - Function that transforms the content
	 * @param encoding - File encoding (default: 'utf-8')
	 */
	public async modifyFile(
		filePath: string,
		modifier: (content: string) => string | Promise<string>,
		encoding: BufferEncoding = "utf-8",
	): Promise<void> {
		const release = await this.acquireLock(filePath)

		try {
			// Read current content
			let currentContent = ""
			try {
				currentContent = await fs.readFile(filePath, encoding)
			} catch (error: any) {
				// File doesn't exist, start with empty content
				if (error.code !== "ENOENT") {
					throw error
				}
			}

			// Apply modification
			const newContent = await modifier(currentContent)

			// Write back
			await fs.writeFile(filePath, newContent, encoding)
		} finally {
			release()
		}
	}

	/**
	 * Execute a custom file operation with automatic locking
	 * 
	 * @param filePath - File path to lock
	 * @param operation - Async operation to perform while holding lock
	 */
	public async withLock<T>(filePath: string, operation: () => Promise<T>): Promise<T> {
		const release = await this.acquireLock(filePath)

		try {
			return await operation()
		} finally {
			release()
		}
	}

	/**
	 * Get current lock status for debugging
	 */
	public getLockStatus(): {
		totalLocks: number
		locks: Array<{ path: string; ageMs: number }>
	} {
		const now = Date.now()
		const locks = Array.from(this.locks.entries()).map(([filePath, entry]) => ({
			path: filePath,
			ageMs: now - entry.timestamp,
		}))

		return {
			totalLocks: locks.length,
			locks,
		}
	}

	/**
	 * Periodic cleanup of stale locks
	 * Removes locks older than STALE_LOCK_TIMEOUT_MS
	 * 
	 * CRITICAL: Must call release() to resolve promises before deleting
	 */
	private startStaleCleanup(): void {
		setInterval(() => {
			const now = Date.now()
			const stalePaths: string[] = []

			for (const [filePath, entry] of this.locks.entries()) {
				if (now - entry.timestamp > this.STALE_LOCK_TIMEOUT_MS) {
					stalePaths.push(filePath)
				}
			}

			// Remove stale locks - MUST call release() to resolve waiting promises!
			for (const filePath of stalePaths) {
				const entry = this.locks.get(filePath)
				if (entry) {
					console.warn(`[FileWriteQueue] Removing stale lock for ${filePath}`)
					entry.release()  // ← CRITICAL: Resolve the promise first!
					// No need to delete - release() already does it
				}
			}
		}, 30000) // Check every 30 seconds
	}

	/**
	 * Force clear all locks (use with caution - only for testing/emergency)
	 */
	public clearAllLocks(): void {
		console.warn(`[FileWriteQueue] Force clearing ${this.locks.size} locks`)
		// Resolve all promises before clearing
		for (const entry of this.locks.values()) {
			entry.release()
		}
		// Releases already cleared the map, but ensure it's empty
		this.locks.clear()
	}

	/**
	 * Check if a file path currently has an active lock
	 */
	public isLocked(filePath: string): boolean {
		const normalizedPath = this.normalizePath(filePath)
		return this.locks.has(normalizedPath)
	}
}

/**
 * Convenience export for singleton access
 */
export const fileWriteQueue = FileWriteQueue.getInstance()