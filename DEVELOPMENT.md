<!--
  Developer Guide for Hoody Agent Server
  Setup instructions, development workflow, and contribution guidelines
  Focus: CLI server development, REST API, and custom UI integration
-->

# Hoody Agent Server Development Guide

Welcome to the Hoody Agent Server development guide! This document will help you set up your development environment and understand how to work with the codebase. **The primary focus is now the CLI server** that exposes AI coding agents via REST API and WebSocket. Whether you're fixing bugs, adding features, or just exploring the code, this guide will get you started.

> **Note on webview-ui**: The `webview-ui/` directory is **deprecated** and should not be used for new development. It's preserved only for type definitions and VS Code extension compatibility. The webview lacks many modern features and likely contains undefined behavior. For production use, build custom UIs using the HTTP/WebSocket APIs (see [docs/api-reference.html](docs/api-reference.html)).

## Prerequisites

Before you begin, choose one of the following development environment options:

### Option 1: Native Development (Recommended for MacOS/Linux/Windows Subsystem for Linux)

1. **Git** - For version control
2. **Node.js** (version [v20.19.2](https://github.com/HoodyNetwork/hoody-agent-server/blob/main/.nvmrc) recommended)
3. **pnpm** - Package manager (https://pnpm.io/)
4. **Visual Studio Code** - Our recommended IDE for development

### Option 2: Devcontainer (Recommended for Windows)

1. **Git** - For version control
2. **Docker Desktop** - For running the development container
3. **Visual Studio Code** - Our recommended IDE for development
4. **Dev Containers extension** - VSCode extension for container development

> **Note for Windows Contributors**: If you're having issues with WSL or want a standardized development environment, we recommend using the devcontainer option. It provides the exact same environment as our Nix flake configuration but works seamlessly on Windows without WSL.

### Option 3: Nix Flake (Recommended for NixOS/Nix users)

1. **Git** - For version control
2. **Nix** - The Nix package manager with flakes enabled
3. **direnv** - For automatic environment loading
4. **Visual Studio Code** - Our recommended IDE for development

## Getting Started

### Installation

#### Native Development Setup

1. **Fork and Clone the Repository**:

    - **Fork the Repository**:
        - Visit the [Hoody Agent Server GitHub repository](https://github.com/HoodyNetwork/hoody-agent-server)
        - Click the "Fork" button in the top-right corner to create your own copy.
    - **Clone Your Fork**:
        ```bash
        git clone https://github.com/[YOUR-USERNAME]/hoodycode.git
        cd hoodycode
        ```
        Replace `[YOUR-USERNAME]` with your actual GitHub username.

2. **Install dependencies**:

    ```bash
    pnpm install
    ```

    This command will install dependencies for the CLI server and all packages.

3. **Install VSCode Extensions** (recommended for development):
    - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Integrates ESLint into VS Code
    - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Integrates Prettier into VS Code
    - [ESBuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers) - Helps display build errors correctly

The full list of recommended extensions is [here](https://github.com/HoodyNetwork/hoody-agent-server/blob/main/.vscode/extensions.json)

#### Devcontainer Setup (Recommended for Windows)

1. **Prerequisites**:

    - Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
    - Install [Visual Studio Code](https://code.visualstudio.com/)
    - Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Fork and Clone the Repository** (same as above)

3. **Open in Devcontainer**:

    - Open the project in VSCode
    - When prompted, click "Reopen in Container" or use Command Palette: `Dev Containers: Reopen in Container`
    - Wait for the container to build and setup to complete (this may take a few minutes on first run)

4. **Start Development**:
    - All dependencies are automatically installed
    - All recommended VSCode extensions are pre-installed
    - Build and run the CLI server (see Development Workflow section)

#### Nix Flake Setup (Recommended for NixOS/Nix users)

1. **Prerequisites**:

    - Install [Nix](https://nixos.org/download.html) with flakes enabled
    - Install [direnv](https://direnv.net/) for automatic environment loading
    - Install [Visual Studio Code](https://code.visualstudio.com/)
    - (Optional) Install the [mkhl.direnv](https://marketplace.visualstudio.com/items?itemName=mkhl.direnv) VSCode extension for better direnv integration

2. **Fork and Clone the Repository** (same as above)

3. **Setup Development Environment**:

    ```bash
    cd hoodycode
    direnv allow
    ```

    The project includes a [`.envrc`](.envrc) file that automatically loads the Nix flake environment when you enter the directory. This provides:

    - Node.js 20 (matching the version in `.nvmrc`)
    - pnpm (via corepack)
    - All other necessary development dependencies

4. **Install Project Dependencies**:

    ```bash
    pnpm install
    ```

5. **Install VSCode Extensions** (same as native development setup above)

6. **Start Development**:
    - Build and run the CLI server (see Development Workflow section)
    - The environment is automatically activated when you enter the project directory
    - No need to manually run `nix develop` - direnv handles this automatically

### Project Structure

The project is organized into several key directories:

- **`cli/`** - **CLI server implementation** (primary development focus)
    - Main entry point for the HTTP/WebSocket server
    - Handles API endpoints, authentication, and routing
- **`src/`** - Core agent code
    - **`core/`** - Core functionality and tools
    - **`services/`** - Service implementations
    - **`api/`** - API routes and controllers
- **`webview-ui/`** - **DEPRECATED** - Legacy VS Code extension UI
    - ⚠️ Kept only for type definitions
    - ⚠️ Should NOT be used for new development
    - ⚠️ Lacks modern features and contains undefined behavior
    - For custom UIs, see [docs/api-reference.html](docs/api-reference.html) and [README_API.md](README_API.md)
- **`docs/`** - Documentation including API reference
- **`packages/`** - Shared packages and utilities
- **`scripts/`** - Build and utility scripts
- **`assets/`** - Static assets like images and icons

## Development Workflow

### Running the CLI Server (Primary Development)

The primary way to develop and test is using the CLI server:

1. **Build the extension bundle** (required first):
   ```bash
   cd src && pnpm bundle
   ```

2. **Build the CLI server**:
   ```bash
   cd cli && pnpm build
   ```

3. **Start the server**:
   ```bash
   npm run start -- --port 3000 --debug
   ```
   
   Or directly from the cli directory:
   ```bash
   cd cli
   node dist/index.js --port 3000 --debug
   ```

4. **Test with HTTP requests**:
   ```bash
   # Check health
   curl http://localhost:3000/api/v1/agent/health
   
   # Create a task
   curl -X POST http://localhost:3000/api/v1/agent/tasks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"text": "Your task here"}'
   ```

> **💡 Tip**: Use `--debug` flag to see detailed logs of requests and responses - great for understanding the system!

### Hot Reloading

- **CLI Server**: Restart the server after making changes to core code for changes to take effect
- Alternatively, use a tool like `nodemon` to automatically restart on file changes

> **💡 Tip**: For faster development, you can use `nodemon` to auto-restart the server when files change.

### Building for Production

Build the CLI server for deployment:

```bash
# Build extension bundle
cd src && pnpm bundle

# Build CLI server
cd ../cli && pnpm build
```

The built server is in `cli/dist/` and can be deployed anywhere Node.js runs.

## Testing

Hoody Agent Server uses several types of tests to ensure quality:

### Unit Tests

Run unit tests with:

```bash
pnpm test
```

### End-to-End Tests

For more details on E2E tests, see [apps/vscode-e2e](apps/vscode-e2e/).

## Linting and Type Checking

Ensure your code meets our quality standards:

```bash
pnpm lint          # Run ESLint
pnpm check-types   # Run TypeScript type checking
```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks, which automate certain checks before commits and pushes. The hooks are located in the `.husky/` directory.

### Pre-commit Hook

Before a commit is finalized, the `.husky/pre-commit` hook runs:

1.  **Branch Check**: Prevents committing directly to the `main` branch.
2.  **Type Generation**: Runs `pnpm --filter hoody-code generate-types`.
3.  **Type File Check**: Ensures that any changes made to `src/exports/roo-code.d.ts` by the type generation are staged.
4.  **Linting**: Runs `lint-staged` to lint and format staged files.

### Pre-push Hook

Before changes are pushed to the remote repository, the `.husky/pre-push` hook runs:

1.  **Branch Check**: Prevents pushing directly to the `main` branch.
2.  **Compilation**: Runs `pnpm run check-types` to ensure typing is correct.
3.  **Changeset Check**: Checks if a changeset file exists in `.changeset/` and reminds you to create one using `npm run changeset` if necessary.

These hooks help maintain code quality and consistency. If you encounter issues with commits or pushes, check the output from these hooks for error messages.

## Troubleshooting

### Common Issues

#### CLI Server Issues

1. **Server won't start**:
   - Ensure you've built both the extension bundle (`cd src && pnpm bundle`) and CLI (`cd cli && pnpm build`)
   - Check if port is already in use: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
   - Verify all dependencies are installed: `pnpm install`

2. **API requests failing**:
   - Check server logs (use `--debug` flag for detailed output)
   - Verify authentication token is correct
   - Ensure correct Content-Type headers (`application/json`)

3. **Build errors**:
   - Make sure all dependencies are installed with `pnpm install`
   - Try cleaning and rebuilding: `rm -rf node_modules && pnpm install`

### Debugging Tips

- **CLI Server Debugging:**
  - Use `--debug` flag to see all requests/responses
  - Check server logs for error stack traces
  - Test endpoints with `curl` or Postman
  - Monitor WebSocket connections in browser DevTools (Network tab)
  
- **Code Debugging:**
  - Use `console.log()` statements liberally
  - Add breakpoints in VSCode and attach debugger to running Node process
  - Use Node.js inspector: `node --inspect dist/index.js serve`

## Contributing

We welcome contributions to Hoody Agent Server! Here's how you can help:

1. **Report an issue** using [GitHub Issues](https://github.com/HoodyNetwork/hoody-agent-server/issues)
2. **Find an issue** and submit a Pull Request with your fix
3. **Write tests** to improve Code Coverage
4. **Improve Documentation** - API docs, guides, examples
5. **Build custom UIs** - Create example integrations using the HTTP/WebSocket APIs
6. **Suggest a new feature** using [GitHub Discussions](https://github.com/HoodyNetwork/hoody-agent-server/discussions/categories/ideas)!
7. Want to **implement something new**? Awesome! We'd be glad to support you on [Discord](https://discord.social.hoody.com)!

**Development Focus Areas:**
- **CLI Server**: REST API endpoints, WebSocket updates, authentication
- **Core Agent**: Tool implementations, AI integration, mode handling
- **Documentation**: API reference, examples, integration guides
- **External UIs**: Build reference implementations for different frameworks

## Community

Your contributions are welcome! For questions or ideas, please join our Discord server: https://discord.social.hoody.com

We look forward to your contributions and feedback!
