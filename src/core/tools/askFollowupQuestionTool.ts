import { Task } from "../task/Task"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { formatResponse } from "../prompts/responses"
import { parseXml } from "../../utils/xml"

export async function askFollowupQuestionTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const question: string | undefined = block.params.question
	const follow_up: string | undefined = block.params.follow_up

	try {
		if (block.partial) {
			await cline.ask("followup", removeClosingTag("question", question), block.partial).catch(() => {})
			return
		} else {
			if (!question) {
				cline.consecutiveMistakeCount++
				cline.recordToolError("ask_followup_question")
				pushToolResult(await cline.sayAndCreateMissingParamError("ask_followup_question", "question"))
				return
			}

			type Suggest = { answer: string; mode?: string }

			let follow_up_json = {
				question,
				suggest: [] as Suggest[],
			}

			if (follow_up) {
				// Define the actual structure returned by the XML parser
				type ParsedSuggestion = string | { "#text": string; "@_mode"?: string }

				let parsedSuggest: {
					suggest: ParsedSuggestion[] | ParsedSuggestion
				}

				try {
					parsedSuggest = parseXml(follow_up, ["suggest"]) as {
						suggest: ParsedSuggestion[] | ParsedSuggestion
					}
				} catch (error) {
					cline.consecutiveMistakeCount++
					cline.recordToolError("ask_followup_question")
					await cline.say("error", `Failed to parse operations: ${error.message}`)
					pushToolResult(formatResponse.toolError("Invalid operations xml format"))
					return
				}

				const rawSuggestions = Array.isArray(parsedSuggest?.suggest)
					? parsedSuggest.suggest
					: [parsedSuggest?.suggest].filter((sug): sug is ParsedSuggestion => sug !== undefined)

				// Transform parsed XML to our Suggest format
				const normalizedSuggest: Suggest[] = rawSuggestions.map((sug) => {
					if (typeof sug === "string") {
						// Simple string suggestion (no mode attribute)
						return { answer: sug }
					} else {
						// XML object with text content and optional mode attribute
						const result: Suggest = { answer: sug["#text"] }
						if (sug["@_mode"]) {
							result.mode = sug["@_mode"]
						}
						return result
					}
				})

				follow_up_json.suggest = normalizedSuggest
			}

			cline.consecutiveMistakeCount = 0
			
			const completeMessage = JSON.stringify(follow_up_json)
			
			// Check if auto-approval is enabled for followup questions
			const provider = cline.providerRef.deref()
			const state = await provider?.getState()
			const shouldAutoApprove = state?.autoApprovalEnabled && state?.alwaysAllowFollowupQuestions
			
			if (shouldAutoApprove && follow_up_json.suggest.length > 0) {
				// Auto-approval enabled: Race between timeout and user response
				const timeoutMs = typeof state.followupAutoApproveTimeoutMs === 'number'
					? state.followupAutoApproveTimeoutMs
					: 60000 // 60 second default
				
				// Record when auto-approval started (used by webview for synchronized countdown)
				const autoApprovalStartedAt = Date.now()
				const autoApprovalWillTriggerAt = autoApprovalStartedAt + timeoutMs
				
				// Create timeout promise
				const timeoutPromise = new Promise<{ source: 'timeout' }>((resolve) => {
					setTimeout(() => resolve({ source: 'timeout' }), timeoutMs)
				})
				
				// Create user response promise that includes metadata about auto-approval timing
				const userResponsePromise = (async () => {
					const result = await cline.ask("followup", completeMessage, false)
					return { source: 'user' as const, text: result.text, images: result.images }
				})()
				
				// Also send metadata to webview about when auto-approval will trigger
				// This allows the webview to show synchronized countdown
				await provider?.postMessageToWebview({
					type: "autoApprovalCountdown",
					taskId: cline.taskId,
					autoApprovalStartedAt,
					autoApprovalWillTriggerAt,
					timeoutMs,
				})
				
				// Race them
				const result = await Promise.race([timeoutPromise, userResponsePromise])
				
				if (result.source === 'timeout') {
					// Timeout won: auto-select first suggestion
					const firstSuggestion = follow_up_json.suggest[0].answer
					await cline.say("user_feedback", firstSuggestion, [])
					pushToolResult(formatResponse.toolResult(`<answer>\n${firstSuggestion}\n</answer>`, []))
				} else {
					// User responded: use their answer
					await cline.say("user_feedback", result.text ?? "", result.images)
					pushToolResult(formatResponse.toolResult(`<answer>\n${result.text}\n</answer>`, result.images))
				}
			} else {
				// Auto-approval not enabled: ask user normally
				const { text, images } = await cline.ask("followup", completeMessage, false)
				await cline.say("user_feedback", text ?? "", images)
				pushToolResult(formatResponse.toolResult(`<answer>\n${text}\n</answer>`, images))
			}
	
			return
		}
	} catch (error) {
		await handleError("asking question", error)
		return
	}
}
