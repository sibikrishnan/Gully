---
name: learning
description: Condense session and extract learnings after task completion. INVOKE after updating TASK_TRACKER.csv to "completed" status.
---

# Learning Skill

**Purpose:** Condense session, analyze patterns, and update learnings/context files.

## When to Invoke This Skill

**MANDATORY - Invoke this skill using `Skill` tool when:**
- After completing a task (when TASK_TRACKER.csv is updated with "completed")
- Before switching to next task or ending session

---

## Workflow

### 1. Detect Latest Completed Task

Read `tools/tracker/data/TASK_TRACKER.csv` and find the most recently completed task (latest "completed" entry).

Extract:
- Task ID (e.g., P2-PROF-T4.2)
- Task name
- Completion date

### 2. Condense Current Session

Create a 150-line session log in `docs/sessions/{TASK_ID}-session-log.md`:

**Format:**
```markdown
# {TASK_ID} Session Log - {Task Name}

**Task**: {Description}
**Start**: Token X | **End**: Token Y | **Used**: Z tokens | **Duration**: ~N min

---

## Execution Sequence

### Phase 1: {Name} (Tokens: X → Y)
1. **Tool** Action → Result
2. **Tool** Action → Result
...

### Phase 2: {Name} (Tokens: X → Y)
...

---

## Key Learnings

### 1. **Pattern Name** ⚠️ CRITICAL/PATTERN
**Problem**: What went wrong
**Wrong Approach**: What we tried first (with code example if relevant)
**Correct Approach**: What actually works (with code example)
**Why This Works**: Brief explanation
**Token Cost**: X tokens (N test runs + M edits)

### 2. **Pattern Name**
...

---

## Files Created/Modified
- file1 (N lines)
- file2 (M lines)

## Test Results
- Test suites: X passed
- Coverage: Y%

## Token Efficiency
- Context gathering: X tokens (Y%)
- Implementation: X tokens (Y%)
- Debugging: X tokens (Y%)
- Total: X tokens

## Improvement Opportunities
- For next task: specific actionable items
```

**Constraints:**
- Max 150 lines (strict - enforce via FILE_BUDGETS.json)
- Focus on execution sequence, learnings, token costs
- Include code examples ONLY for critical patterns (>2k token cost)

### 3. Analyze Patterns

Extract patterns from session log:

**Critical Patterns** (add to learnings.md):
- Token cost >2,000
- Prevents common mistakes
- Appears in multiple sessions
- Has clear fix/prevention strategy

**Domain-Specific Patterns** (add to context files):
- Database patterns → `docs/context/database/knex-patterns.md`
- Testing patterns → `docs/context/testing/jest-patterns.md`
- Validation patterns → `docs/context/validation/` (if exists)

**Task-Specific** (keep in session log only):
- One-off issues
- Context-dependent fixes
- Low token cost (<500)

### 4. Update learnings.md (Minimal Format)

Add 1-3 critical learnings to `docs/context/learnings.md`:

**Format (4-5 lines per learning):**
```markdown
### {Pattern Name} ⚠️ CRITICAL
**Issue:** One-line problem statement
**Fix:** One-line solution
**Cost:** ~X,XXX tokens (N runs + M edits)
**Details:** docs/sessions/{TASK_ID}-session-log.md:LINE_START-LINE_END
```

**Enforce Budget:**
- learnings.md must be <200 lines
- If over budget: Archive oldest phase learnings to `docs/sessions/archives/phase{N}-learnings.md`

### 5. Update Context Files

Based on pattern type:

**Testing patterns:**
- File: `docs/context/testing/jest-patterns.md`
- Add concise pattern (max 30 lines)
- Include minimal code example

**Database patterns:**
- File: `docs/context/database/knex-patterns.md`
- Add portability issues, query patterns

**Workflow antipatterns:**
- File: `docs/context/workflow/antipatterns.md`
- Add expensive mistakes to avoid

**Enforce Budgets:**
- testing/*.md: <150 lines (warn)
- database/*.md: <200 lines (warn)
- workflow/*.md: <150 lines (warn)

### 6. Archive Old Learnings (If Needed)

If `learnings.md` exceeds 200 lines:

1. Identify oldest phase learnings (e.g., Phase 1)
2. Move to `docs/sessions/archives/phase{N}-learnings.md`
3. Keep only current phase + 1 previous phase in learnings.md
4. Update archive reference links

### 7. Report Summary

Output:
```
✅ Learning Capture Complete

📄 Session Log: docs/sessions/{TASK_ID}-session-log.md (150 lines)

🔍 Patterns Extracted:
   - Critical: X (added to learnings.md)
   - Domain-specific: Y (added to context/)
   - Task-specific: Z (kept in session log)

📚 Files Updated:
   - docs/context/learnings.md (+X lines, now N/200)
   - docs/context/testing/jest-patterns.md (+Y lines)
   - docs/context/workflow/antipatterns.md (+Z lines)

💾 Archives:
   - Phase N learnings archived (if applicable)

💰 Token Savings Potential: ~X,XXX tokens/task for similar work
```

---

## Helper Scripts

This skill bundles helper scripts (if needed for future automation):

- `condense-session.sh` - Extract session data
- `analyze-patterns.py` - Pattern detection
- `update-learnings.sh` - File updates

Currently: Claude performs all operations using native tools (Read, Write, Edit, Grep, Bash).

---

## Constraints

- Session logs: 150 lines max (strict)
- learnings.md: 200 lines max (strict)
- Context files: varies by type (warn)
- All enforced via FILE_BUDGETS.json + pre-filewrite-tool-use.sh hook

---

## Example Usage

**User:** (after completing task) Run skill: `learning`

**Claude:**
1. Reads TASK_TRACKER.csv → finds P2-PROF-T4.3 completed
2. Condenses current session → creates session log (150 lines)
3. Analyzes patterns → extracts 2 critical, 1 domain-specific
4. Updates learnings.md (+2 entries, now 115/200 lines)
5. Updates docs/context/testing/jest-patterns.md (+1 pattern)
6. Reports summary

**Duration:** ~30-60 seconds
**Token Cost:** ~500-1,000 tokens
