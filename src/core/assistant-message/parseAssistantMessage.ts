import { type ToolName, toolNames } from "@roo-code/types"

import { TextContent, ToolUse, ToolParamName, toolParamNames } from "../../shared/tools"

export type AssistantMessageContent = TextContent | ToolUse

/**
 * Transform Haiku 4.5's function_calls format to HoodyCode's XML format.
 * Handles multiple variants:
 * Variant 1: <function_calls><invoke_tool><tool_name>list_files</tool_name><path>.</path></invoke_tool></function_calls>
 * Variant 2: <function_calls><invoke name="list_files"><path>.</path></invoke></function_calls>
 * Variant 3: <function_calls><invoke name="tool"><parameters><parameter name="x">...</parameter></parameters></invoke></function_calls>
 * Output: <tool><x>...</x></tool>
 */
function transformFunctionCallsFormat(text: string): string {
	// Pattern to match <function_calls>...</function_calls> blocks
	const functionCallsPattern = /<function_calls>([\s\S]*?)<\/function_calls>/g

	// Normalize Anthropic Haiku 4.5 parameter wrappers:
	// - Drop optional <parameters> container
	// - Convert <parameter name="param">value</parameter> -> <param>value</param>
	const normalizeParams = (content: string): string => {
		let result = content
		result = result.replace(/<\/?parameters>/g, "")
		result = result.replace(/<parameter\s+name="([^"]+)">([\s\S]*?)<\/parameter>/g, (_m, pName, pValue) => {
			const name = String(pName).trim()
			const value = String(pValue)
			return `<${name}>${value.trim()}</${name}>`
		})
		return result
	}
	
	return text.replace(functionCallsPattern, (match, innerContent) => {
		// First, try variant 2: <invoke name="tool_name">...</invoke> or </list_files> etc
		const invokeNamePattern = /<invoke\s+name="([^"]+)">([\s\S]*?)<\/(?:invoke|[a-z_]+)>/g
		let transformedContent = innerContent.replace(invokeNamePattern, (_: string, toolName: string, paramsContent: string) => {
			const trimmedToolName = toolName.trim()
			
			// Validate tool name
			if (!toolNames.includes(trimmedToolName as ToolName)) {
				// Invalid tool name, return original
				return match
			}

			// Normalize Haiku parameter style
			const normalizedParams = normalizeParams(paramsContent)
			
			// Build the transformed tool call
			return `<${trimmedToolName}>${normalizedParams.trim()}</${trimmedToolName}>`
		})
		
		// If no transformation happened, try variant 1: <invoke_tool>...</invoke_tool>
		if (transformedContent === innerContent) {
			const invokeToolPattern = /<invoke_tool>([\s\S]*?)<\/invoke_tool>/g
			
			transformedContent = innerContent.replace(invokeToolPattern, (_: string, toolContent: string) => {
				// Extract tool_name
				const toolNameMatch = toolContent.match(/<tool_name>([^<]+)<\/tool_name>/)
				if (!toolNameMatch) {
					// No tool_name found, return original
					return match
				}
				
				const toolName = toolNameMatch[1].trim()
				
				// Validate tool name
				if (!toolNames.includes(toolName as ToolName)) {
					// Invalid tool name, return original
					return match
				}
				
				// Remove the <tool_name>...</tool_name> tag from content
				const paramsContent = toolContent.replace(/<tool_name>[^<]+<\/tool_name>/, "").trim()

				// Normalize Haiku parameter style
				const normalizedParams = normalizeParams(paramsContent)
				
				// Build the transformed tool call
				return `<${toolName}>${normalizedParams}</${toolName}>`
			})
		}
		
		return transformedContent
	})
}

