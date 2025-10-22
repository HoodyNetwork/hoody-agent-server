import { describe, it, expect } from 'vitest'
import { mapProfileFields } from '../field-mapper'

describe('mapProfileFields', () => {
	it('should map generic provider field to apiProvider', () => {
		const input = { provider: 'openrouter' }
		const output = mapProfileFields(input)
		expect(output).toEqual({ apiProvider: 'openrouter' })
		expect(output).not.toHaveProperty('provider')
	})

	it('should map generic model and apiKey for openrouter', () => {
		const input = {
			provider: 'openrouter',
			model: 'google/gemini-2.5-flash-lite',
			apiKey: 'sk-or-v1-xxx'
		}
		const output = mapProfileFields(input)
		expect(output).toEqual({
			apiProvider: 'openrouter',
			openRouterModelId: 'google/gemini-2.5-flash-lite',
			openRouterApiKey: 'sk-or-v1-xxx'
		})
		expect(output).not.toHaveProperty('provider')
		expect(output).not.toHaveProperty('model')
		expect(output).not.toHaveProperty('apiKey')
	})

	it('should map generic fields for anthropic', () => {
		const input = {
			provider: 'anthropic',
			model: 'claude-3-5-sonnet-20241022',
			apiKey: 'sk-ant-xxx'
		}
		const output = mapProfileFields(input)
		expect(output).toEqual({
			apiProvider: 'anthropic',
			apiModelId: 'claude-3-5-sonnet-20241022',
			apiKey: 'sk-ant-xxx'
		})
	})

	it('should map generic fields for openai', () => {
		const input = {
			provider: 'openai',
			model: 'gpt-4',
			apiKey: 'sk-xxx'
		}
		const output = mapProfileFields(input)
		expect(output).toEqual({
			apiProvider: 'openai',
			openAiModelId: 'gpt-4',
			openAiApiKey: 'sk-xxx'
		})
	})

	it('should not override existing provider-specific fields', () => {
		const input = {
			provider: 'openrouter',
			apiProvider: 'anthropic', // Existing specific field takes precedence
			model: 'google/gemini-2.5-flash-lite',
			openRouterModelId: 'existing-model' // Existing specific field
		}
		const output = mapProfileFields(input)
		expect(output.apiProvider).toBe('anthropic') // Original specific field preserved
		expect(output.openRouterModelId).toBe('existing-model') // Original specific field preserved
		expect(output).not.toHaveProperty('provider')
		expect(output).not.toHaveProperty('model')
	})

	it('should handle mixed generic and specific fields', () => {
		const input = {
			provider: 'openrouter',
			model: 'google/gemini-2.5-flash-lite',
			diffEnabled: true,
			fuzzyMatchThreshold: 0.8
		}
		const output = mapProfileFields(input)
		expect(output).toEqual({
			apiProvider: 'openrouter',
			openRouterModelId: 'google/gemini-2.5-flash-lite',
			diffEnabled: true,
			fuzzyMatchThreshold: 0.8
		})
	})

	it('should preserve all other fields unchanged', () => {
		const input = {
			provider: 'openrouter',
			model: 'test-model',
			apiKey: 'test-key',
			rateLimitSeconds: 5,
			customField: 'custom-value',
			nestedObject: { key: 'value' }
		}
		const output = mapProfileFields(input)
		expect(output.rateLimitSeconds).toBe(5)
		expect(output.customField).toBe('custom-value')
		expect(output.nestedObject).toEqual({ key: 'value' })
	})

	it('should handle providers without apiKey requirements', () => {
		const input = {
			provider: 'lmstudio',
			model: 'local-model'
		}
		const output = mapProfileFields(input)
		expect(output).toEqual({
			apiProvider: 'lmstudio',
			lmStudioModelId: 'local-model'
		})
	})

	it('should handle hoodycode provider with specific field names', () => {
		const input = {
			provider: 'hoodycode',
			model: 'google/gemini-2.5-flash',
			apiKey: 'hoody-token-xxx'
		}
		const output = mapProfileFields(input)
		expect(output).toEqual({
			apiProvider: 'hoodycode',
			hoodycodeModel: 'google/gemini-2.5-flash',
			hoodycodeToken: 'hoody-token-xxx'
		})
	})

	it('should return unchanged object if no provider is specified', () => {
		const input = {
			model: 'some-model',
			apiKey: 'some-key',
			diffEnabled: true
		}
		const output = mapProfileFields(input)
		expect(output).toEqual(input)
	})

	it('should handle empty object', () => {
		const input = {}
		const output = mapProfileFields(input)
		expect(output).toEqual({})
	})
})