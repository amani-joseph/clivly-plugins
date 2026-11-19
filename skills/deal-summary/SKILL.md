---
name: deal-summary
description: Summarise the open deals in Clivly, optionally for one contact or pipeline stage. Use when the user asks what is in the pipeline, what is open, or how a deal is doing.
---

# Deal summary

Use the Clivly MCP tools only.

1. Call `list_deals`, passing the contact or stage the user named if any.
2. Summarise: how many deals are open, the total value, and the stage each is in.
3. Name the largest deals and any that have not moved for a long time.
4. If the user asked about one deal and several match, ask which one before reporting on it.
