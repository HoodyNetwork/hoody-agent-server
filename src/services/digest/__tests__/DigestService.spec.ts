/**
 * DigestService Tests
 * 
 * Tests for the Agent Digest feature which provides ultra-compact
 * LLM-generated message summaries for tiny UI contexts.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { DigestService } from "../DigestService"
import { ClineMessage } from "@roo-code/types"
import { ContextProxy } from "../../../core/config/ContextProxy"

// Mock ContextProxy
vi.mock("../../../core/config/ContextProxy")

// Mock buildApiHandler
vi.mock("../../../api", () => ({
	buildApiHandler: vi.fn(() => ({
		createMessage: vi.fn(),
		getModel: vi.fn(() => ({
			id: "test-model",
			info: { contextWindow: 100000 }
		})),
		countTokens: vi.fn(() => Promise.resolve(100)),
	})),
}))

describe("DigestService", () => {
	let digestService: DigestService
	let mockContextProxy: any
	let mockProvider: any

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()

		// Create mock context proxy
		mockContextProxy = {
			getValue: vi.fn((key: string) => {
				switch (key) {
					case "digestEnabled":
						return true
					case "digestProfileId":
						return "test-profile"
					case "autoDigestEnabled":
						return true
					case "digestMaxLength":
						return 200
					case "customDigestPrompt":
						return undefined
					case "digestTaskOverrides":
						return {}
					case "listApiConfigMeta":
						return [{
							id: "test-profile",
							name: "Test Profile",
							apiProvider: "openrouter",
							openRouterModelId: "test-model"
						}]
					default:
						return undefined
				}
			}),
		}

		// Create mock provider
		mockProvider = {
			providerSettingsManager: {
				getProfile: vi.fn(async ({ id }: { id: string }) => {
					if (id === "test-profile") {
						return {
							id: "test-profile",
							name: "Test Profile",
							apiProvider: "openrouter",
							openRouterModelId: "test-model",
							openRouterApiKey: "test-key"
						}
					}
					throw new Error(`Profile ${id} not found`)
				}),
			},
		}

		digestService = new DigestService(mockContextProxy as any, mockProvider as any)
	})

	describe("digestMessage", () => {
		it("should generate digest for text message", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "This is a long message that needs to be digested into a short summary for notifications and compact views.",
			}

			// Mock LLM response
			const mockDigest = "Long message needs digest for compact views"
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: mockDigest }
			})())

			const result = await digestService.digestMessage(message)

			expect(result.digest).toBe(mockDigest)
			expect(result.cached).toBe(false)
			expect(result.metadata).toBeDefined()
			expect(result.metadata?.profileId).toBe("test-profile")
			expect(result.metadata?.maxLength).toBe(200)
		})

		it("should use cache for repeated digest requests", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test message",
			}

			const mockDigest = "Test digest"
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: mockDigest }
			})())

			// First call
			const result1 = await digestService.digestMessage(message)
			expect(result1.cached).toBe(false)

			// Second call (should use cache)
			const result2 = await digestService.digestMessage(message)
			expect(result2.cached).toBe(true)
			expect(result2.digest).toBe(mockDigest)
			
			// Verify LLM was only called once
			expect(mockHandler.createMessage).toHaveBeenCalledTimes(1)
		})

		it("should respect force parameter to bypass cache", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test message",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Digest" }
			})())

			// First call
			await digestService.digestMessage(message)

			// Second call with force=true
			const result = await digestService.digestMessage(message, { force: true })
			expect(result.cached).toBe(false)
			
			// Verify LLM was called twice
			expect(mockHandler.createMessage).toHaveBeenCalledTimes(2)
		})

		it("should respect maxLength parameter", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test",
			}

			const mockLongDigest = "This is a very long digest that exceeds the maximum length and should be truncated"
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: mockLongDigest }
			})())

			const result = await digestService.digestMessage(message, { maxLength: 50 })

			expect(result.digest.length).toBeLessThanOrEqual(50)
			expect(result.digest).toContain("...")
		})

		it("should throw error if no profile configured", async () => {
			mockContextProxy.getValue.mockReturnValue(undefined)

			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test",
			}

			await expect(digestService.digestMessage(message)).rejects.toThrow(
				"No digest profile configured"
			)
		})

		it("should throw error if profile not found", async () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestProfileId") return "nonexistent-profile"
				if (key === "listApiConfigMeta") return []
				return undefined
			})

			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test",
			}

			await expect(digestService.digestMessage(message)).rejects.toThrow(
				'Digest profile "nonexistent-profile" not found'
			)
		})

		it("should handle empty LLM response", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "   " } // Whitespace only
			})())

			await expect(digestService.digestMessage(message)).rejects.toThrow(
				"LLM returned empty digest"
			)
		})
	})

	describe("extractToolSummary", () => {
		it("should extract summary from newFileCreated tool", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "ask",
				ask: "tool",
				text: JSON.stringify({
					tool: "newFileCreated",
					path: "app.ts"
				}),
			}

			const mockDigest = "Created app.ts"
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: mockDigest }
			})())

			const result = await digestService.digestMessage(message)
			expect(result.digest).toBe(mockDigest)
		})

		it("should extract summary from appliedDiff tool", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "ask",
				ask: "tool",
				text: JSON.stringify({
					tool: "appliedDiff",
					path: "utils.ts"
				}),
			}

			const mockDigest = "Modified utils.ts"
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: mockDigest }
			})())

			const result = await digestService.digestMessage(message)
			expect(result.digest).toBe(mockDigest)
		})

		it("should extract summary from executeCommand tool", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "ask",
				ask: "tool",
				text: JSON.stringify({
					tool: "executeCommand",
					command: "npm test"
				}),
			}

			const mockDigest = "Ran: npm test"
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: mockDigest }
			})())

			const result = await digestService.digestMessage(message)
			expect(result.digest).toBe(mockDigest)
		})
	})

	describe("cache management", () => {
		it("should clear cache", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Digest" }
			})())

			// Generate digest (gets cached)
			await digestService.digestMessage(message)

			// Clear cache
			digestService.clearCache()

			// Next call should not use cache
			const result = await digestService.digestMessage(message)
			expect(result.cached).toBe(false)
			expect(mockHandler.createMessage).toHaveBeenCalledTimes(2)
		})

		it("should return cache stats", async () => {
			const stats = digestService.getCacheStats()
			expect(stats).toHaveProperty("size")
			expect(stats).toHaveProperty("maxSize")
			expect(stats.maxSize).toBe(1000)
		})
	})

	describe("settings checks", () => {
		it("isEnabled should return true when digestEnabled is true", () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestEnabled") return true
				return undefined
			})

			expect(digestService.isEnabled()).toBe(true)
		})

		it("isEnabled should return false when digestEnabled is false", () => {
			mockContextProxy.getValue.mockReturnValue(false)

			expect(digestService.isEnabled()).toBe(false)
		})

		it("isAutoDigestEnabled should return true when both flags are true", () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestEnabled") return true
				if (key === "autoDigestEnabled") return true
				return undefined
			})

			expect(digestService.isAutoDigestEnabled()).toBe(true)
		})

		it("isAutoDigestEnabled should return false when digestEnabled is false", () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestEnabled") return false
				if (key === "autoDigestEnabled") return true
				return undefined
			})

			expect(digestService.isAutoDigestEnabled()).toBe(false)
		})

		it("isEnabledForTask should check task overrides", () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestEnabled") return true
				if (key === "autoDigestEnabled") return true
				if (key === "digestTaskOverrides") {
					return {
						"task-123": { enabled: false },
						"task-456": { enabled: true }
					}
				}
				return undefined
			})

			expect(digestService.isEnabledForTask("task-123")).toBe(false)
			expect(digestService.isEnabledForTask("task-456")).toBe(true)
			expect(digestService.isEnabledForTask("task-789")).toBe(true) // Falls back to auto
		})

		it("getTaskSettings should return merged settings", () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestEnabled") return true
				if (key === "digestMaxLength") return 200
				if (key === "digestProfileId") return "global-profile"
				if (key === "digestTaskOverrides") {
					return {
						"task-123": {
							enabled: true,
							maxLength: 50,
							profileId: "task-profile"
						}
					}
				}
				return undefined
			})

			const settings = digestService.getTaskSettings("task-123")

			expect(settings.enabled).toBe(true)
			expect(settings.maxLength).toBe(50)
			expect(settings.profileId).toBe("task-profile")
		})

		it("getTaskSettings should use global defaults for task without override", () => {
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "digestEnabled") return true
				if (key === "digestMaxLength") return 150
				if (key === "digestProfileId") return "global-profile"
				if (key === "digestTaskOverrides") return {}
				if (key === "autoDigestEnabled") return true
				return undefined
			})

			const settings = digestService.getTaskSettings("task-no-override")

			expect(settings.enabled).toBe(true)
			expect(settings.maxLength).toBe(150)
			expect(settings.profileId).toBe("global-profile")
		})
	})

	describe("content extraction", () => {
		it("should handle error messages", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "error",
				text: "Something went wrong",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Error occurred" }
			})())

			const result = await digestService.digestMessage(message)
			expect(result.digest).toBeDefined()
		})

		it("should handle command output messages", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "command_output",
				text: "npm test output...",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Test output" }
			})())

			const result = await digestService.digestMessage(message)
			expect(result.digest).toBeDefined()
		})

		it("should handle completion result messages", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "completion_result",
				text: "Task completed successfully",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Completed successfully" }
			})())

			const result = await digestService.digestMessage(message)
			expect(result.digest).toBeDefined()
		})

		it("should handle invalid tool JSON gracefully", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "ask",
				ask: "tool",
				text: "invalid json{",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Tool action" }
			})())

			// Should not throw - should handle gracefully
			const result = await digestService.digestMessage(message)
			expect(result.digest).toBeDefined()
		})
	})

	describe("custom prompt", () => {
		it("should use custom digest prompt from settings", async () => {
			const customPrompt = "Custom prompt with {maxLength} and {content}"
			mockContextProxy.getValue.mockImplementation((key: string) => {
				if (key === "customDigestPrompt") return customPrompt
				if (key === "digestProfileId") return "test-profile"
				if (key === "digestMaxLength") return 100
				if (key === "listApiConfigMeta") return [{
					id: "test-profile",
					apiProvider: "openrouter"
				}]
				return undefined
			})

			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test message",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Custom digest" }
			})())

			await digestService.digestMessage(message)

			// Verify the custom prompt was used (check the call args)
			const callArgs = mockHandler.createMessage.mock.calls[0]
			expect(callArgs[1][0].content[0].text).toContain("Custom prompt")
		})

		it("should allow custom prompt via options parameter", async () => {
			const message: ClineMessage = {
				ts: 1700000000000,
				type: "say",
				say: "text",
				text: "Test",
			}

			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			mockHandler.createMessage.mockReturnValue((async function* () {
				yield { type: "text", text: "Option digest" }
			})())

			await digestService.digestMessage(message, {
				customPrompt: "Option-level custom prompt"
			})

			const callArgs = mockHandler.createMessage.mock.calls[0]
			expect(callArgs[1][0].content[0].text).toBe("Option-level custom prompt")
		})
	})

	describe("LRU cache eviction", () => {
		it("should evict oldest entry when cache is full", async () => {
			const { buildApiHandler } = await import("../../../api")
			const mockHandler = (buildApiHandler as any)()
			
			// Generate 1001 digests to trigger eviction
			for (let i = 0; i < 1001; i++) {
				const message: ClineMessage = {
					ts: 1700000000000 + i,
					type: "say",
					say: "text",
					text: `Message ${i}`,
				}

				mockHandler.createMessage.mockReturnValue((async function* () {
					yield { type: "text", text: `Digest ${i}` }
				})())

				await digestService.digestMessage(message)
			}

			const stats = digestService.getCacheStats()
			expect(stats.size).toBeLessThanOrEqual(1000)
		})
	})

	describe("different message types", () => {
		const testCases = [
			{
				type: "text message",
				message: {
					ts: 1700000000000,
					type: "say" as const,
					say: "text" as const,
					text: "Regular text message",
				}
			},
			{
				type: "error message",
				message: {
					ts: 1700000000000,
					type: "say" as const,
					say: "error" as const,
					text: "Error occurred",
				}
			},
			{
				type: "api_req_started message",
				message: {
					ts: 1700000000000,
					type: "say" as const,
					say: "api_req_started" as const,
					text: "{}",
				}
			},
		]

		testCases.forEach(({ type, message }) => {
			it(`should handle ${type}`, async () => {
				const { buildApiHandler } = await import("../../../api")
				const mockHandler = (buildApiHandler as any)()
				mockHandler.createMessage.mockReturnValue((async function* () {
					yield { type: "text", text: "Digest" }
				})())

				const result = await digestService.digestMessage(message as ClineMessage)
				expect(result.digest).toBeDefined()
				expect(result.digest.length).toBeGreaterThan(0)
			})
		})
	})
})