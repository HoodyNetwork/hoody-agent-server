/**
 * MCP Integration Controller
 * Provides REST API access to Model Context Protocol operations
 */

import { Controller, Route, Get, Post, Path, Query, Body, Security, SuccessResponse } from "tsoa"
import type { ClineProvider } from "../../../core/webview/ClineProvider"
import { BadRequestError, NotFoundError } from "../errors"

// Dependency injection
let providerInstance: ClineProvider | null = null

export function setMcpControllerProvider(provider: ClineProvider) {
	providerInstance = provider
}

function getProvider(): ClineProvider {
	if (!providerInstance) {
		throw new Error("McpController: Provider not initialized")
	}
	return providerInstance
}

// Type definitions
interface McpServerListResponse {
	servers: any[]
	total: number
	message?: string
}

interface McpMarketplaceResponse {
	catalog: {
		items: any[]
	}
}

interface InstallMcpRequest {
	mcpId: string
}

interface InstallMcpResponse {
	success: boolean
	mcpId: string
	message: string
}

@Route("mcp")
@Security("bearer")
export class McpController extends Controller {
	/**
	 * List all MCP servers
	 * @summary List MCP servers
	 */
	@Get("servers")
	@SuccessResponse(200, "Servers retrieved")
	public async listServers(): Promise<McpServerListResponse> {
		const provider = getProvider()
		const mcpHub = provider.getMcpHub()

		if (!mcpHub) {
			return {
				servers: [],
				total: 0,
				message: "MCP hub not initialized",
			}
		}

		const servers = mcpHub.getAllServers()

		return {
			servers,
			total: servers.length,
		}
	}

	/**
	 * Get specific MCP server details
	 * @summary Get MCP server by name
	 * @param serverName The name of the MCP server
	 */
	@Get("servers/{serverName}")
	@SuccessResponse(200, "Server retrieved")
	public async getServer(@Path() serverName: string): Promise<any> {
		const provider = getProvider()
		const mcpHub = provider.getMcpHub()

		if (!mcpHub) {
			throw new NotFoundError("MCP hub not initialized")
		}

		// Use getAllServers() and filter by name
		const allServers = mcpHub.getAllServers()
		const server = allServers.find((s) => s.name === serverName)

		if (!server) {
			throw new NotFoundError(`MCP server '${serverName}' not found`)
		}

		return server
	}

	/**
	 * Get MCP marketplace catalog
	 * @summary Get marketplace catalog
	 * @param refresh Force refresh from API (default: false)
	 */
	@Get("marketplace")
	@SuccessResponse(200, "Marketplace catalog retrieved")
	public async getMarketplace(@Query() refresh?: string): Promise<McpMarketplaceResponse> {
		const provider = getProvider()

		// Use provider's existing marketplace fetch method
		await provider.fetchMcpMarketplace(refresh === "true")

		// The provider posts to webview, but we need to get the data
		// Access the cached catalog from global state
		const catalog = provider.getValue("mcpMarketplaceCatalog")

		return {
			catalog: catalog || { items: [] },
		}
	}

	/**
	 * Install MCP package from marketplace
	 * @summary Install MCP package
	 */
	@Post("marketplace/install")
	@SuccessResponse(200, "Installation initiated")
	public async installPackage(@Body() body: InstallMcpRequest): Promise<InstallMcpResponse> {
		const provider = getProvider()

		if (!body.mcpId || typeof body.mcpId !== "string") {
			throw new BadRequestError("mcpId is required")
		}

		// Use provider's existing download method
		await provider.downloadMcp(body.mcpId)

		return {
			success: true,
			mcpId: body.mcpId,
			message: "Installation initiated",
		}
	}
}