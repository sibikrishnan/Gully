#!/bin/bash
# Pre-hook: Git workflow enforcement
# Validates branch naming and workflow before git commits
# Prevents: commits on master/develop, wrong branch for task

# Bypass mechanism
if [[ "$CLAUDE_HOOK_BYPASS" == "1" ]]; then
  exit 0
fi

# Read stdin (JSON payload)
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only validate git commit commands
if [[ "$TOOL_NAME" != "Bash" || "$COMMAND" != *"git commit"* ]]; then
  exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# BLOCK: Commits on master/develop
if [[ "$CURRENT_BRANCH" == "master" || "$CURRENT_BRANCH" == "develop" ]]; then
  echo "" >&2
  echo "❌ BLOCKED: Cannot commit directly to $CURRENT_BRANCH" >&2
  echo "" >&2
  echo "   Required workflow:" >&2
  echo "   1. Create feature branch: git checkout -b feature/P{Phase}-{Component}-T{Task}" >&2
  echo "   2. Work on task branch" >&2
  echo "   3. Create PR when done" >&2
  echo "" >&2
  exit 1
fi

# WARN: Branch must follow naming convention
if [[ ! "$CURRENT_BRANCH" =~ ^feature/P[0-9]+-[A-Z]+-T[0-9]+(\.[0-9]+)?$ ]]; then
  echo "" >&2
  echo "⚠️  WARNING: Branch name doesn't follow convention" >&2
  echo "" >&2
  echo "   Current: $CURRENT_BRANCH" >&2
  echo "   Expected: feature/P{Phase}-{Component}-T{Task}" >&2
  echo "   Example: feature/P2-PROF-T5.1" >&2
  echo "" >&2
  echo "   Allowing commit, but please follow naming convention" >&2
  echo "" >&2
fi

# Allow commit
exit 0
