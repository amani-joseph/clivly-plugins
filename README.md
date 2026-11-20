# Clivly plugin

Connects your AI assistant to your [Clivly](https://clivly.com) workspace over MCP (`https://api.clivly.com/mcp`), with four skills:

- `find-contact`: look up a contact by name or email.
- `deal-summary`: summarise open deals.
- `log-follow-up`: save a note, and optionally a task, on a contact.
- `todays-tasks`: list what is due today and what is overdue.

The skills contain no business logic; they only call the Clivly tools.

## Before you connect

A workspace owner or admin turns agent access on in Clivly, under Settings → Agents. Without it, sign-in stops at the consent screen.

## Install

### Claude Code

```bash
claude plugin marketplace add amani-joseph/clivly-plugins
claude plugin install clivly@clivly
```

Then run `/mcp`, choose `clivly` and sign in.

### Codex

```bash
codex plugin marketplace add amani-joseph/clivly-plugins
codex plugin add clivly@clivly
codex mcp login clivly
```

### Claude.ai, ChatGPT and other MCP clients

Add a custom connector with the URL `https://api.clivly.com/mcp`. The client registers itself and opens Clivly's sign-in and consent screen. Nothing needs to be pasted.

Installed the earlier id `clivly-claude`? Remove it first with `claude plugin uninstall clivly-claude@clivly` or `codex plugin remove clivly-claude@clivly`.

## What it can do

- **Sign in with OAuth.** You pick one workspace and tick the kinds of access you allow. Write access is unticked by default.
- **Read.** Contacts, deals, tasks and activity, within the access you allowed.
- **Write.** Create notes, tasks, contacts and deals, update tasks and contacts, move deals, and draft follow-up emails. Nothing is sent and nothing is deleted. Changes the workspace marks for approval wait for a person in Clivly to approve them.
- **Revoke.** Remove the connection at any time in Settings → Connected apps. The assistant's next request is refused at once.

## Publishing and checks

Run the checks before every release:

```bash
node scripts/validate.mjs
```

The script checks:

- the Claude Code manifests (`.claude-plugin/`) and the Codex and ChatGPT manifest (`.codex-plugin/plugin.json`)
- both marketplace files
- each skill's frontmatter
- that every tool a skill or review case names exists on the server
- `claude plugin validate --strict`

To package for the OpenAI plugin portal:

```bash
zip -r clivly-plugin.zip .codex-plugin .mcp.json skills assets README.md -x '*.DS_Store'
```

Keep `version` the same in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `.codex-plugin/plugin.json`.
