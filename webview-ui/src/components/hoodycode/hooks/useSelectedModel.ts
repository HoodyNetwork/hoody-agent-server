import { type ProviderName, type ProviderSettings } from "@roo-code/types"

export const getModelIdKey = ({
	provider,
}: {
	provider: ProviderName
}): keyof Pick<
	ProviderSettings,
	| "glamaModelId"
	| "openRouterModelId"
	| "unboundModelId"
	| "requestyModelId"
	| "openAiModelId"
	| "litellmModelId"
	| "hoodycodeModel"
	| "ollamaModelId"
	| "lmStudioModelId"
	| "vsCodeLmModelSelector"
	| "ovhCloudAiEndpointsModelId" // hoodycode_change
	| "apiModelId"
> => {
	switch (provider) {
		case "openrouter": {
			return "openRouterModelId"
		}
		case "requesty": {
			return "requestyModelId"
		}
		case "glama": {
			return "glamaModelId"
		}
		case "unbound": {
			return "unboundModelId"
		}
		case "litellm": {
			return "litellmModelId"
		}
		case "openai": {
			return "openAiModelId"
		}
		case "ollama": {
			return "ollamaModelId"
		}
		case "lmstudio": {
			return "lmStudioModelId"
		}
		case "vscode-lm": {
			return "vsCodeLmModelSelector"
		}
		case "hoodycode": {
			return "hoodycodeModel"
		}
		// hoodycode_change start
		case "ovhcloud": {
			return "ovhCloudAiEndpointsModelId"
		}
		// hoodycode_change end
		default: {
			return "apiModelId"
		}
	}
}

export const getSelectedModelId = ({
	provider,
	apiConfiguration,
	defaultModelId,
}: {
	provider: ProviderName
	apiConfiguration: ProviderSettings
	defaultModelId: string
}): string => {
	const modelIdKey = getModelIdKey({ provider })
	switch (provider) {
		case "vscode-lm": {
			return apiConfiguration?.vsCodeLmModelSelector
				? `${apiConfiguration.vsCodeLmModelSelector.vendor}/${apiConfiguration.vsCodeLmModelSelector.family}`
				: defaultModelId
		}
		default: {
			return (apiConfiguration?.[modelIdKey] as string) ?? defaultModelId
		}
	}
}
