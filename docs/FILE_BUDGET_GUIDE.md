# File Budget Enforcement Guide

**Purpose**: Control documentation verbosity and reduce token costs across all Claude sessions

## Problem Statement

Claude was generating verbose documentation that:
- Loaded at every session startup (`.claude/*` files)
- Consumed excessive tokens (19k → 3.5k reduction achieved)
- Made sessions slower and more expensive
- Contained redundant examples and background context

## Solution

**Automated budget enforcement** via pre-write hook that validates all Write/Edit operations against defined limits.

## Budget Configuration

All budgets defined in: `.claude/FILE_BUDGETS.json`

### Enforcement Levels

| Level | Action | Files | Impact |
|-------|--------|-------|--------|
| `strict` | **BLOCK** write if over budget | `.claude/*` files | Prevents verbose files from loading every session |
| `warn` | **WARN** but allow write | `docs/*` files | Encourages optimization without blocking |
| `none` | No validation | `docs/archives/**` | Historical content, no active enforcement |

### Key Budget Limits

| File Pattern | Max Lines | Tokens | Enforce | Purpose |
|--------------|-----------|--------|---------|---------|
| `.claude/commands/*.md` | 30 | 90 | strict | Logic + brief help only |
| `.claude/agents/*.md` | 150 | 450 | strict | Operational instructions only |
| `.claude/skills/*.md` | 100 | 300 | strict | Validation logic only |
| `.claude/hooks/*.md` | 50 | 150 | strict | Hook logic only |
| `.claude/CLAUDE.md` | 200 | 600 | strict | Core project context |
| `docs/sessions/*.md` | 50 | 150 | strict | Condensed session logs |
| `docs/context/**/*.md` | 200 | 600 | warn | On-demand context sections |
| `docs/guides/*.md` | 300 | 900 | warn | User-facing documentation |
| `docs/planning/*.md` | 400 | 1200 | warn | Planning documents |

## How It Works

### Pre-Write Validation Hook

Location: `.claude/hooks/pre-tool-use.sh`

**Workflow**:
1. Intercepts all `Write` and `Edit` tool calls
2. Extracts file path and content
3. Matches path against budget patterns in `FILE_BUDGETS.json`
4. Counts lines in content (1 line ≈ 3 tokens)
5. Checks enforcement level:
   - **strict**: Exit code 1 (block) if over budget
   - **warn**: Show warning, allow write
   - **none**: No validation
6. Provides detailed error messages with condensing strategies

### Example Outputs

**✅ Success (Within Budget)**:
```
✅ Validation passed: .claude/commands/foo.md (25 lines)
```

**❌ Strict Violation (Blocked)**:
```
❌ BUDGET VIOLATION (STRICT): File exceeds budget - WRITE BLOCKED
   File: .claude/commands/generate-tasks.md
   Current: 45 lines (~135 tokens)
   Limit: 30 lines (~90 tokens)
   Overage: +15 lines (+45 tokens)
   Purpose: Slash commands - logic + brief help (NO examples, NO verbose docs)

   SOLUTION: Condense content or move details to docs/
   Budget file: .claude/FILE_BUDGETS.json
```

**⚠️ Warning (Allowed)**:
```
⚠️ BUDGET WARNING: File exceeds recommended limit
   File: docs/guides/WORKFLOW_GUIDE.md
   Current: 350 lines (~1050 tokens)
   Limit: 300 lines (~900 tokens)
   Overage: +50 lines (+150 tokens)
   Purpose: User-facing guides and tutorials

   Write ALLOWED but consider condensing for better performance.
```

## Condensing Strategies

### Commands (`.claude/commands/*.md`)

**Remove**:
- Examples (move to `docs/commands/`)
- Verbose help text
- Background context
- Comments

**Keep**:
- Executable logic only
- 1-line description
- Critical parameters

**Example**:
```markdown
<!-- BEFORE (45 lines) -->
# Generate Tasks Command

This command generates comprehensive task objects...
[15 lines of background]

## Examples
[20 lines of examples]

## Usage
[10 lines of detailed usage]

<!-- AFTER (25 lines) -->
# Generate Tasks

Generate task objects with separated test suites from PROJECT_PLAN.json skeletons.

[Executable logic only - 22 lines]
```

### Agents (`.claude/agents/*.md`)

**Remove**:
- Background/context (move to `docs/agents/`)
- Extended documentation
- Examples (link to docs instead)

**Keep**:
- Operational instructions only
- Tool access lists
- Critical workflow steps

