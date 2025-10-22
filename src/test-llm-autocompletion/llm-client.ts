import OpenAI from "openai"
import { config } from "dotenv"
import { DEFAULT_HEADERS } from "../api/providers/constants.js"

config()

export interface LLMResponse {
	content: string
	provider: string
	model: string
	tokensUsed?: number
}

function getHoodyBaseUriFromToken(hoodycodeToken?: string): string {
	if (hoodycodeToken) {
		try {
			const payload_string = hoodycodeToken.split(".")[1]
			const payload_json = Buffer.from(payload_string, "base64").toString()
			const payload = JSON.parse(payload_json)
			// Note: this is UNTRUSTED, so we need to make sure we're OK with this being manipulated by an attacker
			if (payload.env === "development") return "http://localhost:3000"
		} catch (_error) {
			console.warn("Failed to get base URL from Hoody Code token")
		}
	}
	return "https://api.hoody.com"
}

export class LLMClient {
	private provider: string
	private model: string
	private openai: OpenAI

	constructor() {
		this.provider = process.env.LLM_PROVIDER || "hoodycode"
		this.model = process.env.LLM_MODEL || "mistralai/codestral-2508"

		if (this.provider !== "hoodycode") {
			throw new Error(`Only hoodycode provider is supported. Got: ${this.provider}`)
		}

		if (!process.env.HOODYCODE_API_KEY) {
			throw new Error("HOODYCODE_API_KEY is required for Hoodycode provider")
		}

		const baseUrl = getHoodyBaseUriFromToken(process.env.HOODYCODE_API_KEY)

		this.openai = new OpenAI({
			baseURL: `${baseUrl}/api/openrouter/`,
			apiKey: process.env.HOODYCODE_API_KEY,
			defaultHeaders: {
				...DEFAULT_HEADERS,
				"X-HOODYCODE-TESTER": "SUPPRESS",
			},
		})
	}

	async sendPrompt(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
		try {
			const response = await this.openai.chat.completions.create({
				model: this.model,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				max_tokens: 1024,
			})

			return {
				content: response.choices[0].message.content || "",
				provider: this.provider,
				model: this.model,
				tokensUsed: response.usage?.total_tokens,
			}
		} catch (error) {
			console.error("LLM API Error:", error)
			throw error
		}
	}
}
