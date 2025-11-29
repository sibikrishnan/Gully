---
description: Clean up Playwright screenshots and stop background servers
---

Run the POST cleanup script to clean up test artifacts.

Execute: `./.claude/hooks/post-cleanup.sh`

This will:
- Delete all Playwright MCP screenshots from `tracker/.playwright-mcp/`
- Stop any servers running on port 8080

Use this after browser testing sessions to keep the workspace clean.
