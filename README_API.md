<!-- 
  Hoody Agent Server API Documentation
  Complete REST and WebSocket API reference with 80+ endpoints
  This file documents all API endpoints, request/response formats, and usage examples
-->

# Hoody Agent Server API Documentation

This document provides a comprehensive overview of the Hoody Agent Server REST and WebSocket API, including authentication, endpoints, and usage examples.

## 🚀 Quick Reference for Developers

**Total API Endpoints**: 80+ REST operations across 70+ unique paths
**Base URL**: `http://localhost:3000/api/v1/agent`
**WebSocket**: `ws://localhost:3000/ws?token=YOUR_TOKEN`
**Authentication**: Bearer token (all endpoints except /health, /version, /openapi, and /logs)

### Latest Additions (v4.103.45+)
- ✅ **Memory Bank API** (9 endpoints) - Persistent knowledge storage with CRUD operations
- ✅ **TODO Management** (6 endpoints) - Task TODO lists with position support
- ✅ **Task List Enhancement** - `?includeLastMessage=true` for rich previews

### Complete Endpoint List
1. **Health & Info** (2) - Server status and version
2. **State & Config** (4) - Application state and configuration
3. **Profiles** (8) - AI provider profile management
4. **Tasks** (14) - Task lifecycle and management
5. **Files** (3) - Workspace file operations
6. **MCP** (4) - Model Context Protocol integration
7. **Terminal** (2) - Command execution
8. **Code Index** (5) - Code search and indexing
9. **Settings** (8) - Extension settings management (including dedicated condense settings endpoints)
10. **Commands** (6) - Slash command management
11. **Memory Bank** (9) - Knowledge storage (NEW!)
12. **TODOs** (6) - TODO list management (NEW!)

### Key Features for Remote Webview
- ✅ **Real-time Updates** - WebSocket streams all state changes
- ✅ **Task Previews** - Last message included in task list
- ✅ **TODO Progress** - Track task progress with statistics
- ✅ **Memory Bank** - Persistent knowledge across tasks
- ✅ **Complete CRUD** - Full create, read, update, delete for all resources
- ✅ **Type Safety** - Auto-generated TypeScript types via OpenAPI spec

### Essential Endpoints for UI
```bash
# Get complete state
GET /api/v1/agent/state

# List tasks with previews
GET /api/v1/agent/tasks?includeLastMessage=true&limit=20

# Get task details with parsed messages
GET /api/v1/agent/tasks/{id}?includeParsed=true

# Get TODO list with stats
GET /api/v1/agent/todos/{taskId}

# List memory bank entries
GET /api/v1/agent/memory-bank?scope=all

# WebSocket for real-time updates
ws://localhost:3000/ws?token=YOUR_TOKEN
```

### Documentation Structure
- **Quick Start** - Get running in 5 minutes (see below)
- **API Endpoints** - Complete endpoint reference (line 148)
- **WebSocket API** - Real-time communication (line 219)
- **WebSocket Messages** - Complete message reference ([WEBSOCKET_MESSAGES.md](docs/WEBSOCKET_MESSAGES.md))
- **Memory Bank Guide** - Knowledge management (line 230)
- **TODO Management Guide** - Task tracking (line 243)
- **Settings Reference** - All available settings (line 1243)

---

## 🔧 For Developers: API Development Guidelines

When adding new API endpoints or modifying existing ones, **YOU MUST**:

### 1. Update OpenAPI Specification
- **File**: `src/services/api-server/openapi.yaml`
- Add complete endpoint definitions with:
  - Request/response schemas
  - Error responses (400, 401, 404, 500)
  - Parameter descriptions
  - Example values
  - Proper tags for organization

### 2. Add Comprehensive Code Comments
- **All new code** must include detailed comments explaining:
  - What the code does
  - Why it's implemented that way
  - Any important edge cases or gotchas
  - Relationships to other parts of the codebase
- Use JSDoc-style comments for functions and classes
- Add `TODO` markers for planned improvements
- Document security considerations

### 3. Update This Documentation
- Add new endpoints to the endpoint list below
- Update examples if introducing new patterns
- Document breaking changes prominently

**Failure to maintain these standards will result in technical debt and confusion for future developers.**

---

## For AI Agents: File Creation Guidelines

To maintain a clean and organized repository, please adhere to the following file creation guidelines:

- **Documentation**: If you need to create documentation or other non-essential files, please place them in the `docs/` directory.
- **Avoid Root Directory**: Do not create arbitrary files in the root of the repository.
- **Code Comments**: ALWAYS add comprehensive comments to any code you write or modify.
- **OpenAPI Updates**: ALWAYS update `src/services/api-server/openapi.yaml` when adding or modifying endpoints.

By following these simple rules, you can help keep the project organized and easy to navigate.

---

## 🚀 Getting Started: 5-Minute Quick Start

Get started with the Hoody Code REST and WebSocket API in 5 minutes.

### Step 1: Start the API Server

Start the Hoody Agent Server using npm:

```bash
# Start with default settings
npm run start

# Or with custom options
npm run start -- --port 3000 --debug --token your-secure-token
```

**Get Your API Token**
- If you didn't specify a token, check the server startup logs for the auto-generated token
- Or specify your own with `--token` flag

**Server URL**: `http://localhost:3000`
**WebSocket URL**: `ws://localhost:3000/ws?token=YOUR_TOKEN`

---

### Step 2: Test the Connection

**Using curl**
```bash
# Get server health (no auth needed)
curl http://localhost:3000/api/v1/agent/health

# Response:
# {
#   "status": "ok",
#   "version": "4.103.1",
#   "uptime": 120,
#   "activeConnections": 0
# }
```

**Using Node.js**
```javascript
const response = await fetch('http://localhost:3000/api/v1/agent/health')
const health = await response.json()
console.log('Server status:', health.status)
```

---

### Step 3: Authenticate

All endpoints (except `/health` and `/version`) require authentication.

**Set Token in Header**
```bash
export TOKEN="your-token-here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/agent/state
```

**JavaScript Example**
```javascript
const TOKEN = 'your-token-here'

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`http://localhost:3000/api/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Usage
const config = await apiRequest('/config')
console.log('Current mode:', config.mode)
```

---

---

## API Endpoints

The Hoody Code API provides a comprehensive set of endpoints for managing tasks, files, and more.

### 🏥 Health & Info
- `GET /api/v1/agent/health`: Get server health status.
- `GET /api/v1/agent/version`: Get version information.

### 🔧 State & Config
- `GET /api/v1/agent/state`: Get complete extension state.
- `GET /api/v1/agent/config`: Get current configuration.
- `PATCH /api/v1/agent/config`: Update configuration.
- `GET /api/v1/agent/modes`: List available modes.

### 🤖 Profile Management
- `GET /api/v1/agent/profiles`: List all provider profiles.
- `GET /api/v1/agent/profiles/:nameOrId`: Get specific profile details.
- `POST /api/v1/agent/profiles`: Create new profile.
- `PUT /api/v1/agent/profiles/:name`: Update existing profile.
- `DELETE /api/v1/agent/profiles/:name`: Delete profile.
- `POST /api/v1/agent/profiles/:nameOrId/activate`: Activate profile.
- `GET /api/v1/agent/profiles/modes/:mode`: Get profile assigned to mode.
- `PUT /api/v1/agent/profiles/modes/:mode`: Assign profile to mode.

### 📝 Tasks
- `POST /api/v1/agent/tasks`: Create a new task.
- `GET /api/v1/agent/tasks`: List tasks with advanced filtering.
- `GET /api/v1/agent/tasks/:taskId`: Get task details including messages (supports `?includeParsed=true` for UI-ready format).
- `DELETE /api/v1/agent/tasks/:taskId`: Delete a task.
- `POST /api/v1/agent/tasks/:taskId/resume`: Resume a task.
- `POST /api/v1/agent/tasks/:taskId/cancel`: Cancel a currently running task.
- `POST /api/v1/agent/tasks/:taskId/favorite`: Toggle task favorite status.
- `POST /api/v1/agent/tasks/:taskId/export`: Export task as a markdown file.
- `POST /api/v1/agent/tasks/:taskId/condense`: Condense task context to reduce token usage.
- `POST /api/v1/agent/tasks/:taskId/fork`: Fork conversation from specific message (creates branch).
- `PATCH /api/v1/agent/tasks/:taskId/messages/:timestamp`: Edit a user message in conversation history.
- `DELETE /api/v1/agent/tasks/batch`: Delete multiple tasks at once.

#### Understanding Task Metadata Fields

When you fetch task data via the API, each task includes metadata in the `historyItem` object. Two fields are particularly important to understand:

**`size` (number, in bytes)**
- **What**: Task directory size on disk
- **Unit**: Bytes (e.g., 568599 = ~555 KB)
- **Measures**: Physical storage used by task files (messages, checkpoints, etc.)
- **Use for**: Storage management, cleanup decisions, archival
- **Example values**:
  - Small task: 50,000 bytes (~49 KB)
  - Medium task: 500,000 bytes (~488 KB)
  - Large task: 5,000,000 bytes (~4.8 MB)

**`contextTokens` (number, token count)**
- **What**: Current conversation context size in tokens
- **Unit**: Tokens (LLM token count)
- **Measures**: Size of the active conversation sent to the AI model
- **Use for**: Context window monitoring, condensing decisions, cost prediction
- **Calculation**:
  - For Anthropic: `tokensIn + tokensOut + cacheWrites + cacheReads` (from last API request)
  - For OpenAI: `tokensIn + tokensOut` (from last API request)
  - After condense: `newContextTokens` from the condense operation
- **Example values**:
  - New task: 1,000-5,000 tokens
  - Active conversation: 20,000-50,000 tokens
  - Long conversation: 100,000-200,000 tokens

**Example Response:**
```json
{
  "id": "task-123",
  "task": "Build a website",
  "tokensIn": 592068,
  "tokensOut": 5830,
  "totalCost": 0.05,
  "size": 568599,           // ← Disk space: ~555 KB
  "contextTokens": 358612,  // ← Current context: ~359K tokens
  "workspace": "/Server/project"
}
```

**Why both matter:**

| Use Case | Which Field |
|----------|-------------|
| **"How much disk space?"** | Use `size` |
| **"Will this fit in the model's context window?"** | Use `contextTokens` |
| **"Should I condense the conversation?"** | Compare `contextTokens` to model's `contextWindow` |
| **"Should I delete old tasks?"** | Sort by `size` for largest disk users |
| **"How close am I to the token limit?"** | Calculate `contextTokens / contextWindow * 100` |

**Important Notes:**
- `size` can be large even if `contextTokens` is small (lots of file changes stored)
- `contextTokens` can be large even if `size` is small (long conversations, little file activity)
- After condensing, `contextTokens` decreases but `size` stays the same (disk files unchanged)
- Both are optional fields and may be undefined for some tasks

### ✏️ Message Editing

Edit user messages in conversation history to fix typos or clarify instructions.

**Endpoint:**
```http
PATCH /api/v1/agent/tasks/{taskId}/messages/{timestamp}
```

**Important Limitations:**
- ✅ **Only user messages** (`type: "ask"`) can be edited
- ❌ AI responses and tool messages **cannot** be edited
- ✅ Edits update `uiMessages` file only (raw API messages remain unchanged for history)
- ✅ Changes are immediately visible in UI via WebSocket broadcast
- ✅ If task is currently active, in-memory messages are also updated

**Request Body:**
```json
{
  "text": "Updated message text",
  "images": ["base64-encoded-image"]  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task-123",
  "messageTimestamp": 1700000000000,
  "message": "Message edited successfully. Changed from \"Build a webiste\" to \"Build a website\""
}
```

**Example: Fix a Typo**
```bash
# 1. Get task messages to find the message to edit
curl "http://localhost:3000/api/v1/agent/tasks/task-123?includeParsed=true" \
  -H "Authorization: Bearer YOUR_TOKEN" | \
  jq '.uiMessages[] | select(.type == "ask") | {ts, text}'

# Output shows typo:
# {
#   "ts": 1700000000000,
#   "text": "Build a webiste with React"
# }

# 2. Edit the message to fix typo
curl -X PATCH "http://localhost:3000/api/v1/agent/tasks/task-123/messages/1700000000000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Build a website with React"
  }'

# Response:
# {
#   "success": true,
#   "taskId": "task-123",
#   "messageTimestamp": 1700000000000,
#   "message": "Message edited successfully. Changed from \"Build a webiste with React...\" to \"Build a website with React...\""
# }
```

**Example: Add Images to Existing Message**
```bash
curl -X PATCH "http://localhost:3000/api/v1/agent/tasks/task-123/messages/1700000000000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Build a website based on this design",
    "images": ["data:image/png;base64,iVBORw0KG..."]
  }'
```

**Error Cases:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Attempting to edit non-user message (AI response, tool, etc.) |
| 404 | Not Found | Message with specified timestamp not found |
| 404 | Not Found | Task not found |

**Error Example:**
```json
{
  "error": "Bad Request",
  "message": "Only user messages (type: 'ask') can be edited. This message has type: 'say'",
  "code": "BAD_REQUEST",
  "statusCode": 400
}
```

**JavaScript Example:**
```typescript
class MessageEditor {
  constructor(private apiClient: APIClient) {}

  async findUserMessages(taskId: string) {
    const task = await this.apiClient.get(`/tasks/${taskId}?includeParsed=true`)
    return task.uiMessages
      .filter(m => m.type === 'ask')
      .map(m => ({
        timestamp: m.ts,
        text: m.text,
        images: m.images
      }))
  }

  async editMessage(taskId: string, timestamp: number, newText: string, images?: string[]) {
    return this.apiClient.patch(`/tasks/${taskId}/messages/${timestamp}`, {
      text: newText,
      images
    })
  }

  async fixTypo(taskId: string, timestamp: number, oldText: string, newText: string) {
    // Verify it's actually different
    if (oldText === newText) {
      console.log('No changes needed')
      return
    }

    const result = await this.editMessage(taskId, timestamp, newText)
    console.log(`✓ Fixed: "${oldText}" → "${newText}"`)
    return result
  }
}

// Usage
const editor = new MessageEditor(apiClient)

// Find all user messages
const userMessages = await editor.findUserMessages('task-123')
console.log('User messages:', userMessages)

