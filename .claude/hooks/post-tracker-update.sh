#!/bin/bash
# Post-hook: Auto-learning after task completion
# Triggers when TASK_TRACKER.csv is updated with task completion
# Automatically condenses session, analyzes patterns, and updates context

# Bypass mechanism
if [[ "$CLAUDE_HOOK_BYPASS" == "1" ]]; then
  echo "⚠️  HOOK BYPASS ACTIVE - Auto-learning skipped" >&2
  exit 0
fi

# Read stdin (JSON payload from Claude Code)
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')
FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')

# Only trigger on TASK_TRACKER.csv edits
if [[ "$TOOL_NAME" != "Edit" || "$FILE_PATH" != *"TASK_TRACKER.csv"* ]]; then
  exit 0
fi

# Check if task was marked completed
NEW_STRING=$(echo "$TOOL_INPUT" | jq -r '.new_string // empty')
if [[ "$NEW_STRING" == *"completed"* ]]; then
  echo "🎓 Task completion detected!" >&2
  echo "" >&2
  echo "   📋 REQUIRED GIT WORKFLOW:" >&2
  echo "   1. Create PR: gh pr create --base [parent-branch] --head [current-branch]" >&2
  echo "   2. After merge: git checkout develop && git pull" >&2
  echo "   3. New task branch: git checkout -b feature/P{Phase}-{Component}-T{Task}" >&2
  echo "" >&2
  echo "   ⚡ OPTIONAL: Run 'learning' skill to capture session patterns" >&2
  echo "" >&2
fi

# Allow the write to proceed
exit 0
