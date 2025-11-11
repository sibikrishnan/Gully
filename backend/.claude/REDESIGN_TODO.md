# Task System Redesign - Action Items

**Created:** 2025-11-10
**Priority:** CRITICAL
**Blocker:** All Phase 2 tasks blocked until complete

---

## Quick Summary

Previous session attempted P2-PROF-T1 and failed:
- 95K tokens consumed
- 0% task completion
- 8 test files created with wrong assumptions
- Schema misalignments (UUID vs Integer, is_active vs status)

**Root Cause:** Task generation system creates tasks that are too large, too rigid, and lack validation.

**Full Analysis:** See `POST_MORTEM_P2_PROF_T1.md`

---

## Redesign Checklist

### 1. Task Tier System ⬜
- [ ] Define MVP tier (20-30 tests)
- [ ] Define Production tier (50-70 tests)
- [ ] Define Critical tier (100+ tests)
- [ ] Update task generator to select tier
- [ ] Add tier to task object schema
- [ ] Create tier selection guide

**Goal:** P2-PROF-T1 should be MVP tier, not Production tier

### 2. Schema Discovery Phase ⬜
- [ ] Create schema discovery tool/script
- [ ] Add Phase 0 to all task workflows
- [ ] Define schema validation checklist
- [ ] Make Phase 0 REQUIRED (cannot skip)
- [ ] Output: schema-summary.json

**Actions in Phase 0:**
- Read all migrations in `src/shared/database/migrations/`
- Read type definitions in `src/shared/types/`
- Document: ID types, field names, relationships
- Validate against task assumptions

### 3. Incremental Workflow ⬜
- [ ] Replace rigid TDD with incremental approach
- [ ] Define "write 1, test 1, validate" pattern
- [ ] Create checkpoint gates
- [ ] Add "stop on failure" logic
- [ ] Build token budget tracking

**New Workflow:**
```
1. Schema Discovery (required)
2. Implement minimal → test minimal → validate
3. Expand implementation → expand tests → validate
4. Comprehensive tests (if needed)
```

### 4. Checkpoint System ⬜
- [ ] Define checkpoint thresholds (10K, 30K, 50K tokens)
- [ ] Add human validation prompts
- [ ] Create auto-exit on repeated failures
- [ ] Add progress reporting at checkpoints
- [ ] Build checkpoint metadata into tasks

**Checkpoints:**
- 10K: "Schema validated, proceeding?"
- 30K: "Implementation complete, tests passing?"
- 50K: "Major milestone - review progress"

### 5. Task Splitter ⬜
- [ ] Create task complexity analyzer
- [ ] Build auto-split logic (>40K tokens → split)
- [ ] Generate sub-task dependencies
- [ ] Create continuation task pattern
- [ ] Update task generator to use splitter

**Example:**
```
P2-PROF-T1 (74 tests, 90min)
↓ SPLIT INTO ↓
- P2-PROF-T1.1: Schema + Repository (10K tokens, 20min)
- P2-PROF-T1.2: Controller + Validation (12K tokens, 25min)
- P2-PROF-T1.3: Route + Integration (15K tokens, 30min)
```

### 6. Update Task Templates ⬜
- [ ] Revise TASK_OBJECT_SCHEMA.json
- [ ] Add tier field
- [ ] Add Phase 0 discovery
- [ ] Add checkpoint definitions
- [ ] Add maxTokens, maxFiles, maxTests constraints
- [ ] Update examples

### 7. Documentation ⬜
- [ ] Update TASK_SYSTEM_DESIGN.md
- [ ] Create TASK_TIER_GUIDE.md
- [ ] Create SCHEMA_DISCOVERY_GUIDE.md
- [ ] Update workflow documentation
- [ ] Add examples of good vs bad tasks

### 8. Validation Test ⬜
- [ ] Re-attempt P2-PROF-T1 with new system
- [ ] Measure: tokens used (<50K target)
- [ ] Measure: completion rate (100% target)
- [ ] Measure: tests passing (all)
- [ ] Compare metrics: old vs new

---

## Success Metrics

### Old System (P2-PROF-T1 attempt)
- ❌ Tokens: 95,000 (47.5% of budget)
- ❌ Completion: 0%
- ❌ Tests passing: 0
- ❌ Schema errors: 2
- ❌ Wasted tokens: ~50,000

