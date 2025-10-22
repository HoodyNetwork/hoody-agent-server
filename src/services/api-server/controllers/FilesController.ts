/**
 * File and Workspace Operations Controller
 *
 * This module provides REST API access to the file system within the active VS Code workspace.
 * It includes endpoints for listing files and reading their content. All operations are sandboxed
 * to the workspace root for security.
 */

import { Controller, Route, Get, Query, Security, SuccessResponse } from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { BadRequestError, NotFoundError } from "../errors"
import { parseBoolParam, safeResolvePath } from "../utils"
import * as fs from "fs/promises"
import * as pathModule from "path"

// Dependency injection
let providerInstance: ClineProvider | null = null

export function setFilesControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("FilesController: Provider not initialized")
	}
	return providerInstance
}

// Type definitions
interface FileEntry {
	path: string
	name: string
	type: "file" | "directory"
	size?: number
	created?: string
	modified?: string
	children?: FileEntry[]
}

interface ListFilesResponse {
	files: FileEntry[]
	total: number
	workspace: string
	truncated: boolean
	limitReached: boolean
}

interface FileContent {
	path: string
	content?: string
	size?: number
	error?: string
	success: boolean
}

interface ReadFilesResponse {
	files: FileContent[]
	workspace: string
}

interface WorkspaceInfoResponse {
	path?: string
	exists: boolean
	mode?: string
	customInstructions?: string
}

@Route("files")
@Security("bearer")
export class FilesController extends Controller {
	/**
	 * List files and directories within the workspace
	 * @summary List workspace files
	 * @param dirPath Directory path relative to workspace root (default: ".")
	 * @param recursive If true, lists contents recursively (default: false)
	 */
	@Get()
	@SuccessResponse(200, "Files listed successfully")
	public async listFiles(
		@Query() dirPath?: string,
		@Query() recursive?: string,
	): Promise<ListFilesResponse> {
		const provider = getProvider()
		const cwd = provider.cwd

		if (!cwd) {
			throw new BadRequestError("No workspace directory available")
		}

		const dirParam = dirPath || "."
		const isRecursive = parseBoolParam(recursive, false)
		const { fullPath } = safeResolvePath(cwd, dirParam)

		const stat = await fs.stat(fullPath).catch(() => {
			throw new NotFoundError("Directory not found")
		})
		if (!stat.isDirectory()) {
			throw new BadRequestError("Path must be a directory")
		}

		const MAX_ENTRIES = 5000
		const MAX_DEPTH = 6
		let count = 0
		let truncated = false

		const listFilesRecursive = async (dir: string, depth: number = 0): Promise<FileEntry[]> => {
			if (depth > MAX_DEPTH || count >= MAX_ENTRIES) {
				truncated = true
				return []
			}

			const entries = await fs.readdir(dir, { withFileTypes: true })
			const files: FileEntry[] = []

			for (const entry of entries) {
				if (count >= MAX_ENTRIES) {
					truncated = true
					break
				}
				const fullEntryPath = pathModule.join(dir, entry.name)
				const relativePath = pathModule.relative(cwd, fullEntryPath)
				count++

				if (entry.isDirectory()) {
					files.push({
						path: relativePath,
						name: entry.name,
						type: "directory",
						children: isRecursive ? await listFilesRecursive(fullEntryPath, depth + 1) : undefined,
					})
				} else {
					const stats = await fs.stat(fullEntryPath)
					files.push({
						path: relativePath,
						name: entry.name,
						type: "file",
						size: stats.size,
						created: stats.birthtime.toISOString(),
						modified: stats.mtime.toISOString(),
					})
				}
			}
			return files
		}

		const files = await listFilesRecursive(fullPath, 0)

		return {
			files,
			total: count,
			workspace: cwd,
			truncated,
			limitReached: count >= MAX_ENTRIES,
		}
	}

	/**
	 * Read the content of one or more files
	 * @summary Read file contents
	 * @param filePath Single file path or comma-separated list of file paths
	 */
	@Get("read")
	@SuccessResponse(200, "Files read successfully")
	public async readFiles(@Query() filePath: string): Promise<ReadFilesResponse> {
		const provider = getProvider()
		const cwd = provider.cwd

		if (!cwd) {
			throw new BadRequestError("No workspace directory available")
		}

		// Parse path parameter - can be comma-separated or array
		const paths = filePath.split(",").map((s) => s.trim()).filter(Boolean)

		if (paths.length === 0) {
			throw new BadRequestError("File path(s) are required")
		}
		if (paths.length > 20) {
			throw new BadRequestError("Maximum 20 files per request")
		}

		const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB

		const results = await Promise.all(
			paths.map(async (p) => {
				try {
					const { fullPath } = safeResolvePath(cwd, p)

					const stats = await fs.stat(fullPath)
					if (!stats.isFile()) {
						return { path: p, error: "Not a file", success: false }
					}
					if (stats.size > MAX_FILE_BYTES) {
						return {
							path: p,
							error: `File too large (>${MAX_FILE_BYTES / 1024 / 1024}MB)`,
							success: false,
						}
					}

					const content = await fs.readFile(fullPath, "utf-8")
					return { path: p, content, size: stats.size, success: true }
				} catch (error: any) {
					const message = error.code === "ENOENT" ? "File not found" : "Failed to read file"
					return { path: p, error: message, success: false }
				}
			}),
		)

		return { files: results, workspace: cwd }
	}
}

@Route("workspace")
@Security("bearer")
export class WorkspaceController extends Controller {
	/**
	 * Get basic information about the current workspace
	 * @summary Get workspace info
	 */
	@Get()
	@SuccessResponse(200, "Workspace info retrieved")
	public async getWorkspaceInfo(): Promise<WorkspaceInfoResponse> {
		const provider = getProvider()
		const cwd = provider.cwd
		const state = await provider.getState()

		return {
			path: cwd,
			exists: !!cwd,
			mode: state.mode,
			customInstructions: state.customInstructions,
		}
	}
}

// Set provider for WorkspaceController
export function setWorkspaceControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}