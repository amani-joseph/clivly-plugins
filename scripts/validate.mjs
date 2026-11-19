#!/usr/bin/env node
// Checks the Clivly plugin before it is published to a marketplace.
// Run from anywhere: `node packages/claude-plugin/scripts/validate.mjs`.
// Exits 1 on the first problem group so CI fails loudly.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(pluginRoot, "../..");
const toolDefsPath = join(
	repoRoot,
	"packages/api/src/services/capabilities/tool-defs.ts"
);

const TOOL_LIST = /AGENT_TOOL_NAMES = \[([\s\S]*?)\] as const/;
const failures = [];
const fail = (message) => failures.push(message);

function readJson(relative) {
	const path = join(pluginRoot, relative);
	if (!existsSync(path)) {
		fail(`missing ${relative}`);
		return null;
	}
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		fail(`${relative} is not valid JSON: ${error.message}`);
		return null;
	}
}

// 1. Manifests -------------------------------------------------------------
const plugin = readJson(".claude-plugin/plugin.json");
if (plugin) {
	for (const key of ["name", "version", "description"]) {
		if (typeof plugin[key] !== "string" || plugin[key].length === 0) {
			fail(`.claude-plugin/plugin.json: "${key}" must be a non-empty string`);
		}
	}
	if (!/^\d+\.\d+\.\d+$/.test(plugin.version ?? "")) {
		fail(`.claude-plugin/plugin.json: "version" must be semver x.y.z`);
	}
}

const marketplace = readJson(".claude-plugin/marketplace.json");
if (marketplace && plugin) {
	const entry = marketplace.plugins?.find((p) => p.name === plugin.name);
	if (entry) {
		if (entry.version !== plugin.version) {
			fail("marketplace entry version differs from plugin.json");
		}
		if (typeof entry.source !== "string" || !entry.source.startsWith("./")) {
			fail("marketplace entry source must be a relative ./ path");
		}
	} else {
		fail(`marketplace.json has no entry for plugin "${plugin.name}"`);
	}
}

const codexMarketplace = readJson(".agents/plugins/marketplace.json");
if (codexMarketplace && plugin) {
	const entry = codexMarketplace.plugins?.find((p) => p.name === plugin.name);
	if (!entry) {
		fail(`.agents/plugins/marketplace.json has no entry for "${plugin.name}"`);
	}
}

// 2. MCP config -------------------------------------------------------------
const mcp = readJson(".mcp.json");
if (mcp) {
	const server = mcp.mcpServers?.clivly;
	if (server?.type !== "http" || typeof server.url !== "string") {
		fail('.mcp.json must declare mcpServers.clivly with type "http" and a url');
	} else if (!server.url.endsWith("/mcp")) {
		fail(".mcp.json url must end with /mcp");
	}
	if (JSON.stringify(mcp).match(/secret|token|key=/i)) {
		fail(".mcp.json must not contain credentials");
	}
}

// 3. Skills -----------------------------------------------------------------
// The tool names a skill may call must exist on the server.
function serverToolNames() {
	const source = readFileSync(toolDefsPath, "utf8");
	const block = source.match(TOOL_LIST);
	if (!block) {
		fail("could not read AGENT_TOOL_NAMES from tool-defs.ts");
		return new Set();
	}
	return new Set([...block[1].matchAll(/"([a-z_]+)"/g)].map((m) => m[1]));
}

const known = serverToolNames();
const skillsDir = join(pluginRoot, "skills");
const skillNames = existsSync(skillsDir) ? readdirSync(skillsDir) : [];
if (skillNames.length === 0) {
	fail("no skills found under skills/");
}
for (const dir of skillNames) {
	const path = join(skillsDir, dir, "SKILL.md");
	if (!existsSync(path)) {
		fail(`skills/${dir} has no SKILL.md`);
		continue;
	}
	const text = readFileSync(path, "utf8");
	const front = text.match(/^---\n([\s\S]*?)\n---\n/);
	if (!front) {
		fail(`skills/${dir}/SKILL.md has no frontmatter`);
		continue;
	}
	const name = front[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
	const description = front[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
	if (name !== dir) {
		fail(`skills/${dir}: frontmatter name "${name}" must equal the directory`);
	}
	if (!description || description.length < 40) {
		fail(
			`skills/${dir}: description must say what the skill does and when to use it`
		);
	}
	for (const [, tool] of text.matchAll(/`([a-z_]+)`/g)) {
		if (tool.includes("_") && !known.has(tool) && isLikelyTool(tool)) {
			fail(`skills/${dir} names unknown tool \`${tool}\``);
		}
	}
}

// Words in backticks that look like tool names but are not tools.
function isLikelyTool(word) {
	return !["idempotency_key", "contact_id", "deal_id"].includes(word);
}

// 4. The Claude Code validator (when the CLI is installed) -------------------
const claude = spawnSync(
	"claude",
	["plugin", "validate", pluginRoot, "--strict"],
	{
		encoding: "utf8",
	}
);
if (claude.error) {
	console.log("note: claude CLI not found; skipped `claude plugin validate`");
} else if (claude.status !== 0) {
	fail(
		`claude plugin validate --strict failed:\n${claude.stdout}${claude.stderr}`
	);
}

if (failures.length > 0) {
	console.error(`Clivly plugin check failed (${failures.length}):`);
	for (const message of failures) {
		console.error(`  - ${message}`);
	}
	process.exit(1);
}
console.log(
	`Clivly plugin check passed: ${skillNames.length} skills, ${known.size} known tools.`
);
