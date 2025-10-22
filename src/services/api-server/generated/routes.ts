/* tslint:disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from "@tsoa/runtime"
import { fetchMiddlewares, ExpressTemplateService } from "@tsoa/runtime"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TodoController } from "./../controllers/TodoController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TerminalController } from "./../controllers/TerminalController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TasksController } from "./../controllers/TasksController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { StateController } from "./../controllers/StateController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SettingsController } from "./../controllers/SettingsController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SchemasController } from "./../controllers/SchemasController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PromptsController } from "./../controllers/PromptsController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProfilesController } from "./../controllers/ProfilesController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MemoryBankController } from "./../controllers/MemoryBankController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { McpController } from "./../controllers/McpController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LogsController } from "./../controllers/LogsController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from "./../controllers/HealthController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VersionController } from "./../controllers/HealthController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FilesController } from "./../controllers/FilesController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WorkspaceController } from "./../controllers/FilesController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DocsController } from "./../controllers/DocsController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CommandsController } from "./../controllers/CommandsController"
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CodeIndexController } from "./../controllers/CodeIndexController"
import { expressAuthentication } from "./../auth-middleware"
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from "express"

const expressAuthenticationRecasted = expressAuthentication as (
	req: ExRequest,
	securityName: string,
	scopes?: string[],
	res?: ExResponse,
) => Promise<any>

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
	TodoStatus: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ dataType: "enum", enums: ["pending"] },
				{ dataType: "enum", enums: ["in_progress"] },
				{ dataType: "enum", enums: ["completed"] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TodoItem: {
		dataType: "refObject",
		properties: {
			id: { dataType: "string", required: true },
			content: { dataType: "string", required: true },
			status: { ref: "TodoStatus", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TodoListResponse: {
		dataType: "refObject",
		properties: {
			taskId: { dataType: "string", required: true },
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
			count: { dataType: "double", required: true },
			stats: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					pending: { dataType: "double", required: true },
					inProgress: { dataType: "double", required: true },
					completed: { dataType: "double", required: true },
					total: { dataType: "double", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ApiErrorResponse: {
		dataType: "refObject",
		properties: {
			error: { dataType: "string", required: true },
			message: { dataType: "string" },
			code: { dataType: "string" },
			statusCode: { dataType: "double" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateTodoResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			todo: { ref: "TodoItem", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateTodoRequest: {
		dataType: "refObject",
		properties: {
			content: { dataType: "string", required: true },
			status: { ref: "TodoStatus" },
			position: { dataType: "double" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateTodoResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			todo: { ref: "TodoItem", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateTodoRequest: {
		dataType: "refObject",
		properties: {
			content: { dataType: "string" },
			status: { ref: "TodoStatus" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BulkUpdateTodosResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BulkUpdateTodosRequest: {
		dataType: "refObject",
		properties: {
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ImportTodosResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ImportTodosRequest: {
		dataType: "refObject",
		properties: {
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExportTodosResponse: {
		dataType: "refObject",
		properties: {
			taskId: { dataType: "string", required: true },
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
			count: { dataType: "double", required: true },
			stats: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					pending: { dataType: "double", required: true },
					inProgress: { dataType: "double", required: true },
					completed: { dataType: "double", required: true },
					total: { dataType: "double", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExecuteCommandResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExecuteCommandRequest: {
		dataType: "refObject",
		properties: {
			command: { dataType: "string", required: true },
			cwd: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TerminalInfoResponse: {
		dataType: "refObject",
		properties: {
			outputLineLimit: { dataType: "double" },
			outputCharacterLimit: { dataType: "double" },
			shellIntegrationTimeout: { dataType: "double" },
			shellIntegrationDisabled: { dataType: "boolean" },
			commandDelay: { dataType: "double" },
			compressProgressBar: { dataType: "boolean" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskContext: {
		dataType: "refObject",
		properties: {
			mode: { dataType: "string" },
			modelId: { dataType: "string" },
			modelProvider: { dataType: "string" },
			profileName: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateTaskResponse: {
		dataType: "refObject",
		properties: {
			taskId: { dataType: "string", required: true },
			status: { dataType: "string", required: true },
			context: { ref: "TaskContext" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateTaskRequest: {
		dataType: "refObject",
		properties: {
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
			mode: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskHierarchyMetadata: {
		dataType: "refObject",
		properties: {
			isFork: { dataType: "boolean", required: true },
			isSubtask: { dataType: "boolean", required: true },
			isRootTask: { dataType: "boolean", required: true },
			subtaskDepth: { dataType: "double", required: true },
			fork: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					forkTimestamp: { dataType: "double", required: true },
					forkFromMessageTs: { dataType: "double", required: true },
					sourceTaskId: { dataType: "string", required: true },
				},
			},
			subtask: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					rootTaskId: { dataType: "string", required: true },
					parentTaskId: { dataType: "string", required: true },
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	HistoryItemWithMetadata: {
		dataType: "refObject",
		properties: {
			id: { dataType: "string", required: true },
			rootTaskId: { dataType: "string" },
			parentTaskId: { dataType: "string" },
			number: { dataType: "double", required: true },
			ts: { dataType: "double", required: true },
			task: { dataType: "string", required: true },
			tokensIn: { dataType: "double", required: true },
			tokensOut: { dataType: "double", required: true },
			cacheWrites: { dataType: "double" },
			cacheReads: { dataType: "double" },
			totalCost: { dataType: "double", required: true },
			contextTokens: { dataType: "double" },
			size: { dataType: "double" },
			workspace: { dataType: "string" },
			isFavorited: { dataType: "boolean" },
			fileNotfound: { dataType: "boolean" },
			mode: { dataType: "string" },
			modelId: { dataType: "string" },
			modelProvider: { dataType: "string" },
			profileName: { dataType: "string" },
			sourceTaskId: { dataType: "string" },
			forkFromMessageTs: { dataType: "double" },
			forkTimestamp: { dataType: "double" },
			status: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["running"] },
					{ dataType: "enum", enums: ["interactive"] },
					{ dataType: "enum", enums: ["resumable"] },
					{ dataType: "enum", enums: ["idle"] },
					{ dataType: "enum", enums: ["completed"] },
				],
			},
			hierarchy: { ref: "TaskHierarchyMetadata" },
			lastMessage: {
				dataType: "nestedObjectLiteral",
				nestedProperties: { parsed: { dataType: "any" }, raw: { dataType: "any" } },
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskListResponse: {
		dataType: "refObject",
		properties: {
			data: {
				dataType: "array",
				array: { dataType: "refObject", ref: "HistoryItemWithMetadata" },
				required: true,
			},
			pagination: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					hasPrev: { dataType: "boolean", required: true },
					hasNext: { dataType: "boolean", required: true },
					totalPages: { dataType: "double", required: true },
					total: { dataType: "double", required: true },
					limit: { dataType: "double", required: true },
					page: { dataType: "double", required: true },
				},
				required: true,
			},
			links: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					last: { dataType: "string", required: true },
					first: { dataType: "string", required: true },
					prev: {
						dataType: "union",
						subSchemas: [{ dataType: "string" }, { dataType: "enum", enums: [null] }],
						required: true,
					},
					next: {
						dataType: "union",
						subSchemas: [{ dataType: "string" }, { dataType: "enum", enums: [null] }],
						required: true,
					},
					self: { dataType: "string", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ClineMessage: {
		dataType: "refAlias",
		type: {
			dataType: "nestedObjectLiteral",
			nestedProperties: {
				metadata: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								general: {
									dataType: "union",
									subSchemas: [
										{
											dataType: "nestedObjectLiteral",
											nestedProperties: {
												cumulativeTokensOut: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												cumulativeTokensIn: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												cumulativeCost: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												cost: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												cacheReads: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												cacheWrites: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												tokensOut: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												tokensIn: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												mode: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												profileId: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												profileName: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												provider: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												modelId: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
											},
										},
										{ dataType: "undefined" },
									],
								},
								hoodyCode: {
									dataType: "union",
									subSchemas: [
										{
											dataType: "nestedObjectLiteral",
											nestedProperties: {
												commitRange: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "nestedObjectLiteral",
															nestedProperties: {
																to: { dataType: "string", required: true },
																fromTimeStamp: {
																	dataType: "union",
																	subSchemas: [
																		{ dataType: "double" },
																		{ dataType: "undefined" },
																	],
																},
																from: { dataType: "string", required: true },
															},
														},
														{ dataType: "undefined" },
													],
												},
											},
										},
										{ dataType: "undefined" },
									],
								},
								gpt5: {
									dataType: "union",
									subSchemas: [
										{
											dataType: "nestedObjectLiteral",
											nestedProperties: {
												reasoning_summary: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												instructions: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												previous_response_id: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
											},
										},
										{ dataType: "undefined" },
									],
								},
							},
						},
						{ dataType: "undefined" },
					],
				},
				digestMetadata: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								maxLength: { dataType: "double", required: true },
								tokensUsed: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								profileId: { dataType: "string", required: true },
								generatedAt: { dataType: "double", required: true },
							},
						},
						{ dataType: "undefined" },
					],
				},
				digest: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
				isAnswered: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
				apiProtocol: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "union",
							subSchemas: [
								{ dataType: "enum", enums: ["openai"] },
								{ dataType: "enum", enums: ["anthropic"] },
							],
						},
						{ dataType: "undefined" },
					],
				},
				isProtected: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
				contextCondense: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								summary: { dataType: "string", required: true },
								newContextTokens: { dataType: "double", required: true },
								prevContextTokens: { dataType: "double", required: true },
								cost: { dataType: "double", required: true },
							},
						},
						{ dataType: "undefined" },
					],
				},
				progressStatus: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								text: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								icon: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
							},
						},
						{ dataType: "undefined" },
					],
				},
				checkpoint: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "nestedObjectLiteral",
							nestedProperties: {},
							additionalProperties: { dataType: "any" },
						},
						{ dataType: "undefined" },
					],
				},
				conversationHistoryIndex: {
					dataType: "union",
					subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
				},
				reasoning: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
				partial: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
				images: {
					dataType: "union",
					subSchemas: [{ dataType: "array", array: { dataType: "string" } }, { dataType: "undefined" }],
				},
				text: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
				say: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "union",
							subSchemas: [
								{ dataType: "enum", enums: ["error"] },
								{ dataType: "enum", enums: ["api_req_started"] },
								{ dataType: "enum", enums: ["api_req_finished"] },
								{ dataType: "enum", enums: ["api_req_retried"] },
								{ dataType: "enum", enums: ["api_req_retry_delayed"] },
								{ dataType: "enum", enums: ["api_req_deleted"] },
								{ dataType: "enum", enums: ["text"] },
								{ dataType: "enum", enums: ["image"] },
								{ dataType: "enum", enums: ["reasoning"] },
								{ dataType: "enum", enums: ["completion_result"] },
								{ dataType: "enum", enums: ["user_feedback"] },
								{ dataType: "enum", enums: ["user_feedback_diff"] },
								{ dataType: "enum", enums: ["command_output"] },
								{ dataType: "enum", enums: ["shell_integration_warning"] },
								{ dataType: "enum", enums: ["browser_action"] },
								{ dataType: "enum", enums: ["browser_action_result"] },
								{ dataType: "enum", enums: ["mcp_server_request_started"] },
								{ dataType: "enum", enums: ["mcp_server_response"] },
								{ dataType: "enum", enums: ["subtask_result"] },
								{ dataType: "enum", enums: ["checkpoint_saved"] },
								{ dataType: "enum", enums: ["rooignore_error"] },
								{ dataType: "enum", enums: ["diff_error"] },
								{ dataType: "enum", enums: ["condense_context"] },
								{ dataType: "enum", enums: ["condense_context_error"] },
								{ dataType: "enum", enums: ["codebase_search_result"] },
								{ dataType: "enum", enums: ["user_edit_todos"] },
							],
						},
						{ dataType: "undefined" },
					],
				},
				ask: {
					dataType: "union",
					subSchemas: [
						{
							dataType: "union",
							subSchemas: [
								{ dataType: "enum", enums: ["followup"] },
								{ dataType: "enum", enums: ["command"] },
								{ dataType: "enum", enums: ["command_output"] },
								{ dataType: "enum", enums: ["completion_result"] },
								{ dataType: "enum", enums: ["tool"] },
								{ dataType: "enum", enums: ["api_req_failed"] },
								{ dataType: "enum", enums: ["resume_task"] },
								{ dataType: "enum", enums: ["resume_completed_task"] },
								{ dataType: "enum", enums: ["mistake_limit_reached"] },
								{ dataType: "enum", enums: ["browser_action_launch"] },
								{ dataType: "enum", enums: ["use_mcp_server"] },
								{ dataType: "enum", enums: ["auto_approval_max_req_reached"] },
								{ dataType: "enum", enums: ["payment_required_prompt"] },
								{ dataType: "enum", enums: ["invalid_model"] },
								{ dataType: "enum", enums: ["report_bug"] },
								{ dataType: "enum", enums: ["condense"] },
							],
						},
						{ dataType: "undefined" },
					],
				},
				type: {
					dataType: "union",
					subSchemas: [
						{ dataType: "enum", enums: ["ask"] },
						{ dataType: "enum", enums: ["say"] },
					],
					required: true,
				},
				ts: { dataType: "double", required: true },
			},
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskDetailsResponse: {
		dataType: "refObject",
		properties: {
			historyItem: { ref: "HistoryItemWithMetadata", required: true },
			messages: { dataType: "array", array: { dataType: "any" } },
			uiMessages: { dataType: "array", array: { dataType: "refAlias", ref: "ClineMessage" } },
			context: { ref: "TaskContext" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ResumeTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			status: { dataType: "string", required: true },
			context: { ref: "TaskContext" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	RespondToTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			response: { dataType: "string", required: true },
			context: { ref: "TaskContext" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	RespondToTaskRequest: {
		dataType: "refObject",
		properties: {
			response: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
			text: { dataType: "string" },
			mode: { dataType: "string" },
			profileId: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CancelTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToggleFavoriteResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskExportData: {
		dataType: "refObject",
		properties: {
			historyItem: { dataType: "any", required: true },
			apiMessages: { dataType: "array", array: { dataType: "any" }, required: true },
			uiMessages: { dataType: "array", array: { dataType: "refAlias", ref: "ClineMessage" }, required: true },
			exportMetadata: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					sourceTaskId: { dataType: "string", required: true },
					exportVersion: { dataType: "string", required: true },
					exportedAt: { dataType: "double", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskExportJsonResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			data: { ref: "TaskExportData", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExportTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ImportTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			sourceTaskId: { dataType: "string", required: true },
			message: { dataType: "string", required: true },
			isActive: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ImportTaskRequest: {
		dataType: "refObject",
		properties: {
			data: { ref: "TaskExportData", required: true },
			makeActive: { dataType: "boolean" },
			mode: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CondenseTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	QueueMessage: {
		dataType: "refObject",
		properties: {
			id: { dataType: "string", required: true },
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MessageQueueResponse: {
		dataType: "refObject",
		properties: {
			taskId: { dataType: "string", required: true },
			messages: { dataType: "array", array: { dataType: "refObject", ref: "QueueMessage" }, required: true },
			count: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	AddToQueueResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			message: { ref: "QueueMessage", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	AddToQueueRequest: {
		dataType: "refObject",
		properties: {
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateQueueMessageResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			messageId: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateQueueMessageRequest: {
		dataType: "refObject",
		properties: {
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ClearQueueResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			cleared: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BatchDeleteResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			deleted: { dataType: "double", required: true },
			failed: { dataType: "double", required: true },
			total: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BatchDeleteRequest: {
		dataType: "refObject",
		properties: {
			taskIds: { dataType: "array", array: { dataType: "string" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	Checkpoint: {
		dataType: "refObject",
		properties: {
			hash: { dataType: "string", required: true },
			timestamp: { dataType: "double", required: true },
			from: { dataType: "string" },
			to: { dataType: "string" },
			suppressMessage: { dataType: "boolean" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CheckpointListResponse: {
		dataType: "refObject",
		properties: {
			taskId: { dataType: "string", required: true },
			checkpoints: { dataType: "array", array: { dataType: "refObject", ref: "Checkpoint" }, required: true },
			count: { dataType: "double", required: true },
			currentCheckpoint: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	RestoreCheckpointResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			restoredToHash: { dataType: "string", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	RestoreCheckpointRequest: {
		dataType: "refObject",
		properties: {
			hash: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CheckpointDiffResponse: {
		dataType: "refObject",
		properties: {
			taskId: { dataType: "string", required: true },
			fromHash: { dataType: "string", required: true },
			toHash: { dataType: "string" },
			changes: {
				dataType: "array",
				array: {
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						after: { dataType: "string", required: true },
						before: { dataType: "string", required: true },
						path: { dataType: "string", required: true },
					},
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ForkTaskResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			forkedTaskId: { dataType: "string", required: true },
			sourceTaskId: { dataType: "string", required: true },
			forkFromMessageTs: { dataType: "double", required: true },
			messagesIncluded: { dataType: "double", required: true },
			isActive: { dataType: "boolean", required: true },
			context: { ref: "TaskContext" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ForkTaskRequest: {
		dataType: "refObject",
		properties: {
			messageTimestamp: { dataType: "double", required: true },
			makeActive: { dataType: "boolean" },
			mode: { dataType: "string" },
			providerProfile: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EditMessageResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			messageTimestamp: { dataType: "double", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	EditMessageRequest: {
		dataType: "refObject",
		properties: {
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	DigestMessageResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			messageTimestamp: { dataType: "double", required: true },
			digest: { dataType: "string", required: true },
			metadata: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					maxLength: { dataType: "double", required: true },
					tokensUsed: { dataType: "double" },
					profileId: { dataType: "string", required: true },
					generatedAt: { dataType: "double", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	DigestMessageRequest: {
		dataType: "refObject",
		properties: {
			maxLength: { dataType: "double" },
			profileId: { dataType: "string" },
			force: { dataType: "boolean" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToggleTaskDigestResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			settings: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					profileId: { dataType: "string" },
					maxLength: { dataType: "double" },
					enabled: { dataType: "boolean", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToggleTaskDigestRequest: {
		dataType: "refObject",
		properties: {
			enabled: { dataType: "boolean", required: true },
			maxLength: { dataType: "double" },
			profileId: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateTaskModeResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			mode: { dataType: "string", required: true },
			profileId: { dataType: "string" },
			message: { dataType: "string", required: true },
			context: { ref: "TaskContext" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateTaskModeRequest: {
		dataType: "refObject",
		properties: {
			mode: { dataType: "string", required: true },
			profileId: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ApplicationState: {
		dataType: "refObject",
		properties: {
			_metadata: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					timestamp: { dataType: "double", required: true },
					displayedTaskId: { dataType: "string" },
					currentProvider: { dataType: "string" },
					currentModel: { dataType: "string" },
					currentProfile: { dataType: "string" },
					currentMode: { dataType: "string" },
				},
			},
		},
		additionalProperties: { dataType: "any" },
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ConfigurationResponse: {
		dataType: "refObject",
		properties: {
			mode: { dataType: "string" },
			apiConfiguration: { dataType: "any" },
			currentApiConfigName: { dataType: "string" },
			customInstructions: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ConfigurationUpdateResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ConfigurationUpdateRequest: {
		dataType: "refObject",
		properties: {
			mode: { dataType: "string" },
			apiConfiguration: { dataType: "any" },
			customInstructions: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ModeInfo: {
		dataType: "refObject",
		properties: {
			slug: { dataType: "string", required: true },
			name: { dataType: "string", required: true },
			roleDefinition: { dataType: "string" },
			groups: { dataType: "array", array: { dataType: "string" } },
			isActive: { dataType: "boolean" },
			assignedProfileId: { dataType: "string" },
			assignedProfileName: { dataType: "string" },
			assignedProfileConfig: { dataType: "any" },
		},
		additionalProperties: { dataType: "any" },
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CurrentModelInfo: {
		dataType: "refObject",
		properties: {
			provider: { dataType: "string", required: true },
			modelId: { dataType: "string", required: true },
			modelInfo: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					description: { dataType: "string" },
					cacheReadsPrice: { dataType: "double" },
					cacheWritesPrice: { dataType: "double" },
					outputPrice: { dataType: "double" },
					inputPrice: { dataType: "double" },
					supportsPromptCache: { dataType: "boolean" },
					supportsImages: { dataType: "boolean" },
					contextWindow: { dataType: "double" },
					maxTokens: { dataType: "double" },
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	GlobalSettings: {
		dataType: "refObject",
		properties: {
			currentApiConfigName: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			listApiConfigMeta: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "array",
						array: {
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								modelId: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								apiProvider: {
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["openrouter"] },
												{ dataType: "enum", enums: ["vercel-ai-gateway"] },
												{ dataType: "enum", enums: ["huggingface"] },
												{ dataType: "enum", enums: ["litellm"] },
												{ dataType: "enum", enums: ["hoodycode-openrouter"] },
												{ dataType: "enum", enums: ["ovhcloud"] },
												{ dataType: "enum", enums: ["chutes"] },
												{ dataType: "enum", enums: ["deepinfra"] },
												{ dataType: "enum", enums: ["io-intelligence"] },
												{ dataType: "enum", enums: ["requesty"] },
												{ dataType: "enum", enums: ["unbound"] },
												{ dataType: "enum", enums: ["glama"] },
												{ dataType: "enum", enums: ["ollama"] },
												{ dataType: "enum", enums: ["lmstudio"] },
												{ dataType: "enum", enums: ["vscode-lm"] },
												{ dataType: "enum", enums: ["openai"] },
												{ dataType: "enum", enums: ["fake-ai"] },
												{ dataType: "enum", enums: ["human-relay"] },
												{ dataType: "enum", enums: ["anthropic"] },
												{ dataType: "enum", enums: ["bedrock"] },
												{ dataType: "enum", enums: ["cerebras"] },
												{ dataType: "enum", enums: ["chutes"] },
												{ dataType: "enum", enums: ["claude-code"] },
												{ dataType: "enum", enums: ["doubao"] },
												{ dataType: "enum", enums: ["deepseek"] },
												{ dataType: "enum", enums: ["featherless"] },
												{ dataType: "enum", enums: ["fireworks"] },
												{ dataType: "enum", enums: ["gemini"] },
												{ dataType: "enum", enums: ["gemini-cli"] },
												{ dataType: "enum", enums: ["groq"] },
												{ dataType: "enum", enums: ["mistral"] },
												{ dataType: "enum", enums: ["moonshot"] },
												{ dataType: "enum", enums: ["openai-native"] },
												{ dataType: "enum", enums: ["qwen-code"] },
												{ dataType: "enum", enums: ["roo"] },
												{ dataType: "enum", enums: ["hoodycode"] },
												{ dataType: "enum", enums: ["gemini-cli"] },
												{ dataType: "enum", enums: ["virtual-quota-fallback"] },
												{ dataType: "enum", enums: ["synthetic"] },
												{ dataType: "enum", enums: ["sambanova"] },
												{ dataType: "enum", enums: ["vertex"] },
												{ dataType: "enum", enums: ["xai"] },
												{ dataType: "enum", enums: ["zai"] },
											],
										},
										{ dataType: "undefined" },
									],
								},
								name: { dataType: "string", required: true },
								id: { dataType: "string", required: true },
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			pinnedApiConfigs: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "boolean" },
					},
					{ dataType: "undefined" },
				],
			},
			lastShownAnnouncementId: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			customInstructions: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			taskHistory: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "array",
						array: {
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								status: {
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["running"] },
												{ dataType: "enum", enums: ["interactive"] },
												{ dataType: "enum", enums: ["resumable"] },
												{ dataType: "enum", enums: ["idle"] },
												{ dataType: "enum", enums: ["completed"] },
											],
										},
										{ dataType: "undefined" },
									],
								},
								forkTimestamp: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								forkFromMessageTs: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								sourceTaskId: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								profileName: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								modelProvider: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								modelId: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								mode: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								fileNotfound: {
									dataType: "union",
									subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
								},
								isFavorited: {
									dataType: "union",
									subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
								},
								workspace: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								size: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								contextTokens: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								totalCost: { dataType: "double", required: true },
								cacheReads: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								cacheWrites: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								tokensOut: { dataType: "double", required: true },
								tokensIn: { dataType: "double", required: true },
								task: { dataType: "string", required: true },
								ts: { dataType: "double", required: true },
								number: { dataType: "double", required: true },
								parentTaskId: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								rootTaskId: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								id: { dataType: "string", required: true },
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			dismissedUpsells: {
				dataType: "union",
				subSchemas: [{ dataType: "array", array: { dataType: "string" } }, { dataType: "undefined" }],
			},
			openRouterImageApiKey: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			openRouterImageGenerationSelectedModel: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			hoodyCodeImageApiKey: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			condensingApiConfigId: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			customCondensingPrompt: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			digestEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			digestProfileId: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			autoDigestEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			digestMaxLength: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			customDigestPrompt: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			digestTaskOverrides: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: {
							dataType: "nestedObjectLiteral",
							nestedProperties: {
								profileId: {
									dataType: "union",
									subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
								},
								maxLength: {
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
								},
								enabled: { dataType: "boolean", required: true },
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			autoApprovalEnabled: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			alwaysAllowReadOnly: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			alwaysAllowReadOnlyOutsideWorkspace: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			alwaysAllowWrite: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			alwaysAllowWriteOutsideWorkspace: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			alwaysAllowWriteProtected: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			writeDelayMs: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			alwaysAllowBrowser: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			alwaysApproveResubmit: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			requestDelaySeconds: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			alwaysAllowMcp: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			alwaysAllowModeSwitch: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			alwaysAllowSubtasks: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			alwaysAllowExecute: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			alwaysAllowFollowupQuestions: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			followupAutoApproveTimeoutMs: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			alwaysAllowUpdateTodoList: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			allowedCommands: {
				dataType: "union",
				subSchemas: [{ dataType: "array", array: { dataType: "string" } }, { dataType: "undefined" }],
			},
			deniedCommands: {
				dataType: "union",
				subSchemas: [{ dataType: "array", array: { dataType: "string" } }, { dataType: "undefined" }],
			},
			commandExecutionTimeout: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			commandTimeoutAllowlist: {
				dataType: "union",
				subSchemas: [{ dataType: "array", array: { dataType: "string" } }, { dataType: "undefined" }],
			},
			preventCompletionWithOpenTodos: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			allowedMaxRequests: {
				dataType: "union",
				subSchemas: [
					{ dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }] },
					{ dataType: "undefined" },
				],
			},
			allowedMaxCost: {
				dataType: "union",
				subSchemas: [
					{ dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }] },
					{ dataType: "undefined" },
				],
			},
			autoCondenseContext: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			autoCondenseContextPercent: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			maxConcurrentFileReads: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			allowVeryLargeReads: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			includeDiagnosticMessages: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			maxDiagnosticMessages: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			browserToolEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			browserViewportSize: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			showAutoApproveMenu: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			showTaskTimeline: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			showTimestamps: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			hideCostBelowThreshold: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			localWorkflowToggles: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "boolean" },
					},
					{ dataType: "undefined" },
				],
			},
			globalWorkflowToggles: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "boolean" },
					},
					{ dataType: "undefined" },
				],
			},
			localRulesToggles: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "boolean" },
					},
					{ dataType: "undefined" },
				],
			},
			globalRulesToggles: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "boolean" },
					},
					{ dataType: "undefined" },
				],
			},
			screenshotQuality: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			remoteBrowserEnabled: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			remoteBrowserHost: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			cachedChromeHostUrl: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			enableCheckpoints: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			ttsEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			ttsSpeed: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			soundEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			soundVolume: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			systemNotificationsEnabled: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			maxOpenTabsContext: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			maxWorkspaceFiles: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			showRooIgnoredFiles: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			maxReadFileLine: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			maxImageFileSize: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			maxTotalImageSize: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			terminalOutputLineLimit: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			terminalOutputCharacterLimit: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			terminalShellIntegrationTimeout: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			terminalShellIntegrationDisabled: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			terminalCommandDelay: {
				dataType: "union",
				subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
			},
			terminalPowershellCounter: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			terminalZshClearEolMark: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			terminalZshOhMy: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			terminalZshP10k: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			terminalZdotdir: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			terminalCompressProgressBar: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			diagnosticsEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			rateLimitSeconds: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			diffEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			fuzzyMatchThreshold: { dataType: "union", subSchemas: [{ dataType: "double" }, { dataType: "undefined" }] },
			experiments: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {
							runSlashCommand: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							imageGeneration: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							preventFocusDisruption: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							multiFileApplyDiff: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							powerSteering: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							morphFastApply: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			morphApiKey: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			fastApplyModel: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "union",
						subSchemas: [
							{ dataType: "enum", enums: ["auto"] },
							{ dataType: "enum", enums: ["morph/morph-v3-fast"] },
							{ dataType: "enum", enums: ["morph/morph-v3-large"] },
							{ dataType: "enum", enums: ["relace/relace-apply-3"] },
						],
					},
					{ dataType: "undefined" },
				],
			},
			codebaseIndexModels: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {
							"vercel-ai-gateway": {
								dataType: "union",
								subSchemas: [
									{
										dataType: "nestedObjectLiteral",
										nestedProperties: {},
										additionalProperties: {
											dataType: "nestedObjectLiteral",
											nestedProperties: { dimension: { dataType: "double", required: true } },
										},
									},
									{ dataType: "undefined" },
								],
							},
							mistral: {
								dataType: "union",
								subSchemas: [
									{
										dataType: "nestedObjectLiteral",
										nestedProperties: {},
										additionalProperties: {
											dataType: "nestedObjectLiteral",
											nestedProperties: { dimension: { dataType: "double", required: true } },
										},
									},
									{ dataType: "undefined" },
								],
							},
							gemini: {
								dataType: "union",
								subSchemas: [
									{
										dataType: "nestedObjectLiteral",
										nestedProperties: {},
										additionalProperties: {
											dataType: "nestedObjectLiteral",
											nestedProperties: { dimension: { dataType: "double", required: true } },
										},
									},
									{ dataType: "undefined" },
								],
							},
							"openai-compatible": {
								dataType: "union",
								subSchemas: [
									{
										dataType: "nestedObjectLiteral",
										nestedProperties: {},
										additionalProperties: {
											dataType: "nestedObjectLiteral",
											nestedProperties: { dimension: { dataType: "double", required: true } },
										},
									},
									{ dataType: "undefined" },
								],
							},
							ollama: {
								dataType: "union",
								subSchemas: [
									{
										dataType: "nestedObjectLiteral",
										nestedProperties: {},
										additionalProperties: {
											dataType: "nestedObjectLiteral",
											nestedProperties: { dimension: { dataType: "double", required: true } },
										},
									},
									{ dataType: "undefined" },
								],
							},
							openai: {
								dataType: "union",
								subSchemas: [
									{
										dataType: "nestedObjectLiteral",
										nestedProperties: {},
										additionalProperties: {
											dataType: "nestedObjectLiteral",
											nestedProperties: { dimension: { dataType: "double", required: true } },
										},
									},
									{ dataType: "undefined" },
								],
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			codebaseIndexConfig: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {
							codebaseIndexOpenAiCompatibleModelDimension: {
								dataType: "union",
								subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
							},
							codebaseIndexOpenAiCompatibleBaseUrl: {
								dataType: "union",
								subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
							},
							codebaseIndexSearchMaxResults: {
								dataType: "union",
								subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
							},
							codebaseIndexSearchMinScore: {
								dataType: "union",
								subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
							},
							codebaseIndexEmbedderModelDimension: {
								dataType: "union",
								subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
							},
							codebaseIndexEmbedderModelId: {
								dataType: "union",
								subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
							},
							codebaseIndexEmbedderBaseUrl: {
								dataType: "union",
								subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
							},
							codebaseIndexEmbedderProvider: {
								dataType: "union",
								subSchemas: [
									{
										dataType: "union",
										subSchemas: [
											{ dataType: "enum", enums: ["openai"] },
											{ dataType: "enum", enums: ["ollama"] },
											{ dataType: "enum", enums: ["openai-compatible"] },
											{ dataType: "enum", enums: ["gemini"] },
											{ dataType: "enum", enums: ["mistral"] },
											{ dataType: "enum", enums: ["vercel-ai-gateway"] },
										],
									},
									{ dataType: "undefined" },
								],
							},
							codebaseIndexQdrantUrl: {
								dataType: "union",
								subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
							},
							codebaseIndexEnabled: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			language: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "union",
						subSchemas: [
							{ dataType: "enum", enums: ["ar"] },
							{ dataType: "enum", enums: ["cs"] },
							{ dataType: "enum", enums: ["th"] },
							{ dataType: "enum", enums: ["uk"] },
							{ dataType: "enum", enums: ["ca"] },
							{ dataType: "enum", enums: ["de"] },
							{ dataType: "enum", enums: ["en"] },
							{ dataType: "enum", enums: ["es"] },
							{ dataType: "enum", enums: ["fr"] },
							{ dataType: "enum", enums: ["hi"] },
							{ dataType: "enum", enums: ["id"] },
							{ dataType: "enum", enums: ["it"] },
							{ dataType: "enum", enums: ["ja"] },
							{ dataType: "enum", enums: ["ko"] },
							{ dataType: "enum", enums: ["nl"] },
							{ dataType: "enum", enums: ["pl"] },
							{ dataType: "enum", enums: ["pt-BR"] },
							{ dataType: "enum", enums: ["ru"] },
							{ dataType: "enum", enums: ["tr"] },
							{ dataType: "enum", enums: ["vi"] },
							{ dataType: "enum", enums: ["zh-CN"] },
							{ dataType: "enum", enums: ["zh-TW"] },
						],
					},
					{ dataType: "undefined" },
				],
			},
			telemetrySetting: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "union",
						subSchemas: [
							{ dataType: "enum", enums: ["unset"] },
							{ dataType: "enum", enums: ["enabled"] },
							{ dataType: "enum", enums: ["disabled"] },
						],
					},
					{ dataType: "undefined" },
				],
			},
			mcpEnabled: { dataType: "union", subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }] },
			enableMcpServerCreation: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			mcpMarketplaceCatalog: { dataType: "union", subSchemas: [{ dataType: "any" }, { dataType: "undefined" }] },
			mode: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			modeApiConfigs: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "string" },
					},
					{ dataType: "undefined" },
				],
			},
			customModes: {
				dataType: "union",
				subSchemas: [{ dataType: "array", array: { dataType: "any" } }, { dataType: "undefined" }],
			},
			customModePrompts: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "nestedObjectLiteral",
									nestedProperties: {
										customInstructions: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
										description: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
										whenToUse: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
										roleDefinition: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
									},
								},
								{ dataType: "undefined" },
							],
						},
					},
					{ dataType: "undefined" },
				],
			},
			customSupportPrompts: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
					},
					{ dataType: "undefined" },
				],
			},
			enhancementApiConfigId: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			dismissedNotificationIds: {
				dataType: "union",
				subSchemas: [{ dataType: "array", array: { dataType: "string" } }, { dataType: "undefined" }],
			},
			commitMessageApiConfigId: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			terminalCommandApiConfigId: {
				dataType: "union",
				subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
			},
			ghostServiceSettings: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {
							showGutterAnimation: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							enableSmartInlineTaskKeybinding: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							enableQuickInlineTaskKeybinding: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
							autoTriggerDelay: {
								dataType: "union",
								subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
							},
							enableAutoTrigger: {
								dataType: "union",
								subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
							},
						},
					},
					{ dataType: "undefined" },
				],
			},
			includeTaskHistoryInEnhance: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			historyPreviewCollapsed: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			reasoningBlockCollapsed: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			profileThresholds: {
				dataType: "union",
				subSchemas: [
					{
						dataType: "nestedObjectLiteral",
						nestedProperties: {},
						additionalProperties: { dataType: "double" },
					},
					{ dataType: "undefined" },
				],
			},
			hasOpenedModeSelector: {
				dataType: "union",
				subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
			},
			lastModeExportPath: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
			lastModeImportPath: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExtensionSettings: {
		dataType: "refAlias",
		type: { ref: "GlobalSettings", validators: {} },
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SettingsUpdateResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SettingsUpdateRequest: {
		dataType: "refObject",
		properties: {},
		additionalProperties: { dataType: "any" },
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	AutoApprovalSettings: {
		dataType: "refObject",
		properties: {
			enabled: { dataType: "boolean" },
			readOnly: { dataType: "boolean" },
			readOnlyOutsideWorkspace: { dataType: "boolean" },
			write: { dataType: "boolean" },
			writeOutsideWorkspace: { dataType: "boolean" },
			writeProtected: { dataType: "boolean" },
			execute: { dataType: "boolean" },
			browser: { dataType: "boolean" },
			mcp: { dataType: "boolean" },
			modeSwitch: { dataType: "boolean" },
			subtasks: { dataType: "boolean" },
			followupQuestions: { dataType: "boolean" },
			updateTodoList: { dataType: "boolean" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TerminalSettings: {
		dataType: "refObject",
		properties: {
			outputLineLimit: { dataType: "double" },
			outputCharacterLimit: { dataType: "double" },
			shellIntegrationTimeout: { dataType: "double" },
			shellIntegrationDisabled: { dataType: "boolean" },
			commandDelay: { dataType: "double" },
			compressProgressBar: { dataType: "boolean" },
			powershellCounter: { dataType: "boolean" },
			zshClearEolMark: { dataType: "boolean" },
			zshOhMy: { dataType: "boolean" },
			zshP10k: { dataType: "boolean" },
			zdotdir: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BrowserSettings: {
		dataType: "refObject",
		properties: {
			enabled: { dataType: "boolean" },
			viewportSize: { dataType: "string" },
			screenshotQuality: { dataType: "double" },
			remoteBrowserEnabled: { dataType: "boolean" },
			remoteBrowserHost: { dataType: "string" },
			cachedChromeHostUrl: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"Record_string.number_": {
		dataType: "refAlias",
		type: {
			dataType: "nestedObjectLiteral",
			nestedProperties: {},
			additionalProperties: { dataType: "double" },
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CondenseSettings: {
		dataType: "refObject",
		properties: {
			autoCondenseContext: { dataType: "boolean" },
			autoCondenseContextPercent: { dataType: "double" },
			profileThresholds: { ref: "Record_string.number_" },
			condensingApiConfigId: { dataType: "string" },
			customCondensingPrompt: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"Record_string._enabled-boolean--maxLength_63_-number--profileId_63_-string__": {
		dataType: "refAlias",
		type: {
			dataType: "nestedObjectLiteral",
			nestedProperties: {},
			additionalProperties: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					profileId: { dataType: "string" },
					maxLength: { dataType: "double" },
					enabled: { dataType: "boolean", required: true },
				},
			},
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	DigestSettings: {
		dataType: "refObject",
		properties: {
			digestEnabled: { dataType: "boolean" },
			digestProfileId: { dataType: "string" },
			autoDigestEnabled: { dataType: "boolean" },
			digestMaxLength: { dataType: "double" },
			customDigestPrompt: { dataType: "string" },
			digestTaskOverrides: {
				ref: "Record_string._enabled-boolean--maxLength_63_-number--profileId_63_-string__",
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolType: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ dataType: "enum", enums: ["editedExistingFile"] },
				{ dataType: "enum", enums: ["appliedDiff"] },
				{ dataType: "enum", enums: ["newFileCreated"] },
				{ dataType: "enum", enums: ["codebaseSearch"] },
				{ dataType: "enum", enums: ["readFile"] },
				{ dataType: "enum", enums: ["fetchInstructions"] },
				{ dataType: "enum", enums: ["listFilesTopLevel"] },
				{ dataType: "enum", enums: ["listFilesRecursive"] },
				{ dataType: "enum", enums: ["listCodeDefinitionNames"] },
				{ dataType: "enum", enums: ["searchFiles"] },
				{ dataType: "enum", enums: ["switchMode"] },
				{ dataType: "enum", enums: ["newTask"] },
				{ dataType: "enum", enums: ["finishTask"] },
				{ dataType: "enum", enums: ["searchAndReplace"] },
				{ dataType: "enum", enums: ["insertContent"] },
				{ dataType: "enum", enums: ["generateImage"] },
				{ dataType: "enum", enums: ["imageGenerated"] },
				{ dataType: "enum", enums: ["runSlashCommand"] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseReadFile: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["readFile"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
			additionalFileCount: { dataType: "double" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BatchFileEntry: {
		dataType: "refObject",
		properties: {
			path: { dataType: "string", required: true },
			lineSnippet: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean" },
			key: { dataType: "string", required: true },
			content: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseReadFileBatch: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["readFile"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string" },
			batchFiles: { dataType: "array", array: { dataType: "refObject", ref: "BatchFileEntry" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseListFilesTopLevel: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["listFilesTopLevel"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseListFilesRecursive: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["listFilesRecursive"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseListCodeDefinitionNames: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["listCodeDefinitionNames"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseSearchFiles: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["searchFiles"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
			regex: { dataType: "string", required: true },
			filePattern: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseNewFileCreated: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["newFileCreated"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseEditedExistingFile: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["editedExistingFile"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string" },
			diff: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseApplyDiffSingle: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["appliedDiff"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string" },
			diff: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	DiffOperation: {
		dataType: "refObject",
		properties: {
			content: { dataType: "string", required: true },
			startLine: { dataType: "double" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BatchDiffEntry: {
		dataType: "refObject",
		properties: {
			path: { dataType: "string", required: true },
			changeCount: { dataType: "double", required: true },
			key: { dataType: "string", required: true },
			content: { dataType: "string", required: true },
			diffs: { dataType: "array", array: { dataType: "refObject", ref: "DiffOperation" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseApplyDiffBatch: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["appliedDiff"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string" },
			batchDiffs: { dataType: "array", array: { dataType: "refObject", ref: "BatchDiffEntry" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseApplyDiff: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [{ ref: "ToolResponseApplyDiffSingle" }, { ref: "ToolResponseApplyDiffBatch" }],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseSearchAndReplace: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["searchAndReplace"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string" },
			search: { dataType: "string", required: true },
			replace: { dataType: "string", required: true },
			useRegex: { dataType: "boolean", required: true },
			ignoreCase: { dataType: "boolean", required: true },
			startLine: { dataType: "double" },
			endLine: { dataType: "double" },
			diff: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseInsertContent: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["insertContent"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string" },
			diff: { dataType: "string" },
			lineNumber: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseGenerateImage: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["generateImage"], required: true },
			path: { dataType: "string", required: true },
			isOutsideWorkspace: { dataType: "boolean", required: true },
			isProtected: { dataType: "boolean", required: true },
			content: { dataType: "string", required: true },
			inputImage: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseNewTask: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["newTask"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
			mode: { dataType: "string", required: true },
			todos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" }, required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseFinishTask: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["finishTask"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseSwitchMode: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["switchMode"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string" },
			mode: { dataType: "string", required: true },
			reason: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseFetchInstructions: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["fetchInstructions"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseRunSlashCommand: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["runSlashCommand"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string" },
			command: { dataType: "string", required: true },
			args: { dataType: "string" },
			source: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["global"] },
					{ dataType: "enum", enums: ["project"] },
					{ dataType: "enum", enums: ["built-in"] },
				],
				required: true,
			},
			description: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponseCodebaseSearch: {
		dataType: "refObject",
		properties: {
			tool: { dataType: "enum", enums: ["codebaseSearch"], required: true },
			path: { dataType: "string" },
			isOutsideWorkspace: { dataType: "boolean" },
			isProtected: { dataType: "boolean" },
			content: { dataType: "string", required: true },
			query: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToolResponse: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ ref: "ToolResponseReadFile" },
				{ ref: "ToolResponseReadFileBatch" },
				{ ref: "ToolResponseListFilesTopLevel" },
				{ ref: "ToolResponseListFilesRecursive" },
				{ ref: "ToolResponseListCodeDefinitionNames" },
				{ ref: "ToolResponseSearchFiles" },
				{ ref: "ToolResponseNewFileCreated" },
				{ ref: "ToolResponseEditedExistingFile" },
				{ ref: "ToolResponseApplyDiff" },
				{ ref: "ToolResponseSearchAndReplace" },
				{ ref: "ToolResponseInsertContent" },
				{ ref: "ToolResponseGenerateImage" },
				{ ref: "ToolResponseNewTask" },
				{ ref: "ToolResponseFinishTask" },
				{ ref: "ToolResponseSwitchMode" },
				{ ref: "ToolResponseFetchInstructions" },
				{ ref: "ToolResponseRunSlashCommand" },
				{ ref: "ToolResponseCodebaseSearch" },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SchemaDocumentationResponse_ToolResponse_: {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: { ref: "ToolResponse" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	WebSocketMessageType: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ dataType: "enum", enums: ["action"] },
				{ dataType: "enum", enums: ["state"] },
				{ dataType: "enum", enums: ["selectedImages"] },
				{ dataType: "enum", enums: ["theme"] },
				{ dataType: "enum", enums: ["workspaceUpdated"] },
				{ dataType: "enum", enums: ["invoke"] },
				{ dataType: "enum", enums: ["messageUpdated"] },
				{ dataType: "enum", enums: ["mcpServers"] },
				{ dataType: "enum", enums: ["enhancedPrompt"] },
				{ dataType: "enum", enums: ["commitSearchResults"] },
				{ dataType: "enum", enums: ["listApiConfig"] },
				{ dataType: "enum", enums: ["routerModels"] },
				{ dataType: "enum", enums: ["openAiModels"] },
				{ dataType: "enum", enums: ["ollamaModels"] },
				{ dataType: "enum", enums: ["lmStudioModels"] },
				{ dataType: "enum", enums: ["vsCodeLmModels"] },
				{ dataType: "enum", enums: ["huggingFaceModels"] },
				{ dataType: "enum", enums: ["vsCodeLmApiAvailable"] },
				{ dataType: "enum", enums: ["updatePrompt"] },
				{ dataType: "enum", enums: ["systemPrompt"] },
				{ dataType: "enum", enums: ["autoApprovalEnabled"] },
				{ dataType: "enum", enums: ["updateCustomMode"] },
				{ dataType: "enum", enums: ["deleteCustomMode"] },
				{ dataType: "enum", enums: ["exportModeResult"] },
				{ dataType: "enum", enums: ["importModeResult"] },
				{ dataType: "enum", enums: ["checkRulesDirectoryResult"] },
				{ dataType: "enum", enums: ["deleteCustomModeCheck"] },
				{ dataType: "enum", enums: ["currentCheckpointUpdated"] },
				{ dataType: "enum", enums: ["showHumanRelayDialog"] },
				{ dataType: "enum", enums: ["humanRelayResponse"] },
				{ dataType: "enum", enums: ["humanRelayCancel"] },
				{ dataType: "enum", enums: ["insertTextToChatArea"] },
				{ dataType: "enum", enums: ["browserToolEnabled"] },
				{ dataType: "enum", enums: ["browserConnectionResult"] },
				{ dataType: "enum", enums: ["remoteBrowserEnabled"] },
				{ dataType: "enum", enums: ["ttsStart"] },
				{ dataType: "enum", enums: ["ttsStop"] },
				{ dataType: "enum", enums: ["maxReadFileLine"] },
				{ dataType: "enum", enums: ["fileSearchResults"] },
				{ dataType: "enum", enums: ["toggleApiConfigPin"] },
				{ dataType: "enum", enums: ["mcpMarketplaceCatalog"] },
				{ dataType: "enum", enums: ["mcpDownloadDetails"] },
				{ dataType: "enum", enums: ["showSystemNotification"] },
				{ dataType: "enum", enums: ["openInBrowser"] },
				{ dataType: "enum", enums: ["acceptInput"] },
				{ dataType: "enum", enums: ["focusChatInput"] },
				{ dataType: "enum", enums: ["setHistoryPreviewCollapsed"] },
				{ dataType: "enum", enums: ["commandExecutionStatus"] },
				{ dataType: "enum", enums: ["mcpExecutionStatus"] },
				{ dataType: "enum", enums: ["vsCodeSetting"] },
				{ dataType: "enum", enums: ["profileDataResponse"] },
				{ dataType: "enum", enums: ["balanceDataResponse"] },
				{ dataType: "enum", enums: ["updateProfileData"] },
				{ dataType: "enum", enums: ["authenticatedUser"] },
				{ dataType: "enum", enums: ["condenseTaskContextResponse"] },
				{ dataType: "enum", enums: ["singleRouterModelFetchResponse"] },
				{ dataType: "enum", enums: ["indexingStatusUpdate"] },
				{ dataType: "enum", enums: ["indexCleared"] },
				{ dataType: "enum", enums: ["codebaseIndexConfig"] },
				{ dataType: "enum", enums: ["rulesData"] },
				{ dataType: "enum", enums: ["marketplaceInstallResult"] },
				{ dataType: "enum", enums: ["marketplaceRemoveResult"] },
				{ dataType: "enum", enums: ["marketplaceData"] },
				{ dataType: "enum", enums: ["mermaidFixResponse"] },
				{ dataType: "enum", enums: ["tasksByIdResponse"] },
				{ dataType: "enum", enums: ["taskHistoryResponse"] },
				{ dataType: "enum", enums: ["forkCountsResponse"] },
				{ dataType: "enum", enums: ["shareTaskSuccess"] },
				{ dataType: "enum", enums: ["codeIndexSettingsSaved"] },
				{ dataType: "enum", enums: ["codeIndexSecretStatus"] },
				{ dataType: "enum", enums: ["showDeleteMessageDialog"] },
				{ dataType: "enum", enums: ["showEditMessageDialog"] },
				{ dataType: "enum", enums: ["hoodycodeNotificationsResponse"] },
				{ dataType: "enum", enums: ["usageDataResponse"] },
				{ dataType: "enum", enums: ["keybindingsResponse"] },
				{ dataType: "enum", enums: ["commands"] },
				{ dataType: "enum", enums: ["insertTextIntoTextarea"] },
				{ dataType: "enum", enums: ["dismissedUpsells"] },
				{ dataType: "enum", enums: ["showTimestamps"] },
				{ dataType: "enum", enums: ["organizationSwitchResult"] },
				{ dataType: "enum", enums: ["todoListUpdated"] },
				{ dataType: "enum", enums: ["taskForked"] },
				{ dataType: "enum", enums: ["taskModeChanged"] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskContextMetadata: {
		dataType: "refObject",
		properties: {
			mode: { dataType: "string" },
			modelId: { dataType: "string" },
			modelProvider: { dataType: "string" },
			profileName: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MessageUpdatedMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["messageUpdated"], required: true },
			taskId: { dataType: "string", required: true },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
			clineMessage: { ref: "ClineMessage", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CommandExecutionStatusMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["commandExecutionStatus"], required: true },
			taskId: { dataType: "string", required: true },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskForkedMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["taskForked"], required: true },
			taskId: { dataType: "string", required: true },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
			forkedTaskId: { dataType: "string", required: true },
			sourceTaskId: { dataType: "string", required: true },
			forkFromMessageTs: { dataType: "double", required: true },
			messagesIncluded: { dataType: "double", required: true },
			isActive: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TaskModeChangedMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["taskModeChanged"], required: true },
			taskId: { dataType: "string", required: true },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
			mode: { dataType: "string", required: true },
			profileId: { dataType: "string" },
			profileName: { dataType: "string" },
			isActive: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	TodoListUpdatedMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["todoListUpdated"], required: true },
			taskId: { dataType: "string", required: true },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string", required: true },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IndexingStatus: {
		dataType: "refObject",
		properties: {
			systemStatus: { dataType: "string", required: true },
			message: { dataType: "string" },
			processedItems: { dataType: "double", required: true },
			totalItems: { dataType: "double", required: true },
			currentItemUnit: { dataType: "string" },
			workspacePath: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IndexingStatusUpdateMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["indexingStatusUpdate"], required: true },
			taskId: { dataType: "string" },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
			values: { ref: "IndexingStatus", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExtensionState: {
		dataType: "refObject",
		properties: {
			version: { dataType: "string", required: true },
			clineMessages: { dataType: "array", array: { dataType: "refAlias", ref: "ClineMessage" }, required: true },
			currentTaskItem: { dataType: "any" },
			currentTaskTodos: { dataType: "array", array: { dataType: "refObject", ref: "TodoItem" } },
			apiConfiguration: { dataType: "any", required: true },
			mode: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	StateMessage: {
		dataType: "refObject",
		properties: {
			type: { dataType: "enum", enums: ["state"], required: true },
			taskId: { dataType: "string" },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
			state: { ref: "ExtensionState", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BaseWebSocketMessage: {
		dataType: "refObject",
		properties: {
			type: { ref: "WebSocketMessageType", required: true },
			taskId: { dataType: "string" },
			taskContext: { ref: "TaskContextMetadata" },
			text: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	WebSocketMessage: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ ref: "MessageUpdatedMessage" },
				{ ref: "CommandExecutionStatusMessage" },
				{ ref: "TaskForkedMessage" },
				{ ref: "TaskModeChangedMessage" },
				{ ref: "TodoListUpdatedMessage" },
				{ ref: "IndexingStatusUpdateMessage" },
				{ ref: "StateMessage" },
				{ ref: "BaseWebSocketMessage" },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SchemaDocumentationResponse_WebSocketMessage_: {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: { ref: "WebSocketMessage" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BrowserAction: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ dataType: "enum", enums: ["launch"] },
				{ dataType: "enum", enums: ["click"] },
				{ dataType: "enum", enums: ["hover"] },
				{ dataType: "enum", enums: ["type"] },
				{ dataType: "enum", enums: ["scroll_down"] },
				{ dataType: "enum", enums: ["scroll_up"] },
				{ dataType: "enum", enums: ["resize"] },
				{ dataType: "enum", enums: ["close"] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	BrowserActionResult: {
		dataType: "refObject",
		properties: {
			screenshot: { dataType: "string" },
			logs: { dataType: "string" },
			currentUrl: { dataType: "string" },
			currentMousePosition: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"SchemaDocumentationResponse__actions-BrowserAction-Array--result-BrowserActionResult__": {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					result: { ref: "BrowserActionResult", required: true },
					actions: {
						dataType: "array",
						array: { dataType: "refAlias", ref: "BrowserAction" },
						required: true,
					},
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CommandExecutionStatus: {
		dataType: "refObject",
		properties: {
			executionId: { dataType: "string", required: true },
			status: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["started"] },
					{ dataType: "enum", enums: ["output"] },
					{ dataType: "enum", enums: ["exited"] },
					{ dataType: "enum", enums: ["timeout"] },
					{ dataType: "enum", enums: ["fallback"] },
				],
				required: true,
			},
			pid: { dataType: "double" },
			command: { dataType: "string" },
			exitCode: { dataType: "double" },
			output: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SchemaDocumentationResponse_CommandExecutionStatus_: {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: { ref: "CommandExecutionStatus" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ApiRequestInfo: {
		dataType: "refObject",
		properties: {
			request: { dataType: "string" },
			tokensIn: { dataType: "double" },
			tokensOut: { dataType: "double" },
			cacheWrites: { dataType: "double" },
			cacheReads: { dataType: "double" },
			cost: { dataType: "double" },
			usageMissing: { dataType: "boolean" },
			inferenceProvider: { dataType: "string" },
			cancelReason: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["streaming_failed"] },
					{ dataType: "enum", enums: ["user_cancelled"] },
				],
			},
			streamingFailedMessage: { dataType: "string" },
			apiProtocol: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["anthropic"] },
					{ dataType: "enum", enums: ["openai"] },
				],
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SchemaDocumentationResponse_ApiRequestInfo_: {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: { ref: "ApiRequestInfo" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"SchemaDocumentationResponse__tools-ToolType-Array__": {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					tools: { dataType: "array", array: { dataType: "refAlias", ref: "ToolType" }, required: true },
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"SchemaDocumentationResponse__types-WebSocketMessageType-Array__": {
		dataType: "refObject",
		properties: {
			notice: { dataType: "string", required: true },
			schema: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					types: {
						dataType: "array",
						array: { dataType: "refAlias", ref: "WebSocketMessageType" },
						required: true,
					},
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SupportPromptType: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{ dataType: "enum", enums: ["ENHANCE"] },
				{ dataType: "enum", enums: ["CONDENSE"] },
				{ dataType: "enum", enums: ["EXPLAIN"] },
				{ dataType: "enum", enums: ["FIX"] },
				{ dataType: "enum", enums: ["IMPROVE"] },
				{ dataType: "enum", enums: ["ADD_TO_CONTEXT"] },
				{ dataType: "enum", enums: ["TERMINAL_ADD_TO_CONTEXT"] },
				{ dataType: "enum", enums: ["TERMINAL_FIX"] },
				{ dataType: "enum", enums: ["TERMINAL_EXPLAIN"] },
				{ dataType: "enum", enums: ["TERMINAL_GENERATE"] },
				{ dataType: "enum", enums: ["NEW_TASK"] },
				{ dataType: "enum", enums: ["COMMIT_MESSAGE"] },
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	PromptTypeInfo: {
		dataType: "refObject",
		properties: {
			type: { ref: "SupportPromptType", required: true },
			description: { dataType: "string", required: true },
			parameters: { dataType: "array", array: { dataType: "string" }, required: true },
			category: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["enhancement"] },
					{ dataType: "enum", enums: ["code-action"] },
					{ dataType: "enum", enums: ["terminal"] },
					{ dataType: "enum", enums: ["git"] },
					{ dataType: "enum", enums: ["task"] },
				],
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	PromptTypesResponse: {
		dataType: "refObject",
		properties: {
			types: { dataType: "array", array: { dataType: "refObject", ref: "PromptTypeInfo" }, required: true },
			count: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	PromptTemplate: {
		dataType: "refObject",
		properties: {
			template: { dataType: "string", required: true },
			isCustom: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"Record_string.PromptTemplate_": {
		dataType: "refAlias",
		type: {
			dataType: "nestedObjectLiteral",
			nestedProperties: {},
			additionalProperties: { ref: "PromptTemplate" },
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	PromptsListResponse: {
		dataType: "refObject",
		properties: {
			prompts: { ref: "Record_string.PromptTemplate_", required: true },
			count: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	PromptDetailsResponse: {
		dataType: "refObject",
		properties: {
			type: { ref: "SupportPromptType", required: true },
			template: { dataType: "string", required: true },
			defaultTemplate: { dataType: "string", required: true },
			isCustom: { dataType: "boolean", required: true },
			metadata: { ref: "PromptTypeInfo" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdatePromptResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			type: { ref: "SupportPromptType", required: true },
			template: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdatePromptRequest: {
		dataType: "refObject",
		properties: {
			template: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ResetPromptResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			type: { ref: "SupportPromptType", required: true },
			template: { dataType: "string", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ResetAllPromptsResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			message: { dataType: "string", required: true },
			count: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExecutePromptResponse: {
		dataType: "refObject",
		properties: {
			type: { ref: "SupportPromptType", required: true },
			formattedPrompt: { dataType: "string", required: true },
			result: { dataType: "string" },
			executed: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"Record_string.string_": {
		dataType: "refAlias",
		type: {
			dataType: "nestedObjectLiteral",
			nestedProperties: {},
			additionalProperties: { dataType: "string" },
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExecutePromptRequest: {
		dataType: "refObject",
		properties: {
			type: { dataType: "string", required: true },
			params: { ref: "Record_string.string_", required: true },
			execute: { dataType: "boolean" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ProviderSettingsDiscriminated: {
		dataType: "refAlias",
		type: {
			dataType: "union",
			subSchemas: [
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["anthropic"], required: true },
						anthropicBeta1MContext: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						anthropicUseAuthToken: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						anthropicBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiKey: { dataType: "union", subSchemas: [{ dataType: "string" }, { dataType: "undefined" }] },
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["claude-code"], required: true },
						claudeCodeMaxOutputTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						claudeCodePath: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["glama"], required: true },
						glamaApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						glamaModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["openrouter"], required: true },
						openRouterZdr: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						openRouterProviderSort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["price"] },
										{ dataType: "enum", enums: ["throughput"] },
										{ dataType: "enum", enums: ["latency"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						openRouterProviderDataCollection: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["allow"] },
										{ dataType: "enum", enums: ["deny"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						openRouterUseMiddleOutTransform: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						openRouterSpecificProvider: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openRouterBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openRouterModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openRouterApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["bedrock"], required: true },
						awsBedrock1MContext: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						awsBedrockEndpoint: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsBedrockEndpointEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						awsModelContextWindow: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						awsCustomArn: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsUseApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						awsApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsUseProfile: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						awsProfile: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsUsePromptCache: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						awsUseCrossRegionInference: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						awsRegion: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsSessionToken: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsSecretKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						awsAccessKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["vertex"], required: true },
						enableGrounding: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						enableUrlContext: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						vertexRegion: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						vertexProjectId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						vertexJsonCredentials: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						vertexKeyFile: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["openai"], required: true },
						openAiHeaders: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "nestedObjectLiteral",
									nestedProperties: {},
									additionalProperties: { dataType: "string" },
								},
								{ dataType: "undefined" },
							],
						},
						openAiHostHeader: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openAiStreamingEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						azureApiVersion: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openAiUseAzure: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						openAiCustomModelInfo: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "nestedObjectLiteral",
											nestedProperties: {
												tiers: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "array",
															array: {
																dataType: "nestedObjectLiteral",
																nestedProperties: {
																	cacheReadsPrice: {
																		dataType: "union",
																		subSchemas: [
																			{ dataType: "double" },
																			{ dataType: "undefined" },
																		],
																	},
																	cacheWritesPrice: {
																		dataType: "union",
																		subSchemas: [
																			{ dataType: "double" },
																			{ dataType: "undefined" },
																		],
																	},
																	outputPrice: {
																		dataType: "union",
																		subSchemas: [
																			{ dataType: "double" },
																			{ dataType: "undefined" },
																		],
																	},
																	inputPrice: {
																		dataType: "union",
																		subSchemas: [
																			{ dataType: "double" },
																			{ dataType: "undefined" },
																		],
																	},
																	contextWindow: {
																		dataType: "double",
																		required: true,
																	},
																	name: {
																		dataType: "union",
																		subSchemas: [
																			{
																				dataType: "union",
																				subSchemas: [
																					{
																						dataType: "enum",
																						enums: ["default"],
																					},
																					{
																						dataType: "enum",
																						enums: ["flex"],
																					},
																					{
																						dataType: "enum",
																						enums: ["priority"],
																					},
																				],
																			},
																			{ dataType: "undefined" },
																		],
																	},
																},
															},
														},
														{ dataType: "undefined" },
													],
												},
												deprecated: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												preferredIndex: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "union",
															subSchemas: [
																{ dataType: "double" },
																{ dataType: "enum", enums: [null] },
															],
														},
														{ dataType: "undefined" },
													],
												},
												displayName: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "union",
															subSchemas: [
																{ dataType: "string" },
																{ dataType: "enum", enums: [null] },
															],
														},
														{ dataType: "undefined" },
													],
												},
												cachableFields: {
													dataType: "union",
													subSchemas: [
														{ dataType: "array", array: { dataType: "string" } },
														{ dataType: "undefined" },
													],
												},
												maxCachePoints: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												minTokensPerCachePoint: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												reasoningEffort: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "union",
															subSchemas: [
																{ dataType: "enum", enums: ["low"] },
																{ dataType: "enum", enums: ["medium"] },
																{ dataType: "enum", enums: ["high"] },
															],
														},
														{ dataType: "undefined" },
													],
												},
												description: {
													dataType: "union",
													subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
												},
												cacheReadsPrice: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												cacheWritesPrice: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												outputPrice: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												inputPrice: {
													dataType: "union",
													subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
												},
												supportedParameters: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "array",
															array: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "enum", enums: ["max_tokens"] },
																	{ dataType: "enum", enums: ["temperature"] },
																	{ dataType: "enum", enums: ["reasoning"] },
																	{ dataType: "enum", enums: ["include_reasoning"] },
																],
															},
														},
														{ dataType: "undefined" },
													],
												},
												supportsReasoningEffort: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												requiredReasoningBudget: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												supportsTemperature: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												supportsReasoningBudget: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												supportsVerbosity: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												supportsPromptCache: { dataType: "boolean", required: true },
												supportsComputerUse: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												supportsImages: {
													dataType: "union",
													subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
												},
												contextWindow: { dataType: "double", required: true },
												maxThinkingTokens: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "union",
															subSchemas: [
																{ dataType: "double" },
																{ dataType: "enum", enums: [null] },
															],
														},
														{ dataType: "undefined" },
													],
												},
												maxTokens: {
													dataType: "union",
													subSchemas: [
														{
															dataType: "union",
															subSchemas: [
																{ dataType: "double" },
																{ dataType: "enum", enums: [null] },
															],
														},
														{ dataType: "undefined" },
													],
												},
											},
										},
										{ dataType: "enum", enums: [null] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						openAiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openAiR1FormatEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						openAiLegacyFormat: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						openAiApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openAiBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["ollama"], required: true },
						ollamaNumCtx: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						ollamaApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						ollamaBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						ollamaModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["vscode-lm"], required: true },
						vsCodeLmModelSelector: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "nestedObjectLiteral",
									nestedProperties: {
										id: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
										version: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
										family: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
										vendor: {
											dataType: "union",
											subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
										},
									},
								},
								{ dataType: "undefined" },
							],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["lmstudio"], required: true },
						lmStudioSpeculativeDecodingEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						lmStudioDraftModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						lmStudioBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						lmStudioModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["gemini"], required: true },
						enableGrounding: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						enableUrlContext: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						googleGeminiBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						geminiApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["openai-native"], required: true },
						openAiNativeServiceTier: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["default"] },
										{ dataType: "enum", enums: ["flex"] },
										{ dataType: "enum", enums: ["priority"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						openAiNativeBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						openAiNativeApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["ovhcloud"], required: true },
						ovhCloudAiEndpointsBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						ovhCloudAiEndpointsModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						ovhCloudAiEndpointsApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["mistral"], required: true },
						mistralCodestralUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						mistralApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["deepseek"], required: true },
						deepSeekApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						deepSeekBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["deepinfra"], required: true },
						deepInfraModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						deepInfraApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						deepInfraBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["doubao"], required: true },
						doubaoApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						doubaoBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["moonshot"], required: true },
						moonshotApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						moonshotBaseUrl: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["https://api.moonshot.ai/v1"] },
										{ dataType: "enum", enums: ["https://api.moonshot.cn/v1"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["unbound"], required: true },
						unboundModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						unboundApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["requesty"], required: true },
						requestyModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						requestyApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						requestyBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["human-relay"], required: true },
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["fake-ai"], required: true },
						fakeAi: { dataType: "union", subSchemas: [{ dataType: "any" }, { dataType: "undefined" }] },
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["xai"], required: true },
						xaiApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["gemini-cli"], required: true },
						geminiCliProjectId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						geminiCliOAuthPath: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["hoodycode"], required: true },
						hoodycodeTesterWarningsDisabledUntil: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						openRouterZdr: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						openRouterProviderSort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["price"] },
										{ dataType: "enum", enums: ["throughput"] },
										{ dataType: "enum", enums: ["latency"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						openRouterProviderDataCollection: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["allow"] },
										{ dataType: "enum", enums: ["deny"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						openRouterSpecificProvider: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						hoodycodeModel: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						hoodycodeOrganizationId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						hoodycodeToken: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["virtual-quota-fallback"], required: true },
						profiles: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "array",
									array: {
										dataType: "nestedObjectLiteral",
										nestedProperties: {
											profileLimits: {
												dataType: "union",
												subSchemas: [
													{
														dataType: "nestedObjectLiteral",
														nestedProperties: {
															requestsPerDay: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "double" },
																	{ dataType: "undefined" },
																],
															},
															requestsPerHour: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "double" },
																	{ dataType: "undefined" },
																],
															},
															requestsPerMinute: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "double" },
																	{ dataType: "undefined" },
																],
															},
															tokensPerDay: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "double" },
																	{ dataType: "undefined" },
																],
															},
															tokensPerHour: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "double" },
																	{ dataType: "undefined" },
																],
															},
															tokensPerMinute: {
																dataType: "union",
																subSchemas: [
																	{ dataType: "double" },
																	{ dataType: "undefined" },
																],
															},
														},
													},
													{ dataType: "undefined" },
												],
											},
											profileId: {
												dataType: "union",
												subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
											},
											profileName: {
												dataType: "union",
												subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
											},
										},
									},
								},
								{ dataType: "undefined" },
							],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["synthetic"], required: true },
						syntheticApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["groq"], required: true },
						groqApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["huggingface"], required: true },
						huggingFaceInferenceProvider: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						huggingFaceModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						huggingFaceApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["chutes"], required: true },
						chutesApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["litellm"], required: true },
						litellmUsePromptCache: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						litellmModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						litellmApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						litellmBaseUrl: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["cerebras"], required: true },
						cerebrasApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["sambanova"], required: true },
						sambaNovaApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["zai"], required: true },
						zaiApiLine: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["international_coding"] },
										{ dataType: "enum", enums: ["international"] },
										{ dataType: "enum", enums: ["china_coding"] },
										{ dataType: "enum", enums: ["china"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						zaiApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["fireworks"], required: true },
						fireworksApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["featherless"], required: true },
						featherlessApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["io-intelligence"], required: true },
						ioIntelligenceApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						ioIntelligenceModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["qwen-code"], required: true },
						qwenCodeOauthPath: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["roo"], required: true },
						apiModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "enum", enums: ["vercel-ai-gateway"], required: true },
						vercelAiGatewayModelId: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						vercelAiGatewayApiKey: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						apiProvider: { dataType: "undefined" },
						taskAutoInitMessage: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitSlashCommand: {
							dataType: "union",
							subSchemas: [{ dataType: "string" }, { dataType: "undefined" }],
						},
						taskAutoInitEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						verbosity: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{ dataType: "enum", enums: ["low"] },
										{ dataType: "enum", enums: ["medium"] },
										{ dataType: "enum", enums: ["high"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						modelMaxThinkingTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						reasoningEffort: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [
										{
											dataType: "union",
											subSchemas: [
												{ dataType: "enum", enums: ["low"] },
												{ dataType: "enum", enums: ["medium"] },
												{ dataType: "enum", enums: ["high"] },
											],
										},
										{ dataType: "enum", enums: ["minimal"] },
									],
								},
								{ dataType: "undefined" },
							],
						},
						enableReasoningEffort: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						consecutiveMistakeLimit: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						rateLimitSeconds: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						modelTemperature: {
							dataType: "union",
							subSchemas: [
								{
									dataType: "union",
									subSchemas: [{ dataType: "double" }, { dataType: "enum", enums: [null] }],
								},
								{ dataType: "undefined" },
							],
						},
						fuzzyMatchThreshold: {
							dataType: "union",
							subSchemas: [{ dataType: "double" }, { dataType: "undefined" }],
						},
						todoListEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						diffEnabled: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
						includeMaxTokens: {
							dataType: "union",
							subSchemas: [{ dataType: "boolean" }, { dataType: "undefined" }],
						},
					},
				},
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ProfileDetails: {
		dataType: "refAlias",
		type: {
			dataType: "intersection",
			subSchemas: [
				{ ref: "ProviderSettingsDiscriminated" },
				{
					dataType: "nestedObjectLiteral",
					nestedProperties: {
						isActive: { dataType: "boolean" },
						name: { dataType: "string", required: true },
					},
				},
			],
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ProfileListItem: {
		dataType: "refObject",
		properties: {
			name: { dataType: "string", required: true },
			id: { dataType: "string", required: true },
			apiProvider: { dataType: "string" },
			modelId: { dataType: "string" },
			isActive: { dataType: "boolean" },
			config: { ref: "ProfileDetails" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateProfileResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			id: { dataType: "string", required: true },
			name: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateProfileRequest: {
		dataType: "refObject",
		properties: {
			name: { dataType: "string", required: true },
			config: { ref: "ProviderSettingsDiscriminated", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateProfileResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			id: { dataType: "string", required: true },
			name: { dataType: "string", required: true },
			config: { ref: "ProfileDetails" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateProfileRequest: {
		dataType: "refObject",
		properties: {
			config: { ref: "ProviderSettingsDiscriminated", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	DeleteProfileResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ActivateProfileResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			profile: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					config: { ref: "ProfileDetails", required: true },
					isActive: { dataType: "enum", enums: [true], required: true },
					id: { dataType: "string", required: true },
					name: { dataType: "string", required: true },
				},
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ModeProfileResponse: {
		dataType: "refObject",
		properties: {
			mode: { dataType: "string", required: true },
			profileId: { dataType: "string", required: true },
			profileName: { dataType: "string", required: true },
			profile: { ref: "ProfileDetails", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SetModeProfileResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			mode: { dataType: "string", required: true },
			profileId: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	SetModeProfileRequest: {
		dataType: "refObject",
		properties: {
			profileId: { dataType: "string" },
			profileName: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemoryEntry: {
		dataType: "refObject",
		properties: {
			id: { dataType: "string", required: true },
			path: { dataType: "string", required: true },
			title: { dataType: "string", required: true },
			content: { dataType: "string", required: true },
			scope: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["global"] },
					{ dataType: "enum", enums: ["local"] },
				],
				required: true,
			},
			category: { dataType: "string" },
			tags: { dataType: "array", array: { dataType: "string" } },
			enabled: { dataType: "boolean", required: true },
			createdAt: { dataType: "string", required: true },
			updatedAt: { dataType: "string", required: true },
			size: { dataType: "double" },
			metadata: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					autoGenerated: { dataType: "boolean" },
					taskId: { dataType: "string" },
					source: { dataType: "string" },
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemoryListResponse: {
		dataType: "refObject",
		properties: {
			entries: { dataType: "array", array: { dataType: "refObject", ref: "MemoryEntry" }, required: true },
			count: { dataType: "double", required: true },
			scope: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["global"] },
					{ dataType: "enum", enums: ["local"] },
					{ dataType: "enum", enums: ["all"] },
				],
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemoryStatsResponse: {
		dataType: "refObject",
		properties: {
			total: { dataType: "double", required: true },
			enabled: { dataType: "double", required: true },
			disabled: { dataType: "double", required: true },
			global: { dataType: "double", required: true },
			local: { dataType: "double", required: true },
			totalSize: { dataType: "double", required: true },
			categories: { ref: "Record_string.number_", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateMemoryResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			entry: { ref: "MemoryEntry", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateMemoryRequest: {
		dataType: "refObject",
		properties: {
			filename: { dataType: "string", required: true },
			content: { dataType: "string", required: true },
			scope: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["global"] },
					{ dataType: "enum", enums: ["local"] },
				],
				required: true,
			},
			category: { dataType: "string" },
			tags: { dataType: "array", array: { dataType: "string" } },
			metadata: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					autoGenerated: { dataType: "boolean" },
					taskId: { dataType: "string" },
					source: { dataType: "string" },
				},
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateMemoryResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			entry: { ref: "MemoryEntry", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateMemoryRequest: {
		dataType: "refObject",
		properties: {
			content: { dataType: "string" },
			enabled: { dataType: "boolean" },
			tags: { dataType: "array", array: { dataType: "string" } },
			category: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ToggleMemoryResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "enum", enums: [true], required: true },
			message: { dataType: "string", required: true },
			enabled: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemorySearchResult: {
		dataType: "refObject",
		properties: {
			entry: { ref: "MemoryEntry", required: true },
			score: { dataType: "double", required: true },
			matches: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemorySearchResponse: {
		dataType: "refObject",
		properties: {
			results: { dataType: "array", array: { dataType: "refObject", ref: "MemorySearchResult" }, required: true },
			count: { dataType: "double", required: true },
			query: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemorySuggestion: {
		dataType: "refObject",
		properties: {
			type: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["repetition"] },
					{ dataType: "enum", enums: ["success"] },
					{ dataType: "enum", enums: ["error_fix"] },
					{ dataType: "enum", enums: ["best_practice"] },
				],
				required: true,
			},
			title: { dataType: "string", required: true },
			reason: { dataType: "string", required: true },
			proposedContent: { dataType: "string", required: true },
			confidence: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	MemorySuggestionsResponse: {
		dataType: "refObject",
		properties: {
			suggestions: {
				dataType: "array",
				array: { dataType: "refObject", ref: "MemorySuggestion" },
				required: true,
			},
			count: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	McpServerListResponse: {
		dataType: "refObject",
		properties: {
			servers: { dataType: "array", array: { dataType: "any" }, required: true },
			total: { dataType: "double", required: true },
			message: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	McpMarketplaceResponse: {
		dataType: "refObject",
		properties: {
			catalog: {
				dataType: "nestedObjectLiteral",
				nestedProperties: { items: { dataType: "array", array: { dataType: "any" }, required: true } },
				required: true,
			},
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	InstallMcpResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			mcpId: { dataType: "string", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	InstallMcpRequest: {
		dataType: "refObject",
		properties: {
			mcpId: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	LogEntry: {
		dataType: "refObject",
		properties: {
			timestamp: { dataType: "string", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	LogsResponse: {
		dataType: "refObject",
		properties: {
			logs: { dataType: "array", array: { dataType: "refObject", ref: "LogEntry" }, required: true },
			totalInBuffer: { dataType: "double", required: true },
			maxBufferSize: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ProcessMetrics: {
		dataType: "refObject",
		properties: {
			memoryUsageMB: { dataType: "double", required: true },
			memoryPercent: { dataType: "double", required: true },
			cpuPercent: { dataType: "double", required: true },
			pid: { dataType: "double", required: true },
			heapUsedMB: { dataType: "double", required: true },
			heapTotalMB: { dataType: "double", required: true },
			externalMB: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	HealthCheckResponse: {
		dataType: "refObject",
		properties: {
			status: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["ok"] },
					{ dataType: "enum", enums: ["error"] },
				],
				required: true,
			},
			version: { dataType: "string", required: true },
			uptime: { dataType: "double", required: true },
			activeConnections: { dataType: "double", required: true },
			port: { dataType: "double", required: true },
			process: { ref: "ProcessMetrics", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	FileEntry: {
		dataType: "refObject",
		properties: {
			path: { dataType: "string", required: true },
			name: { dataType: "string", required: true },
			type: {
				dataType: "union",
				subSchemas: [
					{ dataType: "enum", enums: ["file"] },
					{ dataType: "enum", enums: ["directory"] },
				],
				required: true,
			},
			size: { dataType: "double" },
			created: { dataType: "string" },
			modified: { dataType: "string" },
			children: { dataType: "array", array: { dataType: "refObject", ref: "FileEntry" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ListFilesResponse: {
		dataType: "refObject",
		properties: {
			files: { dataType: "array", array: { dataType: "refObject", ref: "FileEntry" }, required: true },
			total: { dataType: "double", required: true },
			workspace: { dataType: "string", required: true },
			truncated: { dataType: "boolean", required: true },
			limitReached: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	FileContent: {
		dataType: "refObject",
		properties: {
			path: { dataType: "string", required: true },
			content: { dataType: "string" },
			size: { dataType: "double" },
			error: { dataType: "string" },
			success: { dataType: "boolean", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ReadFilesResponse: {
		dataType: "refObject",
		properties: {
			files: { dataType: "array", array: { dataType: "refObject", ref: "FileContent" }, required: true },
			workspace: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	WorkspaceInfoResponse: {
		dataType: "refObject",
		properties: {
			path: { dataType: "string" },
			exists: { dataType: "boolean", required: true },
			mode: { dataType: "string" },
			customInstructions: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	"Record_string.any_": {
		dataType: "refAlias",
		type: {
			dataType: "nestedObjectLiteral",
			nestedProperties: {},
			additionalProperties: { dataType: "any" },
			validators: {},
		},
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	OpenAPISpec: {
		dataType: "refObject",
		properties: {
			openapi: { dataType: "string", required: true },
			info: {
				dataType: "nestedObjectLiteral",
				nestedProperties: {
					description: { dataType: "string", required: true },
					version: { dataType: "string", required: true },
					title: { dataType: "string", required: true },
				},
				additionalProperties: { dataType: "any" },
				required: true,
			},
			paths: { ref: "Record_string.any_", required: true },
			components: { ref: "Record_string.any_" },
		},
		additionalProperties: { dataType: "any" },
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CommandListItem: {
		dataType: "refObject",
		properties: {
			name: { dataType: "string", required: true },
			source: { dataType: "string", required: true },
			description: { dataType: "string" },
			argumentHint: { dataType: "string" },
			filePath: { dataType: "string", required: true },
			content: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CommandsListResponse: {
		dataType: "refObject",
		properties: {
			commands: { dataType: "array", array: { dataType: "refObject", ref: "CommandListItem" }, required: true },
			total: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CommandNamesResponse: {
		dataType: "refObject",
		properties: {
			names: { dataType: "array", array: { dataType: "string" }, required: true },
			total: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CommandDetails: {
		dataType: "refObject",
		properties: {
			name: { dataType: "string", required: true },
			source: { dataType: "string", required: true },
			description: { dataType: "string" },
			argumentHint: { dataType: "string" },
			filePath: { dataType: "string", required: true },
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateCommandResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			command: { ref: "CommandDetails", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	CreateCommandRequest: {
		dataType: "refObject",
		properties: {
			name: { dataType: "string", required: true },
			content: { dataType: "string", required: true },
			description: { dataType: "string" },
			argumentHint: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateCommandResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			command: { ref: "CommandDetails", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	UpdateCommandRequest: {
		dataType: "refObject",
		properties: {
			content: { dataType: "string" },
			description: { dataType: "string" },
			argumentHint: { dataType: "string" },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	DeleteCommandResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExecuteSlashCommandResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			taskId: { dataType: "string", required: true },
			commandName: { dataType: "string", required: true },
			commandSource: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ExecuteSlashCommandRequest: {
		dataType: "refObject",
		properties: {
			args: { dataType: "string" },
			mode: { dataType: "string" },
			images: { dataType: "array", array: { dataType: "string" } },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ValidateCommandResponse: {
		dataType: "refObject",
		properties: {
			valid: { dataType: "boolean", required: true },
			frontmatter: { ref: "Record_string.any_", required: true },
			contentPreview: { dataType: "string", required: true },
			contentLength: { dataType: "double", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	ValidateCommandRequest: {
		dataType: "refObject",
		properties: {
			content: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IndexStatusResponse: {
		dataType: "refObject",
		properties: {
			status: { dataType: "string", required: true },
			message: { dataType: "string" },
		},
		additionalProperties: { dataType: "any" },
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IndexOperationResponse: {
		dataType: "refObject",
		properties: {
			success: { dataType: "boolean", required: true },
			message: { dataType: "string", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	IndexConfigResponse: {
		dataType: "refObject",
		properties: {
			config: { dataType: "any", required: true },
			models: { dataType: "any", required: true },
		},
		additionalProperties: false,
	},
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
const templateService = new ExpressTemplateService(models, {
	noImplicitAdditionalProperties: "silently-remove-extras",
	bodyCoercion: true,
})

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
	// ###########################################################################################################
	//  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
	//      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
	// ###########################################################################################################

	const argsTodoController_getTodoList: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.get(
		"/agent/todos/:taskId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.getTodoList),

		async function TodoController_getTodoList(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_getTodoList,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "getTodoList",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTodoController_createTodo: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "CreateTodoRequest" },
	}
	app.post(
		"/agent/todos/:taskId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.createTodo),

		async function TodoController_createTodo(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_createTodo,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "createTodo",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTodoController_updateTodo: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		todoId: { in: "path", name: "todoId", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "UpdateTodoRequest" },
	}
	app.patch(
		"/agent/todos/:taskId/:todoId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.updateTodo),

		async function TodoController_updateTodo(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_updateTodo,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "updateTodo",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTodoController_deleteTodo: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		todoId: { in: "path", name: "todoId", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/todos/:taskId/:todoId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.deleteTodo),

		async function TodoController_deleteTodo(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_deleteTodo,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "deleteTodo",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 204,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTodoController_bulkUpdateTodos: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "BulkUpdateTodosRequest" },
	}
	app.post(
		"/agent/todos/:taskId/bulk",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.bulkUpdateTodos),

		async function TodoController_bulkUpdateTodos(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_bulkUpdateTodos,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "bulkUpdateTodos",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTodoController_importTodos: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "ImportTodosRequest" },
	}
	app.post(
		"/agent/todos/:taskId/import",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.importTodos),

		async function TodoController_importTodos(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_importTodos,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "importTodos",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTodoController_exportTodos: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.get(
		"/agent/todos/:taskId/export",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TodoController),
		...fetchMiddlewares<RequestHandler>(TodoController.prototype.exportTodos),

		async function TodoController_exportTodos(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTodoController_exportTodos,
					request,
					response,
				})

				const controller = new TodoController()

				await templateService.apiHandler({
					methodName: "exportTodos",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTerminalController_executeCommand: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "ExecuteCommandRequest" },
	}
	app.post(
		"/agent/terminal/execute",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TerminalController),
		...fetchMiddlewares<RequestHandler>(TerminalController.prototype.executeCommand),

		async function TerminalController_executeCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTerminalController_executeCommand,
					request,
					response,
				})

				const controller = new TerminalController()

				await templateService.apiHandler({
					methodName: "executeCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTerminalController_getTerminalInfo: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/terminal/info",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TerminalController),
		...fetchMiddlewares<RequestHandler>(TerminalController.prototype.getTerminalInfo),

		async function TerminalController_getTerminalInfo(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTerminalController_getTerminalInfo,
					request,
					response,
				})

				const controller = new TerminalController()

				await templateService.apiHandler({
					methodName: "getTerminalInfo",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_createTask: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "CreateTaskRequest" },
	}
	app.post(
		"/agent/tasks",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.createTask),

		async function TasksController_createTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_createTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "createTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_listTasks: Record<string, TsoaRoute.ParameterSchema> = {
		page: { in: "query", name: "page", dataType: "double" },
		limit: { in: "query", name: "limit", dataType: "double" },
		sort: { in: "query", name: "sort", dataType: "string" },
		workspace: { in: "query", name: "workspace", dataType: "string" },
		favorites: { in: "query", name: "favorites", dataType: "string" },
		mode: { in: "query", name: "mode", dataType: "string" },
		dateFrom: { in: "query", name: "dateFrom", dataType: "string" },
		dateTo: { in: "query", name: "dateTo", dataType: "string" },
		search: { in: "query", name: "search", dataType: "string" },
		includeLastMessage: { in: "query", name: "includeLastMessage", dataType: "boolean" },
		includeHierarchy: { in: "query", name: "includeHierarchy", dataType: "boolean" },
	}
	app.get(
		"/agent/tasks",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.listTasks),

		async function TasksController_listTasks(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_listTasks,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "listTasks",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_getTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		includeParsed: { in: "query", name: "includeParsed", dataType: "boolean" },
		includeRaw: { in: "query", name: "includeRaw", dataType: "boolean" },
	}
	app.get(
		"/agent/tasks/:taskId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.getTask),

		async function TasksController_getTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_getTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "getTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_deleteTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/tasks/:taskId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.deleteTask),

		async function TasksController_deleteTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_deleteTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "deleteTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 204,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_resumeTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.post(
		"/agent/tasks/:taskId/resume",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.resumeTask),

		async function TasksController_resumeTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_resumeTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "resumeTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_respondToTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "RespondToTaskRequest" },
	}
	app.post(
		"/agent/tasks/:taskId/respond",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.respondToTask),

		async function TasksController_respondToTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_respondToTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "respondToTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_cancelTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.post(
		"/agent/tasks/:taskId/cancel",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.cancelTask),

		async function TasksController_cancelTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_cancelTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "cancelTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_toggleFavorite: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.post(
		"/agent/tasks/:taskId/favorite",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.toggleFavorite),

		async function TasksController_toggleFavorite(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_toggleFavorite,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "toggleFavorite",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_exportTaskJson: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.get(
		"/agent/tasks/:taskId/export/json",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.exportTaskJson),

		async function TasksController_exportTaskJson(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_exportTaskJson,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "exportTaskJson",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_exportTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.post(
		"/agent/tasks/:taskId/export",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.exportTask),

		async function TasksController_exportTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_exportTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "exportTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_importTaskJson: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "ImportTaskRequest" },
	}
	app.post(
		"/agent/tasks/import/json",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.importTaskJson),

		async function TasksController_importTaskJson(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_importTaskJson,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "importTaskJson",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_condenseTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.post(
		"/agent/tasks/:taskId/condense",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.condenseTask),

		async function TasksController_condenseTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_condenseTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "condenseTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_getMessageQueue: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.get(
		"/agent/tasks/:taskId/queue",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.getMessageQueue),

		async function TasksController_getMessageQueue(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_getMessageQueue,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "getMessageQueue",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_addToQueue: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "AddToQueueRequest" },
	}
	app.post(
		"/agent/tasks/:taskId/queue",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.addToQueue),

		async function TasksController_addToQueue(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_addToQueue,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "addToQueue",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_updateQueuedMessage: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		messageId: { in: "path", name: "messageId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "UpdateQueueMessageRequest" },
	}
	app.put(
		"/agent/tasks/:taskId/queue/:messageId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.updateQueuedMessage),

		async function TasksController_updateQueuedMessage(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_updateQueuedMessage,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "updateQueuedMessage",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_deleteQueuedMessage: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		messageId: { in: "path", name: "messageId", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/tasks/:taskId/queue/:messageId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.deleteQueuedMessage),

		async function TasksController_deleteQueuedMessage(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_deleteQueuedMessage,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "deleteQueuedMessage",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 204,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_clearMessageQueue: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/tasks/:taskId/queue",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.clearMessageQueue),

		async function TasksController_clearMessageQueue(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_clearMessageQueue,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "clearMessageQueue",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_batchDeleteTasks: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "BatchDeleteRequest" },
	}
	app.delete(
		"/agent/tasks/batch",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.batchDeleteTasks),

		async function TasksController_batchDeleteTasks(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_batchDeleteTasks,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "batchDeleteTasks",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_listCheckpoints: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
	}
	app.get(
		"/agent/tasks/:taskId/checkpoints",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.listCheckpoints),

		async function TasksController_listCheckpoints(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_listCheckpoints,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "listCheckpoints",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_restoreCheckpoint: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "RestoreCheckpointRequest" },
	}
	app.post(
		"/agent/tasks/:taskId/checkpoints/restore",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.restoreCheckpoint),

		async function TasksController_restoreCheckpoint(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_restoreCheckpoint,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "restoreCheckpoint",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_getCheckpointDiff: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		hash: { in: "path", name: "hash", required: true, dataType: "string" },
	}
	app.get(
		"/agent/tasks/:taskId/checkpoints/:hash/diff",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.getCheckpointDiff),

		async function TasksController_getCheckpointDiff(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_getCheckpointDiff,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "getCheckpointDiff",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_forkTask: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "ForkTaskRequest" },
	}
	app.post(
		"/agent/tasks/:taskId/fork",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.forkTask),

		async function TasksController_forkTask(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_forkTask,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "forkTask",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_editMessage: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		timestamp: { in: "path", name: "timestamp", required: true, dataType: "double" },
		body: { in: "body", name: "body", required: true, ref: "EditMessageRequest" },
	}
	app.patch(
		"/agent/tasks/:taskId/messages/:timestamp",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.editMessage),

		async function TasksController_editMessage(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_editMessage,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "editMessage",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_digestMessage: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		timestamp: { in: "path", name: "timestamp", required: true, dataType: "double" },
		body: { in: "body", name: "body", required: true, ref: "DigestMessageRequest" },
	}
	app.post(
		"/agent/tasks/:taskId/messages/:timestamp/digest",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.digestMessage),

		async function TasksController_digestMessage(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_digestMessage,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "digestMessage",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_toggleTaskDigest: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "ToggleTaskDigestRequest" },
	}
	app.post(
		"/agent/tasks/:taskId/digest/toggle",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.toggleTaskDigest),

		async function TasksController_toggleTaskDigest(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_toggleTaskDigest,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "toggleTaskDigest",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsTasksController_updateTaskMode: Record<string, TsoaRoute.ParameterSchema> = {
		taskId: { in: "path", name: "taskId", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "UpdateTaskModeRequest" },
	}
	app.patch(
		"/agent/tasks/:taskId/mode",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(TasksController),
		...fetchMiddlewares<RequestHandler>(TasksController.prototype.updateTaskMode),

		async function TasksController_updateTaskMode(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsTasksController_updateTaskMode,
					request,
					response,
				})

				const controller = new TasksController()

				await templateService.apiHandler({
					methodName: "updateTaskMode",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsStateController_getState: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/state",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(StateController),
		...fetchMiddlewares<RequestHandler>(StateController.prototype.getState),

		async function StateController_getState(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsStateController_getState,
					request,
					response,
				})

				const controller = new StateController()

				await templateService.apiHandler({
					methodName: "getState",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsStateController_getConfig: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/state/config",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(StateController),
		...fetchMiddlewares<RequestHandler>(StateController.prototype.getConfig),

		async function StateController_getConfig(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsStateController_getConfig,
					request,
					response,
				})

				const controller = new StateController()

				await templateService.apiHandler({
					methodName: "getConfig",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsStateController_updateConfig: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "ConfigurationUpdateRequest" },
	}
	app.patch(
		"/agent/state/config",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(StateController),
		...fetchMiddlewares<RequestHandler>(StateController.prototype.updateConfig),

		async function StateController_updateConfig(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsStateController_updateConfig,
					request,
					response,
				})

				const controller = new StateController()

				await templateService.apiHandler({
					methodName: "updateConfig",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsStateController_getModes: Record<string, TsoaRoute.ParameterSchema> = {
		includeProfileConfig: { in: "query", name: "includeProfileConfig", dataType: "boolean" },
	}
	app.get(
		"/agent/state/modes",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(StateController),
		...fetchMiddlewares<RequestHandler>(StateController.prototype.getModes),

		async function StateController_getModes(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsStateController_getModes,
					request,
					response,
				})

				const controller = new StateController()

				await templateService.apiHandler({
					methodName: "getModes",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsStateController_getCurrentModel: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/state/model",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(StateController),
		...fetchMiddlewares<RequestHandler>(StateController.prototype.getCurrentModel),

		async function StateController_getCurrentModel(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsStateController_getCurrentModel,
					request,
					response,
				})

				const controller = new StateController()

				await templateService.apiHandler({
					methodName: "getCurrentModel",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_getSettings: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/settings",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.getSettings),

		async function SettingsController_getSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_getSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "getSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_updateSettings: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "SettingsUpdateRequest" },
	}
	app.patch(
		"/agent/settings",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.updateSettings),

		async function SettingsController_updateSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_updateSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "updateSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_getAutoApproval: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/settings/auto-approval",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.getAutoApproval),

		async function SettingsController_getAutoApproval(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_getAutoApproval,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "getAutoApproval",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_updateAutoApproval: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "AutoApprovalSettings" },
	}
	app.put(
		"/agent/settings/auto-approval",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.updateAutoApproval),

		async function SettingsController_updateAutoApproval(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_updateAutoApproval,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "updateAutoApproval",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_getTerminalSettings: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/settings/terminal",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.getTerminalSettings),

		async function SettingsController_getTerminalSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_getTerminalSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "getTerminalSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_getBrowserSettings: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/settings/browser",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.getBrowserSettings),

		async function SettingsController_getBrowserSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_getBrowserSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "getBrowserSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_getCondenseSettings: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/settings/condense",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.getCondenseSettings),

		async function SettingsController_getCondenseSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_getCondenseSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "getCondenseSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_updateCondenseSettings: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "CondenseSettings" },
	}
	app.put(
		"/agent/settings/condense",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.updateCondenseSettings),

		async function SettingsController_updateCondenseSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_updateCondenseSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "updateCondenseSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_getDigestSettings: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/settings/digest",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.getDigestSettings),

		async function SettingsController_getDigestSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_getDigestSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "getDigestSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSettingsController_updateDigestSettings: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "DigestSettings" },
	}
	app.put(
		"/agent/settings/digest",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(SettingsController),
		...fetchMiddlewares<RequestHandler>(SettingsController.prototype.updateDigestSettings),

		async function SettingsController_updateDigestSettings(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSettingsController_updateDigestSettings,
					request,
					response,
				})

				const controller = new SettingsController()

				await templateService.apiHandler({
					methodName: "updateDigestSettings",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getToolResponseSchemas: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/tool-responses",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getToolResponseSchemas),

		async function SchemasController_getToolResponseSchemas(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getToolResponseSchemas,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getToolResponseSchemas",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getWebSocketMessageSchemas: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/websocket-messages",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getWebSocketMessageSchemas),

		async function SchemasController_getWebSocketMessageSchemas(
			request: ExRequest,
			response: ExResponse,
			next: any,
		) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getWebSocketMessageSchemas,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getWebSocketMessageSchemas",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getBrowserActionSchemas: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/browser-actions",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getBrowserActionSchemas),

		async function SchemasController_getBrowserActionSchemas(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getBrowserActionSchemas,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getBrowserActionSchemas",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getCommandExecutionStatusSchema: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/command-execution-status",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getCommandExecutionStatusSchema),

		async function SchemasController_getCommandExecutionStatusSchema(
			request: ExRequest,
			response: ExResponse,
			next: any,
		) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getCommandExecutionStatusSchema,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getCommandExecutionStatusSchema",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getApiRequestInfoSchema: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/api-request-info",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getApiRequestInfoSchema),

		async function SchemasController_getApiRequestInfoSchema(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getApiRequestInfoSchema,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getApiRequestInfoSchema",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getToolTypes: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/tool-types",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getToolTypes),

		async function SchemasController_getToolTypes(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getToolTypes,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getToolTypes",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsSchemasController_getWebSocketMessageTypes: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/schemas/websocket-message-types",
		...fetchMiddlewares<RequestHandler>(SchemasController),
		...fetchMiddlewares<RequestHandler>(SchemasController.prototype.getWebSocketMessageTypes),

		async function SchemasController_getWebSocketMessageTypes(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsSchemasController_getWebSocketMessageTypes,
					request,
					response,
				})

				const controller = new SchemasController()

				await templateService.apiHandler({
					methodName: "getWebSocketMessageTypes",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_getPromptTypes: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/prompts/types",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.getPromptTypes),

		async function PromptsController_getPromptTypes(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_getPromptTypes,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "getPromptTypes",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_getAllPrompts: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/prompts",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.getAllPrompts),

		async function PromptsController_getAllPrompts(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_getAllPrompts,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "getAllPrompts",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_getPrompt: Record<string, TsoaRoute.ParameterSchema> = {
		type: { in: "path", name: "type", required: true, dataType: "string" },
	}
	app.get(
		"/agent/prompts/:type",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.getPrompt),

		async function PromptsController_getPrompt(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_getPrompt,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "getPrompt",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_updatePrompt: Record<string, TsoaRoute.ParameterSchema> = {
		type: { in: "path", name: "type", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "UpdatePromptRequest" },
	}
	app.put(
		"/agent/prompts/:type",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.updatePrompt),

		async function PromptsController_updatePrompt(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_updatePrompt,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "updatePrompt",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_resetPrompt: Record<string, TsoaRoute.ParameterSchema> = {
		type: { in: "path", name: "type", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/prompts/:type",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.resetPrompt),

		async function PromptsController_resetPrompt(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_resetPrompt,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "resetPrompt",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_resetAllPrompts: Record<string, TsoaRoute.ParameterSchema> = {}
	app.delete(
		"/agent/prompts",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.resetAllPrompts),

		async function PromptsController_resetAllPrompts(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_resetAllPrompts,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "resetAllPrompts",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsPromptsController_executePrompt: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "ExecutePromptRequest" },
	}
	app.post(
		"/agent/prompts/execute",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(PromptsController),
		...fetchMiddlewares<RequestHandler>(PromptsController.prototype.executePrompt),

		async function PromptsController_executePrompt(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsPromptsController_executePrompt,
					request,
					response,
				})

				const controller = new PromptsController()

				await templateService.apiHandler({
					methodName: "executePrompt",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_listProfiles: Record<string, TsoaRoute.ParameterSchema> = {
		includeConfig: { in: "query", name: "includeConfig", dataType: "boolean" },
	}
	app.get(
		"/agent/profiles",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.listProfiles),

		async function ProfilesController_listProfiles(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_listProfiles,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "listProfiles",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_getProfile: Record<string, TsoaRoute.ParameterSchema> = {
		nameOrId: { in: "path", name: "nameOrId", required: true, dataType: "string" },
		includeConfig: { in: "query", name: "includeConfig", dataType: "boolean" },
	}
	app.get(
		"/agent/profiles/:nameOrId",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.getProfile),

		async function ProfilesController_getProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_getProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "getProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_createProfile: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "CreateProfileRequest" },
	}
	app.post(
		"/agent/profiles",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.createProfile),

		async function ProfilesController_createProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_createProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "createProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_updateProfile: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "UpdateProfileRequest" },
	}
	app.put(
		"/agent/profiles/:name",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.updateProfile),

		async function ProfilesController_updateProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_updateProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "updateProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_deleteProfile: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/profiles/:name",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.deleteProfile),

		async function ProfilesController_deleteProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_deleteProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "deleteProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_activateProfile: Record<string, TsoaRoute.ParameterSchema> = {
		nameOrId: { in: "path", name: "nameOrId", required: true, dataType: "string" },
	}
	app.post(
		"/agent/profiles/:nameOrId/activate",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.activateProfile),

		async function ProfilesController_activateProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_activateProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "activateProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_getModeProfile: Record<string, TsoaRoute.ParameterSchema> = {
		mode: { in: "path", name: "mode", required: true, dataType: "string" },
	}
	app.get(
		"/agent/profiles/modes/:mode",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.getModeProfile),

		async function ProfilesController_getModeProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_getModeProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "getModeProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsProfilesController_setModeProfile: Record<string, TsoaRoute.ParameterSchema> = {
		mode: { in: "path", name: "mode", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "SetModeProfileRequest" },
	}
	app.put(
		"/agent/profiles/modes/:mode",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(ProfilesController),
		...fetchMiddlewares<RequestHandler>(ProfilesController.prototype.setModeProfile),

		async function ProfilesController_setModeProfile(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsProfilesController_setModeProfile,
					request,
					response,
				})

				const controller = new ProfilesController()

				await templateService.apiHandler({
					methodName: "setModeProfile",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_listMemories: Record<string, TsoaRoute.ParameterSchema> = {
		scope: {
			in: "query",
			name: "scope",
			dataType: "union",
			subSchemas: [
				{ dataType: "enum", enums: ["global"] },
				{ dataType: "enum", enums: ["local"] },
				{ dataType: "enum", enums: ["all"] },
			],
		},
		enabled: { in: "query", name: "enabled", dataType: "boolean" },
		category: { in: "query", name: "category", dataType: "string" },
	}
	app.get(
		"/agent/memory-bank",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.listMemories),

		async function MemoryBankController_listMemories(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_listMemories,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "listMemories",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_getStats: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/memory-bank/stats",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.getStats),

		async function MemoryBankController_getStats(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_getStats,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "getStats",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_getMemory: Record<string, TsoaRoute.ParameterSchema> = {
		id: { in: "path", name: "id", required: true, dataType: "string" },
	}
	app.get(
		"/agent/memory-bank/:id",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.getMemory),

		async function MemoryBankController_getMemory(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_getMemory,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "getMemory",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_createMemory: Record<string, TsoaRoute.ParameterSchema> = {
		request: { in: "body", name: "request", required: true, ref: "CreateMemoryRequest" },
	}
	app.post(
		"/agent/memory-bank",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.createMemory),

		async function MemoryBankController_createMemory(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_createMemory,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "createMemory",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_updateMemory: Record<string, TsoaRoute.ParameterSchema> = {
		id: { in: "path", name: "id", required: true, dataType: "string" },
		request: { in: "body", name: "request", required: true, ref: "UpdateMemoryRequest" },
	}
	app.patch(
		"/agent/memory-bank/:id",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.updateMemory),

		async function MemoryBankController_updateMemory(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_updateMemory,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "updateMemory",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_deleteMemory: Record<string, TsoaRoute.ParameterSchema> = {
		id: { in: "path", name: "id", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/memory-bank/:id",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.deleteMemory),

		async function MemoryBankController_deleteMemory(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_deleteMemory,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "deleteMemory",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 204,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_toggleMemory: Record<string, TsoaRoute.ParameterSchema> = {
		id: { in: "path", name: "id", required: true, dataType: "string" },
	}
	app.post(
		"/agent/memory-bank/:id/toggle",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.toggleMemory),

		async function MemoryBankController_toggleMemory(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_toggleMemory,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "toggleMemory",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_searchMemories: Record<string, TsoaRoute.ParameterSchema> = {
		body: {
			in: "body",
			name: "body",
			required: true,
			dataType: "nestedObjectLiteral",
			nestedProperties: {
				scope: {
					dataType: "union",
					subSchemas: [
						{ dataType: "enum", enums: ["global"] },
						{ dataType: "enum", enums: ["local"] },
						{ dataType: "enum", enums: ["all"] },
					],
				},
				query: { dataType: "string", required: true },
			},
		},
	}
	app.post(
		"/agent/memory-bank/search",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.searchMemories),

		async function MemoryBankController_searchMemories(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_searchMemories,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "searchMemories",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMemoryBankController_getSuggestions: Record<string, TsoaRoute.ParameterSchema> = {
		body: {
			in: "body",
			name: "body",
			required: true,
			dataType: "nestedObjectLiteral",
			nestedProperties: { context: { dataType: "string" }, taskId: { dataType: "string" } },
		},
	}
	app.post(
		"/agent/memory-bank/suggest",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(MemoryBankController),
		...fetchMiddlewares<RequestHandler>(MemoryBankController.prototype.getSuggestions),

		async function MemoryBankController_getSuggestions(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMemoryBankController_getSuggestions,
					request,
					response,
				})

				const controller = new MemoryBankController()

				await templateService.apiHandler({
					methodName: "getSuggestions",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMcpController_listServers: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/mcp/servers",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(McpController),
		...fetchMiddlewares<RequestHandler>(McpController.prototype.listServers),

		async function McpController_listServers(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMcpController_listServers,
					request,
					response,
				})

				const controller = new McpController()

				await templateService.apiHandler({
					methodName: "listServers",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMcpController_getServer: Record<string, TsoaRoute.ParameterSchema> = {
		serverName: { in: "path", name: "serverName", required: true, dataType: "string" },
	}
	app.get(
		"/agent/mcp/servers/:serverName",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(McpController),
		...fetchMiddlewares<RequestHandler>(McpController.prototype.getServer),

		async function McpController_getServer(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMcpController_getServer,
					request,
					response,
				})

				const controller = new McpController()

				await templateService.apiHandler({
					methodName: "getServer",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMcpController_getMarketplace: Record<string, TsoaRoute.ParameterSchema> = {
		refresh: { in: "query", name: "refresh", dataType: "string" },
	}
	app.get(
		"/agent/mcp/marketplace",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(McpController),
		...fetchMiddlewares<RequestHandler>(McpController.prototype.getMarketplace),

		async function McpController_getMarketplace(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMcpController_getMarketplace,
					request,
					response,
				})

				const controller = new McpController()

				await templateService.apiHandler({
					methodName: "getMarketplace",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsMcpController_installPackage: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "InstallMcpRequest" },
	}
	app.post(
		"/agent/mcp/marketplace/install",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(McpController),
		...fetchMiddlewares<RequestHandler>(McpController.prototype.installPackage),

		async function McpController_installPackage(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsMcpController_installPackage,
					request,
					response,
				})

				const controller = new McpController()

				await templateService.apiHandler({
					methodName: "installPackage",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsLogsController_getLogs: Record<string, TsoaRoute.ParameterSchema> = {
		req: { in: "request", name: "req", required: true, dataType: "object" },
	}
	app.get(
		"/agent/logs",
		...fetchMiddlewares<RequestHandler>(LogsController),
		...fetchMiddlewares<RequestHandler>(LogsController.prototype.getLogs),

		async function LogsController_getLogs(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsLogsController_getLogs,
					request,
					response,
				})

				const controller = new LogsController()

				await templateService.apiHandler({
					methodName: "getLogs",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: undefined,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsHealthController_healthCheck: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/health",
		...fetchMiddlewares<RequestHandler>(HealthController),
		...fetchMiddlewares<RequestHandler>(HealthController.prototype.healthCheck),

		async function HealthController_healthCheck(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsHealthController_healthCheck,
					request,
					response,
				})

				const controller = new HealthController()

				await templateService.apiHandler({
					methodName: "healthCheck",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsVersionController_getVersion: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/version",
		...fetchMiddlewares<RequestHandler>(VersionController),
		...fetchMiddlewares<RequestHandler>(VersionController.prototype.getVersion),

		async function VersionController_getVersion(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsVersionController_getVersion,
					request,
					response,
				})

				const controller = new VersionController()

				await templateService.apiHandler({
					methodName: "getVersion",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsFilesController_listFiles: Record<string, TsoaRoute.ParameterSchema> = {
		dirPath: { in: "query", name: "dirPath", dataType: "string" },
		recursive: { in: "query", name: "recursive", dataType: "string" },
	}
	app.get(
		"/agent/files",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(FilesController),
		...fetchMiddlewares<RequestHandler>(FilesController.prototype.listFiles),

		async function FilesController_listFiles(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsFilesController_listFiles,
					request,
					response,
				})

				const controller = new FilesController()

				await templateService.apiHandler({
					methodName: "listFiles",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsFilesController_readFiles: Record<string, TsoaRoute.ParameterSchema> = {
		filePath: { in: "query", name: "filePath", required: true, dataType: "string" },
	}
	app.get(
		"/agent/files/read",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(FilesController),
		...fetchMiddlewares<RequestHandler>(FilesController.prototype.readFiles),

		async function FilesController_readFiles(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsFilesController_readFiles,
					request,
					response,
				})

				const controller = new FilesController()

				await templateService.apiHandler({
					methodName: "readFiles",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsWorkspaceController_getWorkspaceInfo: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/workspace",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(WorkspaceController),
		...fetchMiddlewares<RequestHandler>(WorkspaceController.prototype.getWorkspaceInfo),

		async function WorkspaceController_getWorkspaceInfo(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsWorkspaceController_getWorkspaceInfo,
					request,
					response,
				})

				const controller = new WorkspaceController()

				await templateService.apiHandler({
					methodName: "getWorkspaceInfo",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsDocsController_getOpenAPISpec: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/openapi/spec.json",
		...fetchMiddlewares<RequestHandler>(DocsController),
		...fetchMiddlewares<RequestHandler>(DocsController.prototype.getOpenAPISpec),

		async function DocsController_getOpenAPISpec(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsDocsController_getOpenAPISpec,
					request,
					response,
				})

				const controller = new DocsController()

				await templateService.apiHandler({
					methodName: "getOpenAPISpec",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsDocsController_getCompressedOpenAPISpec: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/openapi/spec-compressed.json",
		...fetchMiddlewares<RequestHandler>(DocsController),
		...fetchMiddlewares<RequestHandler>(DocsController.prototype.getCompressedOpenAPISpec),

		async function DocsController_getCompressedOpenAPISpec(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsDocsController_getCompressedOpenAPISpec,
					request,
					response,
				})

				const controller = new DocsController()

				await templateService.apiHandler({
					methodName: "getCompressedOpenAPISpec",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_listCommands: Record<string, TsoaRoute.ParameterSchema> = {
		source: { in: "query", name: "source", dataType: "string" },
		includeContent: { in: "query", name: "includeContent", dataType: "string" },
	}
	app.get(
		"/agent/commands",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.listCommands),

		async function CommandsController_listCommands(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_listCommands,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "listCommands",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_getCommandNames: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/commands/names",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.getCommandNames),

		async function CommandsController_getCommandNames(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_getCommandNames,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "getCommandNames",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_getCommand: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
	}
	app.get(
		"/agent/commands/:name",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.getCommand),

		async function CommandsController_getCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_getCommand,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "getCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_createCommand: Record<string, TsoaRoute.ParameterSchema> = {
		body: { in: "body", name: "body", required: true, ref: "CreateCommandRequest" },
	}
	app.post(
		"/agent/commands",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.createCommand),

		async function CommandsController_createCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_createCommand,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "createCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_updateCommand: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "UpdateCommandRequest" },
	}
	app.put(
		"/agent/commands/:name",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.updateCommand),

		async function CommandsController_updateCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_updateCommand,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "updateCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_deleteCommand: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
	}
	app.delete(
		"/agent/commands/:name",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.deleteCommand),

		async function CommandsController_deleteCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_deleteCommand,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "deleteCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_executeCommand: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "ExecuteSlashCommandRequest" },
	}
	app.post(
		"/agent/commands/:name/execute",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.executeCommand),

		async function CommandsController_executeCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_executeCommand,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "executeCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 201,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCommandsController_validateCommand: Record<string, TsoaRoute.ParameterSchema> = {
		name: { in: "path", name: "name", required: true, dataType: "string" },
		body: { in: "body", name: "body", required: true, ref: "ValidateCommandRequest" },
	}
	app.post(
		"/agent/commands/:name/validate",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CommandsController),
		...fetchMiddlewares<RequestHandler>(CommandsController.prototype.validateCommand),

		async function CommandsController_validateCommand(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCommandsController_validateCommand,
					request,
					response,
				})

				const controller = new CommandsController()

				await templateService.apiHandler({
					methodName: "validateCommand",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCodeIndexController_getStatus: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/codeindex/status",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CodeIndexController),
		...fetchMiddlewares<RequestHandler>(CodeIndexController.prototype.getStatus),

		async function CodeIndexController_getStatus(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCodeIndexController_getStatus,
					request,
					response,
				})

				const controller = new CodeIndexController()

				await templateService.apiHandler({
					methodName: "getStatus",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCodeIndexController_startIndexing: Record<string, TsoaRoute.ParameterSchema> = {}
	app.post(
		"/agent/codeindex/start",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CodeIndexController),
		...fetchMiddlewares<RequestHandler>(CodeIndexController.prototype.startIndexing),

		async function CodeIndexController_startIndexing(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCodeIndexController_startIndexing,
					request,
					response,
				})

				const controller = new CodeIndexController()

				await templateService.apiHandler({
					methodName: "startIndexing",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCodeIndexController_cancelIndexing: Record<string, TsoaRoute.ParameterSchema> = {}
	app.post(
		"/agent/codeindex/cancel",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CodeIndexController),
		...fetchMiddlewares<RequestHandler>(CodeIndexController.prototype.cancelIndexing),

		async function CodeIndexController_cancelIndexing(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCodeIndexController_cancelIndexing,
					request,
					response,
				})

				const controller = new CodeIndexController()

				await templateService.apiHandler({
					methodName: "cancelIndexing",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCodeIndexController_clearIndex: Record<string, TsoaRoute.ParameterSchema> = {}
	app.delete(
		"/agent/codeindex",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CodeIndexController),
		...fetchMiddlewares<RequestHandler>(CodeIndexController.prototype.clearIndex),

		async function CodeIndexController_clearIndex(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCodeIndexController_clearIndex,
					request,
					response,
				})

				const controller = new CodeIndexController()

				await templateService.apiHandler({
					methodName: "clearIndex",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
	const argsCodeIndexController_getConfig: Record<string, TsoaRoute.ParameterSchema> = {}
	app.get(
		"/agent/codeindex/config",
		authenticateMiddleware([{ bearer: [] }]),
		...fetchMiddlewares<RequestHandler>(CodeIndexController),
		...fetchMiddlewares<RequestHandler>(CodeIndexController.prototype.getConfig),

		async function CodeIndexController_getConfig(request: ExRequest, response: ExResponse, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			let validatedArgs: any[] = []
			try {
				validatedArgs = templateService.getValidatedArgs({
					args: argsCodeIndexController_getConfig,
					request,
					response,
				})

				const controller = new CodeIndexController()

				await templateService.apiHandler({
					methodName: "getConfig",
					controller,
					response,
					next,
					validatedArgs,
					successStatus: 200,
				})
			} catch (err) {
				return next(err)
			}
		},
	)
	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

	function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
		return async function runAuthenticationMiddleware(request: any, response: any, next: any) {
			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			// keep track of failed auth attempts so we can hand back the most
			// recent one.  This behavior was previously existing so preserving it
			// here
			const failedAttempts: any[] = []
			const pushAndRethrow = (error: any) => {
				failedAttempts.push(error)
				throw error
			}

			const secMethodOrPromises: Promise<any>[] = []
			for (const secMethod of security) {
				if (Object.keys(secMethod).length > 1) {
					const secMethodAndPromises: Promise<any>[] = []

					for (const name in secMethod) {
						secMethodAndPromises.push(
							expressAuthenticationRecasted(request, name, secMethod[name], response).catch(
								pushAndRethrow,
							),
						)
					}

					// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

					secMethodOrPromises.push(
						Promise.all(secMethodAndPromises).then((users) => {
							return users[0]
						}),
					)
				} else {
					for (const name in secMethod) {
						secMethodOrPromises.push(
							expressAuthenticationRecasted(request, name, secMethod[name], response).catch(
								pushAndRethrow,
							),
						)
					}
				}
			}

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

			try {
				request["user"] = await Promise.any(secMethodOrPromises)

				// Response was sent in middleware, abort
				if (response.writableEnded) {
					return
				}

				next()
			} catch (err) {
				// Show most recent error as response
				const error = failedAttempts.pop()
				error.status = error.status || 401

				// Response was sent in middleware, abort
				if (response.writableEnded) {
					return
				}
				next(error)
			}

			// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
		}
	}

	// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
