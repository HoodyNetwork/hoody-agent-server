#!/usr/bin/env node

// Check Node.js version before any imports
const nodeVersion = process.versions.node
const majorVersion = parseInt(nodeVersion.split('.')[0], 10)

if (majorVersion < 20) {
	process.stderr.write(`❌ Node.js ${nodeVersion} is not supported.\n`)
	process.stderr.write(`   Minimum required version: 20.19.2\n`)
	process.stderr.write(`   Recommended versions: 20.x - 22.x\n`)
	process.stderr.write(`   Please upgrade Node.js: https://nodejs.org/\n`)
	process.exit(1)
}

if (majorVersion > 22) {
	process.stderr.write(`⚠️  Node.js ${nodeVersion} has not been tested with this package.\n`)
	process.stderr.write(`   Recommended versions: 20.x - 22.x\n`)
	process.stderr.write(`   Proceeding anyway, but you may encounter issues.\n\n`)
}

// Load .env file before any other imports or initialization
import { loadEnvFile } from "./utils/env-loader.js"
loadEnvFile()

import { Command } from "commander"
import { existsSync } from "fs"
import { dirname } from "path"
import { ServerMode } from "./server.js"
import { Package } from "./constants/package.js"

// Default workspace: if running from cli package, use parent directory
// Otherwise use current working directory
function getDefaultWorkspace(): string {
	const cwd = process.cwd()
	// If current directory ends with 'cli', use parent directory
	if (cwd.endsWith('/cli') || cwd.endsWith('\\cli')) {
		return dirname(cwd)
	}
	return cwd
}

const program = new Command()

program
	.name("hoodycode")
	.description("Hoodycode WebSocket Server - AI-powered coding assistant API")
	.version(Package.version)
	.option("-p, --port <port>", "Port number for the server", "3000")
	.option("-H, --host <host>", "Host address to bind to", "0.0.0.0")
	.option("-w, --workspace <path>", "Path to the workspace directory", getDefaultWorkspace())
	.option("-t, --token <token>", "Custom authentication token (auto-generated if not provided)")
	.option("-s, --storage-dir <path>", "Custom storage directory (default: /hoody/storage/hoody-ai)")
	.option("--process-title <title>", "Process title for identification (default: hoody-ai)", "hoody-ai")
	.option("--ssl-cert <path>", "Path to SSL certificate file (PEM format)")
	.option("--ssl-key <path>", "Path to SSL private key file (PEM format)")
	.option("--ssl-ca <path>", "Path to SSL CA certificate file (optional)")
	.option("--ssl-domain <domain>", "Domain name to enforce when using SSL (e.g., example.com)")
	.option("-d, --debug", "Enable debug logging", false)
	.option("--provider <name>", "AI provider (e.g., anthropic, openrouter, ollama)")
	.option("--model <model-id>", "Model identifier (auto-mapped to provider-specific field)")
	.option("--api-key <key>", "API key (auto-mapped to provider-specific field)")
	.option("--provider-base-url <url>", "Custom base URL for the provider")
	.action(async (options) => {
		try {
			// Validate workspace path exists
			if (!existsSync(options.workspace)) {
				process.stderr.write(`Error: Workspace path does not exist: ${options.workspace}\n`)
				process.exit(1)
			}

			// Parse port as number
			const port = parseInt(options.port)
			if (isNaN(port) || port < 1 || port > 65535) {
				process.stderr.write(`Error: Invalid port number: ${options.port}\n`)
				process.exit(1)
			}

			// Validate SSL configuration
			if (options.sslCert || options.sslKey) {
				// Both cert and key are required if either is provided
				if (!options.sslCert || !options.sslKey) {
					process.stderr.write(`Error: Both --ssl-cert and --ssl-key are required for SSL/TLS\n`)
					process.exit(1)
				}

				// Validate cert file exists
				if (!existsSync(options.sslCert)) {
					process.stderr.write(`Error: SSL certificate file not found: ${options.sslCert}\n`)
					process.exit(1)
				}

				// Validate key file exists
				if (!existsSync(options.sslKey)) {
					process.stderr.write(`Error: SSL private key file not found: ${options.sslKey}\n`)
					process.exit(1)
				}

				// Validate CA file if provided
				if (options.sslCa && !existsSync(options.sslCa)) {
					process.stderr.write(`Error: SSL CA certificate file not found: ${options.sslCa}\n`)
					process.exit(1)
				}
			}

			// Storage directory will be auto-created by HoodyCodePaths.initializeWorkspace()
			// No validation needed here

			// Create and start server
			const server = new ServerMode({
				port,
				host: options.host,
				workspace: options.workspace,
				token: options.token,
				debug: options.debug,
				storageDir: options.storageDir,
				processTitle: options.processTitle,
				sslCert: options.sslCert,
				sslKey: options.sslKey,
				sslCa: options.sslCa,
				sslDomain: options.sslDomain,
				provider: options.provider,
				model: options.model,
				apiKey: options.apiKey,
				providerBaseUrl: options.providerBaseUrl,
			})

			await server.start()
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : String(error)
			process.stderr.write(`Error starting server: ${errorMsg}\n`)
			process.exit(1)
		}
	})

// Parse command line arguments
program.parse()
