import { X_HOODYCODE_VERSION } from "../../shared/hoodycode/headers"
import { Package } from "../../shared/package"

export const DEFAULT_HEADERS = {
	"HTTP-Referer": "https://hoody.com",
	"X-Title": "Hoody Code",
	[X_HOODYCODE_VERSION]: Package.version,
	"User-Agent": `Hoody-Code/${Package.version}`,
}
