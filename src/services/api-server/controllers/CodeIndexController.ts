/**
 * Code Index Controller
 * Provides REST API access to codebase indexing and semantic search
 */

import { Controller, Route, Get, Post, Delete, Security, SuccessResponse } from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { NotFoundError } from "../errors"

// Dependency injection
let providerInstance: ClineProvider | null = null

export function setCodeIndexControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("CodeIndexController: Provider not initialized")
	}
	return providerInstance
}

// Type definitions
interface IndexStatusResponse {
	status: string
	message?: string
	[key: string]: any
}

interface IndexOperationResponse {
	success: boolean
	message: string
}

interface IndexConfigResponse {
	config: any
	models: any
}

@Route("codeindex")
@Security("bearer")
export class CodeIndexController extends Controller {
	/**
	 * Get current indexing status
	 * @summary Get code index status
	 */
	@Get("status")
	@SuccessResponse(200, "Index status retrieved")
	public async getStatus(): Promise<IndexStatusResponse> {
		const provider = getProvider()
		const manager = provider.getCurrentWorkspaceCodeIndexManager()

		if (!manager) {
			return {
				status: "unavailable",
				message: "Code index manager not available",
			}
		}

		const currentStatus = manager.getCurrentStatus()
		// Map the status object to match the response interface
		return {
			status: currentStatus.systemStatus,
			message: currentStatus.message,
			processedItems: currentStatus.processedItems,
			totalItems: currentStatus.totalItems,
			currentItemUnit: currentStatus.currentItemUnit,
		}
	}

	/**
	 * Start indexing the workspace
	 * @summary Start code indexing
	 */
	@Post("start")
	@SuccessResponse(200, "Indexing started")
	public async startIndexing(): Promise<IndexOperationResponse> {
		const provider = getProvider()
		const manager = provider.getCurrentWorkspaceCodeIndexManager()

		if (!manager) {
			throw new NotFoundError("Code index manager not available")
		}

		await manager.startIndexing()

		return {
			success: true,
			message: "Indexing started",
		}
	}

	/**
	 * Cancel ongoing indexing
	 * @summary Cancel code indexing
	 */
	@Post("cancel")
	@SuccessResponse(200, "Indexing cancelled")
	public async cancelIndexing(): Promise<IndexOperationResponse> {
		const provider = getProvider()
		const manager = provider.getCurrentWorkspaceCodeIndexManager()

		if (!manager) {
			throw new NotFoundError("Code index manager not available")
		}

		manager.cancelIndexing()

		return {
			success: true,
			message: "Indexing cancelled",
		}
	}

	/**
	 * Clear the code index
	 * @summary Clear code index
	 */
	@Delete()
	@SuccessResponse(200, "Index cleared")
	public async clearIndex(): Promise<IndexOperationResponse> {
		const provider = getProvider()
		const manager = provider.getCurrentWorkspaceCodeIndexManager()

		if (!manager) {
			throw new NotFoundError("Code index manager not available")
		}

		await manager.clearIndex()

		return {
			success: true,
			message: "Index cleared",
		}
	}

	/**
	 * Get code index configuration
	 * @summary Get code index config
	 */
	@Get("config")
	@SuccessResponse(200, "Config retrieved")
	public async getConfig(): Promise<IndexConfigResponse> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			config: state.codebaseIndexConfig,
			models: state.codebaseIndexModels,
		}
	}
}