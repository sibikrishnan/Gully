# Big-Bang Refactor Migration Notes

**Date:** 2025-11-11
**Branch:** phase2-prof-t1
**Type:** Structural refactoring (non-breaking for code, breaking for file paths)

---

## Summary

Executed comprehensive directory restructuring to solve CWD reset issues, file bloat, and establish clear separation between services, tools, documentation, and transient artifacts.

---

## Changes Made

### 1. Directory Restructure

#### **Services** (Application Components)
```
OLD: /backend/
NEW: /services/backend/

OLD: /frontend/
NEW: /services/frontend/
```

**Rationale:** Clear distinction between application services and internal dev tools.

#### **Tools** (Internal Developer Tools)
```
OLD: /tracker/
NEW: /tools/tracker/

UNCHANGED: /tools/tasks/ (already in correct location)
```

**Rationale:** Tracker is a dev tool for project management, not an application service.

#### **Logs** (Transient Session Artifacts) ⭐ NEW
```
/logs/
├── sessions/          # Session summaries, PM agent design notes
├── phases/            # Phase-specific learnings, postmortems, context summaries
│   └── phase-2/
├── tasks/             # Task execution logs (future)
└── artifacts/         # Brainstorm artifacts (FUNNEL.md, FUNNEL_ARTIFACTS.md)
```

**Moved Files:**
- `FUNNEL.md` → `logs/artifacts/`
- `FUNNEL_ARTIFACTS.md` → `logs/artifacts/`
- `services/backend/.claude/LEARNINGS_P2_PROF_T1.md` → `logs/phases/phase-2/`
- `services/backend/.claude/POST_MORTEM_P2_PROF_T1.md` → `logs/phases/phase-2/`
- `services/backend/.claude/SESSION_SUMMARY_PM_AGENT_DESIGN.md` → `logs/sessions/`
- `services/backend/.claude/NEXT_SESSION_TRACKING_REVAMP.md` → `logs/sessions/`
- `services/backend/.claude/REDESIGN_TODO.md` → `logs/artifacts/`

**Rationale:** Separate permanent documentation from transient session artifacts. `/logs` is the auto-cleanup target at end of phase.

#### **Trash** (Soft-Delete Staging) ⭐ NEW
```
/.trash/
└── README.md (usage guide)
```

**Rationale:** Safety net for deletions, 30-day retention before permanent removal.

---

### 2. Context Consolidation (Single Source of Truth)

#### **Problem Solved:** CWD Reset Error

**Before:**
```
/.claude/.claude.md (Global)
/backend/.claude/* (Backend-specific)
/tracker/.claude/settings.local.json (Tracker-specific)
```

This caused LLM confusion about project root.

**After:**
```
/.claude/.claude.md (SINGLE global context)
/CLAUDE.md (User overrides only)
```

#### **Claude Context Structure**
```
/.claude/
├── .claude.md              # Single auto-loaded context
├── context/                # LLM-optimized summaries (unchanged)
├── agents/                 # Specialized agents (updated paths)
│   ├── pm-agent-orchestrator.md
│   ├── pm-agent-initialize.md
│   ├── task-generation-agent.md
│   ├── tech-spec-architect.md
│   └── AGENT_HANDOFF_PROTOCOLS.md
├── commands/               # Custom slash commands (unchanged)
├── hooks/                  # Git hooks (unchanged)
├── schemas/                # ⭐ NEW - Moved from backend/.claude/schemas/
│   ├── TASK_OBJECT_SCHEMA.json
│   ├── TEST_SUITE_SCHEMA.json
│   ├── PROJECT_PLAN_SCHEMA.json
│   ├── TECH_SPEC_SCHEMA.json
│   └── ...
└── requirements/           # ⭐ NEW - Agent requirements
    └── TASK_GENERATION_AGENT_REQUIREMENTS.md
```

**Cleaned Up:**
- Deleted: `services/backend/.claude/` (except workflows)
- Kept: `services/backend/.claude/workflows/` (tdd.json, exploratory.json, test-after.json)

---

### 3. Task Storage Consolidation (Per Q2: Option A)

