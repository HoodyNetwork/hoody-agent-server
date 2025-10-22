import React, { useState } from "react"
import { GeminiScrollbar, ScrollableContainer } from "./scrollbar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * HoodyUIShowcase - Interactive demo of all Hoody UI components
 * 
 * This component showcases the enhanced UI library built for Hoody Code,
 * featuring Gemini-inspired design and smooth interactions.
 */
export const HoodyUIShowcase: React.FC = () => {
	const [activeTab, setActiveTab] = useState("scrollbar")

	const tabs = [
		{ id: "scrollbar", label: "Scrollbar" },
		{ id: "chat", label: "Chat UI" },
		{ id: "messages", label: "Messages" },
		{ id: "components", label: "Components" },
	]

	return (
		<div className="flex h-screen flex-col bg-vscode-editor-background text-vscode-editor-foreground">
			{/* Header */}
			<div className="border-b border-vscode-panel-border bg-vscode-sideBar-background px-6 py-4">
				<h1 className="text-2xl font-bold">🎨 Hoody UI Library</h1>
				<p className="mt-1 text-sm text-vscode-descriptionForeground">
					Enhanced components for Hoody Code - Gemini-inspired design
				</p>
			</div>

			{/* Tabs */}
			<div className="border-b border-vscode-panel-border bg-vscode-sideBar-background px-6">
				<div className="flex gap-1">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"px-4 py-2 text-sm font-medium transition-colors",
								"border-b-2 border-transparent hover:border-vscode-focusBorder",
								activeTab === tab.id
									? "border-vscode-focusBorder text-vscode-foreground"
									: "text-vscode-descriptionForeground"
							)}>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<GeminiScrollbar variant="autohide" smooth className="flex-1">
				<div className="p-6">
					{activeTab === "scrollbar" && <ScrollbarShowcase />}
					{activeTab === "chat" && <ChatUIShowcase />}
					{activeTab === "messages" && <MessagesShowcase />}
					{activeTab === "components" && <ComponentsShowcase />}
				</div>
			</GeminiScrollbar>
		</div>
	)
}

/**
 * Scrollbar Showcase Section
 */
