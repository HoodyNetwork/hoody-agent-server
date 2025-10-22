import * as vscode from "vscode"

/**
 * Service that buffers log messages and provides access to recent logs
 */
export class LogBufferService implements vscode.OutputChannel {
	private buffer: string[] = []
	private maxBufferSize: number
	private innerChannel: vscode.OutputChannel

	// Implement OutputChannel properties
	public readonly name: string

	constructor(innerChannel: vscode.OutputChannel, maxBufferSize: number = 1000) {
		this.innerChannel = innerChannel
		this.maxBufferSize = maxBufferSize
		this.name = innerChannel.name
	}

	// Implement OutputChannel methods
	append(value: string): void {
		this.addToBuffer(value)
		this.innerChannel.append(value)
	}

	appendLine(value: string): void {
		this.addToBuffer(value + "\n")
		this.innerChannel.appendLine(value)
	}

	clear(): void {
		this.buffer = []
		this.innerChannel.clear()
	}

	show(preserveFocus?: boolean): void
	show(column?: vscode.ViewColumn, preserveFocus?: boolean): void
	show(columnOrPreserveFocus?: vscode.ViewColumn | boolean, preserveFocus?: boolean): void {
		if (typeof columnOrPreserveFocus === "boolean") {
			this.innerChannel.show(columnOrPreserveFocus)
		} else {
			this.innerChannel.show(columnOrPreserveFocus, preserveFocus)
		}
	}

	hide(): void {
		this.innerChannel.hide()
	}

	dispose(): void {
		this.buffer = []
		this.innerChannel.dispose()
	}

	replace(value: string): void {
		this.buffer = []
		this.addToBuffer(value)
		this.innerChannel.replace(value)
	}

	// Buffer management methods
	private addToBuffer(value: string): void {
		// Split by lines and add each line to buffer
		const lines = value.split("\n").filter((line) => line.length > 0)

		for (const line of lines) {
			this.buffer.push(line)

			// Maintain max buffer size
			if (this.buffer.length > this.maxBufferSize) {
				this.buffer.shift()
			}
		}
	}

	/**
	 * Get recent log entries from the buffer
	 * @param count Number of recent entries to retrieve
	 * @returns Array of recent log entries
	 */
	public getRecentLogs(count?: number): string[] {
		if (!count || count >= this.buffer.length) {
			return [...this.buffer]
		}

		return this.buffer.slice(-count)
	}

	/**
	 * Get all buffered logs as a single string
	 * @returns All buffered logs joined with newlines
	 */
	public getAllLogs(): string {
		return this.buffer.join("\n")
	}

	/**
	 * Get the current buffer size
	 * @returns Number of log entries in the buffer
	 */
	public getBufferSize(): number {
		return this.buffer.length
	}

	/**
	 * Search for logs containing specific text
	 * @param searchText Text to search for
	 * @param caseSensitive Whether the search should be case sensitive
	 * @returns Array of matching log entries
	 */
	public searchLogs(searchText: string, caseSensitive: boolean = false): string[] {
		const searchStr = caseSensitive ? searchText : searchText.toLowerCase()

		return this.buffer.filter((log) => {
			const logStr = caseSensitive ? log : log.toLowerCase()
			return logStr.includes(searchStr)
		})
	}

	/**
	 * Get logs within a specific time range (if timestamps are included in logs)
	 * @param startTime Start time for filtering
	 * @param endTime End time for filtering
	 * @returns Array of log entries within the time range
	 */
	public getLogsInTimeRange(startTime: Date, endTime: Date): string[] {
		// This assumes logs have timestamps in ISO format at the beginning
		// Format: "2024-01-01T00:00:00.000Z: log message"
		const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/

		return this.buffer.filter((log) => {
			const match = log.match(isoRegex)
			if (!match) return false

			const logTime = new Date(match[0])
			return logTime >= startTime && logTime <= endTime
		})
	}

	/**
	 * Clear the buffer while keeping the output channel content
	 */
	public clearBuffer(): void {
		this.buffer = []
	}

	/**
	 * Export logs to a string for saving or analysis
	 * @param format Format for export (json, text)
	 * @returns Formatted log string
	 */
	public exportLogs(format: "json" | "text" = "text"): string {
		if (format === "json") {
			return JSON.stringify(
				{
					timestamp: new Date().toISOString(),
					logCount: this.buffer.length,
					logs: this.buffer,
				},
				null,
				2,
			)
		}

		return this.getAllLogs()
	}
}
