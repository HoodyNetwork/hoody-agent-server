/**
 * Swagger JSON Data
 * 
 * This module imports the auto-generated swagger.json so it can be bundled
 * and served by the DocsController without file system access.
 */

import swaggerSpec from "../generated/swagger.json"

export function getSwaggerSpec(): any {
	return swaggerSpec
}