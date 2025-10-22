<!--
  WebSocket Messages Reference
  Complete documentation of real-time bidirectional communication protocol
  Includes all message types for Extension→Client and Client→Extension flows
-->

# WebSocket Messages Reference

This document provides a complete reference for all WebSocket messages used in Hoody Agent Server. WebSocket connections enable real-time, bidirectional communication between clients and the server.

## Connection

Connect to the WebSocket endpoint with authentication:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=YOUR_TOKEN');

// For SSL/TLS
const wss = new WebSocket('wss://your-domain.com/ws?token=YOUR_TOKEN');
```

## Message Structure

All WebSocket messages follow this structure:

```typescript
interface WebSocketMessage {
  type: string              // Message type identifier
  taskId?: string          // Associated task ID (if applicable)
  taskContext?: {          // Task context information
    mode?: string          // Current mode (code, architect, ask, debug, etc.)
    modelId?: string       // Current model ID
    modelProvider?: string // Current provider (openrouter, anthropic, etc.)
    profileName?: string   // Current profile name
  }
  // Additional fields depending on message type
  [key: string]: any
}
```

---

## Extension → Client Messages

Messages sent FROM the server TO connected clients.

### Task & State Updates

#### `state`
Complete state update with all current configuration and task information.

```json
{
  "type": "state",
  "state": {
    "version": "0.0.2",
    "clineMessages": [...],
    "currentTaskItem": {...},
    "apiConfiguration": {...},
    "mode": "code",
    "experiments": {...},
    ...
  }
}
```

#### `messageUpdated`
Sent when a task message is updated (new AI response, tool usage, etc.).

```json
{
  "type": "messageUpdated",
  "taskId": "task-123",
  "clineMessage": {
    "type": "say",
    "say": "text",
    "text": "I'll help you with that...",
    "ts": 1234567890
  }
}
```

#### `currentCheckpointUpdated`
Sent when a task checkpoint is created or updated.

```json
{
  "type": "currentCheckpointUpdated",
  "taskId": "task-123",
  "hasCheckpoint": true,
  "context": "checkpoint-hash-abc123"
}
```

### Action Notifications

#### `action`
UI action notifications (button clicks, visibility changes, etc.).

```json
{
  "type": "action",
  "action": "chatButtonClicked" | "settingsButtonClicked" | "historyButtonClicked" 
           | "mcpButtonClicked" | "promptsButtonClicked" | "profileButtonClicked" 
           | "marketplaceButtonClicked" | "cloudButtonClicked" | "didBecomeVisible" 
           | "focusInput" | "switchTab" | "toggleAutoApprove"
}
```

#### `invoke`
Invoke specific UI actions with parameters.

```json
{
  "type": "invoke",
  "invoke": "newChat" | "sendMessage" | "primaryButtonClick" 
           | "secondaryButtonClick" | "setChatBoxMessage",
  "text": "Optional text content",
  "images": ["base64-image-data"]
}
```

### AI Model & Provider Updates

#### `routerModels`
Available models from router providers (OpenRouter, etc.).

```json
{
  "type": "routerModels",
  "routerModels": {
    "openrouter": {
      "anthropic/claude-sonnet-4": {...},
      "openai/gpt-4-turbo": {...}
    }
  }
}
```

#### `ollamaModels`
Available Ollama models from local instance.

```json
{
  "type": "ollamaModels",
  "ollamaModels": {
    "llama3.2": {...},
    "qwen2.5-coder:32b": {...}
  }
}
```

#### `lmStudioModels`
Available LM Studio models.

```json
{
  "type": "lmStudioModels",
  "lmStudioModels": {
    "model-name": {...}
  }
}
```

#### `openAiModels`
Available OpenAI models.

```json
{
  "type": "openAiModels",
  "openAiModels": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
}
```

#### `vsCodeLmModels`
Available VS Code Language Model API models.

```json
{
  "type": "vsCodeLmModels",
  "vsCodeLmModels": [
    {
      "vendor": "copilot",
      "family": "gpt-4",
      "version": "turbo",
      "id": "copilot-gpt4-turbo"
    }
  ]
}
```

#### `huggingFaceModels`
Available Hugging Face models with provider information.

```json
{
  "type": "huggingFaceModels",
  "huggingFaceModels": [
    {
      "id": "meta-llama/Meta-Llama-3.1-8B-Instruct",
      "object": "model",
      "created": 1234567890,
      "owned_by": "meta-llama",
      "providers": [
        {
          "provider": "together",
          "status": "live",
          "supports_tools": true,
          "context_length": 8192,
          "pricing": {
            "input": 0.0001,
            "output": 0.0002
          }
        }
      ]
    }
  ]
}
```

#### `singleRouterModelFetchResponse`
Response for single model fetch from router.

```json
{
  "type": "singleRouterModelFetchResponse",
  "success": true,
  "values": {
    "modelId": "anthropic/claude-sonnet-4",
    "modelInfo": {...}
  }
}
```

### Profile & Configuration

#### `listApiConfig`
List of all available API configurations/profiles.

```json
{
  "type": "listApiConfig",
  "listApiConfig": [
    {
      "id": "default",
      "name": "Default Profile",
      "apiProvider": "anthropic",
      "modelId": "claude-sonnet-4-20250514"
    }
  ]
}
```

#### `profileDataResponse`
User profile data from Hoody Cloud.

```json
{
  "type": "profileDataResponse",
  "payload": {
    "success": true,
    "data": {
      "hoodycodeToken": "token-here",
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://..."
      },
      "organizations": [...]
    }
  }
}
```

#### `balanceDataResponse`
Account balance data from Hoody Cloud.

```json
{
  "type": "balanceDataResponse",
  "payload": {
    "success": true,
    "data": {
      "balance": 100.50,
      "currency": "USD"
    }
  }
}
```

### Task History & Management

#### `tasksByIdResponse`
Response with specific tasks by their IDs.

```json
{
  "type": "tasksByIdResponse",
  "payload": {
    "requestId": "req-123",
    "tasks": [
      {
        "id": "task-123",
        "ts": 1234567890,
        "task": "Create a React component",
        "tokensIn": 1500,
        "tokensOut": 2000,
        "totalCost": 0.05
      }
    ]
  }
}
```

#### `taskHistoryResponse`
Paginated task history response.

```json
{
  "type": "taskHistoryResponse",
  "payload": {
    "requestId": "req-123",
    "historyItems": [...],
    "pageIndex": 0,
    "pageCount": 5
  }
}
```

#### `forkCountsResponse`
Fork counts for a specific task.

```json
{
  "type": "forkCountsResponse",
  "values": {
    "counts": {
      "1234567890": 2,
      "1234567891": 1
    },
    "taskId": "task-123"
  }
}
```

#### `taskForked`
Notification when a task is forked.

```json
{
  "type": "taskForked",
  "forkedTaskId": "task-456",
  "sourceTaskId": "task-123",
  "forkFromMessageTs": 1234567890,
  "messagesIncluded": 5,
  "isActive": true
}
```

### Command Execution

#### `commandExecutionStatus`
Status updates for terminal command execution.

```json
{
  "type": "commandExecutionStatus",
  "text": "{\"executionId\":\"exec-123\",\"status\":\"started\",\"pid\":12345,\"command\":\"npm install\"}"
}
```

**Status Types:**
- `started` - Command started (includes `pid` and `command`)
- `output` - Command output chunk (includes `output`)
- `exited` - Command finished (includes `exitCode`)
- `timeout` - Command timed out
- `fallback` - Shell integration unavailable

### MCP (Model Context Protocol)

#### `mcpServers`
List of available MCP servers.

```json
{
  "type": "mcpServers",
  "mcpServers": [
    {
      "name": "filesystem",
      "status": "connected",
      "tools": ["read_file", "write_file"],
      "resources": [...]
    }
  ]
}
```

#### `mcpExecutionStatus`
Status updates for MCP operations.

```json
{
  "type": "mcpExecutionStatus",
  "text": "{\"executionId\":\"mcp-123\",\"status\":\"started\",\"serverName\":\"filesystem\",\"toolName\":\"read_file\"}"
}
```

#### `mcpMarketplaceCatalog`
MCP marketplace catalog data.

```json
{
  "type": "mcpMarketplaceCatalog",
  "mcpMarketplaceCatalog": {
    "servers": [...]
  }
}
```

#### `mcpDownloadDetails`
Details about MCP server download/installation.

```json
{
  "type": "mcpDownloadDetails",
  "mcpDownloadDetails": {
    "serverName": "filesystem",
    "status": "success",
    "version": "1.0.0"
  }
}
```

### Browser Automation

#### `browserConnectionResult`
Result of browser connection test.

```json
{
  "type": "browserConnectionResult",
  "success": true
}
```

#### `browserToolEnabled`
Browser tool status update.

```json
{
  "type": "browserToolEnabled",
  "value": true
}
```

#### `remoteBrowserEnabled`
Remote browser status update.

```json
{
  "type": "remoteBrowserEnabled",
  "value": true
}
```

### Text-to-Speech

#### `ttsStart`
Text-to-speech started for a task.

```json
{
  "type": "ttsStart",
  "taskId": "task-123",
  "text": "I'll help you with that"
}
```

#### `ttsStop`
Text-to-speech stopped for a task.

```json
{
  "type": "ttsStop",
  "taskId": "task-123"
}
```

### Workspace & Files

#### `workspaceUpdated`
Workspace directory or files changed.

```json
{
  "type": "workspaceUpdated"
}
```

#### `selectedImages`
Selected images for task context.

```json
{
  "type": "selectedImages",
  "images": ["data:image/png;base64,..."]
}
```

#### `fileSearchResults`
Results from file search operation.

```json
{
  "type": "fileSearchResults",
  "results": [
    {
      "path": "src/app.ts",
      "type": "file",
      "label": "Application Entry Point"
    }
  ]
}
```

#### `maxReadFileLine`
Maximum lines to read from files setting.

```json
{
  "type": "maxReadFileLine",
  "value": 1000
}
```

### Prompts & Enhancement

#### `enhancedPrompt`
AI-enhanced prompt result.

```json
{
  "type": "enhancedPrompt",
  "text": "Enhanced prompt text here..."
}
```

#### `systemPrompt`
System prompt content.

```json
{
  "type": "systemPrompt",
  "text": "You are Roo, a highly skilled software engineer..."
}
```

#### `updatePrompt`
Prompt update notification.

```json
{
  "type": "updatePrompt",
  "promptMode": "code",
  "text": "Updated prompt content"
}
```

### Git Operations

#### `commitSearchResults`
Git commit search results.

```json
{
  "type": "commitSearchResults",
  "commits": [
    {
      "hash": "abc123",
      "subject": "Fix bug in authentication",
      "author": "John Doe",
      "date": "2025-01-15"
    }
  ]
}
```

### Code Indexing

#### `indexingStatusUpdate`
Codebase indexing status update.

```json
{
  "type": "indexingStatusUpdate",
  "values": {
    "systemStatus": "Indexing" | "Indexed" | "Standby" | "Error",
    "message": "Processing files...",
    "processedItems": 150,
    "totalItems": 500,
    "currentItemUnit": "files",
    "workspacePath": "/path/to/workspace"
  }
}
```

#### `indexCleared`
Index data cleared notification.

```json
{
  "type": "indexCleared",
  "values": {
    "success": true
  }
}
```

#### `codeIndexSettingsSaved`
Code index settings saved confirmation.

```json
{
  "type": "codeIndexSettingsSaved",
  "success": true
}
```

#### `codeIndexSecretStatus`
Status of code index secrets (API keys).

```json
{
  "type": "codeIndexSecretStatus",
  "values": {
    "hasQdrantApiKey": true,
    "hasOpenAiKey": false
  }
}
```

#### `codebaseIndexConfig`
Current codebase index configuration.

```json
{
  "type": "codebaseIndexConfig",
  "values": {
    "enabled": true,
    "provider": "openai",
    "modelId": "text-embedding-3-small"
  }
}
```

### Modes & Custom Modes

#### `updateCustomMode`
Custom mode update notification.

```json
{
  "type": "updateCustomMode",
  "customMode": {
    "slug": "custom-mode",
    "name": "Custom Mode",
    "roleDefinition": "You are...",
    "groups": [...]
  }
}
```

#### `deleteCustomMode`
Custom mode deletion notification.

```json
{
  "type": "deleteCustomMode",
  "slug": "custom-mode"
}
```

#### `deleteCustomModeCheck`
Prompt to confirm mode deletion.

```json
{
  "type": "deleteCustomModeCheck",
  "slug": "custom-mode",
  "hasContent": true
}
```

#### `exportModeResult`
Result of mode export operation.

```json
{
  "type": "exportModeResult",
  "success": true,
  "slug": "my-mode"
}
```

#### `importModeResult`
Result of mode import operation.

```json
{
  "type": "importModeResult",
  "success": true,
  "slug": "imported-mode"
}
```

#### `checkRulesDirectoryResult`
Result of checking rules directory.

```json
{
  "type": "checkRulesDirectoryResult",
  "slug": "mode-slug",
  "hasContent": true,
  "rulesFolderPath": "/path/to/rules"
}
```

#### `rulesData`
Rules and workflows data for modes.

```json
{
  "type": "rulesData",
  "globalRules": {...},
  "localRules": {...},
  "globalWorkflows": {...},
  "localWorkflows": {...}
}
```

### Marketplace

#### `marketplaceData`
Marketplace items and installation metadata.

```json
{
  "type": "marketplaceData",
  "marketplaceItems": [...],
  "marketplaceInstalledMetadata": {
    "project": {},
    "global": {}
  }
}
```

#### `marketplaceInstallResult`
Marketplace item installation result.

```json
{
  "type": "marketplaceInstallResult",
  "success": true
}
```

#### `marketplaceRemoveResult`
Marketplace item removal result.

```json
{
  "type": "marketplaceRemoveResult",
  "success": true
}
```

### Authentication & Cloud

#### `authenticatedUser`
User authentication status.

```json
{
  "type": "authenticatedUser",
  "userInfo": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "organizations": [...]
  }
}
```

#### `organizationSwitchResult`
Organization switch result.

```json
{
  "type": "organizationSwitchResult",
  "success": true,
  "organizationId": "org-456"
}
```

#### `updateProfileData`
Profile data update notification.

```json
{
  "type": "updateProfileData"
}
```

### Dialogs & UI Updates

#### `showDeleteMessageDialog`
Show message deletion confirmation dialog.

```json
{
  "type": "showDeleteMessageDialog",
  "messageTs": 1234567890
}
```

#### `showEditMessageDialog`
Show message edit dialog.

```json
{
  "type": "showEditMessageDialog",
  "messageTs": 1234567890,
  "text": "Original message text"
}
```

#### `showHumanRelayDialog`
Show human relay dialog for manual input.

```json
{
  "type": "showHumanRelayDialog",
  "taskId": "task-123"
}
```

#### `humanRelayResponse`
Human relay response received.

```json
{
  "type": "humanRelayResponse",
  "text": "Human response text"
}
```

#### `humanRelayCancel`
Human relay cancelled.

```json
{
  "type": "humanRelayCancel"
}
```

### Notifications

#### `showSystemNotification`
Display system notification to user.

```json
{
  "type": "showSystemNotification",
  "notificationOptions": {
    "title": "Task Complete",
    "subtitle": "Success",
    "message": "Your task has been completed successfully"
  }
}
```

#### `hoodycodeNotificationsResponse`
Hoody Code notifications from cloud.

```json
{
  "type": "hoodycodeNotificationsResponse",
  "notifications": [
    {
      "id": "notif-123",
      "title": "New Feature",
      "message": "Check out our new feature!",
      "action": {
        "actionText": "Learn More",
        "actionURL": "https://..."
      }
    }
  ]
}
```

### Settings & Configuration

#### `vsCodeSetting`
VS Code setting value.

```json
{
  "type": "vsCodeSetting",
  "setting": "editor.fontSize",
  "value": 14
}
```

#### `autoApprovalEnabled`
Auto-approval setting status.

```json
{
  "type": "autoApprovalEnabled",
  "value": true
}
```

#### `autoApprovalCountdown`
Auto-approval countdown for followup questions.

```json
{
  "type": "autoApprovalCountdown",
  "autoApprovalStartedAt": 1234567890000,
  "autoApprovalWillTriggerAt": 1234567900000,
  "timeoutMs": 10000
}
```

#### `theme`
Current theme configuration.

```json
{
  "type": "theme",
  "text": "{\"name\":\"Dark Modern\",\"colors\":{...}}"
}
```

### Input & Text Handling

#### `insertTextToChatArea`
Insert text into chat input area.

```json
{
  "type": "insertTextToChatArea",
  "text": "Text to insert"
}
```

#### `insertTextIntoTextarea`
Insert text into specific textarea.

```json
{
  "type": "insertTextIntoTextarea",
  "text": "Text to insert"
}
```

#### `acceptInput`
Accept current input (trigger send).

```json
{
  "type": "acceptInput"
}
```

#### `focusChatInput`
Focus the chat input field.

```json
{
  "type": "focusChatInput"
}
```

### Commands & Keybindings

#### `commands`
Available slash commands.

```json
{
  "type": "commands",
  "commands": [
    {
      "name": "/fix",
      "source": "built-in",
      "description": "Fix the code",
      "argumentHint": "[file]"
    }
  ]
}
```

#### `keybindingsResponse`
Keyboard shortcuts for commands.

```json
{
  "type": "keybindingsResponse",
  "keybindings": {
    "hoody-code.plusButtonClicked": "Ctrl+Shift+P"
  }
}
```

### Utilities

#### `mermaidFixResponse`
Fixed Mermaid diagram syntax.

```json
{
  "type": "mermaidFixResponse",
  "requestId": "req-123",
  "fixedCode": "graph TD\n  A --> B",
  "errors": []
}
```

#### `usageDataResponse`
Usage statistics data.

```json
{
  "type": "usageDataResponse",
  "text": "{\"totalCost\":15.50,\"totalTokens\":50000}"
}
```

#### `dismissedUpsells`
List of dismissed upsell prompts.

```json
{
  "type": "dismissedUpsells",
  "list": ["upsell-1", "upsell-2"]
}
```

#### `shareTaskSuccess`
Task sharing success notification.

```json
{
  "type": "shareTaskSuccess",
  "visibility": "public" | "organization" | "private"
}
```

#### `openInBrowser`
Open URL in browser.

```json
{
  "type": "openInBrowser",
  "url": "https://hoody.com"
}
```

#### `todoListUpdated`
TODO list update notification.

```json
{
  "type": "todoListUpdated",
  "taskId": "task-123"
}
```

#### `setHistoryPreviewCollapsed`
History preview collapsed state.

```json
{
  "type": "setHistoryPreviewCollapsed",
  "historyPreviewCollapsed": true
}
```

---

## Client → Extension Messages

Messages sent FROM clients TO the server.

### Task Management

#### `newTask`
Create a new task.

```json
{
  "type": "newTask",
  "text": "Create a React component for a todo list",
  "images": ["base64-image-data"]
}
```

#### `askResponse`
Response to AI's question or approval request.

```json
{
  "type": "askResponse",
  "askResponse": "yesButtonClicked" | "noButtonClicked" | "messageResponse" | "objectResponse",
  "text": "Optional response text"
}
```

#### `clearTask`
Clear current task.

```json
{
  "type": "clearTask"
}
```

#### `cancelTask`
Cancel running task.

```json
{
  "type": "cancelTask"
}
```

#### `showTaskWithId`
Show specific task by ID.

```json
{
  "type": "showTaskWithId",
  "text": "task-123"
}
```

#### `deleteTaskWithId`
Delete specific task.

```json
{
  "type": "deleteTaskWithId",
  "text": "task-123"
}
```

#### `deleteMultipleTasksWithIds`
Delete multiple tasks.

```json
{
  "type": "deleteMultipleTasksWithIds",
  "ids": ["task-123", "task-456"]
}
```

#### `exportTaskWithId`
Export specific task.

```json
{
  "type": "exportTaskWithId",
  "text": "task-123"
}
```

#### `exportCurrentTask`
Export current active task.

```json
{
  "type": "exportCurrentTask"
}
```

#### `shareCurrentTask`
Share current task.

```json
{
  "type": "shareCurrentTask",
  "visibility": "public" | "organization" | "private"
}
```

### Task History

#### `tasksByIdRequest`
Request specific tasks by IDs.

```json
{
  "type": "tasksByIdRequest",
  "payload": {
    "requestId": "req-123",
    "taskIds": ["task-1", "task-2"]
  }
}
```

#### `taskHistoryRequest`
Request paginated task history.

```json
{
  "type": "taskHistoryRequest",
  "payload": {
    "requestId": "req-123",
    "workspace": "current" | "all",
    "sort": "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant",
    "favoritesOnly": false,
    "pageIndex": 0,
    "search": "optional search term"
  }
}
```

#### `toggleTaskFavorite`
Toggle task favorite status.

```json
{
  "type": "toggleTaskFavorite",
  "text": "task-123"
}
```

### Message Operations

#### `forkTaskFromMessage`
Fork task from specific message.

```json
{
  "type": "forkTaskFromMessage",
  "messageTs": 1234567890
}
```

#### `forkCountsRequest`
Request fork counts for messages.

```json
{
  "type": "forkCountsRequest"
}
```

#### `deleteMessage`
Request to delete a message.

```json
{
  "type": "deleteMessage",
  "value": 1234567890
}
```

#### `deleteMessageConfirm`
Confirm message deletion.

```json
{
  "type": "deleteMessageConfirm",
  "messageTs": 1234567890
}
```

#### `submitEditedMessage`
Submit edited message.

```json
{
  "type": "submitEditedMessage",
  "value": 1234567890,
  "text": "New message text"
}
```

#### `editMessageConfirm`
Confirm message edit.

```json
{
  "type": "editMessageConfirm",
  "messageTs": 1234567890,
  "editedMessageContent": "Updated text"
}
```

### Checkpoints

#### `checkpointDiff`
View checkpoint diff.

```json
{
  "type": "checkpointDiff",
  "payload": {
    "ts": 1234567890,
    "previousCommitHash": "abc123",
    "commitHash": "def456",
    "mode": "full" | "checkpoint"
  }
}
```

#### `checkpointRestore`
Restore from checkpoint.

```json
{
  "type": "checkpointRestore",
  "payload": {
    "ts": 1234567890,
    "commitHash": "abc123",
    "mode": "preview" | "restore"
  }
}
```

### Profile & Configuration

#### `currentApiConfigName`
Set current API configuration/profile.

```json
{
  "type": "currentApiConfigName",
  "text": "default"
}
```

#### `saveApiConfiguration`
Save API configuration.

```json
{
  "type": "saveApiConfiguration",
  "apiConfiguration": {
    "apiProvider": "anthropic",
    "apiModelId": "claude-sonnet-4-20250514",
    "apiKey": "sk-ant-..."
  }
}
```

#### `upsertApiConfiguration`
Create or update API configuration.

```json
{
  "type": "upsertApiConfiguration",
  "text": "profile-name",
  "apiConfiguration": {...}
}
```

#### `deleteApiConfiguration`
Delete API configuration.

```json
{
  "type": "deleteApiConfiguration",
  "text": "profile-name"
}
```

#### `loadApiConfiguration`
Load API configuration by name.

```json
{
  "type": "loadApiConfiguration",
  "text": "profile-name"
}
```

#### `loadApiConfigurationById`
Load API configuration by ID.

```json
{
  "type": "loadApiConfigurationById",
  "text": "profile-id"
}
```

#### `renameApiConfiguration`
Rename API configuration.

```json
{
  "type": "renameApiConfiguration",
  "text": "old-name",
  "value": "new-name"
}
```

#### `getListApiConfiguration`
Request list of all API configurations.

```json
{
  "type": "getListApiConfiguration"
}
```

#### `toggleApiConfigPin`
Toggle profile pin status.

```json
{
  "type": "toggleApiConfigPin",
  "text": "profile-id"
}
```

### Model Requests

#### `requestRouterModels`
Request models from router providers.

```json
{
  "type": "requestRouterModels",
  "values": {
    "openRouterApiKey": "sk-or-v1-..."
  }
}
```

#### `requestOllamaModels`
Request Ollama models.

```json
{
  "type": "requestOllamaModels"
}
```

#### `requestLmStudioModels`
Request LM Studio models.

```json
{
  "type": "requestLmStudioModels"
}
```

#### `requestOpenAiModels`
Request OpenAI models.

```json
{
  "type": "requestOpenAiModels"
}
```

#### `requestVsCodeLmModels`
Request VS Code LM API models.

```json
{
  "type": "requestVsCodeLmModels"
}
```

#### `requestHuggingFaceModels`
Request Hugging Face models.

```json
{
  "type": "requestHuggingFaceModels"
}
```

#### `flushRouterModels`
Clear cached router models.

```json
{
  "type": "flushRouterModels"
}
```

### Auto-Approval Settings

#### `alwaysAllowReadOnly`
Auto-approve read-only file operations.

```json
{
  "type": "alwaysAllowReadOnly",
  "bool": true
}
```

#### `alwaysAllowReadOnlyOutsideWorkspace`
Auto-approve read-only operations outside workspace.

```json
{
  "type": "alwaysAllowReadOnlyOutsideWorkspace",
  "bool": true
}
```

#### `alwaysAllowWrite`
Auto-approve write operations.

```json
{
  "type": "alwaysAllowWrite",
  "bool": true
}
```

#### `alwaysAllowWriteOutsideWorkspace`
Auto-approve write operations outside workspace.

```json
{
  "type": "alwaysAllowWriteOutsideWorkspace",
  "bool": true
}
```

#### `alwaysAllowWriteProtected`
Auto-approve write to protected files.

```json
{
  "type": "alwaysAllowWriteProtected",
  "bool": true
}
```

#### `alwaysAllowExecute`
Auto-approve command execution.

```json
{
  "type": "alwaysAllowExecute",
  "bool": true
}
```

#### `alwaysAllowBrowser`
Auto-approve browser operations.

```json
{
  "type": "alwaysAllowBrowser",
  "bool": true
}
```

#### `alwaysAllowMcp`
Auto-approve MCP operations.

```json
{
  "type": "alwaysAllowMcp",
  "bool": true
}
```

#### `alwaysAllowModeSwitch`
Auto-approve mode switching.

```json
{
  "type": "alwaysAllowModeSwitch",
  "bool": true
}
```

#### `alwaysAllowSubtasks`
Auto-approve subtask creation.

```json
{
  "type": "alwaysAllowSubtasks",
  "bool": true
}
```

#### `alwaysAllowFollowupQuestions`
Auto-approve followup questions.

```json
{
  "type": "alwaysAllowFollowupQuestions",
  "bool": true
}
```

#### `followupAutoApproveTimeoutMs`
Timeout for followup question auto-approval.

```json
{
  "type": "followupAutoApproveTimeoutMs",
  "value": 10000
}
```

#### `alwaysAllowUpdateTodoList`
Auto-approve TODO list updates.

```json
{
  "type": "alwaysAllowUpdateTodoList",
  "bool": true
}
```

#### `alwaysApproveResubmit`
Auto-approve request resubmission.

```json
{
  "type": "alwaysApproveResubmit",
  "bool": true
}
```

#### `toggleToolAutoApprove`
Toggle auto-approval for specific tool.

```json
{
  "type": "toggleToolAutoApprove",
  "toolName": "read_file",
  "autoApprove": true
}
```

#### `toggleToolAlwaysAllow`
Toggle always-allow for specific tool.

```json
{
  "type": "toggleToolAlwaysAllow",
  "toolName": "read_file",
  "alwaysAllow": true
}
```

### Limits & Constraints

#### `allowedCommands`
Set allowed commands list.

```json
{
  "type": "allowedCommands",
  "commands": ["npm", "git", "ls"]
}
```

#### `deniedCommands`
Set denied commands list.

```json
{
  "type": "deniedCommands",
  "commands": ["rm -rf", "format"]
}
```

#### `allowedMaxRequests`
Set maximum allowed requests.

```json
{
  "type": "allowedMaxRequests",
  "value": 100
}
```

#### `allowedMaxCost`
Set maximum allowed cost.

```json
{
  "type": "allowedMaxCost",
  "value": 10.00
}
```

### Terminal Settings

#### `terminalOutputLineLimit`
Maximum lines to capture from terminal.

```json
{
  "type": "terminalOutputLineLimit",
  "value": 500
}
```

#### `terminalOutputCharacterLimit`
Maximum characters per terminal output.

```json
{
  "type": "terminalOutputCharacterLimit",
  "value": 50000
}
```

#### `terminalShellIntegrationTimeout`
Shell integration timeout.

```json
{
  "type": "terminalShellIntegrationTimeout",
  "value": 5000
}
```

#### `terminalShellIntegrationDisabled`
Disable shell integration.

```json
{
  "type": "terminalShellIntegrationDisabled",
  "bool": true
}
```

#### `terminalCommandDelay`
Delay between terminal commands.

```json
{
  "type": "terminalCommandDelay",
  "value": 500
}
```

#### `terminalOperation`
Terminal operation control.

```json
{
  "type": "terminalOperation",
  "terminalOperation": "continue" | "abort"
}
```

### File Operations

#### `selectImages`
Select images for task context.

```json
{
  "type": "selectImages"
}
```

#### `openImage`
Open image in viewer.

```json
{
  "type": "openImage",
  "text": "data:image/png;base64,..."
}
```

#### `saveImage`
Save image to file.

```json
{
  "type": "saveImage",
  "dataUri": "data:image/png;base64,..."
}
```

#### `openFile`
Open file in editor.

```json
{
  "type": "openFile",
  "text": "path/to/file.ts"
}
```

#### `openMention`
Open mentioned file/resource.

```json
{
  "type": "openMention",
  "text": "@file.ts"
}
```

#### `searchFiles`
Search for files in workspace.

```json
{
  "type": "searchFiles",
  "query": "*.ts"
}
```

#### `draggedImages`
Images dragged into UI.

```json
{
  "type": "draggedImages",
  "dataUrls": ["data:image/png;base64,..."]
}
```

### Prompts & Instructions

#### `customInstructions`
Set custom instructions for AI.

```json
{
  "type": "customInstructions",
  "text": "Always use TypeScript and add detailed comments"
}
```

#### `enhancePrompt`
Request prompt enhancement.

```json
{
  "type": "enhancePrompt",
  "text": "create login form"
}
```

#### `getSystemPrompt`
Request system prompt.

```json
{
  "type": "getSystemPrompt"
}
```

#### `copySystemPrompt`
Copy system prompt to clipboard.

```json
{
  "type": "copySystemPrompt"
}
```

#### `updatePrompt`
Update mode prompt.

```json
{
  "type": "updatePrompt",
  "promptMode": "code",
  "customPrompt": {
    "roleDefinition": "You are...",
    "toolInstructions": {...}
  }
}
```

#### `updateSupportPrompt`
Update support prompt.

```json
{
  "type": "updateSupportPrompt",
  "promptMode": "enhance",
  "text": "Enhanced prompt template"
}
```

### Mode Management

#### `mode`
Switch operating mode.

```json
{
  "type": "mode",
  "mode": "code" | "architect" | "ask" | "debug" | "orchestrator"
}
```

#### `updateCustomMode`
Update custom mode configuration.

```json
{
  "type": "updateCustomMode",
  "slug": "my-mode",
  "modeConfig": {
    "slug": "my-mode",
    "name": "My Custom Mode",
    "roleDefinition": "You are...",
    "groups": [...]
  }
}
```

#### `deleteCustomMode`
Delete custom mode.

```json
{
  "type": "deleteCustomMode",
  "slug": "my-mode",
  "checkOnly": false
}
```

#### `exportMode`
Export mode configuration.

```json
{
  "type": "exportMode",
  "slug": "my-mode"
}
```

#### `importMode`
Import mode configuration.

```json
{
  "type": "importMode"
}
```

#### `checkRulesDirectory`
Check mode rules directory.

```json
{
  "type": "checkRulesDirectory",
  "slug": "my-mode"
}
```

#### `hasOpenedModeSelector`
Mark mode selector as opened.

```json
{
  "type": "hasOpenedModeSelector",
  "bool": true
}
```

### Settings Management

#### `updateVSCodeSetting`
Update VS Code setting.

```json
{
  "type": "updateVSCodeSetting",
  "setting": "editor.fontSize",
  "value": 14
}
```

#### `getVSCodeSetting`
Request VS Code setting value.

```json
{
  "type": "getVSCodeSetting",
  "setting": "editor.fontSize"
}
```

#### `importSettings`
Import settings from file.

```json
{
  "type": "importSettings"
}
```

#### `exportSettings`
Export settings to file.

```json
{
  "type": "exportSettings"
}
```

#### `resetState`
Reset extension state.

```json
{
  "type": "resetState"
}
```

#### `openExtensionSettings`
Open extension settings.

```json
{
  "type": "openExtensionSettings"
}
```

#### `openCustomModesSettings`
Open custom modes settings.

```json
{
  "type": "openCustomModesSettings"
}
```

### Feature Toggles

#### `diffEnabled`
Enable/disable diff view.

```json
{
  "type": "diffEnabled",
  "bool": true
}
```

#### `enableCheckpoints`
Enable/disable checkpoints.

```json
{
  "type": "enableCheckpoints",
  "bool": true
}
```

#### `diagnosticsEnabled`
Enable/disable diagnostics.

```json
{
  "type": "diagnosticsEnabled",
  "bool": true
}
```

#### `browserToolEnabled`
Enable/disable browser tool.

```json
{
  "type": "browserToolEnabled",
  "bool": true
}
```

#### `remoteBrowserEnabled`
Enable/disable remote browser.

```json
{
  "type": "remoteBrowserEnabled",
  "bool": true
}
```

#### `soundEnabled`
Enable/disable sound effects.

```json
{
  "type": "soundEnabled",
  "bool": true
}
```

#### `ttsEnabled`
Enable/disable text-to-speech.

```json
{
  "type": "ttsEnabled",
  "bool": true
}
```

#### `mcpEnabled`
Enable/disable MCP.

```json
{
  "type": "mcpEnabled",
  "bool": true
}
```

#### `enableMcpServerCreation`
Enable/disable MCP server creation.

```json
{
  "type": "enableMcpServerCreation",
  "bool": true
}
```

#### `remoteControlEnabled`
Enable/disable remote control.

```json
{
  "type": "remoteControlEnabled",
  "bool": true
}
```

#### `taskSyncEnabled`
Enable/disable task synchronization.

```json
{
  "type": "taskSyncEnabled",
  "bool": true
}
```

### Numeric Settings

#### `writeDelayMs`
Delay before write operations.

```json
{
  "type": "writeDelayMs",
  "value": 1000
}
```

#### `requestDelaySeconds`
Delay between API requests.

```json
{
  "type": "requestDelaySeconds",
  "value": 2
}
```

#### `fuzzyMatchThreshold`
Fuzzy match threshold for diff.

```json
{
  "type": "fuzzyMatchThreshold",
  "value": 0.8
}
```

#### `ttsSpeed`
Text-to-speech speed.

```json
{
  "type": "ttsSpeed",
  "value": 1.0
}
```

#### `soundVolume`
Sound effect volume.

```json
{
  "type": "soundVolume",
  "value": 0.5
}
```

#### `screenshotQuality`
Browser screenshot quality.

```json
{
  "type": "screenshotQuality",
  "value": 75
}
```

#### `maxOpenTabsContext`
Maximum open tabs to include in context.

```json
{
  "type": "maxOpenTabsContext",
  "value": 5
}
```

#### `maxWorkspaceFiles`
Maximum workspace files to include.

```json
{
  "type": "maxWorkspaceFiles",
  "value": 50
}
```

#### `maxReadFileLine`
Maximum lines to read from files.

```json
{
  "type": "maxReadFileLine",
  "value": 1000
}
```

#### `maxImageFileSize`
Maximum image file size (MB).

```json
{
  "type": "maxImageFileSize",
  "value": 10
}
```

#### `maxTotalImageSize`
Maximum total image size (MB).

```json
{
  "type": "maxTotalImageSize",
  "value": 25
}
```

#### `maxConcurrentFileReads`
Maximum concurrent file reads.

```json
{
  "type": "maxConcurrentFileReads",
  "value": 5
}
```

#### `includeDiagnosticMessages`
Include diagnostic messages.

```json
{
  "type": "includeDiagnosticMessages",
  "bool": true
}
```

#### `maxDiagnosticMessages`
Maximum diagnostic messages.

```json
{
  "type": "maxDiagnosticMessages",
  "value": 10
}
```

### Browser Operations

#### `browserViewportSize`
Set browser viewport size.

```json
{
  "type": "browserViewportSize",
  "text": "1920x1080"
}
```

#### `remoteBrowserHost`
Set remote browser host.

```json
{
  "type": "remoteBrowserHost",
  "text": "wss://browser.example.com"
}
```

#### `testBrowserConnection`
Test browser connection.

```json
{
  "type": "testBrowserConnection"
}
```

### MCP Operations

#### `openMcpSettings`
Open MCP settings.

```json
{
  "type": "openMcpSettings"
}
```

#### `openProjectMcpSettings`
Open project-specific MCP settings.

```json
{
  "type": "openProjectMcpSettings"
}
```

#### `toggleMcpServer`
Toggle MCP server on/off.

```json
{
  "type": "toggleMcpServer",
  "serverName": "filesystem",
  "isEnabled": true
}
```

#### `restartMcpServer`
Restart MCP server.

```json
{
  "type": "restartMcpServer",
  "serverName": "filesystem"
}
```

#### `refreshAllMcpServers`
Refresh all MCP servers.

```json
{
  "type": "refreshAllMcpServers"
}
```

#### `deleteMcpServer`
Delete MCP server configuration.

```json
{
  "type": "deleteMcpServer",
  "serverName": "filesystem"
}
```

#### `updateMcpTimeout`
Update MCP operation timeout.

```json
{
  "type": "updateMcpTimeout",
  "timeout": 30000
}
```

#### `fetchMcpMarketplace`
Fetch MCP marketplace catalog.

```json
{
  "type": "fetchMcpMarketplace"
}
```

#### `silentlyRefreshMcpMarketplace`
Silently refresh marketplace.

```json
{
  "type": "silentlyRefreshMcpMarketplace"
}
```

#### `fetchLatestMcpServersFromHub`
Fetch latest MCP servers.

```json
{
  "type": "fetchLatestMcpServersFromHub"
}
```

#### `downloadMcp`
Download MCP server.

```json
{
  "type": "downloadMcp",
  "mcpId": "server-123"
}
```

### Marketplace Operations

#### `filterMarketplaceItems`
Filter marketplace items.

```json
{
  "type": "filterMarketplaceItems",
  "filters": {
    "type": "mode",
    "search": "react",
    "tags": ["frontend"]
  }
}
```

#### `installMarketplaceItem`
Install marketplace item.

```json
{
  "type": "installMarketplaceItem",
  "mpItem": {...}
}
```

#### `installMarketplaceItemWithParameters`
Install with custom parameters.

```json
{
  "type": "installMarketplaceItemWithParameters",
  "payload": {
    "item": {...},
    "parameters": {...}
  }
}
```

#### `cancelMarketplaceInstall`
Cancel marketplace installation.

```json
{
  "type": "cancelMarketplaceInstall"
}
```

#### `removeInstalledMarketplaceItem`
Remove installed item.

```json
{
  "type": "removeInstalledMarketplaceItem",
  "mpItem": {...}
}
```

#### `fetchMarketplaceData`
Fetch marketplace data.

```json
{
  "type": "fetchMarketplaceData"
}
```

### Context Condensing

#### `autoCondenseContext`
Enable auto-context condensing.

```json
{
  "type": "autoCondenseContext",
  "bool": true
}
```

#### `autoCondenseContextPercent`
Context condensing threshold.

```json
{
  "type": "autoCondenseContextPercent",
  "value": 80
}
```

#### `condensingApiConfigId`
API config for condensing.

```json
{
  "type": "condensingApiConfigId",
  "text": "profile-id"
}
```

#### `updateCondensingPrompt`
Update condensing prompt.

```json
{
  "type": "updateCondensingPrompt",
  "text": "Custom condensing prompt"
}
```

#### `condenseTaskContextRequest`
Request to condense task context.

```json
{
  "type": "condenseTaskContextRequest"
}
```

#### `condense`
Trigger context condensing.

```json
{
  "type": "condense"
}
```

### Codebase Indexing

#### `codebaseIndexEnabled`
Enable/disable codebase indexing.

```json
{
  "type": "codebaseIndexEnabled",
  "bool": true
}
```

#### `saveCodeIndexSettingsAtomic`
Save code index settings atomically.

```json
{
  "type": "saveCodeIndexSettingsAtomic",
  "codeIndexSettings": {
    "codebaseIndexEnabled": true,
    "codebaseIndexQdrantUrl": "http://localhost:6333",
    "codebaseIndexEmbedderProvider": "openai",
    "codebaseIndexEmbedderModelId": "text-embedding-3-small"
  }
}
```

#### `requestCodeIndexSecretStatus`
Request code index secret status.

```json
{
  "type": "requestCodeIndexSecretStatus"
}
```

#### `requestIndexingStatus`
Request indexing status.

```json
{
  "type": "requestIndexingStatus"
}
```

#### `startIndexing`
Start codebase indexing.

```json
{
  "type": "startIndexing"
}
```

#### `cancelIndexing`
Cancel ongoing indexing.

```json
{
  "type": "cancelIndexing"
}
```

#### `clearIndexData`
Clear all index data.

```json
{
  "type": "clearIndexData"
}
```

### Commands

#### `requestCommands`
Request available commands.

```json
{
  "type": "requestCommands"
}
```

#### `openCommandFile`
Open command file in editor.

```json
{
  "type": "openCommandFile",
  "text": "command-name",
  "source": "global" | "project"
}
```

#### `createCommand`
Create new command.

```json
{
  "type": "createCommand",
  "source": "global" | "project"
}
```

#### `deleteCommand`
Delete command.

```json
{
  "type": "deleteCommand",
  "text": "command-name",
  "source": "global" | "project"
}
```

### Cloud & Authentication

#### `cloudButtonClicked`
Cloud button clicked.

```json
{
  "type": "cloudButtonClicked"
}
```

#### `rooCloudSignIn`
Sign in to Hoody Cloud.

```json
{
  "type": "rooCloudSignIn"
}
```

#### `cloudLandingPageSignIn`
Sign in from landing page.

```json
{
  "type": "cloudLandingPageSignIn"
}
```

#### `rooCloudSignOut`
Sign out from Hoody Cloud.

```json
{
  "type": "rooCloudSignOut"
}
```

#### `rooCloudManualUrl`
Manual URL for cloud auth.

```json
{
  "type": "rooCloudManualUrl",
  "url": "https://..."
}
```

#### `switchOrganization`
Switch active organization.

```json
{
  "type": "switchOrganization",
  "organizationId": "org-456"
}
```

#### `fetchProfileDataRequest`
Request user profile data.

```json
{
  "type": "fetchProfileDataRequest"
}
```

#### `fetchBalanceDataRequest`
Request account balance.

```json
{
  "type": "fetchBalanceDataRequest"
}
```

#### `shopBuyCredits`
Navigate to buy credits.

```json
{
  "type": "shopBuyCredits"
}
```

### Rules & Workflows

#### `refreshRules`
Refresh rules data.

```json
{
  "type": "refreshRules"
}
```

#### `toggleRule`
Toggle rule on/off.

```json
{
  "type": "toggleRule",
  "rulePath": "path/to/rule.roo.md",
  "enabled": true,
  "isGlobal": false
}
```

#### `toggleWorkflow`
Toggle workflow on/off.

```json
{
  "type": "toggleWorkflow",
  "workflowPath": "path/to/workflow.roo.md",
  "enabled": true,
  "isGlobal": false
}
```

#### `createRuleFile`
Create new rule file.

```json
{
  "type": "createRuleFile",
  "filename": "new-rule",
  "ruleType": "rule" | "workflow",
  "isGlobal": false
}
```

#### `deleteRuleFile`
Delete rule file.

```json
{
  "type": "deleteRuleFile",
  "rulePath": "path/to/rule.roo.md",
  "isGlobal": false
}
```

### TODO List

#### `updateTodoList`
Update TODO list.

```json
{
  "type": "updateTodoList",
  "payload": {
    "todos": [
      {
        "id": "todo-1",
        "text": "Implement feature X",
        "completed": false
      }
    ]
  }
}
```

### Queue Management

#### `queueMessage`
Queue a message for later.

```json
{
  "type": "queueMessage",
  "text": "Message to queue",
  "images": []
}
```

#### `removeQueuedMessage`
Remove queued message.

```json
{
  "type": "removeQueuedMessage",
  "text": "message-id"
}
```

#### `editQueuedMessage`
Edit queued message.

```json
{
  "type": "editQueuedMessage",
  "payload": {
    "id": "message-id",
    "text": "Updated text",
    "images": []
  }
}
```

### Utilities

#### `playSound`
Play sound effect.

```json
{
  "type": "playSound",
  "audioType": "notification" | "celebration" | "progress_loop"
}
```

#### `playTts`
Play text-to-speech.

```json
{
  "type": "playTts",
  "text": "Text to speak"
}
```

#### `stopTts`
Stop text-to-speech.

```json
{
  "type": "stopTts"
}
```

#### `openInBrowser`
Open URL in browser.

```json
{
  "type": "openInBrowser",
  "url": "https://hoody.com"
}
```

#### `openExternal`
Open external URL.

```json
{
  "type": "openExternal",
  "url": "https://docs.hoody.com"
}
```

#### `searchCommits`
Search git commits.

```json
{
  "type": "searchCommits",
  "query": "fix bug"
}
```

#### `language`
Set interface language.

```json
{
  "type": "language",
  "text": "en" | "fr" | "es" | "de" | ...
}
```

#### `telemetrySetting`
Set telemetry preference.

```json
{
  "type": "telemetrySetting",
  "text": "enabled" | "disabled" | "ask_every_time"
}
```

#### `setHistoryPreviewCollapsed`
Set history preview collapsed state.

```json
{
  "type": "setHistoryPreviewCollapsed",
  "historyPreviewCollapsed": true
}
```

#### `profileThresholds`
Set profile cost thresholds.

```json
{
  "type": "profileThresholds",
  "values": {
    "default": 1.0,
    "premium": 5.0
  }
}
```

#### `showAutoApproveMenu`
Toggle auto-approve menu visibility.

```json
{
  "type": "showAutoApproveMenu",
  "bool": true
}
```

#### `showTaskTimeline`
Toggle task timeline visibility.

```json
{
  "type": "showTaskTimeline",
  "bool": true
}
```

#### `showTimestamps`
Toggle timestamp display.

```json
{
  "type": "showTimestamps",
  "bool": true
}
```

#### `hideCostBelowThreshold`
Hide costs below threshold.

```json
{
  "type": "hideCostBelowThreshold",
  "value": 0.01
}
```

#### `setReasoningBlockCollapsed`
Set reasoning block collapsed state.

```json
{
  "type": "setReasoningBlockCollapsed",
  "bool": true
}
```

#### `dismissUpsell`
Dismiss upsell prompt.

```json
{
  "type": "dismissUpsell",
  "upsellId": "upsell-id"
}
```

#### `getDismissedUpsells`
Get list of dismissed upsells.

```json
{
  "type": "getDismissedUpsells"
}
```

#### `showRooIgnoredFiles`
Show .hoodycodeignore'd files.

```json
{
  "type": "showRooIgnoredFiles",
  "bool": true
}
```

#### `allowVeryLargeReads`
Allow very large file reads.

```json
{
  "type": "allowVeryLargeReads",
  "bool": true
}
```

### Notifications & System

#### `systemNotificationsEnabled`
Enable system notifications.

```json
{
  "type": "systemNotificationsEnabled",
  "bool": true
}
```

#### `dismissNotificationId`
Dismiss specific notification.

```json
{
  "type": "dismissNotificationId",
  "notificationId": "notif-123"
}
```

#### `fetchHoodycodeNotifications`
Fetch Hoody Code notifications.

```json
{
  "type": "fetchHoodycodeNotifications"
}
```

#### `showSystemNotification`
Show system notification.

```json
{
  "type": "showSystemNotification",
  "notificationOptions": {
    "title": "Alert",
    "subtitle": "Important",
    "message": "Something happened"
  }
}
```

#### `showMdmAuthRequiredNotification`
Show MDM authentication required.

```json
{
  "type": "showMdmAuthRequiredNotification"
}
```

### Advanced Features

#### `fixMermaidSyntax`
Fix Mermaid diagram syntax.

```json
{
  "type": "fixMermaidSyntax",
  "requestId": "req-123",
  "text": "graph TD\n  A --> B"
}
```

#### `clearUsageData`
Clear usage statistics.

```json
{
  "type": "clearUsageData"
}
```

#### `getUsageData`
Get usage statistics.

```json
{
  "type": "getUsageData",
  "text": "task-123"
}
```

#### `morphApiKey`
Set Morph API key.

```json
{
  "type": "morphApiKey",
  "text": "morph-api-key"
}
```

#### `fastApplyModel`
Set fast apply model.

```json
{
  "type": "fastApplyModel",
  "text": "gpt-4-turbo"
}
```

#### `ghostServiceSettings`
Ghost text service settings.

```json
{
  "type": "ghostServiceSettings",
  "values": {
    "enabled": true
  }
}
```

#### `imageGenerationSettings`
Image generation settings.

```json
{
  "type": "imageGenerationSettings",
  "values": {...}
}
```

#### `openRouterImageApiKey`
OpenRouter image API key.

```json
{
  "type": "openRouterImageApiKey",
  "text": "sk-or-v1-..."
}
```

#### `hoodyCodeImageApiKey`
Hoody Code image API key.

```json
{
  "type": "hoodyCodeImageApiKey",
  "text": "api-key"
}
```

#### `openRouterImageGenerationSelectedModel`
Selected model for image generation.

```json
{
  "type": "openRouterImageGenerationSelectedModel",
  "text": "flux-1.1-pro"
}
```

### Keybindings & Navigation

#### `openKeyboardShortcuts`
Open keyboard shortcuts settings.

```json
{
  "type": "openKeyboardShortcuts"
}
```

#### `openGlobalKeybindings`
Open global keybindings.

```json
{
  "type": "openGlobalKeybindings"
}
```

#### `getKeybindings`
Get keybindings for commands.

```json
{
  "type": "getKeybindings",
  "commandIds": ["command1", "command2"]
}
```

#### `switchTab`
Switch to specific tab.

```json
{
  "type": "switchTab",
  "tab": "settings" | "history" | "mcp" | "modes" | "chat" | "marketplace" | "cloud"
}
```

#### `focusPanelRequest`
Request panel focus.

```json
{
  "type": "focusPanelRequest"
}
```

### Miscellaneous

#### `webviewDidLaunch`
Webview launched notification.

```json
{
  "type": "webviewDidLaunch"
}
```

#### `didShowAnnouncement`
Announcement shown.

```json
{
  "type": "didShowAnnouncement",
  "text": "announcement-id"
}
```

#### `showFeedbackOptions`
Show feedback options.

```json
{
  "type": "showFeedbackOptions"
}
```

#### `reportBug`
Report a bug.

```json
{
  "type": "reportBug"
}
```

#### `updateExperimental`
Update experimental features.

```json
{
  "type": "updateExperimental",
  "values": {
    "feature1": true,
    "feature2": false
  }
}
```

#### `setopenAiCustomModelInfo`
Set custom OpenAI model info.

```json
{
  "type": "setopenAiCustomModelInfo",
  "values": {
    "maxTokens": 8192,
    "contextWindow": 16384
  }
}
```

#### `seeNewChanges`
View new changes/updates.

```json
{
  "type": "seeNewChanges",
  "payload": {
    "commitRange": {
      "from": "abc123",
      "to": "def456"
    }
  }
}
```

#### `fetchOpenGraphData`
Fetch Open Graph data for URL.

```json
{
  "type": "fetchOpenGraphData",
  "url": "https://example.com"
}
```

#### `checkIsImageUrl`
Check if URL is an image.

```json
{
  "type": "checkIsImageUrl",
  "url": "https://example.com/image.png"
}
```

---

## Message Flow Examples

### Complete Task Creation Flow

```javascript
// 1. Client creates new task
ws.send(JSON.stringify({
  type: 'newTask',
  text: 'Create a login form',
  images: []
}));

