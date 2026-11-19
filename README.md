# Clivly plugin for Claude Code

Connects Claude Code to your Clivly workspace over `/mcp`, with four skills:

- `find-contact`: look up a contact by name or email.
- `deal-summary`: summarise open deals.
- `log-follow-up`: save a note, and optionally a task, on a contact.
- `todays-tasks`: list what is due today and what is overdue.

## Install

1. Install the plugin from this folder, then start a session and sign in to Clivly when prompted.
2. Use `/mcp` in Claude Code to check the `clivly` server is connected.

## What it can do

- Sign in with OAuth. The workspace owner or an admin must first turn agents on in Clivly's agent settings.
- Read contacts, deals, tasks and activity within the scopes you approved.
- Propose creates and updates. Every write waits for your approval in Clivly before it is saved.
- Revoking a consent refuses the next call from Claude. The Connected apps screen that does this is not built yet.

The skills contain no business logic; they only call the Clivly tools.

## Publishing and checks

Run the checks before every release:

```bash
node packages/claude-plugin/scripts/validate.mjs
```

The script checks the manifests and marketplace files, each skill's frontmatter, that every tool a skill names exists on the server, and runs `claude plugin validate --strict`.

This folder is also a marketplace for both tools. Install from a local checkout, or from the Git repository once the folder is published on its own:

```bash
claude plugin marketplace add <path-or-git-url>
claude plugin install clivly-claude@clivly
```

```bash
codex plugin marketplace add <path-or-git-url>
codex plugin add clivly-claude@clivly
```

`.mcp.json` points at the production endpoint, `https://api.clivly.com/mcp`.
