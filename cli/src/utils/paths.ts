import * as crypto from "crypto"
import * as path from "path"
import * as fs from "fs"
import * as os from "os"

/**
 * Centralized path management for Hoody Code CLI
 * Storage is isolated per port for multi-instance support
 */
export class HoodyCodePaths {
	private static readonly WORKSPACE_MAP_FILE = "workspace-map.json"
	
	// Allow custom storage directory via environment variable or parameter
	private static customStorageDir: string | undefined
	private static currentPort: number | undefined

	/**
	 * Set custom storage directory (overrides default)
	 */
	static setStorageDir(dir: string): void {
		this.customStorageDir = dir
	}

	/**
	 * Set current port for port-based isolation
	 */
	static setPort(port: number): void {
		this.currentPort = port
	}

	/**
	 * Get OS-specific default storage directory
	 * - Windows: %LOCALAPPDATA%\hoodycode
	 * - macOS: ~/Library/Application Support/hoodycode
	 * - Linux: ~/.local/share/hoodycode
	 */
	private static getOsDefaultStorageDir(): string {
		const homeDir = os.homedir()
		
		switch (process.platform) {
			case "win32":
				// Windows: Use LOCALAPPDATA (e.g., C:\Users\username\AppData\Local\hoodycode)
				return process.env.LOCALAPPDATA
					? path.join(process.env.LOCALAPPDATA, "hoodycode")
					: path.join(homeDir, "AppData", "Local", "hoodycode")
			
			case "darwin":
				// macOS: Use Application Support (e.g., ~/Library/Application Support/hoodycode)
				return path.join(homeDir, "Library", "Application Support", "hoodycode")
			
			default:
				// Linux/Unix: Use XDG Base Directory spec (e.g., ~/.local/share/hoodycode)
				return process.env.XDG_DATA_HOME
					? path.join(process.env.XDG_DATA_HOME, "hoodycode")
					: path.join(homeDir, ".local", "share", "hoodycode")
		}
	}

	/**
	 * Get base storage directory
	 * Priority: custom > environment > OS-specific default
	 */
	static getBaseStorageDir(): string {
		if (this.customStorageDir) {
			return this.customStorageDir
		}
		if (process.env.HOODYCODE_STORAGE_DIR) {
			return process.env.HOODYCODE_STORAGE_DIR
		}
		return this.getOsDefaultStorageDir()
	}

	/**
	 * Get port-specific instance directory
	 * Each port gets its own isolated storage
	 */
	static getInstanceDir(): string {
		const baseDir = this.getBaseStorageDir()
		if (this.currentPort) {
			return path.join(baseDir, "instances", `port-${this.currentPort}`)
		}
		// Fallback for CLI mode (no port)
		return path.join(baseDir, "instances", "cli")
	}

	/**
	 * Get shared config directory (not port-isolated)
	 * Config is shared across all instances
	 */
	static getConfigDir(): string {
		return this.getBaseStorageDir()
	}

	/**
	 * Get logs directory (port-isolated)
	 */
	static getLogsDir(): string {
		return path.join(this.getInstanceDir(), "logs")
	}

	/**
	 * Get global storage directory (port-isolated)
	 */
	static getGlobalStorageDir(): string {
		return path.join(this.getInstanceDir(), "global")
	}

	/**
	 * Get workspaces base directory (port-isolated)
	 */
	static getWorkspacesDir(): string {
		return path.join(this.getInstanceDir(), "workspaces")
	}

	/**
	 * Generate a deterministic 8-character hash for a workspace path
	 */
	static getWorkspaceHash(workspacePath: string): string {
		const absolutePath = path.resolve(workspacePath)
		const hash = crypto.createHash("sha256").update(absolutePath).digest("hex")
		return hash.substring(0, 8)
	}

	/**
	 * Sanitize workspace name for filesystem use
	 * - Convert to lowercase
	 * - Replace spaces and special chars with hyphens
	 * - Remove consecutive hyphens
	 * - Limit to 32 characters
	 */
	static sanitizeWorkspaceName(workspacePath: string): string {
		const basename = path.basename(workspacePath)

		// Convert to lowercase and replace non-alphanumeric chars with hyphens
		let sanitized = basename
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
			.replace(/-+/g, "-") // Replace consecutive hyphens with single hyphen

		// Limit length
		if (sanitized.length > 32) {
			sanitized = sanitized.substring(0, 32)
		}

		// Ensure it's not empty
		if (!sanitized) {
			sanitized = "workspace"
		}

		return sanitized
	}

	/**
	 * Get workspace folder name in format: {sanitized-name}-{hash}
	 */
	static getWorkspaceFolderName(workspacePath: string): string {
		const sanitizedName = this.sanitizeWorkspaceName(workspacePath)
		const hash = this.getWorkspaceHash(workspacePath)
		return `${sanitizedName}-${hash}`
	}

	/**
	 * Get workspace storage directory for a specific workspace
	 */
	static getWorkspaceStorageDir(workspacePath: string): string {
		const folderName = this.getWorkspaceFolderName(workspacePath)
		return path.join(this.getWorkspacesDir(), folderName)
	}

	/**
	 * Ensure a directory exists, creating it if necessary
	 */
	static ensureDirectoryExists(dirPath: string): void {
		try {
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true })
			}
		} catch {
			// Silent fail - let the calling code handle errors
		}
	}

	/**
	 * Get the workspace map file path
	 */
	private static getWorkspaceMapPath(): string {
		return path.join(this.getWorkspacesDir(), this.WORKSPACE_MAP_FILE)
	}

	/**
	 * Load workspace map (maps absolute paths to folder names)
	 */
	static getWorkspaceMap(): Record<string, string> {
		try {
			const mapPath = this.getWorkspaceMapPath()
			if (fs.existsSync(mapPath)) {
				const content = fs.readFileSync(mapPath, "utf-8")
				return JSON.parse(content)
			}
		} catch {
			// Return empty map on error
		}
		return {}
	}

	/**
	 * Update workspace map with a new workspace entry
	 */
	static updateWorkspaceMap(workspacePath: string, folderName: string): void {
		try {
			const absolutePath = path.resolve(workspacePath)
			const map = this.getWorkspaceMap()
			map[absolutePath] = folderName

			// Ensure workspaces directory exists
			this.ensureDirectoryExists(this.getWorkspacesDir())

			// Save updated map
			const mapPath = this.getWorkspaceMapPath()
			fs.writeFileSync(mapPath, JSON.stringify(map, null, 2))
		} catch {
			// Silent fail - map is optional
		}
	}

	/**
	 * Initialize all required directories for a workspace
	 */
	static initializeWorkspace(workspacePath: string): void {
		// Ensure base directories exist
		this.ensureDirectoryExists(this.getBaseStorageDir())
		this.ensureDirectoryExists(this.getConfigDir())
		this.ensureDirectoryExists(this.getInstanceDir())
		this.ensureDirectoryExists(this.getLogsDir())
		this.ensureDirectoryExists(this.getGlobalStorageDir())
		this.ensureDirectoryExists(this.getWorkspacesDir())

		// Ensure workspace-specific directory exists
		const workspaceDir = this.getWorkspaceStorageDir(workspacePath)
		this.ensureDirectoryExists(workspaceDir)

		// Update workspace map
		const folderName = this.getWorkspaceFolderName(workspacePath)
		this.updateWorkspaceMap(workspacePath, folderName)
	}
}
