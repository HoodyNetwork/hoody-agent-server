import { ApiHandlerOptions, ModelRecord } from "../../shared/api"
import { CompletionUsage, OpenRouterHandler } from "./openrouter"
import { getModelParams } from "../transform/model-params"
import { getModels } from "./fetchers/modelCache"
import { DEEP_SEEK_DEFAULT_TEMPERATURE, openRouterDefaultModelId, openRouterDefaultModelInfo } from "@roo-code/types"
import { ApiHandlerCreateMessageMetadata } from ".."
import { getModelEndpoints } from "./fetchers/modelEndpointCache"

/**
 * A custom OpenRouter handler that overrides the getModel function
 * to provide custom model information and fetches models from the HoodyCode OpenRouter endpoint.
 */
export class HoodycodeOpenrouterHandler extends OpenRouterHandler {
	protected override models: ModelRecord = {}
	defaultModel: string = openRouterDefaultModelId

	protected override get providerName() {
		return "HoodyCode" as const
	}

	constructor(options: ApiHandlerOptions) {
		const baseUri = "https://ai.hoody.run/api/v1/"
		options = {
			...options,
			openRouterBaseUrl: baseUri,
			openRouterApiKey: options.hoodycodeToken,
		}

		super(options)
	}

	override customRequestOptions(_metadata?: ApiHandlerCreateMessageMetadata) {
		return undefined
	}

	override getTotalCost(lastUsage: CompletionUsage): number {
		const model = this.getModel().info
		if (!model.inputPrice && !model.outputPrice) {
			return 0
		}
		// https://github.com/HoodyNetwork/hoody-agent-server-backend/blob/eb3d382df1e933a089eea95b9c4387db0c676e35/src/lib/processUsage.ts#L281
		if (lastUsage.is_byok) {
			return lastUsage.cost_details?.upstream_inference_cost || 0
		}
		return lastUsage.cost || 0
	}

	override getModel() {
		let id = this.options.hoodycodeModel ?? this.defaultModel
		let info = this.models[id] ?? openRouterDefaultModelInfo

		// If a specific provider is requested, use the endpoint for that provider.
		if (this.options.openRouterSpecificProvider && this.endpoints[this.options.openRouterSpecificProvider]) {
			info = this.endpoints[this.options.openRouterSpecificProvider]
		}

		const isDeepSeekR1 = id.startsWith("deepseek/deepseek-r1") || id === "perplexity/sonar-reasoning"

		const params = getModelParams({
			format: "openrouter",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: isDeepSeekR1 ? DEEP_SEEK_DEFAULT_TEMPERATURE : 0,
		})

		return { id, info, topP: isDeepSeekR1 ? 0.95 : undefined, ...params }
	}

	public override async fetchModel() {
		if (!this.options.hoodycodeToken || !this.options.openRouterBaseUrl) {
			throw new Error("Hoody token + baseUrl is required to fetch models")
		}

		const [models, endpoints] = await Promise.all([
			getModels({
				provider: "openrouter",
				apiKey: this.options.hoodycodeToken,
				baseUrl: this.options.openRouterBaseUrl,
			}),
			getModelEndpoints({
				router: "openrouter",
				modelId: this.options.hoodycodeModel,
				endpoint: this.options.openRouterSpecificProvider,
			}),
		])

		this.models = models
		this.endpoints = endpoints
		this.defaultModel = openRouterDefaultModelId
		return this.getModel()
	}
}
