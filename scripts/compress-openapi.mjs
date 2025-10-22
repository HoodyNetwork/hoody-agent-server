#!/usr/bin/env node

/**
 * Aggressive OpenAPI Compression Script
 * 
 * Generates a significantly smaller, AI-optimized version by:
 * - Outputting as MINIFIED JSON (huge savings vs YAML)
 * - Removing verbose descriptions (keep only 80 chars)
 * - Removing unnecessary fields (additionalProperties, format, nullable on booleans)
 * - Keeping examples (valuable for AI understanding)
 * - Maintaining full schema structure
 * 
 * Input: OPENAPI.yaml (234 KB YAML)
 * Output: OPENAPI_COMPRESSED.json (target: <100 KB minified JSON)
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const INPUT_FILE = path.join(rootDir, 'OPENAPI.yaml')
const OUTPUT_JSON = path.join(rootDir, 'OPENAPI_COMPRESSED.json')
const OUTPUT_YAML = path.join(rootDir, 'OPENAPI_COMPRESSED.yaml')

/**
 * Aggressively compress description - keep only essential info
 */
function compressDescription(desc) {
	if (!desc || typeof desc !== 'string') return desc
	
	// Keep only first 80 characters
	if (desc.length <= 80) return desc
	
	// Find first sentence if short enough
	const firstSentence = desc.match(/^[^.!?]+[.!?]/)
	if (firstSentence && firstSentence[0].length <= 80) {
		return firstSentence[0].trim()
	}
	
	// Otherwise truncate
	return desc.substring(0, 77).trim() + '...'
}

/**
 * Aggressively compress schema objects
 */
function compressSchema(schema) {
	if (!schema || typeof schema !== 'object') return schema
	
	const compressed = { ...schema }
	
	// Compress description aggressively
	if (compressed.description) {
		compressed.description = compressDescription(compressed.description)
	}
	
	// Remove unnecessary fields that bloat the spec
	delete compressed.additionalProperties  // Not needed for AI
	delete compressed.format  // "double", "date-time" etc - AI can infer from type
	
	// Remove nullable on boolean enums (redundant)
	if (compressed.type === 'boolean' && compressed.enum) {
		delete compressed.nullable
	}
	
	// KEEP examples - valuable for AI
	
	// Recursively compress nested schemas
	if (compressed.properties) {
		compressed.properties = Object.fromEntries(
			Object.entries(compressed.properties).map(([key, val]) => [key, compressSchema(val)])
		)
	}
	
	if (compressed.items) {
		compressed.items = compressSchema(compressed.items)
	}
	
	if (compressed.allOf) {
		compressed.allOf = compressed.allOf.map(compressSchema)
	}
	
	if (compressed.oneOf) {
		compressed.oneOf = compressed.oneOf.map(compressSchema)
	}
	
	if (compressed.anyOf) {
		compressed.anyOf = compressed.anyOf.map(compressSchema)
	}
	
	return compressed
}

/**
 * Compress an operation (endpoint) definition
 */
function compressOperation(operation) {
	if (!operation || typeof operation !== 'object') return operation
	
	const compressed = { ...operation }
	
	// Aggressively compress descriptions
	if (compressed.description) {
		compressed.description = compressDescription(compressed.description)
	}
	if (compressed.summary) {
		compressed.summary = compressDescription(compressed.summary)
	}
	
	// Compress parameters
	if (compressed.parameters) {
		compressed.parameters = compressed.parameters.map((param) => ({
			...param,
			description: param.description ? compressDescription(param.description) : undefined,
			schema: param.schema ? compressSchema(param.schema) : undefined,
		}))
	}
	
	// Compress request body
	if (compressed.requestBody) {
		if (compressed.requestBody.description) {
			compressed.requestBody.description = compressDescription(compressed.requestBody.description)
		}
		if (compressed.requestBody.content) {
			for (const [contentType, content] of Object.entries(compressed.requestBody.content)) {
				if (content.schema) {
					compressed.requestBody.content[contentType].schema = compressSchema(content.schema)
				}
			}
		}
	}
	
	// Compress responses
	if (compressed.responses) {
		compressed.responses = Object.fromEntries(
			Object.entries(compressed.responses).map(([status, response]) => {
				const compressedResponse = { ...response }
				if (compressedResponse.description) {
					compressedResponse.description = compressDescription(compressedResponse.description)
				}
				if (compressedResponse.content) {
					for (const [contentType, content] of Object.entries(compressedResponse.content)) {
						if (content.schema) {
							compressedResponse.content[contentType].schema = compressSchema(content.schema)
						}
					}
				}
				return [status, compressedResponse]
			})
		)
	}
	
	return compressed
}

