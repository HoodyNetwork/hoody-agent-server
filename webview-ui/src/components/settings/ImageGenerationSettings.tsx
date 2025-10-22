import React, { useState, useEffect } from "react"
import { VSCodeCheckbox, VSCodeTextField, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useAppTranslation } from "@/i18n/TranslationContext"

interface ImageGenerationSettingsProps {
	enabled: boolean
	onChange: (enabled: boolean) => void
	openRouterImageApiKey?: string
	openRouterImageGenerationSelectedModel?: string
	setOpenRouterImageApiKey: (apiKey: string) => void
	setImageGenerationSelectedModel: (model: string) => void
	// hoodycode_change start
	hoodyCodeImageApiKey?: string
	setHoodyCodeImageApiKey: (apiKey: string) => void
	currentProfileHoodycodeToken?: string
	// hoodycode_change end
}

// Hardcoded list of image generation models
const IMAGE_GENERATION_MODELS = [
	{ value: "google/gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image" }, // hoodycode_change
	// Add more models as they become available
]

export const ImageGenerationSettings = ({
	enabled,
	onChange,
	openRouterImageApiKey,
	openRouterImageGenerationSelectedModel,
	setOpenRouterImageApiKey,
	setImageGenerationSelectedModel,
	// hoodycode_change start
	hoodyCodeImageApiKey,
	setHoodyCodeImageApiKey,
	currentProfileHoodycodeToken,
	// hoodycode_change end
}: ImageGenerationSettingsProps) => {
	const { t } = useAppTranslation()

	// hoodycode_change start
	const [isUsingOpenRouter, setIsUsingOpenRouter] = useState(!!openRouterImageApiKey)
	useEffect(() => {
		if (!enabled) {
			return
		}
		const paidImageGenerationModel = IMAGE_GENERATION_MODELS[0].value
		if (isUsingOpenRouter) {
			if (!openRouterImageGenerationSelectedModel) {
				setImageGenerationSelectedModel(paidImageGenerationModel)
			}
		} else {
			if (openRouterImageApiKey) {
				setOpenRouterImageApiKey("")
			}
			if (openRouterImageGenerationSelectedModel !== paidImageGenerationModel) {
				setImageGenerationSelectedModel(paidImageGenerationModel)
			}
		}
	}, [
		enabled,
		isUsingOpenRouter,
		openRouterImageApiKey,
		setOpenRouterImageApiKey,
		hoodyCodeImageApiKey,
		setHoodyCodeImageApiKey,
		openRouterImageGenerationSelectedModel,
		setImageGenerationSelectedModel,
		currentProfileHoodycodeToken,
	])
	// hoodycode_change end

	// Handle API key changes
	const handleApiKeyChange = (value: string) => {
		// setApiKey(value) // hoodycode_change
		setOpenRouterImageApiKey(value)
	}

	const handleHoodyApiKeyChange = (value: string) => {
		setHoodyCodeImageApiKey(value)
	}

	// Handle model selection changes
	const handleModelChange = (value: string) => {
		// setSelectedModel(value) // hoodycode_change
		setImageGenerationSelectedModel(value)
	}

	return (
		<div className="space-y-4">
			<div>
				<div className="flex items-center gap-2">
					<VSCodeCheckbox checked={enabled} onChange={(e: any) => onChange(e.target.checked)}>
						<span className="font-medium">{t("settings:experimental.IMAGE_GENERATION.name")}</span>
					</VSCodeCheckbox>
				</div>
				<p className="text-vscode-descriptionForeground text-sm mt-0">
					{t("settings:experimental.IMAGE_GENERATION.description")}
				</p>
			</div>

			{enabled && (
				<div className="ml-2 space-y-3">
					{/* API Key Configuration */}

					{
						// hoodycode_change start
						<div>
							<label className="block font-medium mb-1">
								{t("settings:experimental.IMAGE_GENERATION.apiProvider")}
							</label>
							<VSCodeDropdown
								value={isUsingOpenRouter ? "openrouter" : "hoodycode"}
								onChange={(e: any) => {
									console.log("onChange", Boolean(e.target.value))
									setIsUsingOpenRouter(e.target.value === "openrouter")
								}}
								className="w-full">
								<VSCodeOption className="py-2 px-3" value="hoodycode">
									Hoody Code
								</VSCodeOption>
								<VSCodeOption className="py-2 px-3" value="openrouter">
									OpenRouter
								</VSCodeOption>
							</VSCodeDropdown>
						</div>
						// hoodycode_change end
					}

					{
						// hoodycode_change start
						<div style={{ display: isUsingOpenRouter ? "none" : undefined }}>
							<label className="block font-medium mb-1">
								{t("settings:experimental.IMAGE_GENERATION.hoodyCodeApiKeyLabel")}
							</label>
							<VSCodeTextField
								value={hoodyCodeImageApiKey}
								onInput={(e: any) => handleHoodyApiKeyChange(e.target.value)}
								placeholder={t("settings:experimental.IMAGE_GENERATION.hoodyCodeApiKeyPlaceholder")}
								className="w-full"
								type="password"
							/>
							<p className="text-vscode-descriptionForeground text-xs mt-1">
								{currentProfileHoodycodeToken ? (
									<a
										href="#"
										onClick={() => handleHoodyApiKeyChange(currentProfileHoodycodeToken)}
										className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground">
										{t("settings:experimental.IMAGE_GENERATION.hoodyCodeApiKeyPaste")}
									</a>
								) : (
									<>
										{t("settings:experimental.IMAGE_GENERATION.getApiKeyText")}{" "}
										<a
											href="https://app.hoody.com/profile?personal=true"
											target="_blank"
											rel="noopener noreferrer"
											className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground">
											app.hoody.com/profile
										</a>
									</>
								)}
							</p>
						</div>
						// hoodycode_change end
					}

					<div style={{ display: isUsingOpenRouter ? undefined : "none" } /*hoodycode_change*/}>
						<label className="block font-medium mb-1">
							{t("settings:experimental.IMAGE_GENERATION.openRouterApiKeyLabel")}
						</label>
						<VSCodeTextField
							value={openRouterImageApiKey /*hoodycode_change*/}
							onInput={(e: any) => handleApiKeyChange(e.target.value)}
							placeholder={t("settings:experimental.IMAGE_GENERATION.openRouterApiKeyPlaceholder")}
							className="w-full"
							type="password"
						/>
						<p className="text-vscode-descriptionForeground text-xs mt-1">
							{t("settings:experimental.IMAGE_GENERATION.getApiKeyText")}{" "}
							<a
								href="https://openrouter.ai/keys"
								target="_blank"
								rel="noopener noreferrer"
								className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground">
								openrouter.ai/keys
							</a>
						</p>
					</div>

					{/* Model Selection */}
					<div style={{ display: isUsingOpenRouter ? undefined : "none" } /*hoodycode_change*/}>
						<label className="block font-medium mb-1">
							{t("settings:experimental.IMAGE_GENERATION.modelSelectionLabel")}
						</label>
						<VSCodeDropdown
							value={openRouterImageGenerationSelectedModel /*hoodycode_change*/}
							onChange={(e: any) => handleModelChange(e.target.value)}
							className="w-full">
							{IMAGE_GENERATION_MODELS.map((model) => (
								<VSCodeOption key={model.value} value={model.value} className="py-2 px-3">
									{model.label}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
						<p className="text-vscode-descriptionForeground text-xs mt-1">
							{t("settings:experimental.IMAGE_GENERATION.modelSelectionDescription")}
						</p>
					</div>

					{/* Status Message */}
					{enabled && (isUsingOpenRouter ? !openRouterImageApiKey : !hoodyCodeImageApiKey) && (
						<div className="p-2 bg-vscode-editorWarning-background text-vscode-editorWarning-foreground rounded text-sm">
							{t("settings:experimental.IMAGE_GENERATION.warningMissingKey")}
						</div>
					)}

					{enabled && (isUsingOpenRouter ? openRouterImageApiKey : hoodyCodeImageApiKey) && (
						<div className="p-2 bg-vscode-editorInfo-background text-vscode-editorInfo-foreground rounded text-sm">
							{t("settings:experimental.IMAGE_GENERATION.successConfigured")}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