// Fix a typo
await editor.fixTypo(
  'task-123',
  1700000000000,
  'Build a webiste',
  'Build a website'
)
```

**React Component Example:**
```typescript
function MessageEditor({ taskId, message }: { taskId: string, message: UIMessage }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(message.text)

  const saveEdit = async () => {
    if (text === message.text) {
      setEditing(false)
      return
    }

    try {
      await fetch(`/api/v1/agent/tasks/${taskId}/messages/${message.ts}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })
      
      setEditing(false)
      toast.success('Message updated!')
    } catch (error) {
      toast.error('Failed to update message')
      setText(message.text) // Revert
    }
  }

  // Only show edit button for user messages
  if (message.type !== 'ask') {
    return <MessageDisplay message={message} />
  }

  return (
    <div className="message">
      {editing ? (
        <div className="message-editor">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="edit-textarea"
          />
          <button onClick={saveEdit}>Save</button>
          <button onClick={() => {
            setText(message.text)
            setEditing(false)
          }}>Cancel</button>
        </div>
      ) : (
        <div className="message-display">
          <p>{message.text}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  )
}
```

**WebSocket Update:**

When a message is edited, a WebSocket event is broadcast to all connected clients:

```typescript
// WebSocket listener
ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  
  if (update.type === 'messageUpdated' && update.messageTs) {
    // Update message in your state
    setMessages(prev => prev.map(msg => 
      msg.ts === update.messageTs 
        ? { ...msg, text: update.text, images: update.images }
        : msg
    ))
  }
}
```

**Use Cases:**

1. **Fix Typos**: Correct spelling mistakes in user prompts
2. **Clarify Instructions**: Make vague requests more specific
3. **Update Requirements**: Change requirements mid-conversation
4. **Add Context**: Include forgotten details or images

**Best Practices:**

1. ✅ **Only edit for corrections** - Don't change the meaning entirely
2. ✅ **Edit early** - Corrections work best before AI has responded extensively
3. ✅ **Verify timestamp** - Ensure you're editing the correct message
4. ❌ **Don't edit AI messages** - Only user messages can be edited
5. ✅ **Consider forking** - For major changes, use conversation forking instead

**Comparison: Edit vs Fork**

| Feature | Message Edit | Conversation Fork |
|---------|-------------|-------------------|
| **What changes** | Single user message | Creates new branch |
| **AI responses** | Remain unchanged | Can explore alternatives |
| **Use for** | Fixing typos, clarifications | Trying different approaches |
| **Scope** | Minimal change | Major divergence |

**See Also:**
- [Conversation Forking](#-conversation-forking-guide) - Create alternative branches
- [Task Messages](#-building-external-webviews-message-format-guide) - Message format guide
- [WebSocket API](#-websocket-api) - Real-time updates


### 📁 Files
- `GET /api/v1/agent/files`: List workspace files.
- `GET /api/v1/agent/files/read`: Read file content(s).
- `GET /api/v1/agent/workspace`: Get workspace information.

### 🔌 MCP Integration
- `GET /api/v1/agent/mcp/servers`: List all MCP servers.
- `GET /api/v1/agent/mcp/servers/:serverName`: Get specific MCP server details.
- `GET /api/v1/agent/mcp/marketplace`: Get MCP marketplace catalog.
- `POST /api/v1/agent/mcp/marketplace/install`: Install an MCP package from the marketplace.

### 💻 Terminal
- `POST /api/v1/agent/terminal/execute`: Execute a terminal command.
- `GET /api/v1/agent/terminal/info`: Get terminal configuration.

### 🔍 Code Index
- `GET /api/v1/agent/codeindex/status`: Get indexing status.
- `POST /api/v1/agent/codeindex/start`: Start indexing the workspace.
- `POST /api/v1/agent/codeindex/cancel`: Cancel ongoing indexing.
- `DELETE /api/v1/agent/codeindex`: Clear the code index.
- `GET /api/v1/agent/codeindex/config`: Get code index configuration.

### ⚙️ Settings
- `GET /api/v1/agent/settings`: Get all extension settings.
- `PATCH /api/v1/agent/settings`: Update settings (partial update).
- `GET /api/v1/agent/settings/auto-approval`: Get auto-approval configuration.
- `PUT /api/v1/agent/settings/auto-approval`: Update auto-approval configuration.
- `GET /api/v1/agent/settings/terminal`: Get terminal settings.
- `GET /api/v1/agent/settings/browser`: Get browser settings.
- `GET /api/v1/agent/settings/condense`: Get context condensing settings (global + per-profile thresholds).
- `PUT /api/v1/agent/settings/condense`: Update context condensing settings.
### 🔬 Agent Digest (Message Minification)
- `GET /api/v1/agent/settings/digest`: Get Agent Digest settings (global + per-task).
- `PUT /api/v1/agent/settings/digest`: Update Agent Digest settings.
- `POST /api/v1/agent/tasks/{taskId}/digest/toggle`: Enable/disable digest for specific task.
- `POST /api/v1/agent/tasks/{taskId}/messages/{timestamp}/digest`: Generate digest for specific message.

**Note**: Agent Digest provides LLM-generated ultra-compact summaries (50-200 chars) for messages, perfect for notifications, mobile views, and status bars. The AI maintains full context - digests are purely for UI display. See [Agent Digest Guide](#-agent-digest-guide) for detailed usage.


For a complete reference of all available settings, see the [Complete Settings Reference](#-complete-settings-reference) section below.

### 🧠 Memory Bank (Rules System)
- `GET /api/v1/agent/memory-bank`: List all memory entries with filtering (scope, enabled, category).
- `GET /api/v1/agent/memory-bank/stats`: Get memory bank statistics (total, enabled, categories, size).
- `GET /api/v1/agent/memory-bank/{id}`: Get specific memory entry by ID or path.
- `POST /api/v1/agent/memory-bank`: Create new memory entry.
- `PATCH /api/v1/agent/memory-bank/{id}`: Update memory entry (content, enabled, tags, category).
- `DELETE /api/v1/agent/memory-bank/{id}`: Delete memory entry.
### 📋 TODO Management
- `GET /api/v1/agent/todos/{taskId}`: Get TODO list for a task with statistics.
- `POST /api/v1/agent/todos/{taskId}`: Create new TODO item (supports position parameter).
- `PATCH /api/v1/agent/todos/{taskId}/{todoId}`: Update TODO content or status.
- `DELETE /api/v1/agent/todos/{taskId}/{todoId}`: Delete TODO item.
- `POST /api/v1/agent/todos/{taskId}/bulk`: Replace entire TODO list.
- `POST /api/v1/agent/todos/{taskId}/import`: Import TODOs from markdown checklist.
- `GET /api/v1/agent/todos/{taskId}/export`: Export TODOs as markdown checklist.

**Note**: TODOs help organize complex tasks with step-by-step tracking. Each TODO has a status (pending, in_progress, completed) and can be reordered using the position parameter. See [TODO API Guide](#-todo-management-api-guide) for detailed usage.

- `POST /api/v1/agent/memory-bank/{id}/toggle`: Toggle memory entry enabled status.
- `POST /api/v1/agent/memory-bank/search`: Search memory entries with relevance scoring.
- `POST /api/v1/agent/memory-bank/suggest`: Get AI-powered memory suggestions (future feature).

**Note**: The Memory Bank is Hoodycode's persistent knowledge storage system. Memory entries are markdown/text files stored in `.hoodycode/rules/` that are automatically loaded into every task's context. See [Memory Bank API Guide](#-memory-bank-api-guide) for detailed usage.

---

## 🌐 WebSocket API

For real-time communication, the Hoody Code API provides a WebSocket interface that streams all extension state changes.

### Connection
```
ws://localhost:3000/ws?token=YOUR_TOKEN
```

### Real-time Events
The WebSocket receives all extension state changes, including:
- `{ type: "state", state: {...} }`: Full state updates.
- `{ type: "messageUpdated", clineMessage: {...} }`: Task message updates.
- `{ type: "indexingStatusUpdate", values: {...} }`: Indexing progress.
- `{ type: "mcpServers", mcpServers: [...] }`: MCP server updates.
- ...and 270+ more event types.

For a complete list of WebSocket message types, refer to the detailed documentation.

---

## API Design

The Hoody Code API is designed to be a comprehensive, production-ready REST API that can support any client application, not just a UI.

### Design Principles
- **RESTful**: Follows REST conventions, including resources, HTTP verbs, and status codes.
- **Stateless**: Each request contains all necessary context.
- **Real-time**: WebSocket for streaming updates, HTTP for queries and commands.
- **Versioned**: API version is included in the URL path (`/api/v1/agent/`).

---

## Task Switching Architecture

Since only one task can be "current" (active in memory) at a time, the API provides two ways to switch between tasks:

- **Explicit Switching**: Use the `/tasks/:id/switch` endpoint for direct control.
- **Auto-switching**: Task-specific endpoints automatically load the task if needed.

### The Current Task Limitation
- **One Active Task**: Only one task can own resources like terminals, browsers, and file watchers.
- **Switching is Destructive**: Loading a new task aborts the current one.
- **State Persistence**: Historical tasks are stored on disk, while the current task is in memory.

For more details, refer to the full `TASK_SWITCHING_ARCHITECTURE.md` document.

---

## 🔄 Understanding Subtasks (new_task Tool)

Subtasks allow the AI to delegate work to a specialized mode while preserving the parent task's context and state.

### How Subtasks Work

When the AI uses the `new_task` tool, it creates a **child task** that:
1. **Pauses the parent task** - Parent stops executing and waits
2. **Switches to target mode** - Child runs in the specified mode (e.g., architect, debug)
3. **Executes independently** - Child has its own conversation history and context
4. **Returns result to parent** - When child completes, parent resumes with the result
5. **Restores parent mode** - Parent continues in its original mode

### Example Flow

```
Parent Task (code mode):
  ├─ "Build a complex web app"
  ├─ AI realizes it needs architecture planning
  ├─ Uses new_task tool → Creates Child Task
  │
  └─ PAUSED (waiting for child)

Child Task (architect mode):
  ├─ "Design the architecture for a web app"
  ├─ Creates technical specifications
  ├─ Completes with attempt_completion
  │
  └─ FINISHED → Returns result to parent

Parent Task (code mode):
  ├─ RESUMED with child's result
  ├─ "Here's the architecture from the architect..."
  └─ Continues implementing based on architecture
```

### Tool Definition

```xml
<new_task>
<mode>architect</mode>
<message>Design the system architecture for this feature</message>
<todos>
- [ ] Define component structure
- [ ] Design data flow
- [ ] Document API contracts
</todos>
</new_task>
```

**Parameters:**
- `mode` (required) - Target mode slug (code, architect, ask, debug, etc.)
- `message` (required) - Initial instructions for the subtask
- `todos` (optional) - Initial todo list as markdown checklist

### Auto-Approval Setting

Control whether subtasks can be created automatically:

```bash
curl -X PATCH "http://localhost:3000/api/v1/agent/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alwaysAllowSubtasks": true}'
```

### Task Hierarchy

Subtasks create a parent-child relationship:

```json
{
  "parentTask": {
    "taskId": "parent-123",
    "mode": "code",
    "isPaused": true,
    "childTaskId": "child-456"
  },
  "childTask": {
    "taskId": "child-456",
    "parentTaskId": "parent-123",
    "rootTaskId": "parent-123",
    "mode": "architect"
  }
}
```

### Key Properties

- **`rootTaskId`** - ID of the top-level parent task
- **`parentTaskId`** - ID of the immediate parent task
- **`childTaskId`** - ID of the current child task (if paused)
- **`isPaused`** - Whether task is waiting for a child to complete

### Subtask Result Integration

When a child task completes:

1. **Result message added to parent's chat:**
   ```json
   {
     "type": "say",
     "say": "subtask_result",
     "text": "Child task completed with: [result summary]"
   }
   ```

2. **Result added to parent's API history:**
   ```json
   {
     "role": "user",
     "content": [
       {
         "type": "text",
         "text": "[new_task completed] Result: [result summary]"
       }
     ]
   }
   ```

3. **Parent resumes execution** with full context of what the child accomplished

### Use Cases

**1. Architecture Planning**
```
Parent (code): "Build a microservices app"
  └─ Child (architect): "Design the microservices architecture"
```

**2. Debugging**
```
Parent (code): "Implement feature X"
  └─ Child (debug): "Fix the error in module Y"
```

**3. Research**
```
Parent (code): "Integrate payment system"
  └─ Child (ask): "Research best practices for Stripe integration"
```

**4. Testing**
```
Parent (code): "Add new API endpoint"
  └─ Child (test): "Write comprehensive tests for the endpoint"
```

### Limitations

- **One child at a time** - Parent can only have one active child
- **No parallel execution** - Child must complete before parent resumes
- **Shared rate limits** - Parent and child share API rate limiting
- **Mode switching overhead** - Small delay when switching modes

### Monitoring Subtasks via API

**Check if task is paused (waiting for child):**
```bash
curl "http://localhost:3000/api/v1/agent/state" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.currentTaskItem.isPaused'
```

**Get child task ID:**
```bash
curl "http://localhost:3000/api/v1/agent/state" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.currentTaskItem.childTaskId'
```

**View subtask result in parent's messages:**
```bash
curl "http://localhost:3000/api/v1/agent/tasks/parent-id?includeParsed=true" \
  -H "Authorization: Bearer YOUR_TOKEN" | \
  jq '.uiMessages[] | select(.say == "subtask_result")'
```

### Best Practices

1. **Use appropriate modes** - Match the subtask mode to the work needed
2. **Provide clear instructions** - Child task needs complete context
3. **Include todos** - Helps child task stay focused and organized
4. **Enable auto-approval** - Set `alwaysAllowSubtasks: true` for automation
5. **Monitor hierarchy** - Track parent-child relationships via API

### Configuration

**Require todos for new tasks:**
```bash
# This VSCode setting can be accessed via the settings API
curl -X PATCH "http://localhost:3000/api/v1/agent/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newTaskRequireTodos": true}'
```

When enabled, the AI **must** provide a todo list when creating subtasks.
---

## 📊 Subtask API Response Examples

Here's exactly what the API returns when subtasks are involved:

### Parent Task (Before Subtask Creation)

```json
{
  "historyItem": {
    "id": "parent-task-123",
    "rootTaskId": "parent-task-123",
    "parentTaskId": null,
    "childTaskId": null,
    "mode": "code",
    "task": "Build a web app",
    "tokensIn": 5000,
    "tokensOut": 200
  },
  "messages": [...],
  "uiMessages": [
    {
      "ts": 1234567890,
      "type": "say",
      "say": "text",
      "text": "Build a web app"
    },
    {
      "ts": 1234567891,
      "type": "ask",
      "ask": "tool",
      "text": "{\"tool\":\"newTask\",\"mode\":\"Architect\",\"content\":\"Design the app architecture\",\"todos\":[]}"
    }
  ]
}
```

### Parent Task (After Subtask Created - PAUSED)

```json
{
  "historyItem": {
    "id": "parent-task-123",
    "rootTaskId": "parent-task-123",
    "parentTaskId": null,
    "childTaskId": "child-task-456",  // ← Child task ID appears here
    "mode": "code",
    "task": "Build a web app"
  },
  "messages": [...],
  "uiMessages": [
    {
      "ts": 1234567892,
      "type": "say",
      "say": "tool",
      "tool": "newTask",
      "mode": "Architect",
      "content": "Design the app architecture"
    }
  ]
}
```

**Key Changes:**
- ✅ `childTaskId` is now set to the child's task ID
- ✅ Parent task is PAUSED (waiting for child to complete)
- ✅ Last message shows the `newTask` tool was used

### Child Task (Active)

```json
{
  "historyItem": {
    "id": "child-task-456",
    "rootTaskId": "parent-task-123",      // ← Points to root parent
    "parentTaskId": "parent-task-123",    // ← Points to immediate parent
    "childTaskId": null,
    "mode": "architect",                   // ← Different mode!
    "task": "Design the app architecture",
    "number": 2                            // ← Child is task #2 in the chain
  },
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "<task>\nDesign the app architecture\n</task>"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "I'll design the architecture..."
        }
      ]
    }
  ],
  "uiMessages": [
    {
      "ts": 1234567893,
      "type": "say",
      "say": "text",
      "text": "Design the app architecture"
    },
    {
      "ts": 1234567894,
      "type": "say",
      "say": "text",
      "text": "I'll design the architecture..."
    }
  ]
}
```

**Key Properties:**
- ✅ `parentTaskId` points to parent task
- ✅ `rootTaskId` points to the original root task
- ✅ `mode` is different from parent (architect vs code)
- ✅ `number` shows position in task chain
- ✅ Has its own independent conversation history

### Parent Task (After Child Completes - RESUMED)

```json
{
  "historyItem": {
    "id": "parent-task-123",
    "rootTaskId": "parent-task-123",
    "parentTaskId": null,
    "childTaskId": null,  // ← Child ID removed (child completed)
    "mode": "code",
    "task": "Build a web app"
  },
  "messages": [
    ...,
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "[new_task completed] Result: Here's the architecture design..."
        }
      ]
    }
  ],
  "uiMessages": [
    ...,
    {
      "ts": 1234567895,
      "type": "say",
      "say": "subtask_result",
      "text": "Here's the architecture design: [child's completion result]"
    },
    {
      "ts": 1234567896,
      "type": "say",
      "say": "text",
      "text": "Based on the architecture, I'll now implement..."
    }
  ]
}
```

**Key Changes:**
- ✅ `childTaskId` is now `null` (child completed)
- ✅ New `subtask_result` message contains child's output
- ✅ Parent continues with child's result in context
- ✅ Parent's API history includes `[new_task completed] Result: ...`

### Detecting Subtask Relationships via API

**1. Check if task has a child (is paused):**
```bash
curl "http://localhost:3000/api/v1/agent/tasks/parent-id" \
  -H "Authorization: Bearer TOKEN" | jq '.historyItem.childTaskId'

# Returns: "child-task-456" (if paused) or null (if not paused)
```

**2. Find all children of a parent:**
```bash
curl "http://localhost:3000/api/v1/agent/tasks" \
  -H "Authorization: Bearer TOKEN" | \
  jq '.data[] | select(.parentTaskId == "parent-id")'
```

**3. Find the root task:**
```bash
curl "http://localhost:3000/api/v1/agent/tasks/any-task-id" \
  -H "Authorization: Bearer TOKEN" | jq '.historyItem.rootTaskId'
```

**4. Get subtask result from parent:**
```bash
curl "http://localhost:3000/api/v1/agent/tasks/parent-id?includeParsed=true" \
  -H "Authorization: Bearer TOKEN" | \
  jq '.uiMessages[] | select(.say == "subtask_result")'
```

### Task Hierarchy Example

```
Root Task (ID: abc-123)
├─ mode: code
├─ childTaskId: def-456
└─ PAUSED

    Child Task (ID: def-456)
    ├─ mode: architect
    ├─ parentTaskId: abc-123
    ├─ rootTaskId: abc-123
    ├─ childTaskId: ghi-789
    └─ PAUSED

        Grandchild Task (ID: ghi-789)
        ├─ mode: debug
        ├─ parentTaskId: def-456
        ├─ rootTaskId: abc-123
        ├─ childTaskId: null
        └─ ACTIVE
```

**API Response for Grandchild:**
```json
{
  "historyItem": {
    "id": "ghi-789",
    "parentTaskId": "def-456",
    "rootTaskId": "abc-123",
    "mode": "debug",
    "number": 3
  }
}
```

### Summary: What Gets Returned

| Field | Parent (Before) | Parent (Paused) | Child (Active) | Parent (Resumed) |
|-------|----------------|-----------------|----------------|------------------|
| `id` | `parent-123` | `parent-123` | `child-456` | `parent-123` |
| `parentTaskId` | `null` | `null` | `parent-123` | `null` |
| `rootTaskId` | `parent-123` | `parent-123` | `parent-123` | `parent-123` |
| `childTaskId` | `null` | `child-456` ✅ | `null` | `null` |
| `mode` | `code` | `code` | `architect` | `code` |
| `number` | `1` | `1` | `2` | `1` |

**Key Indicators:**
- **Parent is paused**: `childTaskId` is not null
- **Task is a child**: `parentTaskId` is not null
- **Task hierarchy depth**: Check `rootTaskId` vs `parentTaskId`
- **Child completed**: `subtask_result` message in parent's `uiMessages`

---

## 🔀 Conversation Forking Guide

The conversation forking feature allows you to create alternative branches from any message in a task's history, enabling exploration of different approaches while preserving the original conversation.

### What is Conversation Forking?

Forking creates a **new task** with conversation history copied up to a specific message, allowing you to:
- **Explore alternatives** without losing your current path
- **Try different AI models** on the same context
- **Create backups** before risky operations
- **Branch from decision points** to test multiple solutions

### Quick Start

**Fork from a specific message:**
```bash
curl -X POST "http://localhost:3000/api/v1/agent/tasks/abc-123/fork" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageTimestamp": 1700000000000,
    "makeActive": true
  }'
```

**Response:**
```json
{
  "success": true,
  "forkedTaskId": "def-456",
  "sourceTaskId": "abc-123",
  "forkFromMessageTs": 1700000000000,
  "messagesIncluded": 42,
  "isActive": true,
  "context": {
    "mode": "code",
    "modelId": "claude-sonnet-4.5",
    "modelProvider": "anthropic"
  }
}
```

### API Endpoint

```http
POST /api/v1/agent/tasks/{taskId}/fork
```

**Request Body:**
```typescript
{
  messageTimestamp: number      // Required: Message timestamp to fork from
  makeActive?: boolean          // Optional: Switch to fork immediately (default: true)
  mode?: string                 // Optional: Change mode in fork
  providerProfile?: string      // Optional: Use different AI profile
}
```

**Response:**
```typescript
{
  success: boolean
  forkedTaskId: string          // New task ID
  sourceTaskId: string          // Original task ID
  forkFromMessageTs: number     // Fork point timestamp
  messagesIncluded: number      // Messages copied
  isActive: boolean             // Whether fork is now active
  context?: {                   // Task context if active
    mode?: string
    modelId?: string
    modelProvider?: string
    profileName?: string
  }
}
```

### How Forking Works

**1. Message Selection**: Specify timestamp of the message to fork from
**2. History Copy**: All messages up to and INCLUDING that message are copied
**3. Context Preservation**: Workspace, mode, settings, todos are all preserved
**4. Independent State**: Fork gets new ID and separate storage
**5. Optional Activation**: Choose whether to switch to fork immediately

### Fork Tracking

Forked tasks maintain lineage information in their `historyItem`:

```json
{
  "id": "fork-456",
  "sourceTaskId": "original-123",          // Parent task
  "forkFromMessageTs": 1700000000000,      // Fork point
  "forkTimestamp": 1700000001000,          // When fork was created
  "workspace": "/path/to/workspace",
  "mode": "code",
  // ... other fields
}
```

**Finding forks of a task:**
```bash
# List all tasks that were forked from task-123
curl "http://localhost:3000/api/v1/agent/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" | \
  jq '.data[] | select(.sourceTaskId == "task-123")'
```

### Use Case 1: Explore Alternative Approach

```bash
# Current task: Building web app with React
# At message 50, want to try Vue.js instead

curl -X POST "$API/tasks/abc-123/fork" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messageTimestamp": 1700000050000,
    "makeActive": true
  }'

# Result:
# - New task created with 50 messages
# - Switched to new task
# - Can now try Vue approach
# - Original React task preserved
```

### Use Case 2: Create Safety Backup

```bash
# Before major refactoring, create silent backup

curl -X POST "$API/tasks/abc-123/fork" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messageTimestamp": 1700000075000,
    "makeActive": false
  }'

# Result:
# - Fork created in background
# - Still working in original task
# - Can revert to fork if refactoring fails
```

### Use Case 3: Compare AI Models

```bash
# Fork and switch to GPT-5 for comparison

curl -X POST "$API/tasks/abc-123/fork" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messageTimestamp": 1700000100000,
    "makeActive": true,
    "providerProfile": "gpt5-profile"
  }'

# Result:
# - Same conversation context
# - Different AI model responds
# - Can compare different models' approaches
```

### Use Case 4: Try Different Mode

```bash
# Fork to architect mode for planning

curl -X POST "$API/tasks/abc-123/fork" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "messageTimestamp": 1700000125000,
    "makeActive": true,
    "mode": "architect"
  }'

# Result:
# - Forked in architect mode
# - Can plan before continuing to code
# - Original still in code mode
```

### Getting Message Timestamps

To fork from a specific message, you need its timestamp:

```bash
# Get all messages with timestamps
curl "http://localhost:3000/api/v1/agent/tasks/abc-123?includeParsed=true" \
  -H "Authorization: Bearer YOUR_TOKEN" | \
  jq '.uiMessages[] | {ts, type, say: .say, ask: .ask, text: (.text | .[0:50])}'
```

**Output:**
```json
[
  {"ts": 1700000000000, "type": "say", "say": "text", "text": "Build a website"},
  {"ts": 1700000010000, "type": "say", "say": "text", "text": "I'll help you build..."},
  {"ts": 1700000020000, "type": "ask", "ask": "tool", "text": "{\"tool\":\"write_to_file\"..."}
]
```

Select the `ts` value of the message you want to fork from.

### Fork Chain Visualization

Forks can form chains (fork of fork of fork):

```
Original Task (abc-123)
├── Fork 1 (def-456) [sourceTaskId: abc-123]
├── Fork 2 (ghi-789) [sourceTaskId: abc-123]
└── Fork 3 (jkl-012) [sourceTaskId: abc-123]
    └── Sub-fork (mno-345) [sourceTaskId: jkl-012]
```

**Traverse fork chain:**
```javascript
async function getForkChain(taskId) {
  const chain = []
  let currentId = taskId
  
  while (currentId) {
    const task = await fetch(`$API/tasks/${currentId}`)
      .then(r => r.json())
    
    chain.push({
      id: task.historyItem.id,
      task: task.historyItem.task,
      sourceTaskId: task.historyItem.sourceTaskId,
      forkFromMessageTs: task.historyItem.forkFromMessageTs
    })
    
    currentId = task.historyItem.sourceTaskId
  }
  
  return chain.reverse() // Root first
}

// Usage
const chain = await getForkChain('mno-345')
// [
//   { id: 'abc-123', sourceTaskId: null },           // Original
//   { id: 'jkl-012', sourceTaskId: 'abc-123' },      // Fork
//   { id: 'mno-345', sourceTaskId: 'jkl-012' }       // Sub-fork
// ]
```

### Error Handling

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid timestamp or parameters |
| 404 | Not Found | Task or message not found |
| 409 | Conflict | Cannot fork from partial/streaming message |

**Example Errors:**

```json
// Task not found
{
  "error": "Not Found",
  "message": "Task not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}

// Message not found
{
  "error": "Not Found",
  "message": "Message with timestamp 1700000000000 not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}

// Partial message
{
  "error": "Bad Request",
  "message": "Cannot fork from partial or streaming message",
  "code": "BAD_REQUEST",
  "statusCode": 400
}
```

### Best Practices

1. **Validate timestamp**: Ensure message exists before forking
2. **Use `makeActive: false` for backups**: Create silent forks as safety nets
3. **Track lineage**: Use `sourceTaskId` to maintain fork relationships
4. **Name your experiments**: Use descriptive task names when forking for exploration
5. **Clean up abandoned forks**: Delete unsuccessful experiment forks

### JavaScript SDK Example

```javascript
class ConversationForkManager {
  constructor(apiClient) {
    this.api = apiClient
  }

  async fork(taskId, messageTs, options = {}) {
    const response = await this.api.post(`/tasks/${taskId}/fork`, {
      messageTimestamp: messageTs,
      makeActive: options.makeActive ?? true,
      mode: options.mode,
      providerProfile: options.providerProfile
    })
    return response
  }

  async createBackup(taskId, messageTs) {
    // Create silent backup
    return this.fork(taskId, messageTs, { makeActive: false })
  }

  async exploreWithModel(taskId, messageTs, profileName) {
    // Fork and try different model
    return this.fork(taskId, messageTs, { 
      makeActive: true,
      providerProfile: profileName
    })
  }

  async getForks(taskId) {
    // Find all forks of a task
    const tasks = await this.api.get('/tasks')
    return tasks.data.filter(t => t.sourceTaskId === taskId)
  }

  async getSourceChain(taskId) {
    // Get full fork ancestry
    const chain = []
    let current = await this.api.get(`/tasks/${taskId}`)
    
    while (current.historyItem.sourceTaskId) {
      chain.push(current.historyItem)
      current = await this.api.get(`/tasks/${current.historyItem.sourceTaskId}`)
    }
    
    chain.push(current.historyItem) // Add root
    return chain.reverse()
  }
}

// Usage
const forkManager = new ConversationForkManager(apiClient)

// Create backup before risky operation
const backup = await forkManager.createBackup('task-123', currentMessageTs)
console.log('Backup created:', backup.forkedTaskId)

// Try different model
const gpt5Fork = await forkManager.exploreWithModel(
  'task-123', 
  messageTs, 
  'gpt5-profile'
)
console.log('Forked with GPT-5:', gpt5Fork.forkedTaskId)

// Find all forks
const forks = await forkManager.getForks('task-123')
console.log(`Found ${forks.length} forks`)

// Get fork ancestry
const chain = await forkManager.getSourceChain('fork-456')
console.log('Fork chain:', chain.map(t => t.id))
```

### Advanced: Fork Comparison System

Build a system to compare different fork outcomes:

```typescript
interface ForkComparison {
  original: Task
  forks: Array<{
    task: Task
    outcome: 'success' | 'failure' | 'ongoing'
    cost: number
    duration: number
  }>
}

async function compareForks(originalTaskId: string): Promise<ForkComparison> {
  // Get original task
  const original = await fetch(`$API/tasks/${originalTaskId}`)
    .then(r => r.json())
  
  // Find all forks
  const allTasks = await fetch(`$API/tasks`)
    .then(r => r.json())
  const forks = allTasks.data.filter(t => t.sourceTaskId === originalTaskId)
  
  // Analyze each fork
  const forkAnalysis = await Promise.all(forks.map(async fork => {
    const details = await fetch(`$API/tasks/${fork.id}?includeParsed=true`)
      .then(r => r.json())
    
    // Check if completed
    const lastMsg = details.uiMessages[details.uiMessages.length - 1]
    const isCompleted = lastMsg?.ask === 'completion_result'
    
    // Calculate duration
    const startTime = details.historyItem.forkTimestamp
    const endTime = details.historyItem.ts
    const duration = endTime - startTime
    
    return {
      task: fork,
      outcome: isCompleted ? 'success' : 'ongoing',
      cost: details.historyItem.totalCost,
      duration: duration
    }
  }))
  
  return {
    original,
    forks: forkAnalysis
  }
}

// Usage
const comparison = await compareForks('original-task-id')
console.log(`Compared ${comparison.forks.length} different approaches:`)
comparison.forks.forEach((fork, i) => {
  console.log(`\nFork ${i+1}:`)
  console.log(`  Status: ${fork.outcome}`)
  console.log(`  Cost: $${fork.cost.toFixed(4)}`)
  console.log(`  Duration: ${(fork.duration / 1000).toFixed(0)}s`)
})

// Find best fork by cost
const cheapest = comparison.forks.reduce((a, b) => 
  a.cost < b.cost ? a : b
)
console.log(`\nCheapest approach: ${cheapest.task.id} ($${cheapest.cost.toFixed(4)})`)
```

### Fork vs Subtask

| Feature | Fork | Subtask |
|---------|------|---------|
| **Relationship** | Sibling (alternative branch) | Parent-child (delegation) |
| **Original task** | Continues independently | Pauses and waits |
| **Context** | Copy at fork point | Starts fresh with prompt |
| **Use case** | Try different approach | Delegate specialized work |
| **Returns to parent** | No | Yes (with result) |

**When to use Fork:**
- ✅ Want to try alternative approach
- ✅ Need safety backup
- ✅ Compare different models/modes
- ✅ Explore "what if" scenarios

**When to use Subtask:**
- ✅ Need specialized mode (architect, debug)
- ✅ Want result integrated into parent
- ✅ Task naturally decomposes
- ✅ Need mode switching with resumption

### Performance Considerations

**Fork creation time:**
- Small tasks (10 messages): ~100ms
- Medium tasks (100 messages): ~300ms
- Large tasks (1000 messages): ~1-2 seconds

**What's copied:**
- ✅ All UI messages (conversation history)
- ✅ All API messages (for LLM context)
- ✅ Workspace path
- ✅ Mode and settings
- ✅ TODO list state

**What's NOT copied (starts fresh):**
- ❌ Checkpoint history
- ❌ Terminal sessions
- ❌ Browser sessions
- ❌ File watchers

### Complete Integration Example

```typescript
class TaskForkingSystem {
  private api: APIClient
  private forks: Map<string, string[]> = new Map()

  async createExperimentalFork(
    taskId: string,
    messageTs: number,
    experimentName: string
  ) {
    // Create fork for experimentation
    const fork = await this.api.post(`/tasks/${taskId}/fork`, {
      messageTimestamp: messageTs,
      makeActive: true
    })

    // Track fork relationship
    if (!this.forks.has(taskId)) {
      this.forks.set(taskId, [])
    }
    this.forks.get(taskId)!.push(fork.forkedTaskId)

    console.log(`Created experimental fork: ${experimentName}`)
    console.log(`Fork ID: ${fork.forkedTaskId}`)
    console.log(`Messages included: ${fork.messagesIncluded}`)

    return fork
  }

  async createSafetyCheckpoint(taskId: string, messageTs: number) {
    // Create backup without switching
    const backup = await this.api.post(`/tasks/${taskId}/fork`, {
      messageTimestamp: messageTs,
      makeActive: false
    })

    console.log(`Safety backup created: ${backup.forkedTaskId}`)
    return backup.forkedTaskId
  }

  async compareApproaches(originalTaskId: string) {
    // Get all forks
    const forkIds = this.forks.get(originalTaskId) || []
    
    // Analyze each
    const results = await Promise.all(
      forkIds.map(async id => {
        const task = await this.api.get(`/tasks/${id}`)
        return {
          id,
          cost: task.historyItem.totalCost,
          tokens: task.historyItem.tokensIn + task.historyItem.tokensOut,
          model: task.historyItem.modelId
        }
      })
    )

    // Find winner
    const winner = results.reduce((a, b) => a.cost < b.cost ? a : b)
    console.log('Most cost-effective approach:', winner)

    return results
  }

  async cleanupFailedForks(originalTaskId: string) {
    const forkIds = this.forks.get(originalTaskId) || []
    
    for (const forkId of forkIds) {
      try {
        const task = await this.api.get(`/tasks/${forkId}`)
        const lastMsg = task.messages[task.messages.length - 1]
        
        // If fork didn't complete successfully, delete it
        if (!lastMsg || lastMsg.say !== 'completion_result') {
          await this.api.delete(`/tasks/${forkId}`)
          console.log(`Cleaned up incomplete fork: ${forkId}`)
        }
      } catch (error) {
        console.error(`Error checking fork ${forkId}:`, error)
      }
    }
  }
}

// Usage
const forkSystem = new TaskForkingSystem(apiClient)

// Experiment with different approaches
await forkSystem.createExperimentalFork(
  'task-123',
  currentMessageTs,
  'Try Vue.js instead of React'
)

await forkSystem.createExperimentalFork(
  'task-123',
  currentMessageTs,
  'Try Svelte instead of React'
)

// Compare results
const comparison = await forkSystem.compareApproaches('task-123')

// Cleanup failed experiments
await forkSystem.cleanupFailedForks('task-123')
```

### Limitations & Considerations

**Limitations:**
- ❌ Cannot fork from partial/streaming messages (must be complete)
- ❌ No automatic merge capability (manual review required)
- ❌ Forked tasks are independent (no shared state)

**Best for:**
- ✅ Exploring alternatives ("what if we try X instead?")
- ✅ Creating save points before risky operations
- ✅ Comparing different AI models/modes
- ✅ Branching at decision points

**Not ideal for:**
- ❌ Merging different approaches (use subtasks instead)
- ❌ Real-time collaboration (use task sync)
- ❌ Version control (use checkpoints instead)

### See Also

- **[Task Architecture](docs/TASK_ARCHITECTURE_EXPLAINED.md)** - Understand task lifecycle
- **[Subtasks Guide](#-understanding-subtasks-new_task-tool)** - Task delegation
- **[Checkpoints API](docs/CHECKPOINT_API.md)** - Code snapshots
- **[Complete Documentation](to-implement/CONVERSATION_FORKING.md)** - Full fork feature guide



---

## 🎨 Building External Webviews: Message Format Guide

When building external webviews (web apps, mobile apps, etc.) that render Hoodycode tasks, you need to understand how task messages are formatted.

---

## 📁 Tracking File Changes in Your Webview

You can track all file modifications made during a task by parsing the `uiMessages` array. Here's how:

### File Modification Tool Types

When the AI modifies files, it creates tool messages with these types:

| Tool Name | Description | Contains |
|-----------|-------------|----------|
| `newFileCreated` | New file created | `path`, `content` |
| `appliedDiff` | File modified via diff | `path`, `diff` |
| `fileEdited` | File edited | `path`, `content` |
| `insertedContent` | Content inserted into file | `path`, `content`, `line` |
| `searchAndReplaced` | Text replaced in file | `path`, `search`, `replace` |

### Example: Extract All File Changes

```javascript
async function getFileChanges(taskId) {
  const response = await fetch(
    `http://localhost:3000/api/v1/agent/tasks/${taskId}?includeParsed=true`,
    { headers: { 'Authorization': `Bearer ${TOKEN}` } }
  )
  const data = await response.json()
  
  const fileChanges = []
  
  for (const msg of data.uiMessages) {
    if (msg.type === 'ask' && msg.ask === 'tool') {
      // Parse the JSON in the text field
      const toolData = JSON.parse(msg.text || '{}')
      const toolName = toolData.tool
      
      // Track file modification tools
      if (['newFileCreated', 'appliedDiff', 'fileEdited', 'insertedContent', 'searchAndReplaced'].includes(toolName)) {
        fileChanges.push({
          timestamp: msg.ts,
          tool: toolName,
          path: toolData.path,
          content: toolData.content,
          diff: toolData.diff,
          line: toolData.line,
          search: toolData.search,
          replace: toolData.replace
        })
      }
    }
  }
  
  return fileChanges
}

// Usage
const changes = await getFileChanges('task-123')
console.log(`Total file operations: ${changes.length}`)

changes.forEach((change, i) => {
  console.log(`${i+1}. [${new Date(change.timestamp).toLocaleTimeString()}] ${change.tool}`)
  console.log(`   File: ${change.path}`)
})
```

### Real Example Output

```
Task: Create demo.txt with Step 1, update to Step 2, then Step 3

FILE CHANGES TIMELINE:
================================================================================
1. [03:15:42] newFileCreated
   📄 File: demo.txt
   📝 Content: Step 1

2. [03:16:59] appliedDiff
   📄 File: demo.txt
   🔄 Diff: Changed "Step 1" to "Step 2"

3. [03:17:37] appliedDiff
   📄 File: demo.txt
   🔄 Diff: Changed "Step 2" to "Step 3"

================================================================================
Total file operations: 3
```

### React Component: File Changes Timeline

```typescript
interface FileChange {
  timestamp: number
  tool: string
  path: string
  content?: string
  diff?: string
}

function FileChangesTimeline({ taskId }: { taskId: string }) {
  const [changes, setChanges] = useState<FileChange[]>([])
  
  useEffect(() => {
    fetch(`/api/v1/agent/tasks/${taskId}?includeParsed=true`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
      .then(r => r.json())
      .then(data => {
        const fileChanges = data.uiMessages
          .filter(m => m.type === 'ask' && m.ask === 'tool')
          .map(m => {
            const toolData = JSON.parse(m.text || '{}')
            return {
              timestamp: m.ts,
              tool: toolData.tool,
              path: toolData.path,
              content: toolData.content,
              diff: toolData.diff
            }
          })
          .filter(c => ['newFileCreated', 'appliedDiff', 'fileEdited', 'insertedContent', 'searchAndReplaced'].includes(c.tool))
        
        setChanges(fileChanges)
      })
  }, [taskId])
  
  return (
    <div className="file-changes-timeline">
      <h3>File Changes ({changes.length})</h3>
      {changes.map((change, i) => (
        <div key={i} className="file-change">
          <div className="change-header">
            <span className="time">{new Date(change.timestamp).toLocaleTimeString()}</span>
            <span className="tool">{change.tool}</span>
          </div>
          <div className="change-details">
            <code>{change.path}</code>
            {change.content && <pre>{change.content.slice(0, 200)}</pre>}
            {change.diff && <pre className="diff">{change.diff.slice(0, 200)}</pre>}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Group Changes by File

```javascript
function groupChangesByFile(changes) {
  const grouped = {}
  
  for (const change of changes) {
    if (!grouped[change.path]) {
      grouped[change.path] = []
    }
    grouped[change.path].push(change)
  }
  
  return grouped
}

// Usage
const changes = await getFileChanges('task-123')
const byFile = groupChangesByFile(changes)

Object.entries(byFile).forEach(([path, fileChanges]) => {
  console.log(`\n${path} (${fileChanges.length} changes)`)
  fileChanges.forEach((change, i) => {
    console.log(`  ${i+1}. ${change.tool} at ${new Date(change.timestamp).toLocaleTimeString()}`)
  })
})
```

### Alternative: Use Checkpoints for Diffs

For tasks with checkpoints enabled, you can get precise diffs between any two points:

```javascript
async function getCheckpointDiff(taskId, checkpointHash) {
  const response = await fetch(
    `http://localhost:3000/api/v1/agent/tasks/${taskId}/checkpoints/${checkpointHash}/diff`,
    { headers: { 'Authorization': `Bearer ${TOKEN}` } }
  )
  return response.json()
}

// Get all checkpoints
const checkpoints = await fetch(`/api/v1/agent/tasks/${taskId}/checkpoints`)
  .then(r => r.json())

// Get diff for each checkpoint
for (const checkpoint of checkpoints.checkpoints) {
  const diff = await getCheckpointDiff(taskId, checkpoint.hash)
  console.log(`Checkpoint ${checkpoint.hash.slice(0, 8)}:`)
  diff.changes.forEach(change => {
    console.log(`  ${change.path}`)
    console.log(`    Before: ${change.before.slice(0, 50)}...`)
    console.log(`    After: ${change.after.slice(0, 50)}...`)
  })
}
```

### Recommendation for Your Webview

**Best approach**: Combine both methods!

1. **Use `uiMessages`** for real-time file change tracking (works for all tasks)
2. **Use checkpoints** for precise diffs when available (requires `enableCheckpoints: true`)

```typescript
interface FileChangeTracker {
  // From uiMessages - always available
  timeline: FileChange[]
  
  // From checkpoints - when available
  checkpoints?: {
    hash: string
    timestamp: number
    changes: Array<{path: string, before: string, after: string}>
  }[]
}

async function getCompleteFileHistory(taskId: string): Promise<FileChangeTracker> {
  const task = await fetch(`/api/v1/agent/tasks/${taskId}?includeParsed=true`)
    .then(r => r.json())
  
  // Extract timeline from uiMessages
  const timeline = task.uiMessages
    .filter(m => m.type === 'ask' && m.ask === 'tool')
    .map(m => JSON.parse(m.text || '{}'))
    .filter(t => ['newFileCreated', 'appliedDiff', 'fileEdited', 'insertedContent', 'searchAndReplaced'].includes(t.tool))
  
  // Get checkpoints if available
  let checkpoints
  try {
    const cpData = await fetch(`/api/v1/agent/tasks/${taskId}/checkpoints`)
      .then(r => r.json())
    
    if (cpData.count > 0) {
      checkpoints = await Promise.all(
        cpData.checkpoints.map(async cp => {
          const diff = await fetch(`/api/v1/agent/tasks/${taskId}/checkpoints/${cp.hash}/diff`)
            .then(r => r.json())
          return { ...cp, changes: diff.changes }
        })
      )
    }
  } catch (e) {
    // Checkpoints not available for this task
  }
  
  return { timeline, checkpoints }
}
```

This gives you **complete visibility** into all file changes throughout the task! 🎯

### Two Message Formats Available

The `GET /api/v1/agent/tasks/:taskId` endpoint supports an optional `?includeParsed=true` parameter that provides **two different message formats**:

1. **`messages`** (always included) - Raw Anthropic API format with XML tool tags as strings
2. **`uiMessages`** (optional) - Pre-parsed JSON format ready for UI rendering

### Why Two Formats?

- **Raw format (`messages`)**: For API compatibility, debugging, or custom parsing
- **Parsed format (`uiMessages`)**: For quick UI rendering - same format the VSCode webview uses

### Example: AI Asking a Question

**Request:**
```bash
curl "http://localhost:3000/api/v1/agent/tasks/abc123?includeParsed=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "historyItem": {
    "id": "abc123",
    "task": "Ask me what my favorite color is",
    "tokensIn": 11305,
    "tokensOut": 73,
    "totalCost": 0.0022
  },
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "<task>\nAsk me what my favorite color is\n</task>"
        }
      ]
    },
    {
      "role": "assistant",
      "content": [
        {
          "type": "text",
          "text": "<ask_followup_question>\n<question>What is your favorite color?</question>\n<follow_up>\n<suggest>Blue</suggest>\n<suggest>Green</suggest>\n<suggest>Red</suggest>\n<suggest>Yellow</suggest>\n</follow_up>\n</ask_followup_question>"
        }
      ]
    }
  ],
  "uiMessages": [
    {
      "ts": 1760588829806,
      "type": "say",
      "say": "text",
      "text": "Ask me what my favorite color is"
    },
    {
      "ts": 1760588831479,
      "type": "ask",
      "ask": "followup",
      "text": "{\"question\":\"What is your favorite color?\",\"suggest\":[{\"answer\":\"Blue\"},{\"answer\":\"Green\"},{\"answer\":\"Red\"},{\"answer\":\"Yellow\"}]}",
      "partial": false
    }
  ]
}
```

### Rendering in Your Webview

#### ❌ Without `?includeParsed=true` (Hard Way)

```javascript
// You get raw XML strings - must parse yourself
const aiMessage = response.messages[1].content[0].text
// "<ask_followup_question>\n<question>What is your favorite color?</question>..."

// Parse XML manually 😰
const parser = new DOMParser()
const doc = parser.parseFromString(aiMessage, 'text/xml')
const question = doc.querySelector('question').textContent
const suggests = Array.from(doc.querySelectorAll('suggest')).map(s => s.textContent)

// Render
return (
  <div>
    <h3>{question}</h3>
    {suggests.map(s => <button>{s}</button>)}
  </div>
)
```

#### ✅ With `?includeParsed=true` (Easy Way)

```javascript
// You get pre-parsed JSON! 🎉
const uiMessage = response.uiMessages.find(m => m.ask === 'followup')
const data = JSON.parse(uiMessage.text)
// { question: "What is your favorite color?", suggest: [{answer: "Blue"}, ...] }

// Render directly - no parsing needed!
return (
  <div>
    <h3>{data.question}</h3>
    {data.suggest.map(s => <button>{s.answer}</button>)}
  </div>
)
```

### Per-Message Metadata (NEW! 🎉)

Each `uiMessage` now includes optional `metadata.general` with per-message tracking:

```typescript
interface UIMessage {
  ts: number
  type: 'say' | 'ask'
  say?: string
  ask?: string
  text?: string
  metadata?: {
    general?: {
      // Model & Profile Information
      modelId?: string           // e.g., "claude-sonnet-4.5"
      provider?: string           // e.g., "anthropic"
      profileName?: string        // e.g., "My Claude Profile"
      profileId?: string          // e.g., "profile-abc123"
      mode?: string               // e.g., "code", "architect"
      
      // Per-Message Metrics (for API requests)
      tokensIn?: number           // Input tokens for this message
      tokensOut?: number          // Output tokens for this message
      cacheWrites?: number        // Cache write tokens
      cacheReads?: number         // Cache read tokens
      cost?: number               // Cost for this message (USD)
      
      // Cumulative Metrics (running totals)
      cumulativeCost?: number     // Total cost up to this message
      cumulativeTokensIn?: number // Total input tokens so far
      cumulativeTokensOut?: number// Total output tokens so far
    }
  }
}
```

**Example: API Request with Metadata**
```json
{
  "ts": 1700000000000,
  "type": "say",
  "say": "api_req_started",
  "text": "{\"request\":\"...\",\"tokensIn\":1250,\"tokensOut\":450,\"cost\":0.0125}",
  "metadata": {
    "general": {
      "modelId": "claude-sonnet-4.5",
      "provider": "anthropic",
      "profileName": "My Claude Profile",
      "profileId": "abc-123",
      "mode": "code",
      "tokensIn": 1250,
      "tokensOut": 450,
      "cacheWrites": 200,
      "cacheReads": 800,
      "cost": 0.0125,
      "cumulativeCost": 0.0450,
      "cumulativeTokensIn": 5000,
      "cumulativeTokensOut": 1800
    }
  }
}
```

**Use Cases:**
1. **Per-message cost tracking** - Show cost for each AI response
2. **Token usage charts** - Visualize token consumption over time
3. **Model identification** - Display which model generated each response
4. **Profile tracking** - Know which profile was used for each message
5. **Mode awareness** - Show which mode the message was created in

**JavaScript Example: Extract Per-Message Costs**
```javascript
async function getMessageCosts(taskId) {
  const response = await fetch(
    `http://localhost:3000/api/v1/agent/tasks/${taskId}?includeParsed=true`,
    { headers: { 'Authorization': `Bearer ${TOKEN}` } }
  )
  const data = await response.json()
  
  return data.uiMessages
    .filter(msg => msg.metadata?.general?.cost)
    .map(msg => ({
      timestamp: new Date(msg.ts),
      type: msg.say || msg.ask,
      cost: msg.metadata.general.cost,
      cumulativeCost: msg.metadata.general.cumulativeCost,
      tokensIn: msg.metadata.general.tokensIn,
      tokensOut: msg.metadata.general.tokensOut,
      model: msg.metadata.general.modelId
    }))
}

// Usage
const costs = await getMessageCosts('task-123')
console.log('Message costs:')
costs.forEach((c, i) => {
  console.log(`${i+1}. [${c.timestamp.toLocaleTimeString()}] ${c.model}`)
  console.log(`   Tokens: ${c.tokensIn} in, ${c.tokensOut} out`)
  console.log(`   Cost: $${c.cost.toFixed(4)} (Total: $${c.cumulativeCost.toFixed(4)})`)
})
```

**React Component: Cost Timeline**
```typescript
function MessageCostTimeline({ taskId }: { taskId: string }) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  
  useEffect(() => {
    fetch(`/api/v1/agent/tasks/${taskId}?includeParsed=true`)
      .then(r => r.json())
      .then(data => setMessages(data.uiMessages))
  }, [taskId])
  
  const apiMessages = messages.filter(m =>
    m.say === 'api_req_started' && m.metadata?.general
  )
  
  return (
    <div className="cost-timeline">
      <h3>AI API Costs</h3>
      {apiMessages.map((msg, i) => (
        <div key={msg.ts} className="cost-entry">
          <div className="cost-header">
            <span className="time">{new Date(msg.ts).toLocaleTimeString()}</span>
            <span className="model">{msg.metadata?.general?.modelId}</span>
          </div>
          <div className="cost-metrics">
            <span>Tokens: {msg.metadata?.general?.tokensIn}↓ / {msg.metadata?.general?.tokensOut}↑</span>
            <span className="cost">${msg.metadata?.general?.cost?.toFixed(4)}</span>
          </div>
          <div className="cumulative">
            Cumulative: ${msg.metadata?.general?.cumulativeCost?.toFixed(4)}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Common UI Message Types

The `uiMessages` array contains different message types you'll need to render:

| Type | `say` value | Description | Example |
|------|-------------|-------------|---------|
| User input | `"text"` | User's task/message | `{type: "say", say: "text", text: "Build a website"}` |
| AI response | `"text"` | AI's text response | `{type: "say", say: "text", text: "I'll help you..."}` |
| Tool use | `"tool"` | AI used a tool (file edit, command, etc.) | `{type: "ask", ask: "tool", tool: "write_to_file", ...}` |
| Question | `"followup"` | AI asking user a question | `{type: "ask", ask: "followup", text: "{\"question\":\"...\"}"}` |
| Error | `"error"` | Error occurred | `{type: "say", say: "error", text: "Error message"}` |
| Checkpoint | `"checkpoint_saved"` | Code snapshot saved | `{type: "say", say: "checkpoint_saved", text: "hash123"}` |
| API request | `"api_req_started"` | API call started (now with metadata!) | `{type: "say", say: "api_req_started", text: "{...}", metadata: {...}}` |

### React Example: Complete Message Renderer

```typescript
interface UIMessage {
  ts: number
  type: 'say' | 'ask'
  say?: string
  ask?: string
  text?: string
  partial?: boolean
  [key: string]: any
}

function MessageRenderer({ message }: { message: UIMessage }) {
  // User input
  if (message.type === 'say' && message.say === 'text' && message.text) {
    return <div className="user-message">{message.text}</div>
  }

  // AI asking a question
  if (message.type === 'ask' && message.ask === 'followup') {
    const data = JSON.parse(message.text || '{}')
    return (
      <div className="ai-question">
        <h3>{data.question}</h3>
        <div className="suggestions">
          {data.suggest?.map((s: any, i: number) => (
            <button key={i} onClick={() => handleAnswer(s.answer)}>
              {s.answer}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Tool use (file edit, command, etc.)
  if (message.type === 'ask' && message.ask === 'tool') {
    return (
      <div className="tool-use">
        <strong>{message.tool}</strong>
        {message.path && <code>{message.path}</code>}
      </div>
    )
  }

  // Error
  if (message.type === 'say' && message.say === 'error') {
    return <div className="error">{message.text}</div>
  }

  // Checkpoint saved
  if (message.type === 'say' && message.say === 'checkpoint_saved') {
    return (
      <div className="checkpoint">
        📸 Snapshot saved: <code>{message.text?.slice(0, 8)}</code>
      </div>
    )
  }

  // Default fallback
  return <div className="message">{JSON.stringify(message)}</div>
}

// Usage
function TaskView({ taskId }: { taskId: string }) {
  const [task, setTask] = useState(null)

  useEffect(() => {
    fetch(`/api/v1/agent/tasks/${taskId}?includeParsed=true`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    })
      .then(r => r.json())
      .then(setTask)
  }, [taskId])

  return (
    <div className="task-view">
      <h2>{task?.historyItem.task}</h2>
      <div className="messages">
        {task?.uiMessages.map((msg, i) => (
          <MessageRenderer key={i} message={msg} />
        ))}
      </div>
    </div>
  )
}
```

### Best Practices

1. **Always use `?includeParsed=true`** for webviews - it saves you from XML parsing
2. **Handle all message types** - see the table above for common types
3. **Check `partial` flag** - messages with `partial: true` are still being streamed
4. **Parse JSON in `text` field** - many message types store structured data as JSON strings
5. **Use timestamps (`ts`)** - for ordering and displaying message times
6. **Handle errors gracefully** - always check for `say: "error"` messages

### WebSocket Real-time Updates

For live updates as the AI works, combine the REST API with WebSocket:

```javascript
// Initial load
const task = await fetch(`/api/v1/agent/tasks/${taskId}?includeParsed=true`)
  .then(r => r.json())

// Real-time updates
const ws = new WebSocket(`ws://localhost:3000/ws?token=${TOKEN}`)

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  
  // New message added
  if (msg.type === 'messageUpdated' && msg.clineMessage) {
    setMessages(prev => [...prev, msg.clineMessage])
  }
  
  // Task state changed
  if (msg.type === 'state' && msg.state.currentTaskId === taskId) {
    updateTaskState(msg.state)
  }
}
```

### Summary

- **Use `?includeParsed=true`** to get UI-ready message format
- **`messages`** = Raw XML strings (for API compatibility)
- **`uiMessages`** = Pre-parsed JSON (for easy rendering)
- **Same format as VSCode webview** - proven and battle-tested
- **No XML parsing needed** - just render the JSON!

For more details, see [`docs/api-reference.html`](docs/api-reference.html) for interactive API documentation.

---

## 📋 Complete Settings Reference

This section provides a comprehensive reference of ALL available settings that can be retrieved and updated via the API.

### How to Access Settings

**Get all settings:**
```bash
curl "http://localhost:3000/api/v1/agent/state" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update settings (partial):**
```bash
curl -X PATCH "http://localhost:3000/api/v1/agent/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"settingName": "value"}'
```

### Auto-Approval Settings

Control which operations can be auto-approved without user confirmation.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoApprovalEnabled` | boolean | `false` | Master switch for auto-approval |
| `alwaysAllowReadOnly` | boolean | `false` | Auto-approve read-only file operations |
| `alwaysAllowReadOnlyOutsideWorkspace` | boolean | `false` | Auto-approve reads outside workspace |
| `alwaysAllowWrite` | boolean | `false` | Auto-approve file write operations |
| `alwaysAllowWriteOutsideWorkspace` | boolean | `false` | Auto-approve writes outside workspace |
| `alwaysAllowWriteProtected` | boolean | `false` | Auto-approve writes to protected files |
| `alwaysAllowExecute` | boolean | `false` | Auto-approve command execution |
| `alwaysAllowBrowser` | boolean | `false` | Auto-approve browser actions |
| `alwaysAllowMcp` | boolean | `false` | Auto-approve MCP server operations |
| `alwaysAllowModeSwitch` | boolean | `false` | Auto-approve mode switching |
| `alwaysAllowSubtasks` | boolean | `false` | Auto-approve subtask creation |
| `alwaysAllowUpdateTodoList` | boolean | `false` | Auto-approve todo list updates |
| `alwaysApproveResubmit` | boolean | `false` | Auto-approve request resubmission |

**Example:**
```json
{
  "autoApprovalEnabled": true,
  "alwaysAllowReadOnly": true,
  "alwaysAllowWrite": true,
  "alwaysAllowExecute": false
}
```

### Context Condensing Settings

Control automatic context window management and condensing behavior. When conversations grow long and approach the model's token limit, the system can automatically condense (summarize) older messages to free up space while preserving important information.

**Dedicated Endpoints:**
```bash
# Get all condense settings
GET /api/v1/agent/settings/condense

# Update condense settings
PUT /api/v1/agent/settings/condense
```

#### Core Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoCondenseContext` | boolean | `true` | Enable automatic context condensing when threshold reached |
| `autoCondenseContextPercent` | number | `100` | **Global threshold** (5-100%) - when token usage reaches this % of context window, condensing triggers |
| `profileThresholds` | object | `{}` | **Per-profile thresholds** - map of profile IDs to their specific percentages |
| `condensingApiConfigId` | string | - | AI profile ID to use for condensing (allows using faster/cheaper model) |
| `customCondensingPrompt` | string | - | Custom prompt for condensing (overrides default) |

#### How Condensing Works

1. **Token Monitoring**: System tracks token usage vs context window size
2. **Threshold Check**: When usage reaches threshold %, condensing triggers
3. **Profile Priority**: Profile-specific threshold overrides global if set
4. **AI Summarization**: Uses configured AI to condense older messages
5. **Context Preservation**: Important information retained, tokens reduced

#### Global vs Per-Profile Thresholds

**Global threshold** (`autoCondenseContextPercent`):
- Applies to ALL profiles by default
- Range: 5-100 (percentage of context window)
- Default: 100 (only condense when context is completely full)

**Per-profile thresholds** (`profileThresholds`):
- Override global setting for specific profiles
- Special value `-1` = inherit from global
- Range: 5-100 or -1

**Example Configuration:**
```json
{
  "autoCondenseContext": true,
  "autoCondenseContextPercent": 80,
  "profileThresholds": {
    "claude-profile-123": 75,
    "gpt-profile-456": -1,
    "gemini-profile-789": 60
  },
  "condensingApiConfigId": "fast-model-profile",
  "customCondensingPrompt": "Condense while preserving technical details and code examples"
}
```

**This means:**
- **Claude profile** (123): Condenses at 75% of its 200K context window
- **GPT profile** (456): Uses global 80% threshold (inherits via `-1`)
- **Gemini profile** (789): Condenses at 60% of its 2M context window
- **All condensing operations**: Use the "fast-model-profile" instead of current profile

#### API Examples

**Get current condense settings:**
```bash
curl "http://localhost:3000/api/v1/agent/settings/condense" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "autoCondenseContext": true,
  "autoCondenseContextPercent": 80,
  "profileThresholds": {
    "profile-abc": 75,
    "profile-def": -1,
    "profile-ghi": 60
  },
  "condensingApiConfigId": "fast-model-id",
  "customCondensingPrompt": "Condense while preserving key technical details"
}
```

**Update global threshold:**
```bash
curl -X PUT "http://localhost:3000/api/v1/agent/settings/condense" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoCondenseContextPercent": 75
  }'
```

**Set per-profile thresholds:**
```bash
curl -X PUT "http://localhost:3000/api/v1/agent/settings/condense" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileThresholds": {
      "claude-sonnet": 75,
      "gpt-4": 80,
      "gemini-flash": 60,
      "local-llama": -1
    }
  }'
```

**Use cheaper model for condensing:**
```bash
# Get list of profiles to find a fast/cheap model
curl "http://localhost:3000/api/v1/agent/profiles" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Set fast model for condensing
curl -X PUT "http://localhost:3000/api/v1/agent/settings/condense" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "condensingApiConfigId": "gemini-flash-profile"
  }'
```

#### Validation Rules

The API validates threshold values:

| Parameter | Valid Range | Special Values |
|-----------|-------------|----------------|
| `autoCondenseContextPercent` | 5-100 | - |
| `profileThresholds[id]` | 5-100 or -1 | -1 = inherit global |

**Invalid requests return 400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "autoCondenseContextPercent must be between 5 and 100",
  "code": "BAD_REQUEST",
  "statusCode": 400
}
```

#### Why Per-Profile Thresholds?

Different models have vastly different context windows:

| Model | Context Window | Recommended Threshold |
|-------|----------------|----------------------|
| GPT-4 Turbo | 128K tokens | 75-80% |
| Claude Sonnet 4.5 | 200K tokens | 75-85% |
| Gemini 2.5 Pro | 2M tokens | 50-60% |
| Local Llama 3 | 8K tokens | 85-90% |

**Benefits:**
- ✅ **Optimize per model**: Larger context windows can defer condensing
- ✅ **Control costs**: Expensive models condense earlier to reduce tokens
- ✅ **Model-specific tuning**: Account for each model's performance characteristics
- ✅ **Flexibility**: Different strategies for different use cases

#### Use Cases

**1. Cost Optimization**
```bash
# Expensive models: condense early to save tokens
PUT /settings/condense
{
  "profileThresholds": {
    "claude-opus": 60,
    "gpt-4": 65
  }
}

# Cheap models: condense later to preserve context
{
  "profileThresholds": {
    "gemini-flash": 90,
    "local-model": 95
  }
}
```

**2. Context Window Management**
```bash
# Large context models: can defer condensing
{
  "profileThresholds": {
    "gemini-2.5-pro": 50,
    "claude-sonnet-4.5": 75
  }
}

# Small context models: condense earlier
{
  "profileThresholds": {
    "llama-8k": 85,
    "mistral-32k": 80
  }
}
```

**3. Different Condensing Model**
```bash
# Use fast, cheap model for condensing
{
  "condensingApiConfigId": "gemini-flash-profile",
  "profileThresholds": {
    "expensive-model": 70
  }
}
```

#### JavaScript SDK Example

```typescript
class CondenseSettingsManager {
  constructor(private apiClient: APIClient) {}

  async getSettings() {
    return this.apiClient.get('/settings/condense')
  }

  async setGlobalThreshold(percent: number) {
    if (percent < 5 || percent > 100) {
      throw new Error('Threshold must be between 5-100')
    }
    return this.apiClient.put('/settings/condense', {
      autoCondenseContextPercent: percent
    })
  }

  async setProfileThreshold(profileId: string, percent: number | -1) {
    if (percent !== -1 && (percent < 5 || percent > 100)) {
      throw new Error('Threshold must be -1 or 5-100')
    }

    const current = await this.getSettings()
    return this.apiClient.put('/settings/condense', {
      profileThresholds: {
        ...current.profileThresholds,
        [profileId]: percent
      }
    })
  }

  async removeProfileThreshold(profileId: string) {
    const current = await this.getSettings()
    const { [profileId]: _, ...rest } = current.profileThresholds
    return this.apiClient.put('/settings/condense', {
      profileThresholds: rest
    })
  }

  async setCondensingModel(profileId: string) {
    return this.apiClient.put('/settings/condense', {
      condensingApiConfigId: profileId
    })
  }

  async optimizeForCost() {
    // Set aggressive condensing for expensive models
    return this.apiClient.put('/settings/condense', {
      autoCondenseContextPercent: 70,
      profileThresholds: {
        'claude-opus': 60,
        'gpt-4': 65
      }
    })
  }

  async optimizeForContext() {
    // Set relaxed condensing for maximum context
    return this.apiClient.put('/settings/condense', {
      autoCondenseContextPercent: 90,
      profileThresholds: {
        'gemini-2.5-pro': 50,
        'claude-sonnet': 80
      }
    })
  }
}

// Usage
const condenseMgr = new CondenseSettingsManager(apiClient)

// Set global threshold to 80%
await condenseMgr.setGlobalThreshold(80)

// Claude profile condenses at 75%
await condenseMgr.setProfileThreshold('claude-profile-123', 75)

// GPT profile inherits global (80%)
await condenseMgr.setProfileThreshold('gpt-profile-456', -1)

// Use fast model for condensing
await condenseMgr.setCondensingModel('gemini-flash-profile')

// Optimize for cost savings
await condenseMgr.optimizeForCost()
```

#### React Component Example

```typescript
function CondenseSettingsPanel() {
  const [settings, setSettings] = useState<CondenseSettings | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    // Load settings and profiles
    Promise.all([
      fetch('/api/v1/agent/settings/condense').then(r => r.json()),
      fetch('/api/v1/agent/profiles').then(r => r.json())
    ]).then(([condenseSettings, profileList]) => {
      setSettings(condenseSettings)
      setProfiles(profileList)
    })
  }, [])

  const updateGlobal = async (percent: number) => {
    await fetch('/api/v1/agent/settings/condense', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoCondenseContextPercent: percent })
    })
    // Reload settings
  }

  const updateProfile = async (profileId: string, percent: number) => {
    const newThresholds = {
      ...settings?.profileThresholds,
      [profileId]: percent
    }
    await fetch('/api/v1/agent/settings/condense', {
      method: 'PUT',
      body: JSON.stringify({ profileThresholds: newThresholds })
    })
  }

  return (
    <div className="condense-settings">
      <h2>Context Condensing Settings</h2>
      
      {/* Global threshold */}
      <div className="global-setting">
        <label>Global Threshold: {settings?.autoCondenseContextPercent}%</label>
        <input
          type="range"
          min="5"
          max="100"
          value={settings?.autoCondenseContextPercent}
          onChange={e => updateGlobal(Number(e.target.value))}
        />
        <p>Condense when context reaches this % of model's limit</p>
      </div>

      {/* Per-profile overrides */}
      <div className="profile-thresholds">
        <h3>Per-Profile Overrides</h3>
        {profiles.map(profile => (
          <div key={profile.id} className="profile-threshold">
            <label>{profile.name}</label>
            <select
              value={settings?.profileThresholds?.[profile.id] ?? -1}
              onChange={e => updateProfile(profile.id, Number(e.target.value))}
            >
              <option value="-1">Inherit Global ({settings?.autoCondenseContextPercent}%)</option>
              <option value="60">60% (Aggressive)</option>
              <option value="75">75% (Balanced)</option>
              <option value="90">90% (Conservative)</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Context & Performance Settings

Control how the AI manages conversation context and performance.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `maxOpenTabsContext` | number | `20` | Maximum open tabs to include in context |
| `maxWorkspaceFiles` | number | `200` | Maximum workspace files to index |
| `maxReadFileLine` | number | `-1` | Max lines to read from files (-1 = unlimited) |
| `maxConcurrentFileReads` | number | `5` | Max concurrent file read operations |
| `allowVeryLargeReads` | boolean | `false` | Allow reading very large files |
| `requestDelaySeconds` | number | `10` | Delay between API requests (seconds) |

**Example:**
```json
{
  "maxOpenTabsContext": 30,
  "maxConcurrentFileReads": 10
}
```

**Note**: For context condensing settings, see the dedicated [Context Condensing Settings](#context-condensing-settings) section above.

### Terminal Settings

Configure terminal behavior and output handling.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `terminalOutputLineLimit` | number | `500` | Maximum lines of terminal output to capture |
| `terminalOutputCharacterLimit` | number | `50000` | Maximum characters of terminal output |
| `terminalShellIntegrationTimeout` | number | `5000` | Shell integration timeout (ms) |
| `terminalShellIntegrationDisabled` | boolean | `false` | Disable shell integration |
| `terminalCommandDelay` | number | `0` | Delay before executing commands (ms) |
| `terminalCompressProgressBar` | boolean | `true` | Compress progress bar output |
| `terminalPowershellCounter` | boolean | `false` | Enable PowerShell counter |
| `terminalZshClearEolMark` | boolean | `true` | Clear Zsh end-of-line mark |
| `terminalZshOhMy` | boolean | `false` | Oh My Zsh compatibility mode |
| `terminalZshP10k` | boolean | `false` | Powerlevel10k compatibility mode |
| `terminalZdotdir` | boolean | `false` | Use custom ZDOTDIR |
| `allowedCommands` | string[] | `[]` | Whitelist of allowed commands |
| `deniedCommands` | string[] | `[]` | Blacklist of denied commands |

**Example:**
```json
{
  "terminalOutputLineLimit": 1000,
  "terminalCommandDelay": 500,
  "allowedCommands": ["npm", "git", "pnpm"],
  "deniedCommands": ["rm -rf", "sudo"]
}
```

### Browser Settings

Configure browser automation features.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `browserToolEnabled` | boolean | `true` | Enable browser automation tool |
| `browserViewportSize` | string | `"900x600"` | Browser viewport dimensions |
| `screenshotQuality` | number | `75` | Screenshot quality (0-100) |
| `remoteBrowserEnabled` | boolean | `false` | Enable remote browser connection |

**Example:**
```json
{
  "browserToolEnabled": true,
  "browserViewportSize": "1920x1080",
  "screenshotQuality": 90
}
```

### UI & Display Settings

Control UI behavior and display preferences.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `soundEnabled` | boolean | `false` | Enable sound notifications |
| `soundVolume` | number | `0.5` | Sound volume (0.0-1.0) |
| `ttsEnabled` | boolean | `false` | Enable text-to-speech |
| `ttsSpeed` | number | `1` | TTS playback speed |
| `diffEnabled` | boolean | `true` | Show diff view for file changes |
| `showRooIgnoredFiles` | boolean | `false` | Show ignored files in file tree |
| `showAutoApproveMenu` | boolean | `false` | Show auto-approve menu |
| `showTaskTimeline` | boolean | `true` | Show task timeline |
| `showTimestamps` | boolean | `true` | Show message timestamps |
| `hideCostBelowThreshold` | number | `0` | Hide costs below threshold |
| `historyPreviewCollapsed` | boolean | `false` | Collapse history preview |
| `reasoningBlockCollapsed` | boolean | `true` | Collapse reasoning blocks |
| `language` | string | `"en"` | UI language code |

**Example:**
```json
{
  "soundEnabled": true,
  "soundVolume": 0.7,
  "showTimestamps": true,
  "language": "en"
}
```

### File & Image Settings

Configure file and image handling.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `writeDelayMs` | number | `1000` | Delay before writing files (ms) |
| `maxImageFileSize` | number | `5` | Max image file size (MB) |
| `maxTotalImageSize` | number | `20` | Max total image size per request (MB) |
| `fuzzyMatchThreshold` | number | `1` | Fuzzy matching threshold for file search |

**Example:**
```json
{
  "writeDelayMs": 500,
  "maxImageFileSize": 10,
  "maxTotalImageSize": 50
}
```

### MCP (Model Context Protocol) Settings

Configure MCP server integration.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mcpEnabled` | boolean | `true` | Enable MCP server support |
| `enableMcpServerCreation` | boolean | `true` | Allow creating new MCP servers |

**Example:**
```json
{
  "mcpEnabled": true,
  "enableMcpServerCreation": true
}
```

### Checkpoint Settings

Configure code checkpoint/snapshot features.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enableCheckpoints` | boolean | `true` | Enable automatic code checkpoints |

**Example:**
```json
{
  "enableCheckpoints": true
}
```

### Experimental Features

Enable/disable experimental features (use with caution).

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `experiments.morphFastApply` | boolean | `false` | Fast apply algorithm (experimental) |
| `experiments.multiFileApplyDiff` | boolean | `false` | Multi-file diff application |
| `experiments.powerSteering` | boolean | `false` | Power steering mode |
| `experiments.preventFocusDisruption` | boolean | `true` | Prevent focus disruption |
| `experiments.imageGeneration` | boolean | `false` | Image generation support |
| `experiments.runSlashCommand` | boolean | `true` | Slash command execution |

**Example:**
```json
{
  "experiments": {
    "preventFocusDisruption": true,
    "runSlashCommand": true
  }
}
```

### Complete Example: Update Multiple Settings

```bash
curl -X PATCH "http://localhost:3000/api/v1/agent/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoApprovalEnabled": true,
    "alwaysAllowReadOnly": true,
    "alwaysAllowWrite": true,
    "autoCondenseContext": true,
    "autoCondenseContextPercent": 75,
    "terminalOutputLineLimit": 1000,
    "browserViewportSize": "1920x1080",
    "soundEnabled": true,
    "soundVolume": 0.8,
    "showTimestamps": true,
    "enableCheckpoints": true
  }'
```

### Notes

- **Secrets are redacted**: API keys and tokens are automatically redacted in responses (shown as `"***REDACTED***"`)
- **Partial updates**: Use `PATCH` to update only specific settings without affecting others
- **Type safety**: Ensure values match the expected type (boolean, number, string, etc.)
- **Validation**: Invalid values may be rejected or cause unexpected behavior
- **Persistence**: Settings are persisted and survive server restarts

### Getting Current Values

To see the current value of any setting:

```bash
# Get all settings
curl "http://localhost:3000/api/v1/agent/state" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.autoCondenseContext'

# Get specific setting groups
curl "http://localhost:3000/api/v1/agent/settings/auto-approval" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl "http://localhost:3000/api/v1/agent/settings/terminal" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl "http://localhost:3000/api/v1/agent/settings/browser" \
  -H "Authorization: Bearer YOUR_TOKEN"
```


---

## 🧠 Memory Bank API Guide

The Memory Bank is Hoodycode's persistent knowledge storage system that allows the AI to remember patterns, solutions, and preferences across all tasks.

### What is the Memory Bank?

The Memory Bank stores knowledge as **markdown/text files** in `.hoodycode/rules/` directories:
- **Global rules**: `~/.hoodycode/rules/` (apply to all projects)
- **Local rules**: `<workspace>/.hoodycode/rules/` (project-specific)
- **Categories**: Subdirectories like `memory-bank/`, `patterns/`, etc.

All enabled memory entries are **automatically loaded** into every task's system prompt, providing persistent context.

### Quick Start

**1. Create a memory entry:**
```bash
curl -X POST "http://localhost:3000/api/v1/agent/memory-bank" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "api-patterns.md",
    "content": "# API Patterns\n\n## REST Conventions\n- Use plural nouns for resources\n- Version in URL path\n- Return JSON with consistent structure",
    "scope": "local",
    "category": "memory-bank",
    "tags": ["api", "rest", "conventions"]
  }'
```

**2. List all memories:**
```bash
curl "http://localhost:3000/api/v1/agent/memory-bank?scope=all" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Search memories:**
```bash
curl -X POST "http://localhost:3000/api/v1/agent/memory-bank/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "api patterns", "scope": "local"}'
```

**4. Get statistics:**
```bash
curl "http://localhost:3000/api/v1/agent/memory-bank/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### API Endpoints

#### List Memory Entries
```http
GET /api/v1/agent/memory-bank?scope={scope}&enabled={true|false}&category={category}
```

**Query Parameters:**
- `scope` (optional): `global`, `local`, or `all` (default: `all`)
- `enabled` (optional): Filter by enabled status
- `category` (optional): Filter by category

**Response:**
```json
{
  "entries": [
    {
      "id": "mem_abc123",
      "path": "memory-bank/api-patterns.md",
      "title": "API Patterns",
      "content": "# API Patterns\n\n...",
      "scope": "local",
      "category": "memory-bank",
      "enabled": true,
      "createdAt": "2025-10-16T06:00:00.000Z",
      "updatedAt": "2025-10-16T06:00:00.000Z",
      "size": 1024,
      "tags": ["api", "rest"]
    }
  ],
  "count": 1,
  "scope": "all"
}
```

#### Get Memory Entry
```http
GET /api/v1/agent/memory-bank/{id}
```

**Path Parameter:**
- `id`: Memory ID (e.g., `mem_abc123`) or path (e.g., `memory-bank%2Fapi-patterns.md`)

**Note**: Paths with slashes must be URL-encoded (`/` → `%2F`)

#### Create Memory Entry
```http
POST /api/v1/agent/memory-bank
```

**Request Body:**
```json
{
  "filename": "api-patterns.md",
  "content": "# API Patterns\n\nYour markdown content here",
  "scope": "local",
  "category": "memory-bank",
  "tags": ["api", "patterns"],
  "metadata": {
    "source": "manual",
    "taskId": "task-123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Memory entry 'api-patterns.md' created successfully",
  "entry": { ... }
}
```

#### Update Memory Entry
```http
PATCH /api/v1/agent/memory-bank/{id}
```

**Request Body (all fields optional):**
```json
{
  "content": "# Updated Content\n\nNew information here",
  "enabled": false,
  "tags": ["updated", "api"],
  "category": "patterns"
}
```

#### Delete Memory Entry
```http
DELETE /api/v1/agent/memory-bank/{id}
```

**Response**: `204 No Content`

#### Toggle Memory Entry
```http
POST /api/v1/agent/memory-bank/{id}/toggle
```

**Response:**
```json
{
  "success": true,
  "message": "Memory entry 'api-patterns.md' disabled",
  "enabled": false
}
```

#### Search Memory Entries
```http
POST /api/v1/agent/memory-bank/search
```

**Request Body:**
```json
{
  "query": "error handling",
  "scope": "all"
}
```

**Response:**
```json
{
  "results": [
    {
      "entry": { ... },
      "score": 0.85,
      "matches": [
        "Title: Error Handling Patterns",
        "Content match found"
      ]
    }
  ],
  "count": 1,
  "query": "error handling"
}
```

#### Get Statistics
```http
GET /api/v1/agent/memory-bank/stats
```

**Response:**
```json
{
  "total": 15,
  "enabled": 12,
  "disabled": 3,
  "global": 5,
  "local": 10,
  "totalSize": 45678,
  "categories": {
    "memory-bank": 8,
    "patterns": 4,
    "workflows": 3
  }
}
```

### Use Cases

**1. Project Onboarding**
```bash
# Create comprehensive project rules
curl -X POST "$API/memory-bank" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filename": "project-conventions.md",
    "content": "# Project Conventions\n\n## Code Style\n- TypeScript strict mode\n- ESLint + Prettier\n\n## Git Workflow\n- Feature branches from develop\n- PR requires 2 approvals",
    "scope": "local"
  }'
```

**2. Bug Fix Patterns**
```bash
# Document common bug solutions
curl -X POST "$API/memory-bank" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filename": "common-fixes.md",
    "content": "# Common Fixes\n\n## CORS Errors\nSolution: Add CORS middleware...",
    "scope": "local",
    "category": "memory-bank"
  }'
```

**3. API Design Patterns**
```bash
# Store API conventions
curl -X POST "$API/memory-bank" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filename": "api-conventions.md",
    "content": "# API Conventions\n\n## Endpoints\n- RESTful: /api/v1/{resource}\n- Versioning in URL",
    "scope": "local",
    "category": "patterns"
  }'
```

### Best Practices

1. **Organize with categories**: Use subdirectories (`memory-bank/`, `patterns/`, etc.)
2. **Use descriptive filenames**: `error-handling-patterns.md` not `errors.md`
3. **Include examples**: Add code examples in memory entries
4. **Tag appropriately**: Use tags for cross-referencing
5. **Keep updated**: Update memories as patterns evolve
6. **Search before creating**: Avoid duplicates by searching first

### Integration with Slash Commands

The Memory Bank API works alongside existing slash commands:
- `/newrule` - AI analyzes conversation → creates comprehensive rule
- `/remember [text]` - AI uses your text → creates focused memory
- `/mb [text]` - Short alias for `/remember`

**API vs Commands:**
- **API**: Programmatic access, automation, external tools
- **Commands**: Interactive use, AI-assisted creation

### JavaScript SDK Example

```javascript
class MemoryBankClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
  }

  async create(filename, content, options = {}) {
    const response = await fetch(`${this.baseUrl}/memory-bank`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename,
        content,
        scope: options.scope || 'local',
        category: options.category,
        tags: options.tags,
        metadata: options.metadata
      })
    })
    return response.json()
  }

  async list(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.baseUrl}/memory-bank?${params}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    return response.json()
  }

  async search(query, scope = 'all') {
    const response = await fetch(`${this.baseUrl}/memory-bank/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, scope })
    })
    return response.json()
  }

  async stats() {
    const response = await fetch(`${this.baseUrl}/memory-bank/stats`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    return response.json()
  }

  async update(id, updates) {
    const response = await fetch(`${this.baseUrl}/memory-bank/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    return response.json()
  }

  async delete(id) {
    await fetch(`${this.baseUrl}/memory-bank/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
  }

  async toggle(id) {
    const response = await fetch(`${this.baseUrl}/memory-bank/${encodeURIComponent(id)}/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    return response.json()
  }
}

// Usage
const memoryBank = new MemoryBankClient('http://localhost:3000/api/v1/agent', 'YOUR_TOKEN')

// Create memory
await memoryBank.create('coding-standards.md', '# Coding Standards\n\n...', {
  category: 'memory-bank',
  tags: ['standards', 'code-quality']
})

// Search
const results = await memoryBank.search('error handling')
console.log(`Found ${results.count} memories`)

// Get stats
const stats = await memoryBank.stats()
console.log(`Total memories: ${stats.total}`)
```

### Path Encoding

When using paths as IDs, remember to URL-encode them:

```javascript
// ❌ Wrong
const id = 'memory-bank/api-patterns.md'
fetch(`/api/v1/agent/memory-bank/${id}`)  // 404 error!

// ✅ Correct
const id = encodeURIComponent('memory-bank/api-patterns.md')
fetch(`/api/v1/agent/memory-bank/${id}`)  // Works!
// URL: /api/v1/agent/memory-bank/memory-bank%2Fapi-patterns.md
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid filename, missing required fields |
| 404 | Not Found | Memory entry doesn't exist |
| 409 | Conflict | Memory entry already exists (on create) |
| 500 | Internal Server Error | Server error (check logs) |

**Example Error:**
```json
{
  "error": "Not Found",
  "message": "Memory entry 'nonexistent.md' not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

### Advanced: AI Suggestions (Future Feature)

The `/suggest` endpoint will analyze task history to recommend memory creation:

```bash
curl -X POST "http://localhost:3000/api/v1/agent/memory-bank/suggest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskId": "current-task-id"}'
```

**Expected Response (when implemented):**
```json
{
  "suggestions": [
    {
      "type": "repetition",
      "title": "API Error Handling Pattern",
      "reason": "You've asked about error handling 3 times",
      "proposedContent": "# API Error Handling\n\n...",
      "confidence": 0.85
    }
  ],
  "count": 1
}
```

For complete AI suggestions design, see [`docs/MEMORY_BANK_AI_SUGGESTIONS.md`](docs/MEMORY_BANK_AI_SUGGESTIONS.md).

---

---

## 📋 TODO Management API Guide

The TODO API provides complete CRUD operations for managing task TODO lists, enabling step-by-step task tracking and progress monitoring.

### What are TODOs?

TODOs are checklist items that help organize complex tasks:
- **Pending** `[ ]` - Not started
- **In Progress** `[-]` - Currently working on
- **Completed** `[x]` - Finished

### Quick Start

**1. Get TODO list for a task:**
```bash
curl "http://localhost:3000/api/v1/agent/todos/task-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "taskId": "task-123",
  "todos": [
    {"id": "abc", "content": "Design architecture", "status": "completed"},
    {"id": "def", "content": "Implement core logic", "status": "in_progress"},
    {"id": "ghi", "content": "Write tests", "status": "pending"}
  ],
  "count": 3,
  "stats": {
    "total": 3,
    "completed": 1,
    "inProgress": 1,
    "pending": 1
  }
}
```

**2. Create TODO (with position support):**
```bash
# Add at end (default)
curl -X POST "http://localhost:3000/api/v1/agent/todos/task-123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Update documentation", "status": "pending"}'

# Add at beginning (position 0)
curl -X POST "http://localhost:3000/api/v1/agent/todos/task-123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "High priority task", "position": 0}'

# Add at specific position
curl -X POST "http://localhost:3000/api/v1/agent/todos/task-123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "Insert here", "position": 2}'
```

**3. Update TODO status:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/agent/todos/task-123/abc" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "completed"}'
```

**4. Delete TODO:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/agent/todos/task-123/abc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### API Endpoints

#### Get TODO List
```http
GET /api/v1/agent/todos/{taskId}
```

Returns all TODOs with statistics.

#### Create TODO
```http
POST /api/v1/agent/todos/{taskId}
```

**Request Body:**
```json
{
  "content": "Task description",
  "status": "pending",
  "position": 0
}
```

**Parameters:**
- `content` (required) - TODO description
- `status` (optional) - Initial status (default: "pending")
- `position` (optional) - Insert position (0-based index, default: append to end)

**Position Examples:**
- `position: 0` - Insert at beginning
- `position: 2` - Insert at index 2 (3rd position)
- No position - Append to end

#### Update TODO
```http
PATCH /api/v1/agent/todos/{taskId}/{todoId}
```

**Request Body:**
```json
{
  "content": "Updated description",
  "status": "in_progress"
}
```

Both fields are optional - update only what you need.

#### Delete TODO
```http
DELETE /api/v1/agent/todos/{taskId}/{todoId}
```

Returns `204 No Content` on success.

#### Bulk Update
```http
POST /api/v1/agent/todos/{taskId}/bulk
```

Replace entire TODO list at once:

```json
{
  "todos": [
    {"id": "abc", "content": "Task 1", "status": "completed"},
    {"id": "def", "content": "Task 2", "status": "pending"}
  ]
}
```

**Use cases:**
- Reordering TODOs (drag & drop)
- Bulk status updates
- Importing from external source

#### Import from Markdown
```http
POST /api/v1/agent/todos/{taskId}/import
```

**Request Body:**
```json
{
  "markdown": "[ ] Design architecture\n[x] Implement core\n[-] Write tests"
}
```

**Supported formats:**
- `[ ]` - Pending
- `[x]` or `[X]` - Completed
- `[-]` or `[~]` - In progress
- `- [ ]` - With bullet point

#### Export to Markdown
```http
GET /api/v1/agent/todos/{taskId}/export
```

**Response:**
```json
{
  "markdown": "[ ] Design architecture\n[x] Implement core\n[-] Write tests",
  "count": 3
}
```

### Use Cases

**1. Progress Tracking**
```typescript
async function showTaskProgress(taskId) {
  const todos = await fetch(`/api/v1/agent/todos/${taskId}`)
    .then(r => r.json())
  
  const progress = (todos.stats.completed / todos.stats.total) * 100
  console.log(`Progress: ${progress.toFixed(0)}%`)
  console.log(`Completed: ${todos.stats.completed}/${todos.stats.total}`)
}
```

**2. Drag & Drop Reordering**
```typescript
async function reorderTodo(taskId, todoId, newPosition) {
  // Get current list
  const { todos } = await fetch(`/api/v1/agent/todos/${taskId}`)
    .then(r => r.json())
  
  // Find and remove todo
  const todo = todos.find(t => t.id === todoId)
  const newTodos = todos.filter(t => t.id !== todoId)
  
  // Insert at new position
  newTodos.splice(newPosition, 0, todo)
  
  // Update via bulk API
  await fetch(`/api/v1/agent/todos/${taskId}/bulk`, {
    method: 'POST',
    body: JSON.stringify({ todos: newTodos })
  })
}
```

**3. Import from External Tool**
```typescript
async function importFromJira(taskId, jiraIssues) {
  const markdown = jiraIssues
    .map(issue => `[ ] ${issue.summary}`)
    .join('\n')
  
  await fetch(`/api/v1/agent/todos/${taskId}/import`, {
    method: 'POST',
    body: JSON.stringify({ markdown })
  })
}
```

**4. Export for Documentation**
```typescript
async function exportToReadme(taskId) {
  const { markdown } = await fetch(`/api/v1/agent/todos/${taskId}/export`)
    .then(r => r.json())
  
  // Add to README.md
  const readme = `# Project Tasks\n\n${markdown}\n`
  await fs.writeFile('README.md', readme)
}
```

### JavaScript SDK Example

```javascript
class TodoAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
  }

  async list(taskId) {
    const response = await fetch(`${this.baseUrl}/todos/${taskId}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    return response.json()
  }

  async create(taskId, content, options = {}) {
    const response = await fetch(`${this.baseUrl}/todos/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        status: options.status || 'pending',
        position: options.position  // Optional: insert at specific position
      })
    })
    return response.json()
  }

  async update(taskId, todoId, updates) {
    const response = await fetch(`${this.baseUrl}/todos/${taskId}/${todoId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    return response.json()
  }

  async delete(taskId, todoId) {
    await fetch(`${this.baseUrl}/todos/${taskId}/${todoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
  }

  async import(taskId, markdown) {
    const response = await fetch(`${this.baseUrl}/todos/${taskId}/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ markdown })
    })
    return response.json()
  }

  async export(taskId) {
    const response = await fetch(`${this.baseUrl}/todos/${taskId}/export`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    return response.json()
  }
}

// Usage
const todoAPI = new TodoAPI('http://localhost:3000/api/v1/agent', 'YOUR_TOKEN')

// Create TODO at beginning
await todoAPI.create('task-123', 'High priority task', { position: 0 })

// Create TODO at end
await todoAPI.create('task-123', 'Low priority task')

// Update status
await todoAPI.update('task-123', 'todo-id', { status: 'completed' })

// Get progress
const { stats } = await todoAPI.list('task-123')
console.log(`Progress: ${stats.completed}/${stats.total}`)
```

### Position Parameter Details

The `position` parameter in `POST /api/v1/agent/todos/{taskId}` allows precise control over TODO ordering:

**How it works:**
- `position: 0` - Insert at the very beginning (becomes first item)
- `position: 1` - Insert at index 1 (becomes second item)
- `position: n` - Insert at index n
- No position - Append to the end (default behavior)
- Position is clamped to valid range (0 to current list length)

**Examples:**

```bash
# Current list: [A, B, C]

# Add at beginning (position 0)
curl -X POST "/api/v1/agent/todos/task-123" \
  -d '{"content": "X", "position": 0}'
# Result: [X, A, B, C]

# Add at position 2
curl -X POST "/api/v1/agent/todos/task-123" \
  -d '{"content": "Y", "position": 2}'
# Result: [X, A, Y, B, C]

# Add at end (no position)
curl -X POST "/api/v1/agent/todos/task-123" \
  -d '{"content": "Z"}'
# Result: [X, A, Y, B, C, Z]
```

**UI Use Cases:**
- **Drag & Drop**: User drags TODO to new position → call API with new position
- **Insert Above/Below**: Context menu "Insert above" → use current index as position
- **Priority Sorting**: "Move to top" → position: 0, "Move to bottom" → no position

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid content, status, or position |
| 404 | Not Found | Task or TODO not found |
| 500 | Internal Server Error | Server error (check logs) |


---

## 🔬 Agent Digest Guide

The Agent Digest feature provides LLM-powered ultra-compact message summaries (50-200 characters) for tiny UI contexts like notifications, mobile views, and status bars.

### What is Agent Digest?

Agent Digest generates short, human-readable summaries of agent messages while maintaining full context for the AI:

- **For UI**: Compact digests suitable for notifications and small screens
- **For AI**: Full message context preserved (no information loss)
- **Configurable**: Use cheap/fast LLM models for digest generation
- **Flexible**: Global settings with per-task overrides

### Quick Start

**1. Enable Agent Digest:**
```bash
curl -X PUT "http://localhost:3000/api/v1/agent/settings/digest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "digestEnabled": true,
    "digestProfileId": "gemini-flash-profile",
    "autoDigestEnabled": true,
    "digestMaxLength": 150
  }'
```

**2. View messages with digests:**
```bash
curl "http://localhost:3000/api/v1/agent/tasks/task-123?includeParsed=true" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.uiMessages[].digest'
```

**Example output:**
```json
{
  "ts": 1700000000000,
  "type": "say",
  "say": "text",
  "text": "I've created a new React application with TypeScript, set up routing with React Router, configured Redux for state management, and added a basic authentication system with JWT tokens...",
  "digest": "Created React app with TypeScript, routing, Redux, and JWT auth",
  "digestMetadata": {
    "generatedAt": 1700000001000,
    "profileId": "gemini-flash",
    "tokensUsed": 42,
    "maxLength": 150
  }
}
```

### API Endpoints

#### Get Digest Settings

```http
GET /api/v1/agent/settings/digest
```

**Response:**
```json
{
  "digestEnabled": true,
  "digestProfileId": "gemini-flash-profile",
  "autoDigestEnabled": true,
  "digestMaxLength": 200,
  "customDigestPrompt": "Condense to {maxLength} chars...",
  "digestTaskOverrides": {
    "task-123": {
      "enabled": false
    },
    "task-456": {
      "enabled": true,
      "maxLength": 50
    }
  }
}
```

#### Update Digest Settings

```http
PUT /api/v1/agent/settings/digest
```

**Request Body:**
```json
{
  "digestEnabled": true,
  "digestProfileId": "fast-model-id",
  "autoDigestEnabled": true,
  "digestMaxLength": 150,
  "customDigestPrompt": "Custom prompt template",
  "digestTaskOverrides": {
    "task-id": {
      "enabled": true,
      "maxLength": 100,
      "profileId": "profile-override"
    }
  }
}
```

**Validation Rules:**
- `digestMaxLength`: Must be 20-500 characters
- `digestTaskOverrides.*.maxLength`: Must be 20-500 characters

#### Toggle Task Digest

```http
POST /api/v1/agent/tasks/{taskId}/digest/toggle
```

**Request Body:**
```json
{
  "enabled": true,
  "maxLength": 100,
  "profileId": "custom-profile"
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task-123",
  "settings": {
    "enabled": true,
    "maxLength": 100,
    "profileId": "custom-profile"
  }
}
```

#### Generate Message Digest On-Demand

```http
POST /api/v1/agent/tasks/{taskId}/messages/{timestamp}/digest
```

**Request Body:**
```json
{
  "maxLength": 150,
  "profileId": "gemini-flash",
  "force": true
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "task-123",
  "messageTimestamp": 1700000000000,
  "digest": "Created app.ts with routing and state management",
  "metadata": {
    "generatedAt": 1700000001000,
    "profileId": "gemini-flash",
    "tokensUsed": 42,
    "maxLength": 150
  }
}
```

**Parameters:**
- `maxLength` (optional): Override default max length
- `profileId` (optional): Override default profile
- `force` (optional): Regenerate even if digest exists

### Use Cases

#### 1. Desktop Notifications

```javascript
// Show compact digest in notifications
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.type === 'messageUpdated' && msg.clineMessage?.digest) {
    new Notification("Hoody Agent Update", {
      body: msg.clineMessage.digest,
      icon: "agent-icon.png"
    })
  }
}
```

#### 2. Mobile Compact View

```typescript
// React Native component
function MessageList({ taskId }: { taskId: string }) {
  const [messages, setMessages] = useState<ClineMessage[]>([])
  
  useEffect(() => {
    fetch(`/api/v1/agent/tasks/${taskId}?includeParsed=true`)
      .then(r => r.json())
      .then(data => setMessages(data.uiMessages))
  }, [taskId])
  
  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => (
        <View style={styles.messageCard}>
          <Text style={styles.compact}>
            {item.digest || item.text?.substring(0, 100)}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.ts).toLocaleTimeString()}
          </Text>
        </View>
      )}
    />
  )
}
```

#### 3. Status Bar Updates

```javascript
// IDE status bar showing current agent action
const statusBar = vscode.window.createStatusBarItem()

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.type === 'messageUpdated' && msg.clineMessage) {
    statusBar.text = msg.clineMessage.digest || "AI Working..."
    statusBar.show()
  }
}
```

#### 4. Task List Preview

```typescript
// Show task preview with last message digest
async function getTaskList() {
  const response = await fetch(
    '/api/v1/agent/tasks?includeLastMessage=true&limit=10'
  )
  const data = await response.json()
  
  return data.data.map(task => ({
    id: task.id,
    title: task.task,
    preview: task.lastMessage?.parsed?.digest || 
             task.lastMessage?.parsed?.text?.substring(0, 100)
  }))
}
```

### Configuration Examples

#### Minimal Setup

```json
{
  "digestEnabled": true,
  "digestProfileId": "gemini-flash-profile"
}
```

#### Production Setup

```json
{
  "digestEnabled": true,
  "digestProfileId": "fast-cheap-model",
  "autoDigestEnabled": true,
  "digestMaxLength": 150,
  "customDigestPrompt": "Condense to max {maxLength} chars. Focus on: actions, files, results. Remove: explanations, tool names.",
  "digestTaskOverrides": {
    "important-task": {
      "enabled": false
    },
    "mobile-task": {
      "enabled": true,
      "maxLength": 50
    }
  }
}
```

### Custom Digest Prompts

You can customize how digests are generated:

```json
{
  "customDigestPrompt": "Create an ultra-short summary (max {maxLength} chars) of this message. Focus on concrete actions and results. Be direct and informative.\n\nMessage: {content}\n\nSummary:"
}
```

**Placeholders:**
- `{maxLength}` - Replaced with digestMaxLength value
- `{content}` - Replaced with message content

### Best Practices

1. **Use Fast/Cheap Models**
   ```json
   {
     "digestProfileId": "gemini-flash-profile"
   }
   ```
   Recommended models: GPT-3.5 Turbo, Gemini Flash, Claude Haiku

2. **Set Appropriate Max Length**
   - Notifications: 100-150 chars
   - Mobile: 50-100 chars
   - Status bars: 50-80 chars
   - Task previews: 150-200 chars

3. **Per-Task Overrides**
   ```javascript
   // Disable for critical tasks
   await fetch('/api/v1/agent/tasks/critical-123/digest/toggle', {
     method: 'POST',
     body: JSON.stringify({ enabled: false })
   })
   
   // Extra short for mobile
   await fetch('/api/v1/agent/tasks/mobile-456/digest/toggle', {
     method: 'POST',
     body: JSON.stringify({ enabled: true, maxLength: 50 })
   })
   ```

4. **On-Demand Generation**
   ```javascript
   // Generate digest for specific message
   async function getCompactMessage(taskId, messageTs) {
     const response = await fetch(
       `/api/v1/agent/tasks/${taskId}/messages/${messageTs}/digest`,
       {
         method: 'POST',
         body: JSON.stringify({ maxLength: 100, force: true })
       }
     )
     return response.json()
   }
   ```

### JavaScript SDK Example

```javascript
class AgentDigestClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl
    this.token = token
  }

  async getSettings() {
    const response = await fetch(`${this.baseUrl}/settings/digest`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
    return response.json()
  }

  async enable(profileId, options = {}) {
    const response = await fetch(`${this.baseUrl}/settings/digest`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        digestEnabled: true,
        digestProfileId: profileId,
        autoDigestEnabled: true,
        digestMaxLength: options.maxLength || 200,
        customDigestPrompt: options.customPrompt
      })
    })
    return response.json()
  }

  async toggleForTask(taskId, enabled, options = {}) {
    const response = await fetch(
      `${this.baseUrl}/tasks/${taskId}/digest/toggle`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled,
          maxLength: options.maxLength,
          profileId: options.profileId
        })
      }
    )
    return response.json()
  }

  async digestMessage(taskId, messageTs, options = {}) {
    const response = await fetch(
      `${this.baseUrl}/tasks/${taskId}/messages/${messageTs}/digest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxLength: options.maxLength,
          profileId: options.profileId,
          force: options.force
        })
      }
    )
    return response.json()
  }
}

// Usage
const digest = new AgentDigestClient('http://localhost:3000/api/v1/agent', 'TOKEN')

// Enable globally
await digest.enable('gemini-flash-profile', { maxLength: 150 })

// Disable for specific task
await digest.toggleForTask('task-123', false)

// Generate digest for message
const result = await digest.digestMessage('task-123', 1700000000000, {
  maxLength: 100,
  force: true
})
console.log('Digest:', result.digest)
```

### React Component Example

```typescript
function MessageWithDigest({ message }: { message: ClineMessage }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className="message">
      <div className="message-content">
        {expanded || !message.digest ? (
          <p>{message.text}</p>
        ) : (
          <p className="digest">{message.digest}</p>
        )}
      </div>
      
      {message.digest && (
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show Digest' : 'Show Full'}
        </button>
      )}
      
      {message.digestMetadata && (
        <small className="metadata">
          Digest by {message.digestMetadata.profileId}
        </small>
      )}
    </div>
  )
}
```

### Performance Considerations

**Caching:**
- Digests are cached in memory (LRU, 1000 entries)
- Cache key: messageTimestamp + maxLength + profileId
- Cache never invalidates (digests don't change)

**Async Generation:**
- Auto-digest runs asynchronously (doesn't block agent)
- Failures are logged but don't stop task execution
- Generated digests are broadcast via WebSocket

**Token Usage:**
- Each digest costs ~20-50 input tokens
- ~10-30 output tokens per digest
- Use cheap models (GPT-3.5, Gemini Flash) to minimize cost

### Error Handling

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid maxLength (must be 20-500) |
| 404 | Not Found | Task or message not found |
| 404 | Not Found | Digest profile not configured |

**Example Errors:**

```json
{
  "error": "Bad Request",
  "message": "digestMaxLength must be between 20 and 500",
  "code": "BAD_REQUEST",
  "statusCode": 400
}

{
  "error": "Not Found",
  "message": "Digest profile \"nonexistent\" not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

### Comparison: Digest vs Condense

| Feature | Agent Digest | Context Condense |
|---------|-------------|------------------|
| **Purpose** | UI display | AI context management |
| **Target** | Individual messages | Entire conversation |
| **Length** | 50-200 chars | Variable (removes ~25-50% context) |
| **When** | Per message | When context window fills |
| **Visibility** | UI only (`message.digest`) | Both AI and UI |
| **Cost** | ~$0.0001 per digest | ~$0.01-0.05 per condense |

**When to use Digest:**
- ✅ Notifications
- ✅ Mobile compact views
- ✅ Status bars
- ✅ Task previews

**When to use Condense:**
- ✅ Long conversations approaching token limits
- ✅ Reducing API costs
- ✅ Maintaining conversation continuity

### Advanced: Bulk Digest Generation

Generate digests for multiple messages at once:

```javascript
async function bulkDigestMessages(taskId, messageTimestamps) {
  const results = await Promise.all(
    messageTimestamps.map(ts =>
      fetch(`/api/v1/agent/tasks/${taskId}/messages/${ts}/digest`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify({ maxLength: 100 })
      }).then(r => r.json())
    )
  )
  
  return results.map(r => ({
    timestamp: r.messageTimestamp,
    digest: r.digest
  }))
}

// Usage: Generate digests for last 10 messages
const task = await fetch(`/api/v1/agent/tasks/task-123?includeParsed=true`)
  .then(r => r.json())

const lastTen = task.uiMessages.slice(-10).map(m => m.ts)
const digests = await bulkDigestMessages('task-123', lastTen)

console.log('Generated', digests.length, 'digests')
```

### WebSocket Integration

Digests are automatically included in WebSocket broadcasts:

```javascript
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  
  if (msg.type === 'messageUpdated' && msg.clineMessage) {
    const { digest, digestMetadata } = msg.clineMessage
    
    if (digest) {
      console.log('Digest:', digest)
      console.log('Generated by:', digestMetadata?.profileId)
      
      // Update UI with digest
      updateStatusBar(digest)
      showNotification(digest)
    }
  }
}
```

### Migration Guide

**Step 1: Configure Profile**
```bash
# Create a fast/cheap profile for digest generation
curl -X POST "/api/v1/agent/profiles" \
  -d '{
    "name": "Digest Profile",
    "apiProvider": "openrouter",
    "openRouterModelId": "google/gemini-2.5-flash-lite"
  }'
```

**Step 2: Enable Digest**
```bash
curl -X PUT "/api/v1/agent/settings/digest" \
  -d '{
    "digestEnabled": true,
    "digestProfileId": "profile-id-from-step-1",
    "autoDigestEnabled": true
  }'
```

**Step 3: Update UI**
```typescript
// Display digest instead of full text in compact views
{messages.map(msg => (
  <div className="message-compact">
    {msg.digest || msg.text?.substring(0, 100)}
  </div>
))}
```

### Troubleshooting

**Digests not generating?**
1. Check `digestEnabled` is `true`
2. Verify `digestProfileId` is configured and valid
3. Check task overrides haven't disabled it
4. Look for errors in server logs

**Digests too long/short?**
- Adjust `digestMaxLength` setting
- Use custom digest prompt for better results
- Try different LLM models (some are more concise)

**Performance issues?**
- Disable `autoDigestEnabled` and use on-demand only
- Use faster model for digest generation
- Increase cache size if needed

---

**Example Error:**
```json
{
  "error": "Not Found",
  "message": "TODO 'abc123' not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

---