import { z } from "zod"
import { hoodyLanguages } from "./hoodyLanguages.js"

/**
 * CodeAction
 */

export const codeActionIds = ["explainCode", "fixCode", "improveCode", "addToContext", "newTask"] as const

export type CodeActionId = (typeof codeActionIds)[number]

export type CodeActionName = "EXPLAIN" | "FIX" | "IMPROVE" | "ADD_TO_CONTEXT" | "NEW_TASK"

/**
 * TerminalAction
 */

export const terminalActionIds = ["terminalAddToContext", "terminalFixCommand", "terminalExplainCommand"] as const

export type TerminalActionId = (typeof terminalActionIds)[number]

export type TerminalActionName = "ADD_TO_CONTEXT" | "FIX" | "EXPLAIN"

export type TerminalActionPromptType = `TERMINAL_${TerminalActionName}`

/**
 * Command
 */

export const commandIds = [
	"activationCompleted",

	"plusButtonClicked",
	"promptsButtonClicked",
	"mcpButtonClicked",

	"historyButtonClicked",
	"marketplaceButtonClicked",
	"popoutButtonClicked",
	"cloudButtonClicked",
	"settingsButtonClicked",

	"openInNewTab",

	"showHumanRelayDialog",
	"registerHumanRelayCallback",
	"unregisterHumanRelayCallback",
	"handleHumanRelayResponse",

	"newTask",

	"setCustomStoragePath",
	"importSettings",

	// "focusInput", // hoodycode_change
	"acceptInput",
	"profileButtonClicked", // hoodycode_change
	"helpButtonClicked", // hoodycode_change
	"focusChatInput", // hoodycode_change
	"importSettings", // hoodycode_change
	"exportSettings", // hoodycode_change
	"generateTerminalCommand", // hoodycode_change
	"handleExternalUri", // hoodycode_change - for JetBrains plugin URL forwarding
	"focusPanel",
	"toggleAutoApprove",
	// API Server commands
	"enableApiServer",
	"disableApiServer",
	"copyApiToken",
	"showApiToken",
	"regenerateApiToken",
	"openStandaloneUI",
] as const

export type CommandId = (typeof commandIds)[number]

/**
 * Language
 */

export const languages = [
	...hoodyLanguages,
	"ca",
	"de",
	"en",
	"es",
	"fr",
	"hi",
	"id",
	"it",
	"ja",
	"ko",
	"nl",
	"pl",
	"pt-BR",
	"ru",
	"tr",
	"vi",
	"zh-CN",
	"zh-TW",
] as const

export const languagesSchema = z.enum(languages)

export type Language = z.infer<typeof languagesSchema>

export const isLanguage = (value: string): value is Language => languages.includes(value as Language)