/**
 * Compress all paths/endpoints
 */
function compressPaths(paths) {
	if (!paths || typeof paths !== 'object') return paths
	
	return Object.fromEntries(
		Object.entries(paths).map(([path, methods]) => {
			const compressedMethods = Object.fromEntries(
				Object.entries(methods).map(([method, operation]) => [method, compressOperation(operation)])
			)
			return [path, compressedMethods]
		})
	)
}

/**
 * Main compression function
 */
async function compressOpenAPI() {
	console.log('🗜️  Aggressively compressing OpenAPI specification...')
	console.log(`📖 Reading: ${INPUT_FILE}`)
	
	// Read and parse YAML
	const content = await fs.readFile(INPUT_FILE, 'utf8')
	const spec = yaml.parse(content)
	
	const originalSize = content.length
	const originalLines = content.split('\n').length
	
	// Compress components/schemas
	if (spec.components?.schemas) {
		spec.components.schemas = Object.fromEntries(
			Object.entries(spec.components.schemas).map(([name, schema]) => [name, compressSchema(schema)])
		)
	}
	
	// Compress paths
	if (spec.paths) {
		spec.paths = compressPaths(spec.paths)
	}
	
	// Compress info description
	if (spec.info?.description) {
		spec.info.description = compressDescription(spec.info.description)
	}
	
	// Output as MINIFIED JSON (massive savings vs YAML)
	const compressedJson = JSON.stringify(spec)
	await fs.writeFile(OUTPUT_JSON, compressedJson, 'utf8')
	
	// Also output formatted YAML for human readability
	const compressedYaml = yaml.stringify(spec, {
		lineWidth: 120,
		indent: 2,
		minContentWidth: 60,
	})
	await fs.writeFile(OUTPUT_YAML, compressedYaml, 'utf8')
	
	const jsonSize = compressedJson.length
	const yamlSize = compressedYaml.length
	const yamlLines = compressedYaml.split('\n').length
	
	const jsonSavings = ((originalSize - jsonSize) / originalSize * 100).toFixed(1)
	const yamlSavings = ((originalSize - yamlSize) / originalSize * 100).toFixed(1)
	
	console.log(`✅ Compressed OpenAPI written to:`)
	console.log(`   - ${OUTPUT_JSON} (minified JSON)`)
	console.log(`   - ${OUTPUT_YAML} (formatted YAML)`)
	console.log(``)
	console.log(`📊 Statistics:`)
	console.log(`   Original YAML:      ${originalLines.toLocaleString()} lines, ${(originalSize / 1024).toFixed(1)} KB`)
	console.log(`   Compressed JSON:    ${(jsonSize / 1024).toFixed(1)} KB (${jsonSavings}% savings) ⭐`)
	console.log(`   Compressed YAML:    ${yamlLines.toLocaleString()} lines, ${(yamlSize / 1024).toFixed(1)} KB (${yamlSavings}% savings)`)
	console.log(``)
	console.log(`🤖 AI-optimized specification ready!`)
	console.log(`   Recommended: Use .json for AI context (smaller)`)
	console.log(`   For humans: Use .yaml for readability`)
}

// Run compression
compressOpenAPI().catch(error => {
	console.error('❌ Compression failed:', error)
	process.exit(1)
})