#### **Problem:** Task definitions scattered, growing number of tasks per phase

**Before:**
```
/backend/.claude/tasks/*.json (18 task files)
/backend/.claude/tasks/tests/*.json (6 test suites)
```

**After:**
```
/tools/tracker/data/tasks/*.json (18 task files)
/tools/tracker/data/tasks/tests/*.json (6 test suites)
/tools/tracker/data/tasks/archive/ (versioned history)
```

**Rationale:**
- Consolidates all tracking data in one location
- Tasks are growing artifacts (20-25 per phase)
- Tracker is the logical home for task definitions + execution state
- Maintains separated architecture (task objects ~250 tokens, test suites ~750 tokens)

---

### 4. Documentation Reorganization

#### **Renamed:**
```
OLD: /docs/parallel-development/
NEW: /docs/service-briefs/
```

**Rationale:** More accurate name for service implementation briefs.

---

## Path Reference Updates

### Files Updated:

1. **`.claude/.claude.md`**
   - `docs/parallel-development/INDEX.md` → `docs/service-briefs/INDEX.md`

2. **`.claude/agents/pm-agent-orchestrator.md`**
   - `backend/.claude/tasks/` → `tools/tracker/data/tasks/`
   - `backend/.claude/phases/` → `logs/phases/`
   - Added legacy file notes

3. **`.claude/agents/task-generation-agent.md`**
   - All `backend/.claude/tasks/` → `tools/tracker/data/tasks/`
   - All `backend/.claude/schemas/` → `.claude/schemas/`

4. **`.claude/agents/AGENT_HANDOFF_PROTOCOLS.md`**
   - All `backend/.claude/tasks/` → `tools/tracker/data/tasks/`
   - All `backend/.claude/schemas/` → `.claude/schemas/`

5. **`logs/artifacts/FUNNEL.md`**
   - All `backend/.claude/schemas/` → `.claude/schemas/`
   - All `backend/.claude/tasks/` → `tools/tracker/data/tasks/`
   - Updated workflow reference: `services/backend/.claude/workflows/tdd.json`

6. **`tools/tracker/README.md`**
   - Added comprehensive section on task storage
   - Documented separated architecture
   - Noted migration from backend/.claude/tasks/

---

## Validation Results

### Tests
```
✅ 168/169 tests passing
⚠️ 1 pre-existing failure: auth.routes.test.ts (file doesn't exist, consolidated into user.routes.ts)
```

### Build
```
⚠️ TypeScript error: knexfile.ts outside rootDir
```

**Note:** Both failures are pre-existing issues, not caused by refactoring.

### File Accessibility
```
✅ 18 task objects accessible at tools/tracker/data/tasks/
✅ 6 test suites accessible at tools/tracker/data/tasks/tests/
✅ Schemas accessible at .claude/schemas/
✅ Workflows accessible at services/backend/.claude/workflows/
```

---

## Breaking Changes

### For PM Agents

**Old Paths (Deprecated):**
```
backend/.claude/tasks/P{N}-*.json
backend/.claude/schemas/*.json
backend/.claude/STATUS.md
backend/.claude/TASK_HISTORY.md
```

**New Paths (Active):**
```
tools/tracker/data/tasks/P{N}-*.json
.claude/schemas/*.json
tools/tracker/data/PROJECT_STATUS.json
tools/tracker/data/TASK_HISTORY.json
```

**Migration:** All PM agents (`pm-agent-orchestrator`, `task-generation-agent`) have been updated to use new paths.

### For Slash Commands

**Updated:**
- `/gullycontext` - References updated in `.claude/.claude.md`
- `/generate-tasks` - Agent updated to use new task paths

**No changes needed:**
- `/gullystatus`, `/gullycontinue`, `/gullypause` (use relative paths or INDEX.md)

---

## Non-Breaking Changes

### Source Code
- ✅ All TypeScript source code uses relative imports
- ✅ package.json scripts unchanged
- ✅ tsconfig.json paths unchanged
- ✅ Test imports use relative paths

### Configuration Files
- ✅ docker-compose.yml (moved with backend to services/)
- ✅ .env.example (moved with backend to services/)
- ✅ jest.config.js (moved with backend to services/)