const ScrollbarShowcase: React.FC = () => {
	return (
		<div className="space-y-8">
			<div>
				<h2 className="mb-4 text-xl font-semibold">Gemini Scrollbar</h2>
				<p className="mb-6 text-sm text-vscode-descriptionForeground">
					Minimal, elegant scrollbar with smooth animations inspired by Google Gemini.
				</p>
			</div>

			{/* Default Scrollbar */}
			<Section title="Default" description="Standard Gemini scrollbar with 8px width">
				<ScrollableContainer maxHeight="200px" className="rounded-lg border border-vscode-input-border p-4">
					<div className="space-y-2">
						{Array.from({ length: 20 }, (_, i) => (
							<div key={i} className="rounded bg-vscode-list-hoverBackground p-3 text-sm">
								Line {i + 1} - This is scrollable content with the default Gemini scrollbar
							</div>
						))}
					</div>
				</ScrollableContainer>
			</Section>

			{/* Autohide Scrollbar */}
			<Section title="Autohide" description="Scrollbar appears only on hover">
				<ScrollableContainer
					variant="autohide"
					maxHeight="200px"
					className="rounded-lg border border-vscode-input-border p-4">
					<div className="space-y-2">
						{Array.from({ length: 15 }, (_, i) => (
							<div key={i} className="rounded bg-vscode-list-hoverBackground p-3 text-sm">
								Line {i + 1} - Hover to see the scrollbar appear smoothly
							</div>
						))}
					</div>
				</ScrollableContainer>
			</Section>

			{/* Minimal Scrollbar */}
			<Section title="Minimal" description="Ultra-minimal, only visible on hover">
				<ScrollableContainer
					variant="minimal"
					maxHeight="200px"
					className="rounded-lg border border-vscode-input-border p-4">
					<div className="space-y-2">
						{Array.from({ length: 15 }, (_, i) => (
							<div key={i} className="rounded bg-vscode-list-hoverBackground p-3 text-sm">
								Line {i + 1} - Even more subtle scrollbar design
							</div>
						))}
					</div>
				</ScrollableContainer>
			</Section>

			{/* Size Variants */}
			<Section title="Size Variants" description="Different scrollbar widths">
				<div className="grid grid-cols-3 gap-4">
					<div>
						<p className="mb-2 text-xs font-medium">Thin (6px)</p>
						<ScrollableContainer
							size="thin"
							maxHeight="150px"
							className="rounded-lg border border-vscode-input-border p-3">
							{Array.from({ length: 10 }, (_, i) => (
								<div key={i} className="mb-2 text-xs">
									Line {i + 1}
								</div>
							))}
						</ScrollableContainer>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium">Default (8px)</p>
						<ScrollableContainer maxHeight="150px" className="rounded-lg border border-vscode-input-border p-3">
							{Array.from({ length: 10 }, (_, i) => (
								<div key={i} className="mb-2 text-xs">
									Line {i + 1}
								</div>
							))}
						</ScrollableContainer>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium">Wide (12px)</p>
						<ScrollableContainer
							size="wide"
							maxHeight="150px"
							className="rounded-lg border border-vscode-input-border p-3">
							{Array.from({ length: 10 }, (_, i) => (
								<div key={i} className="mb-2 text-xs">
									Line {i + 1}
								</div>
							))}
						</ScrollableContainer>
					</div>
				</div>
			</Section>

			{/* Smooth Scrolling */}
			<Section title="Smooth Scrolling" description="Animated scroll behavior">
				<div className="space-y-4">
					<ScrollableContainer
						smooth
						maxHeight="200px"
						className="rounded-lg border border-vscode-input-border p-4">
						<div className="space-y-2">
							{Array.from({ length: 20 }, (_, i) => (
								<div key={i} id={`item-${i}`} className="rounded bg-vscode-list-hoverBackground p-3 text-sm">
									Item {i + 1} - Try scrolling to see smooth animation
								</div>
							))}
						</div>
					</ScrollableContainer>
					<div className="flex gap-2">
						<Button size="sm" onClick={() => document.getElementById("item-0")?.scrollIntoView({ behavior: "smooth" })}>
							Scroll to Top
						</Button>
						<Button
							size="sm"
							onClick={() => document.getElementById("item-19")?.scrollIntoView({ behavior: "smooth" })}>
							Scroll to Bottom
						</Button>
					</div>
				</div>
			</Section>
		</div>
	)
}

/**
 * Chat UI Showcase Section (Placeholder)
 */
const ChatUIShowcase: React.FC = () => {
	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">Chat UI Components</h2>
			<p className="text-sm text-vscode-descriptionForeground">Coming soon...</p>
		</div>
	)
}

/**
 * Messages Showcase Section (Placeholder)
 */
const MessagesShowcase: React.FC = () => {
	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">Message Components</h2>
			<p className="text-sm text-vscode-descriptionForeground">Coming soon...</p>
		</div>
	)
}

/**
 * Components Showcase Section (Placeholder)
 */
const ComponentsShowcase: React.FC = () => {
	return (
		<div>
			<h2 className="mb-4 text-xl font-semibold">UI Components</h2>
			<p className="text-sm text-vscode-descriptionForeground">Coming soon...</p>
		</div>
	)
}

/**
 * Section wrapper component
 */
interface SectionProps {
	title: string
	description?: string
	children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => {
	return (
		<div className="rounded-lg border border-vscode-panel-border bg-vscode-sideBar-background p-6">
			<h3 className="mb-2 font-semibold">{title}</h3>
			{description && <p className="mb-4 text-sm text-vscode-descriptionForeground">{description}</p>}
			{children}
		</div>
	)
}

export default HoodyUIShowcase