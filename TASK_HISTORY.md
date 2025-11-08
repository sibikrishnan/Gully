# Gully - Task History (Active Tasks Only)

**Purpose:** Track pending and active tasks for current work.

**For Completed Tasks:** See archives:
- Phase 1 (User Authentication): `docs/archives/tasks/PHASE1_TASKS.md`

**Task Status Types:**
- `⏳` - Pending (not started)
- `⏸️` - Paused (work started but interrupted)
- `✅` - Completed (moved to phase archives)

---

## 📋 Pending Tasks

### ⏳ Phase 2 Planning - Define User Profile CRUD Tasks

**Goal:** Plan and break down Phase 2 tasks into specific, actionable items.

**Phase 2 Scope** (from STATUS.md):
1. User profile CRUD operations (GET, PATCH, DELETE)
2. Sport preferences management
3. User search & discovery with pagination

**What Needs Planning:**
- Define specific task IDs (e.g., US-1, US-2, US-3)
- Break down into manageable chunks
- Specify endpoints, validation rules, test expectations
- Create commit message templates
- Identify files to create/modify

**Planning Approach:**
- Load context if needed (`/gullycontext mvp`, `/gullycontext database`)
- Review existing patterns from Phase 1
- Follow TDD approach (tests first)
- Maintain 90%+ coverage requirement

**Estimated Duration:** 30 min (planning only, no coding)

---

## ⏸️ Paused Tasks

None

---

## 📚 Quick Reference

### Session Startup Workflow
```bash
/gullystatus        # See current status (~500 tokens)
/gullycontinue      # Load next task (targeted read, ~200 tokens)
```

### After Completing a Task
1. Update STATUS.md with new "Last Completed" and "Next Task"
2. Move completed task from TASK_HISTORY.md to weekly archive (see archival format below)
3. Auto-commit changes (Claude handles this)

### Phase Review Process
1. Complete all phase tasks
2. Run Token Auditor agent (scan for context bloat)
3. **Context Integrity Check:** Review the phase commits and ask:
   - "Did Claude's responses seem confused, corrupted, or off-topic in any task?"
   - If YES: Identify which context sections were loaded (check commit messages)
   - Action: Flag those sections for optimization or splitting
4. Create phase review document
5. Archive completed tasks to `docs/archives/tasks/PHASEN_TASKS.md` (use archival format below)
6. Update STATUS.md for next phase

### Archival Format Rule (Locked: 2025-11-04)
All `PHASEN_TASKS.md` files MUST use YAML Frontmatter for structured metadata:

```yaml
---
phase: N
phase_name: "Feature Name"
start_date: YYYY-MM-DD
end_date: YYYY-MM-DD
status: complete
tasks_completed: X
total_duration_min: XXX
test_coverage: XX%
branch: feature/name
format_version: 2025-11-04
---

# Phase N - Completed Tasks Archive
[Human-readable content below]
```

**Why:** Enables programmatic queries (e.g., "Find all tasks that modified auth module in Phases 1-3") without parsing full Markdown. Format is locked to prevent ad-hoc archival that breaks future automation.

---

## 🎯 Token Optimization Principles

**Rule:** No frequently-read file should exceed 100 lines (~500 tokens)

**Files to Monitor:**
- TASK_HISTORY.md (this file) - Keep under 100 lines
- STATUS.md - Keep under 50 lines
- Weekly reviews - Archive after completion

**Enforcement:** Token Auditor agent runs during each weekly review

---

**Last Updated:** 2025-11-07
**Current Phase:** 2 (User Profiles)
**Active Tasks:** 1 pending (Phase 2 planning)
