# Hook Usage Guide

## Quick Start

After any Playwright MCP testing session, run:

```bash
# Option 1: Direct execution
./.claude/hooks/post-cleanup.sh

# Option 2: Via slash command (from Claude Code chat)
/cleanup
```

## What Gets Cleaned

### 1. Playwright Screenshots
- Location: `tracker/.playwright-mcp/*.png`
- These are test artifacts from browser automation
- Safe to delete after reviewing test results

### 2. Background Servers
- Port 8080 (dashboard server)
- Prevents port conflicts in future sessions

## When to Run

✅ **After browser testing** - Clean up screenshots and stop servers
✅ **Before committing** - Ensure no test artifacts are committed
✅ **Session end** - Keep workspace clean for next session

## Example Workflow

```bash
# 1. Test the dashboard
cd tracker && ./launch-dashboard.sh
# ... run Playwright tests ...

# 2. Review test results
# Check screenshots in tracker/.playwright-mcp/

# 3. Clean up
./.claude/hooks/post-cleanup.sh

# 4. Commit changes (screenshots not included)
git add . && git commit -m "feat: update dashboard"
```

## Automation Ideas

### Option A: Add to `.gitignore`
```bash
# Add to tracker/.gitignore
.playwright-mcp/*.png
```

### Option B: Pre-commit Hook
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
./.claude/hooks/post-cleanup.sh
```

### Option C: Alias in Shell
```bash
# Add to ~/.zshrc or ~/.bashrc
alias cleanup='cd /Users/sibikrishnan/Documents/Gully && ./.claude/hooks/post-cleanup.sh'
```

## Customization

Edit `post-cleanup.sh` to add more cleanup tasks:

```bash
# Example: Clean npm cache
clean_npm_cache() {
    echo "  🗑️  Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true
}

# Example: Clean Docker containers
clean_docker() {
    echo "  🐳 Stopping Docker containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true
}
```

## Troubleshooting

**"Permission denied"**
```bash
chmod +x ./.claude/hooks/post-cleanup.sh
```

**"No such file or directory"**
```bash
# Make sure you're in project root
cd /Users/sibikrishnan/Documents/Gully
```

**"Server still running"**
```bash
# Check what's on port 8080
lsof -ti:8080

# Force kill
lsof -ti:8080 | xargs kill -9
```
