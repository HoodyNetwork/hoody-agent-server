/* eslint-disable no-undef */
import esbuild from "esbuild"
import { chmodSync, mkdirSync, copyFileSync, existsSync, cpSync } from "fs"
import { rimrafSync } from "rimraf"
import { execSync } from "child_process"

// Function to compress OpenAPI spec
function compressOpenAPI() {
	try {
		console.log("🗜️  Compressing OpenAPI specification...")
		execSync("node ../scripts/compress-openapi.mjs", { stdio: "inherit", cwd: process.cwd() })
		console.log("✓ OpenAPI compressed")
	} catch (err) {
		console.error("Error compressing OpenAPI:", err)
	}
}

// Function to copy post-build files
function copyPostBuildFiles() {
	try {
		mkdirSync("dist/config", { recursive: true })

		copyFileSync("src/config/schema.json", "dist/config/schema.json")
		copyFileSync("package.dist.json", "dist/package.json")
		copyFileSync("README.md", "dist/README.md")
		
		// Copy OpenAPI specs (JSON for AI, YAML for humans)
		copyFileSync("../OPENAPI.yaml", "dist/OPENAPI.yaml")
		copyFileSync("../OPENAPI_COMPRESSED.json", "dist/OPENAPI_COMPRESSED.json")
		copyFileSync("../OPENAPI_COMPRESSED.yaml", "dist/OPENAPI_COMPRESSED.yaml")

		try {
			copyFileSync(".env", "dist/.env")
			copyFileSync(".env", "dist/hoodycode/.env")
		} catch {
			// .env might not exist, that's okay
		}

		console.log("✓ Post-build files copied")
	} catch (err) {
		console.error("Error copying post-build files:", err)
	}
}

function removeUnneededFiles() {
	rimrafSync("dist/hoodycode/webview-ui")
	rimrafSync("dist/hoodycode/assets")
	console.log("✓ Unneeded files removed")
}

function copyExtensionBundle() {
	try {
		const sourcePath = "../src/dist"
		const destPath = "dist/hoodycode/dist"  // Note: includes /dist to match symlink structure

		// Remove existing directory if it exists
		if (existsSync("dist/hoodycode")) {
			rimrafSync("dist/hoodycode")
		}

		// Create destination directory
		mkdirSync(destPath, { recursive: true })

		// Copy the entire extension dist folder
		// This includes extension.js and all assets (i18n, wasms, etc.)
		cpSync(sourcePath, destPath, {
			recursive: true,
			force: true,
			filter: (src) => {
				// Exclude source maps and unnecessary files
				if (src.endsWith('.map')) return false
				if (src.includes('webview-ui')) return false
				if (src.includes('assets/vscode-material-icons')) return false
				return true
			}
		})

		console.log("✓ Extension bundle copied: dist/hoodycode/dist/ (matches symlink structure)")
	} catch (err) {
		console.error("✗ Failed to copy extension bundle:", err.message)
		console.error("  Make sure to run 'cd src && pnpm bundle' first")
		throw err
	}
}

const afterBuildPlugin = {
	name: "after-build",
	setup(build) {
		build.onEnd((result) => {
			if (result.errors.length > 0) return

			compressOpenAPI()
			copyPostBuildFiles()
			removeUnneededFiles()
			copyExtensionBundle()
			try {
				chmodSync("dist/index.js", 0o755)
				console.log("✓ dist/index.js made executable")
			} catch (err) {
				console.error("Error making dist/index.js executable:", err)
			}
		})
	},
}

const config = {
	entryPoints: ["src/index.ts"],
	bundle: true,
	platform: "node",
	target: "node20",
	format: "esm",
	outfile: "dist/index.js",
	banner: {
		js: `import { createRequire as __createRequire__ } from 'module';
import { fileURLToPath as __fileURLToPath__ } from 'url';
import { dirname as __dirname__ } from 'path';
const require = __createRequire__(import.meta.url);
const __filename = __fileURLToPath__(import.meta.url);
const __dirname = __dirname__(__filename);
`,
	},
	external: [
		// Keep these as external dependencies (will be installed via npm)
		"@anthropic-ai/bedrock-sdk",
		"@anthropic-ai/sdk",
		"@anthropic-ai/vertex-sdk",
		"@aws-sdk/client-bedrock-runtime",
		"@aws-sdk/credential-providers",
		"@cerebras/cerebras_cloud_sdk",
		"@google/genai",
		"@lmstudio/sdk",
		"@mistralai/mistralai",
		"@modelcontextprotocol/sdk",
		"@qdrant/js-client-rest",
		"@vscode/codicons",
		"@vscode/ripgrep",
		"async-mutex",
		"axios",
		"chalk",
		"cheerio",
		"chokidar",
		"clone-deep",
		"commander",
		"default-shell",
		"delay",
		"diff",
		"diff-match-patch",
		"dotenv",
		"eventemitter3",
		"exceljs",
		"fast-deep-equal",
		"fast-xml-parser",
		"fastest-levenshtein",
		"fs-extra",
		"fuse.js",
		"fzf",
		"get-folder-size",
		"google-auth-library",
		"gray-matter",
		"i18next",
		"ignore",
		"ink",
		"ink-big-text",
		"ink-gradient",
		"ink-select-input",
		"ink-spinner",
		"ink-table",
		"ink-text-input",
		"is-wsl",
		"isbinaryfile",
		"jotai",
		"jsdom",
		"json5",
		"jwt-decode",
		"lodash.debounce",
		"lru-cache",
		"mammoth",
		"marked",
		"marked-terminal",
		"monaco-vscode-textmate-theme-converter",
		"node-cache",
		"node-ipc",
		"ollama",
		"openai",
		"os-name",
		"p-limit",
		"p-wait-for",
		"pdf-parse",
		"pkce-challenge",
		"pretty-bytes",
		"proper-lockfile",
		"ps-tree",
		"puppeteer-chromium-resolver",
		"puppeteer-core",
		"react",
		"reconnecting-eventsource",
		"sanitize-filename",
		"say",
		"serialize-error",
		"shiki",
		"simple-git",
		"socket.io-client",
		"sound-play",
		"stream-json",
		"string-similarity",
		"strip-ansi",
		"strip-bom",
		"tiktoken",
		"tmp",
		"tree-sitter-wasms",
		"ts-node",
		"turndown",
		"undici",
		"uri-js",
		"uuid",
		"vscode-material-icons",
		"vscode-uri",
		"web-tree-sitter",
		"workerpool",
		"yaml",
		"zod",
	],
	sourcemap: false,
	minify: false,
	treeShaking: true,
	logLevel: "info",
	plugins: [afterBuildPlugin],
}

if (process.argv.includes("--watch")) {
	const ctx = await esbuild.context(config)
	await ctx.watch()
	console.log("Watching for changes...")
} else {
	// Single build
	await esbuild.build(config)
}
