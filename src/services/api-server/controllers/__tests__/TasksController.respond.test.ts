import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ClineProvider } from '../../../../core/webview/ClineProvider'
import { TasksController, setTasksControllerProvider } from '../TasksController'

describe('TasksController /respond endpoint', () => {
	let controller: TasksController
	let mockProvider: any
	let mockTask: any

	beforeEach(() => {
		// Reset mocks
		mockTask = {
			taskId: 'test-123',
			taskStatus: 'Resumable',
			handleWebviewAskResponse: vi.fn(),
			getTaskMode: vi.fn().mockResolvedValue('code'),
			api: {
				getModel: vi.fn().mockReturnValue({ id: 'claude-3-5-sonnet' })
			}
		}

		mockProvider = {
			ensureTaskIsCurrent: vi.fn().mockResolvedValue(mockTask),
			getCurrentTask: vi.fn().mockReturnValue(mockTask),
			getState: vi.fn().mockResolvedValue({
				apiConfiguration: {
					apiProvider: 'anthropic',
					apiModelId: 'claude-3-5-sonnet'
				},
				currentApiConfigName: 'default'
			})
		}

		setTasksControllerProvider(mockProvider as unknown as ClineProvider)
		controller = new TasksController()
	})

	it('should approve when response is "approve"', async () => {
		await controller.respondToTask('test-123', { response: 'approve' })

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'yesButtonClicked',
			undefined,
			[]
		)
	})

	it('should approve when response is "yes"', async () => {
		await controller.respondToTask('test-123', { response: 'yes' })

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'yesButtonClicked',
			undefined,
			[]
		)
	})

	it('should approve with case-insensitive matching', async () => {
		await controller.respondToTask('test-123', { response: 'APPROVE' })

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'yesButtonClicked',
			undefined,
			[]
		)
	})

	it('should deny when response is "deny"', async () => {
		await controller.respondToTask('test-123', { response: 'deny' })

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'noButtonClicked',
			undefined,
			[]
		)
	})

	it('should deny when response is "no"', async () => {
		await controller.respondToTask('test-123', { response: 'no' })

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'noButtonClicked',
			undefined,
			[]
		)
	})

	it('should send custom text for any other response', async () => {
		await controller.respondToTask('test-123', { 
			response: 'Use TypeScript with strict mode' 
		})

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'messageResponse',
			'Use TypeScript with strict mode',
			[]
		)
	})

	it('should include optional text with approval', async () => {
		await controller.respondToTask('test-123', { 
			response: 'approve',
			text: 'Proceed with caution'
		})

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'yesButtonClicked',
			'Proceed with caution',
			[]
		)
	})

	it('should include optional text with denial', async () => {
		await controller.respondToTask('test-123', { 
			response: 'deny',
			text: 'This file is protected'
		})

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'noButtonClicked',
			'This file is protected',
			[]
		)
	})

	it('should include optional images', async () => {
		const images = ['base64image1', 'base64image2']
		await controller.respondToTask('test-123', { 
			response: 'approve',
			images
		})

		expect(mockTask.handleWebviewAskResponse).toHaveBeenCalledWith(
			'yesButtonClicked',
			undefined,
			images
		)
	})
})