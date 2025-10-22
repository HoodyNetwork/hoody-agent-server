/**
 * Server Mode - Runs Hoodycode as a standalone WebSocket server
 * Uses ExtensionService (same as CLI) to load the full extension
 */

import path from "path"
import { createExtensionService, type ExtensionService } from "./services/extension.js"
import { logs } from "./services/logs.js"
import { HoodyCodePaths } from "./utils/paths.js"
import { loadConfig, saveConfig } from "./config/persistence.js"
import { mapCliParamsToProviderConfig, getProviderName } from "./utils/provider-config.js"
import type { ProviderName } from "./types/messages.js"

// Note: __filename and __dirname are provided by esbuild banner

export interface ServerModeOptions {
	port?: number
	host?: string
	workspace?: string
	token?: string
	debug?: boolean
	storageDir?: string
	processTitle?: string
	sslCert?: string
	sslKey?: string
	sslCa?: string
	sslDomain?: string
	provider?: string
	model?: string
	apiKey?: string
	providerBaseUrl?: string
}

export class ServerMode {
	private extensionService: ExtensionService | undefined
	private apiServer: any | undefined // Will be loaded from extension dynamically
	private isRunning = false

	constructor(private options: ServerModeOptions) { }

	/**
	 * Start the server mode
	 */
	async start(): Promise<void> {
		if (this.isRunning) {
			throw new Error("Server is already running")
		}

		const {
			port = 3000,
			host = "0.0.0.0",
			workspace = process.cwd(),
			token,
			debug = false,
			storageDir,
			processTitle = "hoody-ai",
			sslCert,
			sslKey,
			sslCa,
			sslDomain
		} = this.options

		// Set process title for easy identification in process lists
		process.title = processTitle

		// Set custom storage directory if provided
		if (storageDir) {
			HoodyCodePaths.setStorageDir(storageDir)
		}

		// Set port for port-based isolation
		HoodyCodePaths.setPort(port)

		// Apply CLI provider overrides to default profile if provided
		if (this.options.provider || this.options.model || this.options.apiKey || this.options.providerBaseUrl) {
			await this.applyProviderOverrides()
		}

		// Print startup banner
		this.displayStartupBanner({
			protocol: sslCert && sslKey ? 'HTTPS' : 'HTTP',
			processTitle,
			workspace,
			...(sslCert && { sslCert }),
			...(sslKey && { sslKey }),
			...(sslCa && { sslCa })
		})

		logs.info("Starting Hoodycode in server mode...", "ServerMode")
		logs.info(`Process title: ${process.title}`, "ServerMode")
		logs.info(`Workspace: ${workspace}`, "ServerMode")
		logs.info(`Storage: ${HoodyCodePaths.getInstanceDir()}`, "ServerMode")
		logs.info(`Server will run on: ws://${host}:${port}/ws`, "ServerMode")

		try {
			// Step 1: Create ExtensionService (same as CLI does)
			process.stdout.write(`\n🔧 Loading Hoodycode extension...\n`)
			logs.info("Loading Hoodycode extension...", "ServerMode")

			this.extensionService = createExtensionService({
				workspace,
				mode: "code", // Default mode for server
			})

			// Set up event listeners
			this.extensionService.on("ready", (api) => {
				logs.info("Extension ready", "ServerMode")
			})

			this.extensionService.on("error", (error) => {
				logs.error("Extension error", "ServerMode", { error })
			})

			// Initialize the service (activates extension)
			await this.extensionService.initialize()
			logs.info("Extension initialized successfully", "ServerMode")

			// Step 2: Get the ClineProvider from the extension
			const provider = await this.getClineProvider()
			if (!provider) {
				throw new Error("Failed to get ClineProvider from extension")
			}

			logs.info("ClineProvider obtained", "ServerMode")

			// Step 3: Load createApiServer from the extension bundle
			logs.info("Starting API server...", "ServerMode")

			// Load the API server module from the bundled extension
			const { createRequire } = await import("module")
			const require = createRequire(import.meta.url)

			// The extension bundle at dist/hoodycode/dist/extension.js
			// should now export createApiServer
			const extensionPath = path.join(__dirname, "hoodycode", "dist", "extension.js")
			const extensionModule = require(extensionPath)

			if (!extensionModule.createApiServer) {
				throw new Error("createApiServer not exported from extension. Please rebuild the extension.")
			}

			const createApiServer = extensionModule.createApiServer

			// Get the VSCode context from the extension host
			const extensionHost = this.extensionService.getExtensionHost()
			const vscodeContext = (extensionHost as any).vscodeAPI.context

			// Build SSL config if certificates provided
			const sslConfig = sslCert && sslKey ? {
				cert: sslCert,
				key: sslKey,
				...(sslCa && { ca: sslCa }),
				...(sslDomain && { domain: sslDomain })
			} : undefined


			this.apiServer = await createApiServer(
				provider,
				{
					port,
					host,
					token,
					debug,
					allowedOrigins: ["*"], // Allow all origins in server mode
					ssl: sslConfig,
				},
				vscodeContext,
			)

			logs.info("API server started successfully", "ServerMode")

			this.isRunning = true

			// Display connection information
			await this.displayConnectionInfo()

			// Step 4: Keep the process alive
			await this.keepAlive()
		} catch (error) {
			// Print error to stderr (bypasses console interception)
			const errorMsg = error instanceof Error ? error.message : String(error)
			process.stderr.write(`\n❌ Failed to start server: ${errorMsg}\n`)
			process.stderr.write(`   Check logs at: ${HoodyCodePaths.getLogsDir()}\n\n`)

			logs.error("Failed to start server mode", "ServerMode", { error })
			await this.stop()
			throw error
		}
	}

