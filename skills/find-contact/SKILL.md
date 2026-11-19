---
name: find-contact
description: Find a Clivly contact by name or email and show their details. Use when the user asks who someone is, or for a contact's status, company or last activity.
---

# Find a contact

Use the Clivly MCP tools only. Do not add business logic of your own.

1. Call `search_contacts` with the name or email the user gave.
2. If exactly one contact matches, call `get_contact` with its id and show the name, email, company, status and last activity.
3. If several match, list them (name, email, company) and ask the user which one they mean. Do not guess.
4. If none match, say so and suggest the user check the spelling or try the email address.
