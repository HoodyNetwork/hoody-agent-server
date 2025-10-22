// hoodycode_change new file - Storybook stories for ImageWarningBanner component
import type { Meta, StoryObj } from "@storybook/react-vite"
import { ImageWarningBanner } from "../../../webview-ui/src/components/chat/ImageWarningBanner"

const meta = {
	title: "Components/Chat/ImageWarningBanner",
	component: ImageWarningBanner,
	tags: ["autodocs"],
	args: {
		isVisible: true,
		onDismiss: () => {},
	},
} satisfies Meta<typeof ImageWarningBanner>

export default meta
type Story = StoryObj<typeof meta>

export const ModelNoImageSupport: Story = {
	args: {
		messageKey: "hoodycode:imageWarnings.modelNoImageSupport",
	},
}

export const MaxImagesReached: Story = {
	args: {
		messageKey: "hoodycode:imageWarnings.maxImagesReached",
	},
}