// 2. Server sends state update
// <- { type: 'state', state: {...} }

// 3. Server sends message updates as AI works
// <- { type: 'messageUpdated', clineMessage: {...} }
// <- { type: 'messageUpdated', clineMessage: {...} }

// 4. AI asks for approval
// <- { type: 'messageUpdated', clineMessage: { type: 'ask', ask: 'tool', ... } }

// 5. Client responds
ws.send(JSON.stringify({
  type: 'askResponse',
  askResponse: 'yesButtonClicked'
}));

// 6. Task completes
// <- { type: 'messageUpdated', clineMessage: { type: 'say', say: 'completion_result', ... } }
```

### Profile Configuration Flow

```javascript
// 1. Request available models
ws.send(JSON.stringify({
  type: 'requestRouterModels',
  values: { openRouterApiKey: 'sk-or-v1-...' }
}));

// 2. Receive model list
// <- { type: 'routerModels', routerModels: {...} }

// 3. Save new profile
ws.send(JSON.stringify({
  type: 'upsertApiConfiguration',
  text: 'my-profile',
  apiConfiguration: {
    apiProvider: 'openrouter',
    openRouterApiKey: 'sk-or-v1-...',
    openRouterModelId: 'anthropic/claude-sonnet-4'
  }
}));

// 4. Activate profile
ws.send(JSON.stringify({
  type: 'currentApiConfigName',
  text: 'my-profile'
}));

