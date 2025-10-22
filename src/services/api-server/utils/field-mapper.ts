/**
 * Field Mapper Utility
 * 
 * Maps generic profile field names to provider-specific field names.
 * This allows the API to accept both generic names (e.g., "provider", "model", "apiKey")
 * and provider-specific names (e.g., "apiProvider", "openRouterModelId", "openRouterApiKey").
 * 
 * @module field-mapper
 */

/**
 * Maps generic field names to provider-specific field names based on the provider.
 * 
 * Handles transformations like:
 * - `provider` → `apiProvider`
 * - `model` → `{provider}ModelId` (e.g., `openRouterModelId`, `geminiModelId`)
 * - `apiKey` → `{provider}ApiKey` (e.g., `openRouterApiKey`, `geminiApiKey`)
 * 
 * @param config - Configuration object with generic or provider-specific field names
 * @returns Transformed configuration with provider-specific field names
 * 
 * @example
 * ```typescript
 * // Input with generic names
 * const input = {
 *   provider: "openrouter",
 *   model: "google/gemini-2.5-flash-lite",
 *   apiKey: "sk-or-v1-xxx"
 * }
 * 
 * // Output with provider-specific names
 * const output = mapProfileFields(input)
 * // {
 * //   apiProvider: "openrouter",
 * //   openRouterModelId: "google/gemini-2.5-flash-lite",
 * //   openRouterApiKey: "sk-or-v1-xxx"
 * // }
 * ```
 */
export function mapProfileFields(config: Record<string, any>): Record<string, any> {
	const result = { ...config }
	
	// Map 'provider' to 'apiProvider' if apiProvider doesn't exist
	// Always delete 'provider' after checking
	if ('provider' in result) {
		if (!('apiProvider' in result)) {
			result.apiProvider = result.provider
		}
		delete result.provider
	}
	
	// Get the provider name to determine field mappings
	const provider = result.apiProvider as string | undefined
	
	if (!provider) {
		return result
	}
	
	// Map 'model' to provider-specific modelId field
	if ('model' in result) {
		const modelFieldName = getModelFieldName(provider)
		if (modelFieldName) {
			// Only map if the target field doesn't exist
			if (!(modelFieldName in result)) {
				result[modelFieldName] = result.model
			}
			// Only delete 'model' if we mapped to a DIFFERENT field name
			if (modelFieldName !== 'model') {
				delete result.model
			}
		}
	}
	
	// Map 'apiKey' to provider-specific apiKey field
	if ('apiKey' in result) {
		const apiKeyFieldName = getApiKeyFieldName(provider)
		if (apiKeyFieldName) {
			// Only map if the target field doesn't exist
			if (!(apiKeyFieldName in result)) {
				result[apiKeyFieldName] = result.apiKey
			}
			// Only delete 'apiKey' if we mapped to a DIFFERENT field name
			if (apiKeyFieldName !== 'apiKey') {
				delete result.apiKey
			}
		}
	}
	
	return result
}

/**
 * Gets the provider-specific model field name.
 * 
 * @param provider - Provider name (e.g., "openrouter", "anthropic", "openai")
 * @returns Provider-specific model field name or undefined if not applicable
 */
function getModelFieldName(provider: string): string | undefined {
	const modelFieldMap: Record<string, string> = {
		'openrouter': 'openRouterModelId',
		'anthropic': 'apiModelId',
		'openai': 'openAiModelId',
		'gemini': 'geminiModelId',
		'bedrock': 'awsBedrockModelId',
		'vertex': 'vertexModelId',
		'ollama': 'ollamaModelId',
		'lmstudio': 'lmStudioModelId',
		'glama': 'glamaModelId',
		'mistral': 'mistralModelId',
		'deepseek': 'deepSeekModelId',
		'deepinfra': 'deepInfraModelId',
		'doubao': 'doubaoModelId',
		'moonshot': 'moonshotModelId',
		'unbound': 'unboundModelId',
		'requesty': 'requestyModelId',
		'xai': 'xaiModelId',
		'groq': 'groqModelId',
		'huggingface': 'huggingFaceModelId',
		'litellm': 'litellmModelId',
		'cerebras': 'cerebrasModelId',
		'sambanova': 'sambaNovaModelId',
		'zai': 'zaiModelId',
		'fireworks': 'fireworksModelId',
		'featherless': 'featherlessModelId',
		'io-intelligence': 'ioIntelligenceModelId',
		'hoodycode': 'hoodycodeModel',
		'claude-code': 'apiModelId',
		'openai-native': 'openAiNativeModelId',
		'ovhcloud': 'ovhCloudAiEndpointsModelId',
		'qwen-code': 'apiModelId',
		'roo': 'apiModelId',
		'vercel-ai-gateway': 'vercelAiGatewayModelId',
		'vscode-lm': undefined, // Uses vsCodeLmModelSelector instead
		'synthetic': 'syntheticModelId',
		'chutes': 'chutesModelId',
		'gemini-cli': 'geminiModelId',
	}
	
	return modelFieldMap[provider]
}

/**
 * Gets the provider-specific API key field name.
 * 
 * @param provider - Provider name (e.g., "openrouter", "anthropic", "openai")
 * @returns Provider-specific API key field name or undefined if not applicable
 */
function getApiKeyFieldName(provider: string): string | undefined {
	const apiKeyFieldMap: Record<string, string> = {
		'openrouter': 'openRouterApiKey',
		'anthropic': 'apiKey',
		'openai': 'openAiApiKey',
		'gemini': 'geminiApiKey',
		'bedrock': 'awsApiKey',
		'vertex': 'vertexProjectId', // Vertex uses projectId, not apiKey
		'ollama': 'ollamaApiKey',
		'lmstudio': undefined, // LMStudio doesn't require API key
		'glama': 'glamaApiKey',
		'mistral': 'mistralApiKey',
		'deepseek': 'deepSeekApiKey',
		'deepinfra': 'deepInfraApiKey',
		'doubao': 'doubaoApiKey',
		'moonshot': 'moonshotApiKey',
		'unbound': 'unboundApiKey',
		'requesty': 'requestyApiKey',
		'xai': 'xaiApiKey',
		'groq': 'groqApiKey',
		'huggingface': 'huggingFaceApiKey',
		'litellm': 'litellmApiKey',
		'cerebras': 'cerebrasApiKey',
		'sambanova': 'sambaNovaApiKey',
		'zai': 'zaiApiKey',
		'fireworks': 'fireworksApiKey',
		'featherless': 'featherlessApiKey',
		'io-intelligence': 'ioIntelligenceApiKey',
		'hoodycode': 'hoodycodeToken',
		'claude-code': 'apiKey',
		'openai-native': 'openAiNativeApiKey',
		'ovhcloud': 'ovhCloudAiEndpointsApiKey',
		'qwen-code': 'apiKey',
		'roo': 'apiKey',
		'vercel-ai-gateway': 'vercelAiGatewayApiKey',
		'vscode-lm': undefined, // VS Code LM doesn't require API key
		'synthetic': 'syntheticApiKey',
		'chutes': 'chutesApiKey',
		'gemini-cli': 'geminiApiKey',
		'human-relay': undefined, // Human relay doesn't require API key
		'fake-ai': undefined, // Fake AI doesn't require API key
	}
	
	return apiKeyFieldMap[provider]
}