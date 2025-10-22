import axios from "axios"
import { z } from "zod"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import type { ModelInfo } from "@roo-code/types"

import { parseApiPrice } from "@roo/cost"

export const OPENROUTER_DEFAULT_PROVIDER_NAME = "[default]"

const openRouterEndpointsSchema = z.object({
	data: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string().optional(),
		architecture: z
			.object({
				input_modalities: z.array(z.string()).nullish(),
				output_modalities: z.array(z.string()).nullish(),
				tokenizer: z.string().nullish(),
			})
			.nullish(),
		// Make endpoints optional since /models endpoint doesn't include it
		endpoints: z.array(
			z.object({
				name: z.string(),
				// hoodycode_change start
				provider_name: z.string(),
				// hoodycode_change end
				tag: z.string().optional(),
				context_length: z.number(),
				max_completion_tokens: z.number().nullish(),
				pricing: z
					.object({
						prompt: z.union([z.string(), z.number()]).optional(),
						completion: z.union([z.string(), z.number()]).optional(),
						input_cache_read: z.union([z.string(), z.number()]).optional(),
						input_cache_write: z.union([z.string(), z.number()]).optional(),
					})
					.optional(),
			}),
		).optional(),
		// Add fields that /models endpoint actually returns
		context_length: z.number().optional(),
		pricing: z
			.object({
				prompt: z.union([z.string(), z.number()]).optional(),
				completion: z.union([z.string(), z.number()]).optional(),
				image: z.union([z.string(), z.number()]).optional(),
				request: z.union([z.string(), z.number()]).optional(),
			})
			.optional(),
		top_provider: z
			.object({
				context_length: z.number().optional(),
				max_completion_tokens: z.number().nullish(),
				is_moderated: z.boolean().optional(),
			})
			.optional(),
	}),
})

type OpenRouterModelProvider = ModelInfo & {
	label: string
}

// hoodycode_change: baseUrl, apiKey
async function getOpenRouterProvidersForModel(modelId: string, baseUrl?: string, apiKey?: string) {
	const models: Record<string, OpenRouterModelProvider> = {}

	try {
		// hoodycode_change start: baseUrl, apiKey
		// Fetch all models from OpenRouter API
		const response = await axios.get(
			`${baseUrl?.trim() || "https://openrouter.ai/api/v1"}/models`,
			apiKey ? { headers: { Authorization: `Bearer ${apiKey}` } } : undefined,
		)
		
		// Find the specific model in the response
		const modelData = response.data?.data?.find((model: any) => model.id === modelId)
		if (!modelData) {
			console.warn(`Model ${modelId} not found in OpenRouter models list`)
			return models
		}
		
		// Wrap in the expected schema format
		const wrappedData = { data: modelData }
		// hoodycode_change end
		const result = openRouterEndpointsSchema.safeParse(wrappedData)

		if (!result.success) {
			console.error("OpenRouter API response validation failed:", result.error)
			return models
		}

		const { description, architecture, endpoints, context_length, pricing, top_provider } = result.data.data

		// Skip image generation models (models that output images)
		if (architecture?.output_modalities?.includes("image")) {
			return models
		}

		// If endpoints array is available, use it (old API behavior)
		if (endpoints && endpoints.length > 0) {
			for (const endpoint of endpoints) {
				const providerName = endpoint.tag ?? endpoint.provider_name
				const inputPrice = parseApiPrice(endpoint.pricing?.prompt)
				const outputPrice = parseApiPrice(endpoint.pricing?.completion)
				const cacheReadsPrice = parseApiPrice(endpoint.pricing?.input_cache_read)
				const cacheWritesPrice = parseApiPrice(endpoint.pricing?.input_cache_write)

				const modelInfo: OpenRouterModelProvider = {
					maxTokens: endpoint.max_completion_tokens || endpoint.context_length,
					contextWindow: endpoint.context_length,
					supportsImages: architecture?.input_modalities?.includes("image") ?? false,
					supportsPromptCache: typeof cacheReadsPrice !== "undefined",
					cacheReadsPrice,
					cacheWritesPrice,
					inputPrice,
					outputPrice,
					description,
					label: providerName,
				}

				// Apply model-specific overrides
				switch (true) {
					case modelId.startsWith("anthropic/claude-3.7-sonnet"):
						modelInfo.supportsComputerUse = true
						modelInfo.supportsPromptCache = true
						modelInfo.cacheWritesPrice = 3.75
						modelInfo.cacheReadsPrice = 0.3
						modelInfo.maxTokens = modelId === "anthropic/claude-3.7-sonnet:thinking" ? 64_000 : 8192
						break
					case modelId.startsWith("anthropic/claude-3.5-sonnet-20240620"):
						modelInfo.supportsPromptCache = true
						modelInfo.cacheWritesPrice = 3.75
						modelInfo.cacheReadsPrice = 0.3
						modelInfo.maxTokens = 8192
						break
				}

				models[providerName] = modelInfo
			}
		} else {
			// New API behavior: /models endpoint doesn't have endpoints array
			// Create a single provider entry using the model data directly
			const providerName = OPENROUTER_DEFAULT_PROVIDER_NAME
			const inputPrice = parseApiPrice(pricing?.prompt)
			const outputPrice = parseApiPrice(pricing?.completion)

			const modelInfo: OpenRouterModelProvider = {
				maxTokens: top_provider?.max_completion_tokens || context_length || 4096,
				contextWindow: context_length || top_provider?.context_length || 4096,
				supportsImages: architecture?.input_modalities?.includes("image") ?? false,
				supportsPromptCache: false,
				inputPrice,
				outputPrice,
				description,
				label: providerName,
			}

			// Apply model-specific overrides
			switch (true) {
				case modelId.startsWith("anthropic/claude-3.7-sonnet"):
					modelInfo.supportsComputerUse = true
					modelInfo.supportsPromptCache = true
					modelInfo.cacheWritesPrice = 3.75
					modelInfo.cacheReadsPrice = 0.3
					modelInfo.maxTokens = modelId === "anthropic/claude-3.7-sonnet:thinking" ? 64_000 : 8192
					break
				case modelId.startsWith("anthropic/claude-3.5-sonnet-20240620"):
					modelInfo.supportsPromptCache = true
					modelInfo.cacheWritesPrice = 3.75
					modelInfo.cacheReadsPrice = 0.3
					modelInfo.maxTokens = 8192
					break
			}

			models[providerName] = modelInfo
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error(`OpenRouter API response validation failed:`, error.errors)
		} else {
			console.error(`Error fetching OpenRouter providers:`, error)
		}
	}

	return models
}

type UseOpenRouterModelProvidersOptions = Omit<
	UseQueryOptions<Record<string, OpenRouterModelProvider>>,
	"queryKey" | "queryFn"
>

// hoodycode_change start: baseUrl, apiKey, organizationId
export const useOpenRouterModelProviders = (
	modelId?: string,
	baseUrl?: string,
	apiKey?: string,
	organizationId?: string,
	options?: UseOpenRouterModelProvidersOptions,
) =>
	useQuery<Record<string, OpenRouterModelProvider>>({
		queryKey: ["openrouter-model-providers", modelId, baseUrl, apiKey, organizationId],
		queryFn: () => (modelId ? getOpenRouterProvidersForModel(modelId, baseUrl, apiKey) : {}),
		...options,
	})
// hoodycode_change end
