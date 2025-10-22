/**
 * API Documentation Controller
 * 
 * Serves the OpenAPI specification for API discovery and documentation.
 */

import { Controller, Get, Route, SuccessResponse, Response } from "tsoa"
import { getSwaggerSpec } from "./swagger-data"
import { readFileSync } from "fs"
import { join } from "path"
import yaml from "yaml"

/**
 * OpenAPI Specification (subset for typing)
 */
export interface OpenAPISpec {
	openapi: string
	info: {
		title: string
		version: string
		description: string
		[key: string]: any
	}
	paths: Record<string, any>
	components?: Record<string, any>
	[key: string]: any
}

/**
 * API Documentation Controller
 * 
 * Provides endpoints for accessing API documentation and OpenAPI specification.
 * These endpoints are PUBLIC (no authentication required) to allow API discovery.
 */
@Route("openapi")
export class DocsController extends Controller {
	/**
	 * Get OpenAPI specification
	 *
	 * Returns the complete OpenAPI 3.0 specification in JSON format.
	 * This spec is auto-generated from TypeScript code via tsoa.
	 * Use this endpoint for API discovery, client SDK generation, or documentation tools.
	 *
	 * @returns Complete OpenAPI specification
	 */
	@Get("spec.json")
	@SuccessResponse(200, "OpenAPI specification retrieved successfully")
	public getOpenAPISpec(): OpenAPISpec {
		// Return the bundled swagger spec
		// This spec is imported directly so it's included in the bundle
		return getSwaggerSpec() as OpenAPISpec
	}

	/**
	 * Get compressed OpenAPI specification
	 *
	 * Returns an AI-optimized, compressed version of the OpenAPI specification.
	 * This version is 38.7% smaller (234 KB → 143 KB) with:
	 * - Minified JSON format (massive savings vs YAML)
	 * - Shortened descriptions (80 char limit)
	 * - Removed unnecessary fields (format, additionalProperties, nullable)
	 * - Maintained examples and full schema structure for AI comprehension
	 *
	 * Ideal for use with AI models where context window size matters.
	 *
	 * @returns Compressed OpenAPI specification in minified JSON format
	 */
	@Get("spec-compressed.json")
	@SuccessResponse(200, "Compressed OpenAPI specification retrieved successfully")
	@Response(404, "Compressed spec file not found")
	public getCompressedOpenAPISpec(): OpenAPISpec {
		try {
			// Read the pre-compressed JSON file from the dist directory
			const compressedPath = join(process.cwd(), "OPENAPI_COMPRESSED.json")
			const jsonContent = readFileSync(compressedPath, "utf8")
			
			// Parse JSON
			const spec = JSON.parse(jsonContent)
			
			return spec as OpenAPISpec
		} catch (error) {
			this.setStatus(404)
			throw new Error("Compressed OpenAPI specification not found. Run build process to generate it.")
		}
	}
}