---
name: log-follow-up
description: Record a follow-up in Clivly as a note on a contact, and optionally a task with a due date. Use when the user says they spoke to someone, or asks to log or remember a follow-up.
---

# Log a follow-up

Use the Clivly MCP tools only. Each write needs an idempotency key, and Clivly holds every write from Claude for the user's approval before it lands.

1. Identify the contact. Call `search_contacts`. If several match, ask which one.
2. Call `create_note` on that contact with what the user said, in their words.
3. If the user asked for a reminder or a due date, call `create_task` linked to the same contact, with the due date.
4. Tell the user what was proposed. Say it is waiting for their approval in Clivly, not yet saved.