	/**
	 * Get the ClineProvider from the activated extension
	 */
	private async getClineProvider(): Promise<any> {
		if (!this.extensionService) {
			return null
		}

		// The ExtensionHost registers providers during activation
		const extensionHost = this.extensionService.getExtensionHost()
		const globalExtensionHost = (global as any).__extensionHost

		if (!globalExtensionHost) {
			logs.error("Global extension host not found", "ServerMode")
			return null
		}

		// Get the registered webview provider (ClineProvider)
		const provider = globalExtensionHost.webviewProviders?.get("hoody-code.SidebarProvider")
		if (!provider) {
			logs.error("ClineProvider not found in registered providers", "ServerMode")
			logs.error("Available providers:", "ServerMode", {
				providers: Array.from(globalExtensionHost.webviewProviders?.keys() || []),
			})
			return null
		}

		return provider
	}

	/**
	 * Display startup banner
	 */
	private displayStartupBanner(opts: {
		protocol: string
		processTitle: string
		workspace: string
		sslCert?: string
		sslKey?: string
		sslCa?: string
	}): void {
		const { protocol, processTitle, workspace, sslCert, sslKey, sslCa } = opts
		
		const banner = [
			"",
			"╔═══════════════════════════════════════════════════════════════╗",
			"║                                                               ║",
			"║     🤖  H O O D Y   A G E N T   S E R V E R                  ║",
			"║                                                               ║",
			"║     Build AI Coding Assistants via REST API                  ║",
			"║                                                               ║",
			"╚═══════════════════════════════════════════════════════════════╝",
			"",
			"📦 Configuration",
			"─".repeat(65),
			`   Protocol    : ${protocol}`,
			`   Process     : ${processTitle}`,
			`   Workspace   : ${workspace}`,
			`   Storage     : ${HoodyCodePaths.getInstanceDir()}`,
		]
		
		if (sslCert && sslKey) {
			banner.push(`   SSL Cert    : ${sslCert}`)
			banner.push(`   SSL Key     : ${sslKey}`)
			if (sslCa) {
				banner.push(`   SSL CA      : ${sslCa}`)
			}
		}
		
		banner.push("")
		
		process.stdout.write(banner.join("\n") + "\n")
	}

