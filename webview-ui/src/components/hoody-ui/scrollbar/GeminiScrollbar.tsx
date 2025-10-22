import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import "./gemini-scrollbar.css"

export interface GeminiScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Scrollbar variant
	 * @default "default"
	 */
	variant?: "default" | "minimal" | "autohide" | "hidden"
	
	/**
	 * Scrollbar size
	 * @default "default"
	 */
	size?: "thin" | "default" | "wide"
	
	/**
	 * Enable smooth scrolling
	 * @default false
	 */
	smooth?: boolean
	
	/**
	 * Children to render inside scrollable container
	 */
	children: React.ReactNode
}

/**
 * GeminiScrollbar - Elegant, minimal scrollbar inspired by Google Gemini
 * 
 * Features:
 * - Minimal design with smooth transitions
 * - Multiple variants (default, minimal, autohide, hidden)
 * - Size options (thin, default, wide)
 * - Smooth scrolling support
 * - VSCode theme integration
 * 
 * @example
 * ```tsx
 * <GeminiScrollbar variant="autohide" smooth>
 *   <div className="h-[500px]">
 *     Long content here...
 *   </div>
 * </GeminiScrollbar>
 * ```
 */
export const GeminiScrollbar = forwardRef<HTMLDivElement, GeminiScrollbarProps>(
	({ variant = "default", size = "default", smooth = false, className, children, ...props }, ref) => {
		const scrollbarClasses = cn(
			"gemini-scrollbar",
			{
				"gemini-scrollbar-minimal": variant === "minimal",
				"gemini-scrollbar-autohide": variant === "autohide",
				"gemini-scrollbar-hidden": variant === "hidden",
				"gemini-scrollbar-thin": size === "thin",
				"gemini-scrollbar-wide": size === "wide",
				"gemini-scrollbar-smooth": smooth,
			},
			className
		)

		return (
			<div ref={ref} className={scrollbarClasses} {...props}>
				{children}
			</div>
		)
	}
)

GeminiScrollbar.displayName = "GeminiScrollbar"

/**
 * ScrollableContainer - Pre-configured scrollable container
 * 
 * @example
 * ```tsx
 * <ScrollableContainer maxHeight="500px">
 *   Content...
 * </ScrollableContainer>
 * ```
 */
export interface ScrollableContainerProps extends GeminiScrollbarProps {
	maxHeight?: string | number
	maxWidth?: string | number
}

export const ScrollableContainer = forwardRef<HTMLDivElement, ScrollableContainerProps>(
	({ maxHeight, maxWidth, style, children, ...props }, ref) => {
		return (
			<GeminiScrollbar
				ref={ref}
				style={{
					maxHeight: maxHeight,
					maxWidth: maxWidth,
					overflow: "auto",
					...style,
				}}
				{...props}>
				{children}
			</GeminiScrollbar>
		)
	}
)

ScrollableContainer.displayName = "ScrollableContainer"

export default GeminiScrollbar