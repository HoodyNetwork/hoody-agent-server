# Hoody Agent Server - CLI

> Fast, asynchronous AI coding agent server with REST API and WebSocket support

This is the CLI/server component of Hoody Agent Server. It provides a standalone server that exposes AI coding capabilities through HTTP and WebSocket APIs.

## Quick Start

### Installation

```bash
# Clone and build
git clone https://github.com/HoodyNetwork/hoody-agent-server.git
cd hoody-agent-server
pnpm install

# Build everything (extension + CLI server)
pnpm build:server

# Start server
npm run start
```

### Basic Usage

```bash
# Start with default settings (port 3000)
npm run start

# Start with custom port
npm run start -- --port 8080

# Start with AI provider configured
npm run start -- --provider anthropic --model claude-sonnet-4-20250514 --api-key sk-ant-...

# Production with SSL
npm run start -- \
  --port 443 \
  --ssl-cert /path/to/cert.pem \
  --ssl-key /path/to/key.pem \
  --token $(openssl rand -hex 32)
```

## CLI Options

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --port <port>` | Server port | `3000` |
| `-H, --host <host>` | Host address | `0.0.0.0` |
| `-w, --workspace <path>` | Workspace directory | Current directory |
| `-t, --token <token>` | Auth token | Auto-generated |
| `-s, --storage-dir <path>` | Storage directory | OS-specific |
| `--provider <name>` | AI provider (anthropic, openrouter, etc.) | - |
| `--model <id>` | Model ID | - |
| `--api-key <key>` | API key for provider | - |
| `--provider-base-url <url>` | Custom base URL | - |
| `--ssl-cert <path>` | SSL certificate (PEM) | None (HTTP) |
| `--ssl-key <path>` | SSL private key (PEM) | None (HTTP) |
| `--ssl-ca <path>` | SSL CA certificate | None |
| `--ssl-domain <domain>` | Domain name for SSL | None |
| `--process-title <title>` | Process title | `hoody-ai` |
| `-d, --debug` | Enable debug logging | `false` |

## AI Provider Configuration

Configure AI providers directly via CLI parameters or through the REST API.

### Via CLI (updates default profile):

```bash
# Anthropic
npm run start -- --provider anthropic --model claude-sonnet-4-20250514 --api-key sk-ant-...

# OpenRouter
npm run start -- --provider openrouter --model anthropic/claude-sonnet-4 --api-key sk-or-v1-...

# OpenAI
npm run start -- --provider openai --model gpt-4-turbo --api-key sk-...

# Ollama (local)
npm run start -- --provider ollama --model llama3.2 --provider-base-url http://localhost:11434
```

### Via REST API:

```bash
curl -X POST http://localhost:3000/api/v1/agent/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "default",
    "apiProvider": "anthropic",
    "apiKey": "sk-ant-...",
    "apiModelId": "claude-sonnet-4-20250514"
  }'
```

## API Documentation

- **REST API**: See [README_API.md](../README_API.md) or [docs/api-reference.html](../docs/api-reference.html)
- **OpenAPI Spec**: [OPENAPI.yaml](../OPENAPI.yaml)
- **WebSocket**: See [docs/WEBSOCKET_MESSAGES.md](../docs/WEBSOCKET_MESSAGES.md)

## Architecture

The server runs a headless VS Code extension environment in Node.js, providing:

- ⚡ **Async task execution** - Unlimited concurrent tasks per instance
- 🔒 **Safe file operations** - Automatic locking prevents conflicts
- 💾 **Persistent storage** - Task history, memory bank, profiles
- 🌐 **CORS-enabled** - Works with web, mobile, desktop clients
- 🔐 **Secure** - Token auth, SSL/TLS, secret redaction

**Memory Usage**: ~250MB per instance  
**Scalability**: Horizontal scaling with multiple instances

## Development

```bash
# Watch mode
pnpm dev

# Build
pnpm build

# Type checking
pnpm check-types

# Lint
pnpm lint
```

## Storage Locations

- **Windows**: `%LOCALAPPDATA%\hoodycode`
- **macOS**: `~/Library/Application Support/hoodycode`
- **Linux**: `~/.local/share/hoodycode`

Use `--storage-dir` to customize.

## License

Apache License 2.0 - See [../LICENSE](../LICENSE)

## More Information

- **Main Documentation**: [../README.md](../README.md)
- **Website**: https://hoody.com
- **Discord**: https://discord.social.hoody.com
- **Issues**: https://github.com/HoodyNetwork/hoody-agent-server/issues