	/**
	 * Display connection information
	 * Uses process.stdout directly to bypass console interception
	 */
	private async displayConnectionInfo(): Promise<void> {
		const { port = 3000, host = "0.0.0.0", workspace = process.cwd(), sslCert, sslKey } = this.options
		const token = this.apiServer?.getToken?.() || "TOKEN_NOT_AVAILABLE"
		const isSecure = !!(sslCert && sslKey)
		const httpProtocol = isSecure ? 'https' : 'http'
		const wsProtocol = isSecure ? 'wss' : 'ws'

		// Load current config to display AI profile
		const config = await loadConfig()
		const defaultProfile = config.providers.find((p) => p.id === "default") || config.providers[0]

		const output = [
			"",
			"╔═══════════════════════════════════════════════════════════════╗",
			"║                                                               ║",
			`║     ${isSecure ? '🔒 ' : ''}🚀  S E R V E R   R U N N I N G  ${isSecure ? '                      ' : '                        '}║`,
			"║                                                               ║",
			"╚═══════════════════════════════════════════════════════════════╝",
			"",
			"🤖 AI Profile Configuration",
			"─".repeat(65),
		]

		// Display current AI configuration
		if (defaultProfile) {
			this.appendProfileToOutput(output, defaultProfile)
		} else {
			output.push("   No AI profile configured")
		}

		output.push(
			"",
			"🌐 Endpoints",
			"─".repeat(65),
			`   WebSocket   : ${wsProtocol}://${host}:${port}/ws`,
			`   HTTP API    : ${httpProtocol}://${host}:${port}/api/v1`,
			`   Health      : ${httpProtocol}://${host}:${port}/api/v1/agent/health`,
			"",
			"🔑 Authentication",
			"─".repeat(65),
			`   Token       : ${token}`,
			"",
			"💡 Quick Connect",
			"─".repeat(65),
			`   ${wsProtocol}://${host}:${port}/ws?token=${token}`,
			"",
			"📚 Documentation",
			"─".repeat(65),
			`   Local Files : docs/api-reference.html, OPENAPI.yaml`,
			`   GitHub      : https://github.com/HoodyNetwork/hoody-agent-server`,
			"",
			"💾 Storage & Workspace",
			"─".repeat(65),
			`   Workspace   : ${workspace}`,
			`   Storage     : ${HoodyCodePaths.getInstanceDir()}`,
			`   Logs        : ${HoodyCodePaths.getLogsDir()}`,
			"",
			"═".repeat(65),
			"",
			"📖 Available CLI Flags:",
			"─".repeat(65),
			"   -p, --port <port>              Server port (default: 3000)",
			"   -H, --host <host>              Host address (default: 0.0.0.0)",
			"   -w, --workspace <path>         Workspace directory",
			"   -t, --token <token>            Authentication token",
			"   -s, --storage-dir <path>       Storage directory",
			"   --process-title <title>        Process title (default: hoody-ai)",
			"   --provider <name>              AI provider (anthropic, openrouter, etc.)",
			"   --model <model-id>             Model identifier",
			"   --api-key <key>                API key for the provider",
			"   --provider-base-url <url>      Custom base URL for provider",
			"   --ssl-cert <path>              SSL certificate file (PEM)",
			"   --ssl-key <path>               SSL private key file (PEM)",
			"   --ssl-ca <path>                SSL CA certificate (optional)",
			"   --ssl-domain <domain>          Domain for SSL enforcement",
			"   -d, --debug                    Enable debug logging",
			"",
			"═".repeat(65),
			"",
			"Press Ctrl+C to stop the server",
			""
		)

		process.stdout.write(output.join("\n"))
	}