### New System (Target)
- ✅ Tokens: <50,000 (25% of budget)
- ✅ Completion: 100%
- ✅ Tests passing: 100%
- ✅ Schema errors: 0
- ✅ Wasted tokens: <5,000

**Improvement:** 52% token efficiency, 100% completion rate

---

## File References

**Must Read:**
1. `POST_MORTEM_P2_PROF_T1.md` ← Detailed analysis
2. `TASK_SYSTEM_DESIGN.md` ← Current design
3. `tasks/P2-PROF-T1.json` ← Failed task example

**Schema Files (Should Have Read First):**
1. `src/shared/database/migrations/20251101000001_create_users.ts`
2. `src/shared/types/auth.types.ts`

**To Update:**
1. `schemas/TASK_OBJECT_SCHEMA.json`
2. `workflows/tdd.json`
3. Task generation agent prompts

---

## Implementation Order

### Phase 1: Design (1 session)
1. Read post-mortem thoroughly
2. Design task tier system
3. Design schema discovery process
4. Design checkpoint system
5. Sketch out new task structure

### Phase 2: Build (1 session)
1. Update schemas
2. Create schema discovery tool
3. Update workflow templates
4. Update task generator
5. Document new patterns

### Phase 3: Test (1 session)
1. Generate new P2-PROF-T1 tasks (split)
2. Execute P2-PROF-T1.1
3. Execute P2-PROF-T1.2
4. Execute P2-PROF-T1.3
5. Measure and compare

### Phase 4: Rollout (ongoing)
1. Apply to remaining Phase 2 tasks
2. Refine based on learnings
3. Document best practices
4. Update all task templates

---

## Quick Wins (Do First)

1. **Add maxTokens constraint** to all tasks
   - Quick: 5 min
   - Impact: Prevents runaway token usage

2. **Require schema discovery** in all workflows
   - Quick: 10 min
   - Impact: Prevents assumption failures

3. **Split P2-PROF-T1** into 3 sub-tasks manually
   - Quick: 15 min
   - Impact: Immediate validation of approach

4. **Add checkpoint at 30K tokens**
   - Quick: 5 min
   - Impact: Early human validation

---

## Questions to Answer

1. **How do we auto-detect task tier?**
   - Feature type? (CRUD = MVP, Auth = Critical)
   - Test count estimate?
   - User specification?

2. **What's the ideal task size?**
   - 20K tokens? 30K? 40K?
   - 30 min? 45 min? 60 min?

3. **When should we split vs abort?**
   - >40K estimate = auto-split?
   - >60K actual = abort and replan?

4. **How granular should checkpoints be?**
   - Every 10K tokens?
   - Every phase completion?
   - On first failure?

---

## Risk Mitigation

**Risk:** New system is too complex
- **Mitigation:** Start simple, iterate

**Risk:** Still generate oversized tasks
- **Mitigation:** Hard limits (maxTokens: 40000)

**Risk:** Schema discovery adds overhead
- **Mitigation:** Cache schema summaries

**Risk:** Too many checkpoints slow down flow
- **Mitigation:** Make checkpoints async (log, don't block)

---

## Copy-Paste for Next Session

```
Read backend/.claude/REDESIGN_TODO.md and POST_MORTEM_P2_PROF_T1.md

Task: Redesign the task generation system to fix the issues discovered in P2-PROF-T1 execution.

Focus areas:
1. Task tier system (MVP vs Production vs Critical)
2. Schema discovery phase (Phase 0, required)
3. Incremental workflow (replace rigid TDD)
4. Checkpoint system (human validation)
5. Task splitter (auto-split large tasks)

Goal: Re-attempt P2-PROF-T1 using new system and complete in <50K tokens.
```

---

## Status

- [x] Post-mortem analysis complete
- [x] Redesign checklist created
- [ ] Task tier system designed
- [ ] Schema discovery implemented
- [ ] Incremental workflow defined
- [ ] Checkpoint system built
- [ ] Task splitter created
- [ ] Templates updated
- [ ] Validation test executed

**Next Step:** Read post-mortem, design task tier system