### Sessions (`docs/sessions/*.md`)

**Use `/gullycondense` command**:
- Auto-compresses session to 50 lines
- Extracts patterns to context files
- Moves detailed logs to `docs/archives/`

### Context (`docs/context/**/*.md`)

**Strategies**:
- Use tables instead of prose
- Compress examples to minimal forms
- Link to detailed docs instead of embedding
- Remove redundant explanations

## Pattern Matching

Budget patterns use glob syntax with priority matching:

**Priority** (most specific wins):
1. Exact file path: `docs/sessions/NEXT_SESSION.md`
2. Specific glob: `.claude/commands/*.md`
3. Wildcard glob: `docs/context/**/*.md`
4. Parent directory: `docs/*.md`

**Glob Conversion**:
- `**` → matches any characters including `/`
- `*` → matches any characters except `/`

## Cost Impact

**Before optimization**: ~19,000 tokens loaded per session
**After optimization**: ~3,500 tokens loaded per session
**Reduction**: 82% (saves ~15,500 tokens per session)

**Cost calculation**:
- 1,000 lines ≈ 3,000 tokens
- If 100 sessions/month: 1.55M tokens saved/month
- Faster session startup + lower costs

## Emergency Bypass

**RARE USE ONLY**: If hook blocks critical operation:

```bash
CLAUDE_HOOK_BYPASS=1 claude
```

This disables ALL hook validation. Use only when:
- Emergency fixes required
- Budget config needs updating
- Testing hook modifications

## Maintenance

### Adding New File Types

Edit `.claude/FILE_BUDGETS.json`:

```json
{
  "budgets": {
    "new/pattern/*.md": {
      "max_lines": 100,
      "purpose": "Clear description of purpose",
      "tokens": 300,
      "enforce": "strict|warn|none"
    }
  }
}
```

### Adjusting Budgets

1. Identify files consistently hitting limits
2. Analyze if content can be condensed
3. If truly necessary, increase budget in `FILE_BUDGETS.json`
4. Document reason in `purpose` field

### Monitoring

Check current usage:
```bash
# Count lines in .claude files
find .claude -name "*.md" -exec wc -l {} + | sort -n

# Estimate token usage
find .claude -name "*.md" -exec wc -l {} + | awk '{sum+=$1} END {print sum*3 " tokens"}'
```

## Integration with Workflows

### During Development

1. **Before writing** any `.claude/*` or `docs/*` file:
   - Check `.claude/FILE_BUDGETS.json` for applicable limit
   - Draft content within budget
   - If over budget, apply condensing strategies

2. **If write is blocked**:
   - Review error message for current usage
   - Apply suggested condensing strategies
   - Move verbose content to `docs/` if needed

3. **For session logs**:
   - Always use `/gullycondense` at session end
   - Never manually write verbose session logs
   - Keep to 50-line limit

### Best Practices

✅ **DO**:
- Keep `.claude/*` files minimal (load every session)
- Move examples to `docs/` (on-demand)
- Use tables for compact information
- Link to detailed docs instead of embedding
- Run `/gullycondense` for session logs

❌ **DON'T**:
- Write verbose examples in `.claude/commands/`
- Include background context in `.claude/agents/`
- Create manual session logs (use `/gullycondense`)
- Bypass hooks without valid reason
- Ignore budget warnings (they indicate bloat)

## Troubleshooting

### "Budget file not found"

**Cause**: `.claude/FILE_BUDGETS.json` missing or moved
**Solution**: Restore from git or recreate using this guide

### "No budget pattern matched"

**Cause**: Writing to file path not covered by any budget pattern
**Solution**: Add pattern to `FILE_BUDGETS.json` or warning is informational only

### "jq command not found"

**Cause**: Hook requires `jq` for JSON parsing
**Solution**: `brew install jq` (macOS) or `apt-get install jq` (Linux)

### Hook not triggering

**Cause**: Hook not registered in `.claude/settings.local.json`
**Solution**: Verify `PreToolUse` hook is configured:
```json
{
  "hooks": {
    "PreToolUse": [{
      "hooks": [{"type": "command", "command": ".claude/hooks/pre-tool-use.sh"}]
    }]
  }
}
```

## See Also

- `.claude/FILE_BUDGETS.json` - Complete budget configuration
- `.claude/hooks/pre-tool-use.sh` - Enforcement hook implementation
- `.claude/skills/budget-checker.md` - Budget validation skill
- `CLAUDE.md` - File budget enforcement quick reference
