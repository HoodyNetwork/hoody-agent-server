// WARNING: This webview UI isn't using the Hoody Agent HTTP system and is not in good condition
// You should ignore this directory entirely, unless you know what you are doing.
// This was an initial fork of Cline but the integrated UI is of no use anymore, it's not on point with the features.

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import "../node_modules/@vscode/codicons/dist/codicon.css"
import "./codicon-custom.css" // hoodycode_change

import { getHighlighter } from "./utils/highlighter"

// Initialize Shiki early to hide initialization latency (async)
getHighlighter().catch((error: Error) => console.error("Failed to initialize Shiki highlighter:", error))

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
