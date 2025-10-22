import type { ProviderName } from "../types/messages.js"
import type { ProviderConfig } from "../config/types.js"

/**
 * Map CLI parameters to provider-specific field names
 */
export function mapCliParamsToProviderConfig(params: {
	provider: string
	model?: string
	apiKey?: string
	baseUrl?: string
}): Record<string, any> {
	const { provider, model, apiKey, baseUrl } = params
	const config: Record<string, any> = {}

	// Map model parameter to provider-specific field
	if (model) {
		switch (provider) {
			case "hoodycode":
				config.hoodycodeModel = model
				break
			case "anthropic":
				config.apiModelId = model
				break
			case "openrouter":
				config.openRouterModelId = model
				break
			case "openai-native":
				config.apiModelId = model
				break
			case "openai":
				config.apiModelId = model
				break
			case "ollama":
				config.ollamaModelId = model
				break
			case "lmstudio":
				config.lmStudioModelId = model
				break
			case "glama":
				config.glamaModelId = model
				break
			case "litellm":
				config.litellmModelId = model
				break
			case "deepinfra":
				config.deepInfraModelId = model
				break
			case "unbound":
				config.unboundModelId = model
				break
			case "requesty":
				config.requestyModelId = model
				break
			case "vercel-ai-gateway":
				config.vercelAiGatewayModelId = model
				break
			case "io-intelligence":
				config.ioIntelligenceModelId = model
				break
			case "huggingface":
				config.huggingFaceModelId = model
				break
			default:
				// For other providers, use generic apiModelId
				config.apiModelId = model
				break
		}
	}

	// Map API key parameter to provider-specific field
	if (apiKey) {
		switch (provider) {
			case "hoodycode":
				config.hoodycodeToken = apiKey
				break
			case "anthropic":
				config.apiKey = apiKey
				break
			case "openrouter":
				config.openRouterApiKey = apiKey
				break
			case "openai-native":
				config.openAiNativeApiKey = apiKey
				break
			case "openai":
				config.openAiApiKey = apiKey
				break
			case "ollama":
				config.ollamaApiKey = apiKey
				break
			case "gemini":
				config.geminiApiKey = apiKey
				break
			case "mistral":
				config.mistralApiKey = apiKey
				break
			case "groq":
				config.groqApiKey = apiKey
				break
			case "deepseek":
				config.deepSeekApiKey = apiKey
				break
			case "xai":
				config.xaiApiKey = apiKey
				break
			case "cerebras":
				config.cerebrasApiKey = apiKey
				break
			case "glama":
				config.glamaApiKey = apiKey
				break
			case "litellm":
				config.litellmApiKey = apiKey
				break
			case "moonshot":
				config.moonshotApiKey = apiKey
				break
			case "doubao":
				config.doubaoApiKey = apiKey
				break
			case "chutes":
				config.chutesApiKey = apiKey
				break
			case "sambanova":
				config.sambaNovaApiKey = apiKey
				break
			case "fireworks":
				config.fireworksApiKey = apiKey
				break
			case "featherless":
				config.featherlessApiKey = apiKey
				break
			case "deepinfra":
				config.deepInfraApiKey = apiKey
				break
			case "unbound":
				config.unboundApiKey = apiKey
				break
			case "requesty":
				config.requestyApiKey = apiKey
				break
			case "vercel-ai-gateway":
				config.vercelAiGatewayApiKey = apiKey
				break
			case "io-intelligence":
				config.ioIntelligenceApiKey = apiKey
				break
			case "zai":
				config.zaiApiKey = apiKey
				break
			case "huggingface":
				config.huggingFaceApiKey = apiKey
				break
			case "bedrock":
				config.awsAccessKey = apiKey
				break
			default:
				// For other providers, use generic apiKey
				config.apiKey = apiKey
				break
		}
	}

	// Map base URL parameter to provider-specific field
	if (baseUrl) {
		switch (provider) {
			case "anthropic":
				config.anthropicBaseUrl = baseUrl
				break
			case "openrouter":
			case "hoodycode-openrouter":
				config.openRouterBaseUrl = baseUrl
				break
			case "openai-native":
				config.openAiNativeBaseUrl = baseUrl
				break
			case "openai":
				config.openAiBaseUrl = baseUrl
				break
			case "ollama":
				config.ollamaBaseUrl = baseUrl
				break
			case "lmstudio":
				config.lmStudioBaseUrl = baseUrl
				break
			case "gemini":
				config.googleGeminiBaseUrl = baseUrl
				break
			case "litellm":
				config.litellmBaseUrl = baseUrl
				break
			case "moonshot":
				config.moonshotBaseUrl = baseUrl
				break
			case "requesty":
				config.requestyBaseUrl = baseUrl
				break
			case "mistral":
				config.mistralCodestralUrl = baseUrl
				break
			case "deepseek":
				config.deepSeekBaseUrl = baseUrl
				break
			case "deepinfra":
				config.deepInfraBaseUrl = baseUrl
				break
			case "doubao":
				config.doubaoBaseUrl = baseUrl
				break
			case "ovhcloud":
				config.ovhCloudAiEndpointsBaseUrl = baseUrl
				break
			default:
				// For providers that don't have specific base URL field, skip
				break
		}
	}

	return config
}

/**
 * Get the provider name from a string, with validation
 */
export function getProviderName(provider: string): ProviderName | null {
	const validProviders: ProviderName[] = [
		"hoodycode",
		"anthropic",
		"openrouter",
		"hoodycode-openrouter",
		"openai-native",
		"openai",
		"bedrock",
		"gemini",
		"vertex",
		"claude-code",
		"mistral",
		"groq",
		"deepseek",
		"xai",
		"cerebras",
		"ollama",
		"lmstudio",
		"vscode-lm",
		"glama",
		"huggingface",
		"litellm",
		"moonshot",
		"doubao",
		"chutes",
		"sambanova",
		"fireworks",
		"featherless",
		"deepinfra",
		"io-intelligence",
		"qwen-code",
		"gemini-cli",
		"zai",
		"unbound",
		"requesty",
		"roo",
		"vercel-ai-gateway",
		"virtual-quota-fallback",
		"human-relay",
		"fake-ai",
		"ovhcloud",
		"synthetic",
	]

	if (validProviders.includes(provider as ProviderName)) {
		return provider as ProviderName
	}

	return null
}