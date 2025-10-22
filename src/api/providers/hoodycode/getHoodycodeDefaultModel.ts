import { openRouterDefaultModelId, type ProviderSettings } from "@roo-code/types"
import { getHoodyBaseUriFromToken } from "../../../shared/hoodycode/token"
import { TelemetryService } from "@roo-code/telemetry"
import { z } from "zod"
import { fetchWithTimeout } from "./fetchWithTimeout"
import { DEFAULT_HEADERS } from "../constants"

type HoodycodeToken = string

type OrganizationId = string

const cache = new Map<string, Promise<string>>()

const defaultsSchema = z.object({
	defaultModel: z.string().nullish(),
})

const fetcher = fetchWithTimeout(5000)

async function fetchHoodycodeDefaultModel(
	hoodycodeToken: HoodycodeToken,
	organizationId?: OrganizationId,
	providerSettings?: ProviderSettings,
): Promise<string> {
	try {
		const path = organizationId ? `/organizations/${organizationId}/defaults` : `/defaults`
		const url = `${getHoodyBaseUriFromToken(hoodycodeToken)}/api${path}`

		const headers: Record<string, string> = {
			...DEFAULT_HEADERS,
			Authorization: `Bearer ${hoodycodeToken}`,
		}

		// Add X-HOODYCODE-TESTER: SUPPRESS header if the setting is enabled
		if (
			providerSettings?.hoodycodeTesterWarningsDisabledUntil &&
			providerSettings.hoodycodeTesterWarningsDisabledUntil > Date.now()
		) {
			headers["X-HOODYCODE-TESTER"] = "SUPPRESS"
		}

		const response = await fetcher(url, { headers })
		if (!response.ok) {
			throw new Error(`Fetching default model from ${url} failed: ${response.status}`)
		}
		const defaultModel = (await defaultsSchema.parseAsync(await response.json())).defaultModel
		if (!defaultModel) {
			throw new Error(`Default model from ${url} was empty`)
		}
		console.info(`Fetched default model from ${url}: ${defaultModel}`)
		return defaultModel
	} catch (err) {
		console.error("Failed to get default model", err)
		TelemetryService.instance.captureException(err, { context: "getHoodycodeDefaultModel" })
		return openRouterDefaultModelId
	}
}

export async function getHoodycodeDefaultModel(
	hoodycodeToken?: HoodycodeToken,
	organizationId?: OrganizationId,
	providerSettings?: ProviderSettings,
): Promise<string> {
	if (!hoodycodeToken) {
		return openRouterDefaultModelId
	}
	const key = JSON.stringify({
		hoodycodeToken,
		organizationId,
		testerSuppressed: providerSettings?.hoodycodeTesterWarningsDisabledUntil,
	})
	let defaultModelPromise = cache.get(key)
	if (!defaultModelPromise) {
		defaultModelPromise = fetchHoodycodeDefaultModel(hoodycodeToken, organizationId, providerSettings)
		cache.set(key, defaultModelPromise)
	}
	return await defaultModelPromise
}
