import * as vscode from "vscode"
import { JETBRAIN_PRODUCTS, HoodyCodeWrapperProperties } from "../../shared/hoodycode/wrapper"

export const getHoodyCodeWrapperProperties = (): HoodyCodeWrapperProperties => {
	const appName = vscode.env.appName
	const hoodyCodeWrapped = appName.includes("wrapper")
	let hoodyCodeWrapper = null
	let hoodyCodeWrapperTitle = null
	let hoodyCodeWrapperCode = null
	let hoodyCodeWrapperVersion = null

	if (hoodyCodeWrapped) {
		const wrapperMatch = appName.split("|")
		hoodyCodeWrapper = wrapperMatch[1].trim() || null
		hoodyCodeWrapperCode = wrapperMatch[2].trim() || null
		hoodyCodeWrapperVersion = wrapperMatch[3].trim() || null
		hoodyCodeWrapperTitle =
			hoodyCodeWrapperCode === "cli"
				? "Hoody Code CLI"
				: JETBRAIN_PRODUCTS[hoodyCodeWrapperCode as keyof typeof JETBRAIN_PRODUCTS]?.name || "JetBrains IDE"
	}

	return {
		hoodyCodeWrapped,
		hoodyCodeWrapper,
		hoodyCodeWrapperTitle,
		hoodyCodeWrapperCode,
		hoodyCodeWrapperVersion,
	}
}
