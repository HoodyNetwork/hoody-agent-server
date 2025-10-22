/**
 * Terminal Operations Controller
 * Provides REST API access to terminal command execution
 */

import { Controller, Route, Post, Get, Body, Security, SuccessResponse } from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { BadRequestError } from "../errors"

// Dependency injection
let providerInstance: ClineProvider | null = null

export function setTerminalControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("TerminalController: Provider not initialized")
	}
	return providerInstance
}

// Type definitions
interface ExecuteCommandRequest {
	command: string
	cwd?: string
}

interface ExecuteCommandResponse {
	success: boolean
	taskId: string
	message: string
}

interface TerminalInfoResponse {
	outputLineLimit?: number
	outputCharacterLimit?: number
	shellIntegrationTimeout?: number
	shellIntegrationDisabled?: boolean
	commandDelay?: number
	compressProgressBar?: boolean
}

@Route("terminal")
@Security("bearer")
export class TerminalController extends Controller {
	/**
	 * Execute a terminal command
	 * @summary Execute terminal command
	 */
	@Post("execute")
	@SuccessResponse(200, "Command execution initiated")
	public async executeCommand(@Body() body: ExecuteCommandRequest): Promise<ExecuteCommandResponse> {
		const provider = getProvider()

		if (!body.command || typeof body.command !== "string") {
			throw new BadRequestError("Command is required")
		}

		// Create a task that executes the command
		const task = await provider.createTask(body.command)

		return {
			success: true,
			taskId: task.taskId,
			message: "Command execution initiated via task",
		}
	}

	/**
	 * Get terminal configuration information
	 * @summary Get terminal configuration
	 */
	@Get("info")
	@SuccessResponse(200, "Terminal info retrieved")
	public async getTerminalInfo(): Promise<TerminalInfoResponse> {
		const provider = getProvider()
		const state = await provider.getState()

		return {
			outputLineLimit: state.terminalOutputLineLimit,
			outputCharacterLimit: state.terminalOutputCharacterLimit,
			shellIntegrationTimeout: state.terminalShellIntegrationTimeout,
			shellIntegrationDisabled: state.terminalShellIntegrationDisabled,
			commandDelay: state.terminalCommandDelay,
			compressProgressBar: state.terminalCompressProgressBar,
		}
	}
}