// 5. Receive updated state
// <- { type: 'state', state: {...} }
```

---

## Best Practices

### 1. Always Handle Connection State

```javascript
const ws = new WebSocket('ws://localhost:3000/ws?token=TOKEN');

ws.onopen = () => {
  console.log('Connected to Hoody Agent Server');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from server');
  // Implement reconnection logic here
};
```

### 2. Parse Messages Safely

```javascript
ws.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    handleMessage(message);
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
};
```

### 3. Use Task Context

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.taskId) {
    console.log(`Task ${message.taskId}: ${message.type}`);
  }
  
  if (message.taskContext) {
    console.log(`Mode: ${message.taskContext.mode}`);
    console.log(`Model: ${message.taskContext.modelId}`);
  }
};
```

### 4. Implement Message Queue for Reliability

```javascript
class WebSocketClient {
  private messageQueue = [];
  private ws;
  
  connect() {
    this.ws = new WebSocket('ws://localhost:3000/ws?token=TOKEN');
    
    this.ws.onopen = () => {
      // Send queued messages
      while (this.messageQueue.length > 0) {
        this.ws.send(this.messageQueue.shift());
      }
    };
  }
  
  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(JSON.stringify(message));
    }
  }
}
```

---

## Related Documentation

- [README_API.md](../README_API.md) - REST API Reference
- [OPENAPI.yaml](../OPENAPI.yaml) - OpenAPI Specification
- [docs/api-reference.html](api-reference.html) - Interactive API Documentation
- [docs/MEMORY_BANK_API.md](MEMORY_BANK_API.md) - Memory Bank API

---

## Notes

- All timestamps (`ts`) are in Unix epoch milliseconds
- Base64 image data should use data URI format: `data:image/png;base64,...`
- Task IDs are generated server-side and returned in responses
- WebSocket connection requires bearer token authentication via query parameter
- CORS is enabled for WebSocket connections
- SSL/TLS is supported via `wss://` protocol when server is started with SSL certificates