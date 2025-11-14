#!/bin/bash
# Pre-hook: File write validation (path + token budget enforcement)
# Blocks Write/Edit tool calls that violate path rules or line limits

# Bypass mechanism for emergency use
if [[ "$CLAUDE_HOOK_BYPASS" == "1" ]]; then
  echo "⚠️  HOOK BYPASS ACTIVE - Validation skipped" >&2
  exit 0
fi

# Read stdin (JSON payload from Claude Code)
INPUT=$(cat)

# Debug logging - DISABLED (enable for troubleshooting)
# DEBUG_LOG="/tmp/claude-tool-call-$(date +%s).json"
# echo "$INPUT" > "$DEBUG_LOG"
# echo "🔍 DEBUG: Tool call logged to $DEBUG_LOG" >&2

# Extract tool info
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Only validate Write/Edit tools
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

# Extract tool input (parameters)
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty')
FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0  # No path, allow (shouldn't happen)
fi

# Load budget configuration
REPO_ROOT="/Users/sibikrishnan/Documents/Gully"
BUDGET_FILE="$REPO_ROOT/.claude/FILE_BUDGETS.json"

if [[ ! -f "$BUDGET_FILE" ]]; then
  echo "⚠️  Budget file not found: $BUDGET_FILE" >&2
  exit 0  # Fail open if config missing
fi

# ===== PATH VALIDATION =====

# Check forbidden patterns
FORBIDDEN=$(jq -r '.path_rules.forbidden_patterns[]' "$BUDGET_FILE")
while IFS= read -r pattern; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "❌ BLOCKED: Invalid file path" >&2
    echo "   Path: $FILE_PATH" >&2
    echo "   Reason: Files cannot be in $pattern" >&2
    echo "   See: .claude/FILE_BUDGETS.json for correct locations" >&2
    exit 1
  fi
done <<< "$FORBIDDEN"

# ===== TOKEN BUDGET VALIDATION =====

# Extract content for line counting
if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$TOOL_INPUT" | jq -r '.content // empty')
elif [[ "$TOOL_NAME" == "Edit" ]]; then
  # For Edit, check new_string (the replacement content)
  CONTENT=$(echo "$TOOL_INPUT" | jq -r '.new_string // empty')
fi

if [[ -n "$CONTENT" && "$CONTENT" != "null" ]]; then
  LINE_COUNT=$(echo "$CONTENT" | wc -l | tr -d ' ')

  # Match file path against budget patterns
  BUDGETS=$(jq -c '.budgets | to_entries[]' "$BUDGET_FILE")

  MATCHED=false
  while IFS= read -r budget_entry; do
    PATTERN=$(echo "$budget_entry" | jq -r '.key')
    MAX_LINES=$(echo "$budget_entry" | jq -r '.value.max_lines')
    PURPOSE=$(echo "$budget_entry" | jq -r '.value.purpose')

    # Convert glob pattern to regex for matching
    # ** -> .* (match any characters including /)
    # * -> [^/]* (match any characters except /)
    REGEX_PATTERN=$(echo "$PATTERN" | sed 's|\*\*|DOUBLE_STAR|g' | sed 's|\*|[^/]*|g' | sed 's|DOUBLE_STAR|.*|g')

    if [[ "$FILE_PATH" =~ $REGEX_PATTERN ]]; then
      MATCHED=true
      if (( LINE_COUNT > MAX_LINES )); then
        echo "❌ BLOCKED: File exceeds token budget" >&2
        echo "   File: $FILE_PATH" >&2
        echo "   Lines: $LINE_COUNT / $MAX_LINES max" >&2
        echo "   Type: $PURPOSE" >&2
        echo "   Solution: Split into core + detail, or compress content" >&2
        echo "   Budget: .claude/FILE_BUDGETS.json" >&2
        exit 1
      fi
      # Match found and valid, exit loop
      break
    fi
  done <<< "$BUDGETS"

  # Optional: Warn if no budget pattern matched (uncomment to enable)
  # if [[ "$MATCHED" == "false" ]]; then
  #   echo "⚠️  No budget pattern matched for: $FILE_PATH" >&2
  # fi
fi

# All validations passed
echo "✅ Validation passed: $FILE_PATH ($LINE_COUNT lines)" >&2
exit 0
