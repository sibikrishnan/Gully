---
description: Analyze session log, extract patterns, and auto-update context files
---

# Analyze Session & Update Context

Analyze a session log file to extract patterns, learnings, and automatically update appropriate context files.

## Usage

```bash
/gullyanalyze {filename}
```

**Example:**
```bash
/gullyanalyze P2-PROF-T4.1-session-log.md
```

---

## What This Does

Claude will:
1. Read the session log from `docs/sessions/{filename}`
2. Extract key patterns, antipatterns, and learnings
3. Identify which context files need updates:
   - Database patterns → `docs/context/database/knex-patterns.md`
   - Testing patterns → `docs/context/testing/` (if created)
   - Repository patterns → `docs/context/database/repositories.md` (if needed)
   - Validation patterns → `docs/context/validation/` (if needed)
4. Update relevant context files with new patterns
5. Update `/gullycontext` command if new sections created
6. Append to `docs/context/learnings.md` with phase-specific learnings

---

## Decision Logic

**Pattern Categories:**
- Database portability issues → `database/knex-patterns.md`
- Test setup/isolation → `testing/patterns.md`
- Error handling → `database/knex-patterns.md` or service-specific
- Type safety → `learnings.md` (TypeScript-specific)
- Performance → `learnings.md` or new optimization file

**Auto-update Rules:**
- If pattern prevents >2,000 token debugging cycles → Add to context
- If pattern appears in multiple sessions → Elevate to context file
- If pattern is task-specific → Keep in learnings.md only

---

## Output

Claude will show:
- ✅ Patterns extracted (count)
- ✅ Files updated (list with line additions)
- ✅ /gullycontext command updated (if applicable)
- 📊 Estimated token savings for future tasks

---

## When to Use

- ✅ After running `/gullycondense` on completed task
- ✅ When reviewing historical session logs
- ✅ After major debugging sessions with lessons learned
- ❌ Don't use on incomplete/partial sessions
