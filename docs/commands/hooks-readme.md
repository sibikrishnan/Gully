# Claude Code Hooks

This directory contains hook scripts that run at specific points during Claude Code sessions.

## Available Hooks

### `post-cleanup.sh`

**When it runs:** Manually after Playwright MCP testing sessions

**What it does:**
1. Deletes all Playwright screenshots from `tracker/.playwright-mcp/`
2. Stops any running background servers on port 8080

**Usage:**
```bash
# Run manually after testing
./.claude/hooks/post-cleanup.sh
```

**Output:**
```
🧹 Running POST cleanup...
  📸 Found 8 Playwright screenshot(s)
  🗑️  Deleting screenshots...
  ✅ Cleaned up Playwright screenshots
  🛑 Stopping server on port 8080 (PID: 43122)
  ✅ Server stopped
✨ POST cleanup complete!
```

## Configuring Hooks in Claude Code

Claude Code supports hooks in `.claude/claude_settings.json` or global settings.

### Option 1: User Prompt Submit Hook (for automation)

Add to `.claude/claude_settings.json`:
```json
{
  "hooks": {
    "user_prompt_submit": {
      "command": ".claude/hooks/post-cleanup.sh",
      "trigger": "keyword:cleanup"
    }
  }
}
```

Then type `cleanup` in chat to trigger the hook.

### Option 2: Manual Execution (current approach)

Run the script manually when needed:
```bash
./.claude/hooks/post-cleanup.sh
```

## Creating New Hooks

1. Create a new executable script in `.claude/hooks/`
2. Make it executable: `chmod +x .claude/hooks/your-hook.sh`
3. Document it in this README
4. (Optional) Configure in settings.json for automatic triggering

## Best Practices

- ✅ Keep hooks lightweight (<100ms execution time)
- ✅ Include clear output messages
- ✅ Handle errors gracefully
- ✅ Make hooks idempotent (safe to run multiple times)
- ✅ Test hooks manually before automation

## Hook Ideas

- `pre-commit.sh` - Validate JSON schemas before commits
- `post-test.sh` - Clean up test databases/artifacts
- `pre-deploy.sh` - Run safety checks before deployment
- `session-summary.sh` - Generate session reports
