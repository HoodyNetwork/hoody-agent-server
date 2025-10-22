import NodeCache from "node-cache"
import getFolderSize from "get-folder-size"

import type { ClineMessage, HistoryItem } from "@roo-code/types"

import { combineApiRequests } from "../../shared/combineApiRequests"
import { combineCommandSequences } from "../../shared/combineCommandSequences"
import { getApiMetrics } from "../../shared/getApiMetrics"
import { findLastIndex } from "../../shared/array"
import { getTaskDirectoryPath } from "../../utils/storage"
import { t } from "../../i18n"

const taskSizeCache = new NodeCache({ stdTTL: 30, checkperiod: 5 * 60 })

export type TaskMetadataOptions = {
	taskId: string
	rootTaskId?: string
	parentTaskId?: string
	taskNumber: number
	messages: ClineMessage[]
	globalStoragePath: string
	workspace: string
	mode?: string
	modelId?: string
	modelProvider?: string
	profileName?: string
}

export async function taskMetadata({
	taskId: id,
	rootTaskId,
	parentTaskId,
	taskNumber,
	messages,
	globalStoragePath,
	workspace,
	mode,
	modelId,
	modelProvider,
	profileName,
}: TaskMetadataOptions) {
	const taskDir = await getTaskDirectoryPath(globalStoragePath, id)

	// Determine message availability upfront
	const hasMessages = messages && messages.length > 0

	// Pre-calculate all values based on availability
	let timestamp: number
	let tokenUsage: ReturnType<typeof getApiMetrics>
	let taskDirSize: number
	let taskMessage: ClineMessage | undefined
	let status: string = "completed" // Default to completed for old tasks

	if (!hasMessages) {
		// Handle no messages case
		timestamp = Date.now()
		tokenUsage = {
			totalTokensIn: 0,
			totalTokensOut: 0,
			totalCacheWrites: 0,
			totalCacheReads: 0,
			totalCost: 0,
			contextTokens: 0,
		}
		taskDirSize = 0
	} else {
		// Handle messages case
		taskMessage = messages[0] // First message is always the task say.

		const lastRelevantMessage =
			messages[findLastIndex(messages, (m) => !(m.ask === "resume_task" || m.ask === "resume_completed_task"))] ||
			taskMessage

		timestamp = lastRelevantMessage.ts

		tokenUsage = getApiMetrics(combineApiRequests(combineCommandSequences(messages.slice(1))))
		
		// Determine task status from the last relevant message
		status = determineTaskStatus(lastRelevantMessage)

		// Get task directory size
		const cachedSize = taskSizeCache.get<number>(taskDir)

		if (cachedSize === undefined) {
			try {
				taskDirSize = await getFolderSize.loose(taskDir)
				taskSizeCache.set<number>(taskDir, taskDirSize)
			} catch (error) {
				taskDirSize = 0
			}
		} else {
			taskDirSize = cachedSize
		}
	}

	// Create historyItem once with pre-calculated values.
	const historyItem: HistoryItem = {
		id,
		rootTaskId,
		parentTaskId,
		number: taskNumber,
		ts: timestamp,
		task: hasMessages
			? taskMessage!.text?.trim() || t("common:tasks.incomplete", { taskNumber })
			: t("common:tasks.no_messages", { taskNumber }),
		tokensIn: tokenUsage.totalTokensIn,
		tokensOut: tokenUsage.totalTokensOut,
		cacheWrites: tokenUsage.totalCacheWrites,
		cacheReads: tokenUsage.totalCacheReads,
		totalCost: tokenUsage.totalCost,
		contextTokens: tokenUsage.contextTokens,
		size: taskDirSize,
		workspace,
		mode,
		modelId,
		modelProvider,
		profileName,
		status,
	}

	return { historyItem, tokenUsage }
}

/**
	* Determine task status from the last relevant message
	*/
function determineTaskStatus(message: ClineMessage): string {
	if (message.type === "ask") {
		switch (message.ask) {
			case "completion_result":
				return "completed"
			case "followup":
				return "interactive"
			case "tool":
			case "command":
			case "browser_action_launch":
			case "use_mcp_server":
				return "resumable"
			case "resume_task":
			case "resume_completed_task":
				return "idle"
			default:
				return "interactive"
		}
	}
	
	// For "say" messages, determine based on the say type
	if (message.type === "say") {
		// If it's an error or api_req_failed, task likely needs attention
		if (message.say === "error" || message.say === "api_req_failed") {
			return "idle"
		}
		// If it's completion_result as a say message
		if (message.say === "completion_result") {
			return "completed"
		}
	}
	
	// Default to running for other cases
	return "running"
}
