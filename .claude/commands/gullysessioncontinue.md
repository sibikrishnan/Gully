---
description: Generate 50-line continuation prompt for next session and save to NEXT_SESSION.md
---

# Session Continuation Prompt

Generate a concise 50-line prompt for the next session to continue from current state.

## Usage

```bash
/gullysessioncontinue
```

---

## What This Does

Claude will:
1. Analyze current session state and progress
2. Read `tools/tracker/data/TASK_TRACKER.csv` to check task status
3. Generate a 50-line continuation prompt with:
   - Current task context (what was being worked on)
   - Progress made (files created/modified, tests passing)
   - Next steps (what to do next)
   - Critical context to load (relevant /gullycontext commands)
   - Blockers/issues to address
4. **Overwrite** `/Users/sibikrishnan/Documents/Gully/.claude/NEXT_SESSION.md`

---

## Output Format (50 lines max)

```markdown
# Session Continuation: [Task ID/Description]

## Current State
- Task: [P2-PROF-T4.X]
- Branch: [feature/P2-PROF-T4]
- Status: [in_progress/blocked/ready_for_testing]

## Progress Made
- ✅ [Completed items]
- ⏳ [In progress items]

## Next Steps
1. [Specific action 1]
2. [Specific action 2]
3. [Specific action 3]

## Context to Load
/gullycontext database/knex-patterns
/gullycontext [other relevant sections]

## Files Modified
- [file1]: [brief description]
- [file2]: [brief description]

## Blockers/Notes
- [Any issues or important context]
```

---

## When to Use

- ✅ End of work session (before closing)
- ✅ Before switching to different task
- ✅ After partial completion needing continuation
- ❌ Don't use if task fully complete (use /gullycondense instead)

---

**Note:** File is auto-loaded at next session startup (see `.claude.md`)
