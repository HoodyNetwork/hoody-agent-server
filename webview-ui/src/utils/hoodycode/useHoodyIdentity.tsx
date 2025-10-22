import { useEffect, useState } from "react"
import { ProfileDataResponsePayload } from "@roo/WebviewMessage"
import { vscode } from "@/utils/vscode"

export function useHoodyIdentity(hoodycodeToken: string, machineId: string) {
	const [hoodyIdentity, setHoodyIdentity] = useState("")
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === "profileDataResponse") {
				const payload = event.data.payload as ProfileDataResponsePayload | undefined
				const success = payload?.success || false
				const tokenFromMessage = payload?.data?.hoodycodeToken || ""
				const email = payload?.data?.user?.email || ""
				if (!success) {
					console.error("HOODYTEL: Failed to identify Hoody user, message doesn't indicate success:", payload)
				} else if (tokenFromMessage !== hoodycodeToken) {
					console.error("HOODYTEL: Failed to identify Hoody user, token mismatch:", payload)
				} else if (!email) {
					console.error("HOODYTEL: Failed to identify Hoody user, email missing:", payload)
				} else {
					console.debug("HOODYTEL: Hoody user identified:", email)
					setHoodyIdentity(email)
					window.removeEventListener("message", handleMessage)
				}
			}
		}

		if (hoodycodeToken) {
			console.debug("HOODYTEL: fetching profile...")
			window.addEventListener("message", handleMessage)
			vscode.postMessage({
				type: "fetchProfileDataRequest",
			})
		} else {
			console.debug("HOODYTEL: no Hoody user")
			setHoodyIdentity("")
		}

		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [hoodycodeToken])
	return hoodyIdentity || machineId
}
