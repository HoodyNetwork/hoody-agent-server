#!/usr/bin/env node
/**
 * Creates a fully portable production build of Hoodycode CLI
 * Result: cli/dist/ folder contains EVERYTHING needed to run
 */

import { execSync } from "child_process"
import { cpSync, existsSync, mkdirSync } from "fs"
import { rimrafSync } from "rimraf"

console.log("🚀 Building fully portable Hoodycode CLI distribution...\n")

// Step 1: Clean dist
console.log("1️⃣  Cleaning dist directory...")
if (existsSync("dist")) {
	rimrafSync("dist")
}
console.log("   ✓ Cleaned\n")

// Step 2: Build CLI (creates dist/index.js + copies extension)
console.log("2️⃣  Building CLI bundle...")
execSync("pnpm build", { stdio: "inherit" })
console.log("   ✓ CLI built\n")

// Step 3: Install production dependencies into dist/
console.log("3️⃣  Installing production dependencies into dist/...")
try {
	// Copy package.json to dist (already done by build)
	// Install only production dependencies
	execSync("npm install --omit=dev --prefix dist", { stdio: "inherit" })
	console.log("   ✓ Dependencies installed\n")
} catch (error) {
	console.error("   ✗ Failed to install dependencies:", error.message)
	process.exit(1)
}

// Step 4: Verify structure
console.log("4️⃣  Verifying portable build...")
const requiredFiles = [
	"dist/index.js",
	"dist/package.json",
	"dist/hoodycode/dist/extension.js",
	"dist/node_modules"
]

let allPresent = true
for (const file of requiredFiles) {
	if (existsSync(file)) {
		console.log(`   ✓ ${file}`)
	} else {
		console.log(`   ✗ MISSING: ${file}`)
		allPresent = false
	}
}

if (!allPresent) {
	console.error("\n❌ Build verification failed!")
	process.exit(1)
}

// Step 5: Calculate sizes
console.log("\n5️⃣  Build Statistics:")
try {
	const { execSync: exec } = await import("child_process")
	const distSize = exec("du -sh dist 2>/dev/null || echo 'unknown'").toString().trim().split('\t')[0]
	const nodeModulesSize = exec("du -sh dist/node_modules 2>/dev/null || echo 'unknown'").toString().trim().split('\t')[0]
	const extensionSize = exec("du -sh dist/hoodycode 2>/dev/null || echo 'unknown'").toString().trim().split('\t')[0]
	
	console.log(`   Total size:        ${distSize}`)
	console.log(`   - node_modules:    ${nodeModulesSize}`)
	console.log(`   - extension:       ${extensionSize}`)
	console.log(`   - CLI code:        ~1MB`)
} catch {
	console.log("   (Size calculation skipped)")
}

console.log("\n" + "=".repeat(60))
console.log("✅ Portable build complete!")
console.log("=".repeat(60))
console.log("\n📦 The dist/ folder is now FULLY PORTABLE")
console.log("\nYou can:")
console.log("  • Copy dist/ folder anywhere")
console.log("  • Ship it to any server")
console.log("  • Run: node dist/index.js serve")
console.log("\nNo additional dependencies needed!")
console.log("=".repeat(60) + "\n")