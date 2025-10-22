import type { ExtensionContext } from "vscode"

export function getUserAgent(context?: ExtensionContext): string {
	return `Hoody-Code ${context?.extension?.packageJSON?.version || "unknown"}`
}
