import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { Button } from "@src/components/ui"
import { type ProviderSettings, type OrganizationAllowList } from "@roo-code/types"
import type { RouterModels } from "@roo/api"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { inputEventTransform } from "../../../settings/transforms"
import { ModelPicker } from "../../../settings/ModelPicker"
import { OrganizationSelector } from "../../common/OrganizationSelector"
import { useHoodyIdentity } from "@src/utils/hoodycode/useHoodyIdentity"

type HoodyCodeProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
	routerModels?: RouterModels
	organizationAllowList: OrganizationAllowList
	hoodycodeDefaultModel: string
}

export const HoodyCode = ({
	apiConfiguration,
	setApiConfigurationField,
	routerModels,
	organizationAllowList,
	hoodycodeDefaultModel,
}: HoodyCodeProps) => {
	const { t } = useAppTranslation()
	
	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	// Use the existing hook to get user identity
	const userIdentity = useHoodyIdentity(apiConfiguration.hoodycodeToken || "", "")
	const isHoodyCodeAiUser = userIdentity.endsWith("@hoody.com")

	const areHoodycodeWarningsDisabled = apiConfiguration.hoodycodeTesterWarningsDisabledUntil
		? apiConfiguration.hoodycodeTesterWarningsDisabledUntil > Date.now()
		: false

	const handleToggleTesterWarnings = useCallback(() => {
		const newTimestamp = Date.now() + (areHoodycodeWarningsDisabled ? 0 : 24 * 60 * 60 * 1000)
		setApiConfigurationField("hoodycodeTesterWarningsDisabledUntil", newTimestamp)
	}, [areHoodycodeWarningsDisabled, setApiConfigurationField])

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.hoodycodeToken || ""}
				type="password"
				onInput={handleInputChange("hoodycodeToken")}
				placeholder={t("hoodycode:settings.provider.apiKey")}
				className="w-full">
				<div className="flex justify-between items-center mb-1">
					<label className="block font-medium">{t("hoodycode:settings.provider.apiKey")}</label>
				</div>
			</VSCodeTextField>

			<OrganizationSelector showLabel />

			<ModelPicker
				apiConfiguration={apiConfiguration}
				setApiConfigurationField={setApiConfigurationField}
				defaultModelId={hoodycodeDefaultModel}
				models={routerModels?.["hoodycode-openrouter"] ?? {}}
				modelIdKey="hoodycodeModel"
				serviceName="Hoody Code"
				serviceUrl="https://hoody.com"
				organizationAllowList={organizationAllowList}
			/>

			{/* HOODYCODE-TESTER warnings setting - only visible for @hoody.com users */}
			{isHoodyCodeAiUser && (
				<div className="mb-4">
					<label className="block font-medium mb-2">Disable HOODYCODE-TESTER warnings</label>
					<div className="text-sm text-vscode-descriptionForeground mb-2">
						{areHoodycodeWarningsDisabled
							? `Warnings disabled until ${new Date(apiConfiguration.hoodycodeTesterWarningsDisabledUntil || 0).toLocaleString()}`
							: "HOODYCODE-TESTER warnings are currently enabled"}
					</div>
					<Button variant="secondary" onClick={handleToggleTesterWarnings} className="text-sm">
						{areHoodycodeWarningsDisabled ? "Enable warnings now" : "Disable warnings for 1 day"}
					</Button>
				</div>
			)}
		</>
	)
}
