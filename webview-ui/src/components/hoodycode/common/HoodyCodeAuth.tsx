import React from "react"
import { ButtonSecondary } from "./ButtonSecondary"
import Logo from "./Logo"
import { useAppTranslation } from "@/i18n/TranslationContext"

interface HoodyCodeAuthProps {
	onManualConfigClick?: () => void
	className?: string
}

const HoodyCodeAuth: React.FC<HoodyCodeAuthProps> = ({ onManualConfigClick, className = "" }) => {
	const { t } = useAppTranslation()

	return (
		<div className={`flex flex-col items-center ${className}`}>
			<Logo />

			<h2 className="m-0 p-0 mb-4">{t("hoodycode:welcome.greeting")}</h2>
			<p className="text-center mb-2">{t("hoodycode:welcome.introText1")}</p>
			<p className="text-center mb-2">{t("hoodycode:welcome.introText2")}</p>
			<p className="text-center mb-5">{t("hoodycode:welcome.introText3")}</p>

			<div className="w-full flex flex-col gap-5">
				{!!onManualConfigClick && (
					<ButtonSecondary onClick={() => onManualConfigClick && onManualConfigClick()}>
						{t("hoodycode:welcome.manualModeButton")}
					</ButtonSecondary>
				)}
			</div>
		</div>
	)
}

export default HoodyCodeAuth
