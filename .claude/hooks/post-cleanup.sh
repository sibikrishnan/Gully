#!/bin/bash

# POST Cleanup Script
# Automatically deletes Playwright MCP screenshots after session ends
# Configured as a post-session hook in Claude Code

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🧹 Running POST cleanup..."

# Function to clean Playwright screenshots
clean_playwright_screenshots() {
    local screenshots_dir="$PROJECT_ROOT/tracker/.playwright-mcp"

    if [ -d "$screenshots_dir" ]; then
        local file_count=$(find "$screenshots_dir" -type f -name "*.png" | wc -l | tr -d ' ')

        if [ "$file_count" -gt 0 ]; then
            echo "  📸 Found $file_count Playwright screenshot(s)"
            echo "  🗑️  Deleting screenshots..."
            rm -f "$screenshots_dir"/*.png
            echo "  ✅ Cleaned up Playwright screenshots"
        else
            echo "  ℹ️  No Playwright screenshots to clean"
        fi
    else
        echo "  ℹ️  Playwright screenshot directory does not exist"
    fi
}

# Function to stop any running background servers
stop_background_servers() {
    local port=8080
    local pid=$(lsof -ti:$port 2>/dev/null || echo "")

    if [ -n "$pid" ]; then
        echo "  🛑 Stopping server on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
        echo "  ✅ Server stopped"
    else
        echo "  ℹ️  No server running on port $port"
    fi
}

# Run cleanup tasks
echo ""
clean_playwright_screenshots
echo ""
stop_background_servers
echo ""
echo "✨ POST cleanup complete!"
