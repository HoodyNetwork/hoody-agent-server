import { config } from "dotenv"
import { existsSync } from "fs"
import { join } from "path"

// __dirname is provided by the banner in the bundled output
declare const __dirname: string

/**
 * Loads the .env file from the dist directory (where binaries are located)
 * The .env file is optional - if it doesn't exist, environment variables won't be loaded
 */
export function loadEnvFile(): void {
	// In bundled output, __dirname points to the dist directory where index.js is located
	// The .env file should be in the same directory
	const envPath = join(__dirname, ".env")

	// Check if .env file exists - it's optional
	if (!existsSync(envPath)) {
		// .env file not found - this is OK, just skip loading
		return
	}

	// Load the .env file
	const result = config({ path: envPath })

	if (result.error) {
		console.error(`Warning: Error loading .env file: ${result.error.message}`)
		// Don't exit - .env is optional
	}
}