export function parseAssistantMessage(assistantMessage: string): AssistantMessageContent[] {
	// Transform function_calls format to HoodyCode format before processing
	const transformedMessage = transformFunctionCallsFormat(assistantMessage)
	
	let contentBlocks: AssistantMessageContent[] = []
	let currentTextContent: TextContent | undefined = undefined
	let currentTextContentStartIndex = 0
	let currentToolUse: ToolUse | undefined = undefined
	let currentToolUseStartIndex = 0
	let currentParamName: ToolParamName | undefined = undefined
	let currentParamValueStartIndex = 0
	let accumulator = ""

	for (let i = 0; i < transformedMessage.length; i++) {
		const char = transformedMessage[i]
		accumulator += char

		// There should not be a param without a tool use.
		if (currentToolUse && currentParamName) {
			const currentParamValue = accumulator.slice(currentParamValueStartIndex)
			const paramClosingTag = `</${currentParamName}>`
			if (currentParamValue.endsWith(paramClosingTag)) {
				// End of param value.
				// Don't trim content parameters to preserve newlines, but strip first and last newline only
				let paramValue = currentParamValue.slice(0, -paramClosingTag.length).trim()

				// hoodycode_change start
				if (currentToolUse.name === "execute_command" && currentParamName === "command") {
					// Some models XML encode ampersands in the <command></command> tag, some don't
					// to minimize chances of unintended consequences, we only XML decode &amp; for now
					// NOTE(emn): this is a hacky workaround to an empirically observed problem.
					// We know it's not a perfect solution and in corner cases can make things worse, but let's try this for now.
					paramValue = paramValue.replaceAll("&amp;", "&")
				}
				// hoodycode_change end

				currentToolUse.params[currentParamName] =
					currentParamName === "content"
						? paramValue.replace(/^\n/, "").replace(/\n$/, "")
						: paramValue.trim()
				currentParamName = undefined
				continue
			} else {
				// Partial param value is accumulating.
				continue
			}
		}

		// No currentParamName.

		if (currentToolUse) {
			const currentToolValue = accumulator.slice(currentToolUseStartIndex)
			const toolUseClosingTag = `</${currentToolUse.name}>`
			if (currentToolValue.endsWith(toolUseClosingTag)) {
				// End of a tool use.
				currentToolUse.partial = false
				contentBlocks.push(currentToolUse)
				currentToolUse = undefined
				continue
			} else {
				const possibleParamOpeningTags = toolParamNames.map((name) => `<${name}>`)
				for (const paramOpeningTag of possibleParamOpeningTags) {
					if (accumulator.endsWith(paramOpeningTag)) {
						// Start of a new parameter.
						currentParamName = paramOpeningTag.slice(1, -1) as ToolParamName
						currentParamValueStartIndex = accumulator.length
						break
					}
				}

				// There's no current param, and not starting a new param.

				// Special case for write_to_file where file contents could
				// contain the closing tag, in which case the param would have
				// closed and we end up with the rest of the file contents here.
				// To work around this, we get the string between the starting
				// content tag and the LAST content tag.
				const contentParamName: ToolParamName = "content"
				if (
					(currentToolUse.name === "write_to_file" || currentToolUse.name === "new_rule") && // hoodycode_change
					accumulator.endsWith(`</${contentParamName}>`)
				) {
					const toolContent = accumulator.slice(currentToolUseStartIndex)
					const contentStartTag = `<${contentParamName}>`
					const contentEndTag = `</${contentParamName}>`
					const contentStartIndex = toolContent.indexOf(contentStartTag) + contentStartTag.length
					const contentEndIndex = toolContent.lastIndexOf(contentEndTag)

					if (contentStartIndex !== -1 && contentEndIndex !== -1 && contentEndIndex > contentStartIndex) {
						// Don't trim content to preserve newlines, but strip first and last newline only
						currentToolUse.params[contentParamName] = toolContent
							.slice(contentStartIndex, contentEndIndex)
							.replace(/^\n/, "")
							.replace(/\n$/, "")
					}
				}

				// Partial tool value is accumulating.
				continue
			}
		}

		// No currentToolUse.

		let didStartToolUse = false
		const possibleToolUseOpeningTags = toolNames.map((name) => `<${name}>`)

		for (const toolUseOpeningTag of possibleToolUseOpeningTags) {
			if (accumulator.endsWith(toolUseOpeningTag)) {
				// Start of a new tool use.
				currentToolUse = {
					type: "tool_use",
					name: toolUseOpeningTag.slice(1, -1) as ToolName,
					params: {},
					partial: true,
				}

				currentToolUseStartIndex = accumulator.length

				// This also indicates the end of the current text content.
				if (currentTextContent) {
					currentTextContent.partial = false

					// Remove the partially accumulated tool use tag from the
					// end of text (<tool).
					currentTextContent.content = currentTextContent.content
						.slice(0, -toolUseOpeningTag.slice(0, -1).length)
						.trim()

					contentBlocks.push(currentTextContent)
					currentTextContent = undefined
				}

				didStartToolUse = true
				break
			}
		}

		if (!didStartToolUse) {
			// No tool use, so it must be text either at the beginning or
			// between tools.
			if (currentTextContent === undefined) {
				currentTextContentStartIndex = i
			}

			currentTextContent = {
				type: "text",
				content: accumulator.slice(currentTextContentStartIndex).trim(),
				partial: true,
			}
		}
	}

	if (currentToolUse) {
		// Stream did not complete tool call, add it as partial.
		if (currentParamName) {
			// Tool call has a parameter that was not completed.
			// Don't trim content parameters to preserve newlines, but strip first and last newline only
			const paramValue = accumulator.slice(currentParamValueStartIndex)
			currentToolUse.params[currentParamName] =
				currentParamName === "content" ? paramValue.replace(/^\n/, "").replace(/\n$/, "") : paramValue.trim()
		}

		contentBlocks.push(currentToolUse)
	}

	// NOTE: It doesn't matter if check for currentToolUse or
	// currentTextContent, only one of them will be defined since only one can
	// be partial at a time.
	if (currentTextContent) {
		// Stream did not complete text content, add it as partial.
		contentBlocks.push(currentTextContent)
	}

	return contentBlocks
}
