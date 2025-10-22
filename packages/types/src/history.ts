import { z } from "zod"

/**
 * HistoryItem
 */

export const historyItemSchema = z.object({
	id: z.string(),
	rootTaskId: z.string().optional(),
	parentTaskId: z.string().optional(),
	// Subtask depth: 1 = root task, 2+ = subtask levels
	// Note: Forks inherit this from source but it has no meaning for them - use sourceTaskId instead
	number: z.number(),
	ts: z.number(),
	task: z.string(),
	tokensIn: z.number(),
	tokensOut: z.number(),
	cacheWrites: z.number().optional(),
	cacheReads: z.number().optional(),
	totalCost: z.number(),
	contextTokens: z.number().optional(),
	size: z.number().optional(),
	workspace: z.string().optional(),
	isFavorited: z.boolean().optional(), // hoodycode_change
	fileNotfound: z.boolean().optional(), // hoodycode_change
	mode: z.string().optional(),
	modelId: z.string().optional(), // Task context: model used
	modelProvider: z.string().optional(), // Task context: provider used
	profileName: z.string().optional(), // Task context: profile name used
	
	// Fork tracking - forks are independent conversations branched from a message
	sourceTaskId: z.string().optional(), // The task this was forked from
	forkFromMessageTs: z.number().optional(), // Exact message timestamp we forked from
	forkTimestamp: z.number().optional(), // When the fork was created
	
	// Task status - reflects last known state
	status: z.enum(["running", "interactive", "resumable", "idle", "completed"]).optional(),
})

export type HistoryItem = z.infer<typeof historyItemSchema>