---

## File Count Summary

**Moved:** ~50+ files
**Deleted:** ~40+ redundant files from old backend/.claude
**Created:** 2 new directories (logs/, .trash/)
**Updated:** 8 documentation/configuration files with new paths

---

## Rationale for Design Decisions

### Q1: Keep Nested Backend Structure (Option A)
- Maintains current modular monolith pattern
- Minimizes refactoring of existing code
- Preserves service boundaries within backend

### Q2: Consolidate Tasks to Tracker (Option A)
- Tasks are growing artifacts (20-25 per phase, 300-500 lines each)
- Tracker is already the "project management home"
- Consolidates: PROJECT_STATUS + TASK_HISTORY + BUG_TRACKER + TASKS
- Single source of truth for project state

### Q3: Keep .claude/context Separate (Option B)
- LLM-optimized summaries vs human-friendly guides
- Token efficiency critical for agent performance
- Small acceptable duplication for major performance gains

### Q4: End of Phase Cleanup (Option A)
- Aligns with phase review workflow
- Keeps /logs lean and focused on active phase
- Clear trigger point for archival

### Q5: No Shared Code Yet (Option C)
- YAGNI - frontend is Week 3+, currently in Phase 2
- Defer decision until actual need arises
- Avoid premature abstraction

---

## Remaining Work (Deferred to Next Iteration)

### INDEX.md Updates
- Root /INDEX.md - Update with new structure
- docs/INDEX.md - Update service-briefs reference
- docs/service-briefs/INDEX.md - Verify after rename

**Reason for Deferral:** Per user approval, validate structure first before updating navigation indexes.

### Pre-Existing Issues to Fix (Separate Tasks)
1. Fix auth.routes.test.ts import (file consolidated into user.routes.ts)
2. Resolve knexfile.ts tsconfig issue (architectural decision needed)

---

## Enforcement Mechanism (Future)

**Subagent Enforcer** (To be designed after structure approval):
- On session start: Validate structure integrity
- On file create: Enforce naming conventions and placement rules
- On phase complete: Move logs to appropriate locations
- Weekly: Check for bloat in /docs and /logs

**Implementation options:**
- Git pre-commit hook
- Claude slash command (/structure-check)
- CI/CD validation
- Automated weekly subagent run

---

## Verification Commands

```bash
# Verify new structure
ls -la services/backend services/frontend tools/tracker tools/tasks logs/.trash

# Verify task files
ls tools/tracker/data/tasks/*.json | wc -l  # Should be 18
ls tools/tracker/data/tasks/tests/*.json | wc -l  # Should be 6

# Verify schemas
ls .claude/schemas/*.json

# Verify tests still pass
cd services/backend && npm test

# Verify build (with known pre-existing issue)
cd services/backend && npm run build
```

---

## Git Commit Strategy

**Commit Message Template:**
```
refactor: big-bang directory restructure for multi-service clarity

BREAKING CHANGE: Moved major directories to establish clear service/tool/log boundaries

- Move backend → services/backend
- Move frontend → services/frontend
- Move tracker → tools/tracker
- Create /logs for transient artifacts (sessions, phases, artifacts)
- Create /.trash for soft-delete staging
- Consolidate tasks: backend/.claude/tasks → tools/tracker/data/tasks
- Consolidate schemas: backend/.claude/schemas → .claude/schemas
- Consolidate context: Single .claude/ at root (no sub-.claude dirs)
- Rename: docs/parallel-development → docs/service-briefs

Updated path references in:
- .claude/.claude.md
- .claude/agents/*.md (3 files)
- logs/artifacts/FUNNEL.md
- tools/tracker/README.md

Solves:
- CWD reset errors (single .claude/ root)
- File bloat (logs/ as cleanup target)
- Task consolidation (all in tracker/data/tasks)
- Clear boundaries (services vs tools vs logs)

Tests: 168/169 passing (1 pre-existing failure)
Build: ⚠️ Known pre-existing tsconfig issue with knexfile.ts

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

**Last Updated:** 2025-11-11
**Next Review:** After INDEX.md updates and user validation
