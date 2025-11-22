# Learning Skill

**Purpose:** Automated session condensing and pattern extraction after task completion.

---

## How It Works

### 1. After Completing Task

When you mark a task as "completed" in `TASK_TRACKER.csv`, the post-tracker-update hook will show:

```
🎓 Task completion detected - Learning capture needed!

   ⚡ RUN SKILL: learning

   This will:
   - Condense session → 150-line log
   - Extract critical patterns
   - Update learnings.md + context files
   - Archive old learnings if needed

   Duration: ~30-60 seconds | Cost: ~500-1,000 tokens

✅ Simply type the skill name 'learning' to invoke
```

### 2. Invoke the Skill

Type: `learning` (the skill name)

Claude will then:
1. Detect latest completed task from TASK_TRACKER.csv
2. Condense current session to 150-line format
3. Analyze patterns (critical vs domain-specific vs task-specific)
4. Update learnings.md in minimal format (4-5 lines per learning)
5. Update relevant context files (testing/, database/, workflow/)
6. Archive old learnings if learnings.md exceeds 200 lines
7. Report summary of what was captured

### 3. Review Changes

Check git diff to see what was updated:
- `docs/sessions/{TASK_ID}-session-log.md` (new file)
- `docs/context/learnings.md` (updated)
- `docs/context/{domain}/*.md` (updated if applicable)
- `docs/sessions/archives/phase{N}-learnings.md` (if archiving occurred)

### 4. Commit

Commit the learning capture:
```bash
git add -A
git commit -m "docs: capture learnings from {TASK_ID}"
```

---

## What Gets Captured

### Session Log (150 lines max)
- Execution sequence (phase by phase)
- Key learnings with code examples
- Token costs and efficiency metrics
- Files created/modified
- Improvement opportunities

### Critical Learnings (→ learnings.md)
- Token cost >2,000
- Prevents common mistakes
- Clear fix/prevention strategy
- Appears in multiple sessions

### Domain-Specific Patterns (→ context files)
- Testing patterns → `docs/context/testing/`
- Database patterns → `docs/context/database/`
- Workflow antipatterns → `docs/context/workflow/`

### Task-Specific Notes (→ session log only)
- One-off issues (token cost <500)
- Context-dependent fixes
- Low-impact learnings

---

## File Structure

```
.claude/skills/learning/
├── SKILL.md                    # Skill definition (YAML + instructions)
├── README.md                   # This file
├── condense-session.sh         # Helper script (future automation)
├── analyze-patterns.py         # Helper script (future automation)
└── update-learnings.sh         # Helper script (future automation)
```

**Current:** Claude performs all operations using native tools (Read, Write, Edit, Grep)
**Future:** Helper scripts can automate parts of the workflow

---

## Constraints

All enforced via `FILE_BUDGETS.json` + `pre-filewrite-tool-use.sh` hook:

- Session logs: 150 lines max (strict)
- learnings.md: 200 lines max (strict)
- testing/*.md: 150 lines max (warn)
- database/*.md: 200 lines max (warn)
- workflow/*.md: 150 lines max (warn)

If learnings.md exceeds 200 lines, skill will archive oldest phase learnings.

---

## Example Output

```
✅ Learning Capture Complete

📄 Session Log: docs/sessions/P2-PROF-T4.2-session-log.md (150 lines)

🔍 Patterns Extracted:
   - Critical: 2 (added to learnings.md)
   - Domain-specific: 1 (added to context/testing/)
   - Task-specific: 2 (kept in session log)

📚 Files Updated:
   - docs/context/learnings.md (+2 entries, now 115/200 lines)
   - docs/context/testing/jest-patterns.md (+1 pattern)
   - docs/context/workflow/antipatterns.md (+1 pattern)

💰 Token Savings Potential: ~6,000 tokens/task for similar work
```

---

## Token Cost

**Per Invocation:** ~500-1,000 tokens
**Savings Per Future Task:** ~2,000-6,000 tokens (if patterns prevent debugging cycles)

**ROI:** Pays for itself after 1-2 similar tasks
