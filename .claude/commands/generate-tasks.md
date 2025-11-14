---
name: generate-tasks
description: Interactive task generation with human-in-the-loop feedback. Generate comprehensive task objects with separated test suites. Supports generating all tasks for a phase or a single task. Quality-focused with user review at each step.
---

# Interactive Task Generation

Generate high-quality task objects with separated test suites.

## Usage

```bash
/generate-tasks P2           # All Phase 2 tasks
/generate-tasks P3           # All Phase 3 tasks
/generate-tasks P2-PROF-T6   # Single task
```

## Process

1. **Validate Target** → Check against `docs/planning/PROJECT_PLAN.json`
2. **Check Existing** → Scan `tools/tracker/data/tasks/P{N}-*.json`
3. **Generate Task** → Create task object + test suites (20-25 tests each)
4. **Review with User** → Show summary, get approval
5. **Iterate** → Refine based on feedback
6. **Write Output** → Save to `tools/tracker/data/tasks/`

**Full workflow:** `docs/commands/README.md`
