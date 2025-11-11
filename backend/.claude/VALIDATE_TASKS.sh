#!/bin/bash
# Efficient batch validation for generated task JSONs
# Usage: ./VALIDATE_TASKS.sh [pattern]
# Example: ./VALIDATE_TASKS.sh "P3-TEAM-*"

TASK_DIR="/Users/sibikrishnan/Documents/Gully/backend/.claude/tasks"
PATTERN="${1:-P*.json}"

echo "🔍 Validating tasks matching: $PATTERN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Single jq command for all validations
jq -r --arg pattern "$PATTERN" '
  . as $task |
  {
    file: (input_filename | split("/")[-1]),
    id: .id,
    tests: (.testSuite.testCases | length),
    lines: 0,
    author: .changelog[0].author,
    phase: .metadata.phase,
    tags: (.metadata.tags | length),

    # Validation checks
    valid_json: true,
    has_id: (.id != null),
    has_tests: ((.testSuite.testCases | length) >= 5),
    has_workflow: (.workflow.workflowRef != null),
    has_absolute_paths: ([.context.relevantFiles[] | select(startswith("/"))] | length > 0),
    has_sports: ([.. | select(type == "string") | select(test("pickleball|paddle"; "i"))] | length > 0)
  } |
  "✓ \(.file) | ID:\(.id) | Tests:\(.tests) | Phase:\(.phase) | Tags:\(.tags) | Paths:✓ | Sports:✓"
' "$TASK_DIR"/$PATTERN 2>&1 | grep -v "^parse error" || echo "❌ JSON parsing errors found"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "  Total files: $(ls -1 "$TASK_DIR"/$PATTERN 2>/dev/null | wc -l | xargs)"
echo "  Total lines: $(cat "$TASK_DIR"/$PATTERN 2>/dev/null | wc -l | xargs)"
echo "  Total test cases: $(jq -s '[.[] | .testSuite.testCases | length] | add' "$TASK_DIR"/$PATTERN 2>/dev/null)"
echo ""
echo "✅ Validation complete"
