import { Controller, Get, Request, Route, Tags } from "tsoa"

/**
 * Represents a single log entry with timestamp and message
 * @example { "timestamp": "2023-10-27T10:00:00.000Z", "message": "User logged in" }
 */
export interface LogEntry {
	timestamp: string
	message: string
}

/**
 * Response containing log entries and buffer metadata
 */
interface LogsResponse {
	logs: LogEntry[]
	totalInBuffer: number
	maxBufferSize: number
}

/**
 * Controller for retrieving extension logs
 */
@Route("logs")
@Tags("Logs")
export class LogsController extends Controller {
	private static readonly DEFAULT_LINES = 100
	private static readonly MAX_LINES = 1000
	private static readonly MIN_LINES = 1

	/**
	 * Get recent logs from the output channel
	 *
	 * @param lines - Number of recent log lines to retrieve (default: 100, max: 1000, min: 1)
	 * @returns Recent log entries with timestamps
	 *
	 * @example lines "100"
	 */
	@Get()
	public async getLogs(@Request() req: any): Promise<LogsResponse> {
		// Parse and validate input with strict bounds
		let requestedLines = LogsController.DEFAULT_LINES

		const linesParam = req?.query?.lines as string | undefined
		if (typeof linesParam === "string") {
			const parsed = parseInt(linesParam, 10)

			// Validate: must be a valid positive number within bounds
			if (!isNaN(parsed) && parsed >= LogsController.MIN_LINES) {
				requestedLines = Math.min(parsed, LogsController.MAX_LINES)
			}
		}

		const logBuffer = (global as any).logBuffer

		if (!logBuffer) {
			throw new Error("Log buffer service not initialized")
		}

		const logs = logBuffer.getLastLines(requestedLines)
		const allLogs = logBuffer.getAllLogs()

		return {
			logs,
			totalInBuffer: allLogs.length,
			maxBufferSize: 1000, // This should match LogBufferService maxSize
		}
	}
}