	/**
		* Append profile configuration to output array
		*/
	private appendProfileToOutput(output: string[], profile: any): void {
		// Create a sanitized copy for display
		const displayConfig: any = {}
		
		for (const [key, value] of Object.entries(profile)) {
			// Skip the id field
			if (key === "id") continue
			
			// Sanitize sensitive fields
			if (typeof value === "string" && (
				key.toLowerCase().includes("key") ||
				key.toLowerCase().includes("token") ||
				key.toLowerCase().includes("secret")
			)) {
				// Show first 8 chars and last 4 chars if long enough
				if (value.length > 16) {
					displayConfig[key] = `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
				} else if (value.length > 8) {
					displayConfig[key] = `${value.substring(0, 8)}...`
				} else {
					displayConfig[key] = "***"
				}
			} else {
				displayConfig[key] = value
			}
		}
		
		// Display in formatted way
		const maxKeyLength = Math.max(...Object.keys(displayConfig).map(k => k.length), 10)
		for (const [key, value] of Object.entries(displayConfig)) {
			const paddedKey = key.padEnd(maxKeyLength)
			const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value)
			output.push(`   ${paddedKey} : ${displayValue}`)
		}
	}

	/**
	 * Keep the process alive indefinitely
	 */
	private async keepAlive(): Promise<void> {
		// Set up graceful shutdown handlers
		process.on("SIGINT", async () => {
			process.stdout.write("\n\n🛑 Shutting down gracefully...\n")
			await this.stop()
			process.exit(0)
		})

		process.on("SIGTERM", async () => {
			process.stdout.write("\n\n🛑 Shutting down gracefully...\n")
			await this.stop()
			process.exit(0)
		})

		// Keep alive forever
		return new Promise(() => {
			// Never resolves - keeps process running
		})
	}

	/**
	 * Apply CLI provider overrides to the default profile
	 */
	private async applyProviderOverrides(): Promise<void> {
		try {
			logs.info("Applying CLI provider overrides to default profile", "ServerMode")

			// Load existing config
			const config = await loadConfig()

			// Get or validate provider
			let providerName: ProviderName | null = null
			if (this.options.provider) {
				const validatedProvider = getProviderName(this.options.provider)
				if (!validatedProvider) {
					throw new Error(`Invalid provider: ${this.options.provider}`)
				}
				providerName = validatedProvider
			}

			// Find the default profile or the first provider
			let defaultProfile = config.providers.find((p) => p.id === "default")
			
			// If default profile doesn't exist, create it
			if (!defaultProfile) {
				// If provider is specified, use it; otherwise use the current provider or hoodycode
				const provider: ProviderName = providerName || (config.provider ? (getProviderName(config.provider) || "hoodycode") : "hoodycode")
				defaultProfile = {
					id: "default",
					provider,
				}
				config.providers.push(defaultProfile)
				config.provider = "default"
			}

			// Update provider if specified
			if (providerName) {
				defaultProfile.provider = providerName
			}

			// Map CLI parameters to provider-specific fields
			const overrides = mapCliParamsToProviderConfig({
				provider: defaultProfile.provider,
				...(this.options.model && { model: this.options.model }),
				...(this.options.apiKey && { apiKey: this.options.apiKey }),
				...(this.options.providerBaseUrl && { baseUrl: this.options.providerBaseUrl }),
			})

			// Apply overrides to default profile
			Object.assign(defaultProfile, overrides)

			// Log what was updated
			const updates: string[] = []
			if (this.options.provider) updates.push(`provider=${this.options.provider}`)
			if (this.options.model) updates.push(`model=${this.options.model}`)
			if (this.options.apiKey) updates.push("api-key=***")
			if (this.options.providerBaseUrl) updates.push(`base-url=${this.options.providerBaseUrl}`)
			
			logs.info(`Updated default profile: ${updates.join(", ")}`, "ServerMode")
			process.stdout.write(`   Updated default profile: ${updates.join(", ")}\n`)

			// Save updated config
			await saveConfig(config)
			logs.info("Config saved with CLI overrides", "ServerMode")
			
			// Display the final default profile configuration
			this.displayDefaultProfileConfig(defaultProfile)
		} catch (error) {
			logs.error("Failed to apply provider overrides", "ServerMode", { error })
			throw error
		}
	}

	/**
	 * Display the final default profile configuration
	 */
	private displayDefaultProfileConfig(profile: any): void {
		process.stdout.write(`\n🎯 AI Profile Configuration\n`)
		process.stdout.write(`─${"─".repeat(63)}\n`)
		
		// Create a sanitized copy for display
		const displayConfig: any = {}
		
		for (const [key, value] of Object.entries(profile)) {
			// Skip the id field
			if (key === "id") continue
			
			// Sanitize sensitive fields
			if (typeof value === "string" && (
				key.toLowerCase().includes("key") ||
				key.toLowerCase().includes("token") ||
				key.toLowerCase().includes("secret")
			)) {
				// Show first 8 chars and last 4 chars if long enough
				if (value.length > 16) {
					displayConfig[key] = `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
				} else if (value.length > 8) {
					displayConfig[key] = `${value.substring(0, 8)}...`
				} else {
					displayConfig[key] = "***"
				}
			} else {
				displayConfig[key] = value
			}
		}
		
		// Display in formatted way
		const maxKeyLength = Math.max(...Object.keys(displayConfig).map(k => k.length))
		for (const [key, value] of Object.entries(displayConfig)) {
			const paddedKey = key.padEnd(maxKeyLength)
			const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value)
			process.stdout.write(`   ${paddedKey} : ${displayValue}\n`)
		}
		
		process.stdout.write(`─${"─".repeat(63)}\n\n`)
	}

	/**
	 * Stop the server
	 */
	async stop(): Promise<void> {
		if (!this.isRunning) {
			return
		}

		logs.info("Stopping server mode...", "ServerMode")

		try {
			// Stop API server (closes HTTP and WebSocket)
			if (this.apiServer && typeof this.apiServer.stop === "function") {
				await this.apiServer.stop()
				this.apiServer = undefined
			}

			// Dispose extension service
			if (this.extensionService) {
				await this.extensionService.dispose()
				this.extensionService = undefined
			}

			this.isRunning = false
			logs.info("Server mode stopped", "ServerMode")
		} catch (error) {
			logs.error("Error stopping server mode", "ServerMode", { error })
			throw error
		}
	}
}