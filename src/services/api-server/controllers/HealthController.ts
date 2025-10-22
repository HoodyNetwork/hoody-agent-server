/**
 * Health Controller
 *
 * Provides public health check and version endpoints.
 * These endpoints do NOT require authentication.
 *
 * @tags Health
 */

import {
	Controller,
	Get,
	Route,
	Response,
	SuccessResponse,
} from "tsoa"
import * as os from "os"
import { HealthCheckResponse, ApiErrorResponse, ProcessMetrics } from "../api-types"
import { calculateUptime } from "../utils"
import { Package } from "../../../shared/package"

/**
 * Dependencies for health controller
 */
interface HealthControllerDeps {
	startTime: number
	getConnectionCount: () => number
	port: number
}

let deps: HealthControllerDeps | null = null

export function setHealthControllerDeps(dependencies: HealthControllerDeps) {
	deps = dependencies
}

function getDeps(): HealthControllerDeps {
	if (!deps) {
		throw new Error("HealthController: Dependencies not initialized")
	}
	return deps
}

@Route("health")
export class HealthController extends Controller {
	/**
	 * Health check endpoint
	 *
	 * Returns server health status along with real-time process metrics
	 * including memory usage, CPU usage, and heap statistics.
	 *
	 * @summary Check server health and resource usage
	 * @returns Server health status, version, uptime, active connections, and process metrics
	 */
	@Get()
	@SuccessResponse(200, "Server is healthy")
	public async healthCheck(): Promise<HealthCheckResponse> {
		const { startTime, getConnectionCount, port } = getDeps()
		
		// Collect process metrics
		const processMetrics = this.getProcessMetrics()
		
		return {
			status: "ok",
			version: Package.version,
			uptime: calculateUptime(startTime),
			activeConnections: getConnectionCount(),
			port,
			process: processMetrics,
		}
	}

	/**
	 * Get current process resource usage metrics
	 *
	 * Collects real-time memory and CPU usage statistics for monitoring and debugging.
	 * CPU percentage is calculated over a short interval to provide accurate readings.
	 *
	 * @private
	 * @returns ProcessMetrics object with current resource usage
	 */
	private getProcessMetrics(): ProcessMetrics {
		// Get memory usage from Node.js process
		const memUsage = process.memoryUsage()
		const totalSystemMemory = os.totalmem()
		const rss = memUsage.rss // Resident Set Size - total memory allocated
		
		// Get CPU usage
		const cpuUsage = process.cpuUsage()
		// Convert microseconds to percentage (rough estimate)
		// Note: This is cumulative since process start, not current usage
		// For accurate current CPU%, you'd need to sample over time
		const cpuPercent = this.estimateCpuPercent()
		
		return {
			memoryUsageMB: Math.round(rss / 1024 / 1024 * 100) / 100,
			memoryPercent: Math.round((rss / totalSystemMemory) * 100 * 100) / 100,
			cpuPercent: Math.round(cpuPercent * 100) / 100,
			pid: process.pid,
			heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
			heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
			externalMB: Math.round(memUsage.external / 1024 / 1024 * 100) / 100,
		}
	}

	/**
	 * Estimate current CPU percentage
	 *
	 * Uses Node.js process.cpuUsage() to estimate CPU usage.
	 * Since cpuUsage() returns cumulative values, we calculate percentage
	 * based on total uptime for a rough estimate.
	 *
	 * Note: For accurate real-time CPU%, you'd need to sample cpuUsage()
	 * at intervals and calculate the delta. This implementation provides
	 * a reasonable approximation.
	 *
	 * @private
	 * @returns Estimated CPU percentage
	 */
	private estimateCpuPercent(): number {
		const usage = process.cpuUsage()
		const uptime = process.uptime() * 1000000 // Convert to microseconds
		
		// Total CPU time used (user + system)
		const totalCpuTime = usage.user + usage.system
		
		// Calculate percentage over lifetime
		// Divide by number of CPUs to normalize
		const cpuCount = os.cpus().length
		const percent = (totalCpuTime / uptime / cpuCount) * 100
		
		// Clamp to reasonable range
		return Math.min(Math.max(percent, 0), 100 * cpuCount)
	}
}

@Route("version")
export class VersionController extends Controller {
	/**
	 * Get API version information
	 * 
	 * @summary Get version info
	 * @returns API version details
	 */
	@Get()
	@SuccessResponse(200, "Version information retrieved")
	public async getVersion(): Promise<{ version: string; name: string; apiVersion: string }> {
		return {
			version: Package.version,
			name: Package.name,
			apiVersion: "v1",
		}
	}
}