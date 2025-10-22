/**
 * API Routes Aggregator
 *
 * This module serves as the central registry for all API routes. It imports route
 * modules from the routes/ directory and mounts them onto a single Express router.
 *
 * ⚠️  CRITICAL: ALWAYS UPDATE OPENAPI SPEC WHEN MODIFYING ENDPOINTS ⚠️
 *
 * When adding, modifying, or removing ANY endpoint in ANY router file:
 * 1. Update src/services/api-server/openapi.yaml
 * 2. Add/modify the corresponding path, parameters, request/response schemas
 * 3. Keep endpoint descriptions, examples, and error codes current
 * 4. Update the endpoint count below if adding/removing routes
 *
 * The OpenAPI spec is the source of truth for API consumers!
 * Outdated specs lead to broken integrations and frustrated users.
 *
 * Architecture:
 * - Each route module (tasks, files, mcp, etc.) exports a factory function
 * - Factory functions receive dependencies (ClineProvider, startTime, etc.)
 * - All routes are mounted under the same base path ("/")
 * - Individual modules define their own route prefixes (e.g., "/tasks", "/files")
 *
 * Route Registration Order:
 * The order of route registration matters! Routes are matched in order of registration.
 * More specific routes should be registered before generic ones to prevent conflicts.
 *
 * Current Endpoints by Module:
 * 1. Health (1 endpoint)       - GET /health - Server health check (no auth)
 * 2. State (1 endpoint)        - GET /state - Application state
 * 3. Tasks (14 endpoints)      - Task management and lifecycle
 * 4. Files (7 endpoints)       - File operations and search
 * 5. MCP (6 endpoints)         - MCP server integration
 * 6. Terminal (4 endpoints)    - Terminal operations
 * 7. CodeIndex (3 endpoints)   - Code search and indexing
 * 8. Settings (3 endpoints)    - Settings management
 * 9. Commands (6 endpoints)    - Slash command management
 * 10. Prompts (7 endpoints)    - Support prompt templates
 * 11. MemoryBank (9 endpoints) - Memory bank/rules management
 * 12. Todos (6 endpoints)      - TODO list management
 *
 * Total: 67 REST API endpoints
 */

import { Router } from "express"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import type { TaskExecutionPool } from "../TaskExecutionPool"

// tsoa-generated routes
import { RegisterRoutes } from "../generated/routes"
import { setProfilesControllerProvider } from "../controllers/ProfilesController"
import { setHealthControllerDeps } from "../controllers/HealthController"
import { setStateControllerProvider } from "../controllers/StateController"
import { setSettingsControllerProvider } from "../controllers/SettingsController"
import { setTerminalControllerProvider } from "../controllers/TerminalController"
import { setCodeIndexControllerProvider } from "../controllers/CodeIndexController"
import { setMcpControllerProvider } from "../controllers/McpController"
import { setFilesControllerProvider, setWorkspaceControllerProvider } from "../controllers/FilesController"
import { setCommandsControllerProvider } from "../controllers/CommandsController"
import { setPromptsControllerProvider } from "../controllers/PromptsController"
import { setTasksControllerProvider, setTasksControllerPool } from "../controllers/TasksController"
import { setMemoryBankControllerProvider } from "../controllers/MemoryBankController"
import { setTodoControllerProvider, setTodoControllerPool } from "../controllers/TodoController"

/**
 * Create and configure the main API router
 *
 * This function aggregates all route modules into a single router that can be
 * mounted at the API base path (typically /api/v1). Each module is responsible
 * for defining its own routes, and this function simply wires them together.
 *
 * @param provider - ClineProvider instance for accessing core functionality (legacy mode)
 * @param startTime - Server start timestamp for uptime calculations
 * @param getConnectionCount - Function to get current WebSocket connection count
 * @param port - Server port number
 * @param taskExecutionPool - Optional pool for parallel task execution
 * @returns Configured Express router with all API routes
 *
 * @example
 * ```typescript
 * const apiRoutes = createApiRoutes(provider, Date.now(), () => wsServer.getConnectionCount(), 3000, pool)
 * app.use('/api/v1', apiRoutes)
 * ```
 */
export function createApiRoutes(
	provider: ClineProvider,
	startTime: number,
	getConnectionCount: () => number,
	port: number,
	taskExecutionPool?: TaskExecutionPool,
): Router {
	const router = Router()

	// Initialize tsoa controllers with dependencies
	setProfilesControllerProvider(provider)
	setHealthControllerDeps({ startTime, getConnectionCount, port })
	setStateControllerProvider(provider)
	setSettingsControllerProvider(provider)
	setTerminalControllerProvider(provider)
	setCodeIndexControllerProvider(provider)
	setMcpControllerProvider(provider)
	setFilesControllerProvider(provider)
	setWorkspaceControllerProvider(provider)
	setCommandsControllerProvider(provider)
	setPromptsControllerProvider(provider)
	
	// Inject both provider (legacy) and pool (new parallel execution)
	setTasksControllerProvider(provider)
	if (taskExecutionPool) {
		setTasksControllerPool(taskExecutionPool)
	}
	
	setMemoryBankControllerProvider(provider)
	
	setTodoControllerProvider(provider)
	if (taskExecutionPool) {
		setTodoControllerPool(taskExecutionPool)
	}

	// Register tsoa-generated routes
	// All 67 REST API endpoints are now managed by tsoa controllers with auto-generated OpenAPI spec
	// Routes: /profiles, /health, /version, /state, /settings, /terminal, /codeindex, /mcp, /files, /workspace, /commands, /prompts, /tasks, /memory-bank, /todos
	RegisterRoutes(router)

	return router
}