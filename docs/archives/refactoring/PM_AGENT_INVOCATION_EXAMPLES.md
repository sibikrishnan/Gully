# PM Agent Invocation Examples

**Date:** 2025-11-11
**Purpose:** Document end-to-end flow for Human → PM Agent → Task Generation Agent

---

## Example 1: Generate First Task in Phase (Mode A - Single Task)

### Human Request
```
"Generate P2-PROF-T1"
```

### PM Agent Orchestrator Workflow

**Step 1: Read Project State**
```bash
# PM agent reads these files:
cat docs/planning/PROJECT_PLAN.json
cat tracker/data/PROJECT_STATUS.json
cat tracker/data/TASK_HISTORY.json
cat tracker/data/BUG_TRACKER.json
```

**Step 2: Extract P2-PROF-T1 from PROJECT_PLAN**
```json
{
  "P2-PROF-T1": {
    "feature": "GET /api/users/:id",
    "layers": ["repository", "controller", "route"],
    "complexity": "medium",
    "dependencies": ["Phase 1 Auth"]
  }
}
```

**Step 3: Calculate Test Budget (for T1 only)**
```
PM Agent calculates:

P2-PROF-T1 (GET with field-level access control):
  Repository: 25 tests (complex JOIN queries)
  Controller: 15 tests (access control logic)
  Route: 12 tests (auth middleware)
  Validation: 8 tests (edge cases)
  Total: 60 tests
```

**Step 4: Build PM Thoughts**
```
pmThoughts = "Phase 1 revealed users.id is INTEGER not UUID - verify schema
from migrations first. Previous tasks succeeded with separated architecture
(task 1KB, tests separate), saving 93% tokens. Phase 2 features need strong
access control - users can only modify own data. Allocate 60 tests for GET
endpoint (complex access control), 50 for PATCH (validation). Use
integration-style tests with real DB, avoid mocks. Add checkpoints at
10K/30K tokens. Quality over speed - building MVP correctly."
```

**Step 5: Invoke Task Generation Agent (ONE TASK)**
```
Use Task tool with subagent_type="task-generation-agent"

Prompt contains this JSON:

{
  "mode": "single-task",
  "taskId": "P2-PROF-T1",
  "phase": {
    "number": 2,
    "name": "User Profiles"
  },
  "taskSkeleton": {
    "id": "P2-PROF-T1",
    "feature": "GET /api/users/:id",
    "layers": ["repository", "controller", "route"],
    "complexity": "medium",
    "dependencies": ["Phase 1 Auth"]
  },
  "testBudget": {
    "total": 60,
    "repository": 25,
    "controller": 15,
    "route": 12,
    "validation": 8
  },
  "context": {
    "databaseSchema": {
      "validated": true,
      "source": "migrations/*.ts",
      "critical": {
        "users.id": "INTEGER (not UUID)",
        "users.status": "ENUM (not boolean)",
        "users.email": "VARCHAR(255) UNIQUE NOT NULL"
      }
    },
    "architecturePatterns": {
      "layered": true,
      "testingApproach": "integration-style-unit-tests",
      "mockingPolicy": "avoid-mocks"
    }
  },
  "pmThoughts": "[see above]"
}
```

**Step 6: Task Generation Agent Output (ONE TASK ONLY)**
```
Task Generation Agent creates P2-PROF-T1 folder only:

backend/.claude/tasks/
  └── P2-PROF-T1/
      ├── P2-PROF-T1.json (parent)
      ├── P2-PROF-T1.1-repo.json
      ├── P2-PROF-T1.2-controller.json
      ├── P2-PROF-T1.3-route.json
      └── tests/
          ├── P2-PROF-T1.1-repo-tests.json (25 tests)
          ├── P2-PROF-T1.2-controller-tests.json (15 tests)
          └── P2-PROF-T1.3-route-tests.json (20 tests)

Total: 1 parent task, 3 subtasks, 3 test suites, 60 test cases
Token Usage: ~25K tokens, 5-7 minutes
```

**Step 7: PM Agent Reviews Quality**
```
PM Agent validates P2-PROF-T1:
✅ 1 task generated
✅ Naming convention followed (P2-PROF-T1.1-repo)
✅ Test budget met (60 tests: 25+15+20)
✅ Separated architecture (testSuiteRef used)
✅ Dependencies declared correctly
✅ Workflows assigned (tdd.json)

Decision: PASS → Ready for execution
```

**Step 8: PM Agent Outputs to Human**
```markdown
✅ P2-PROF-T1 Generated!

📊 Summary
- 1 task created (P2-PROF-T1)
- 3 subtasks (repo, controller, route)
- 60 test cases (25 repo, 15 controller, 20 route)
- Saved to backend/.claude/tasks/P2-PROF-T1/

📁 Files Created
- P2-PROF-T1/P2-PROF-T1.json (parent)
- P2-PROF-T1/P2-PROF-T1.1-repo.json
- P2-PROF-T1/P2-PROF-T1.2-controller.json
- P2-PROF-T1/P2-PROF-T1.3-route.json
- P2-PROF-T1/tests/*.json (3 test suites)

⏱️ Token Usage: ~25K tokens, 5-7 minutes

🎯 Next Steps
1. Review generated task (inspect JSON files)
2. Say: "Execute P2-PROF-T1" to start implementation
3. After T1 complete, say: "Generate P2-PROF-T2"

Ready to implement P2-PROF-T1!
```

---

## Example 2: Regenerate Single Task (Mode B - Ad-hoc)

### Human Request
```
"Regenerate P2-PROF-T2 - the previous version had schema issues"
```

### PM Agent Orchestrator Workflow

**Step 1: Read Context**
```bash
# PM agent checks what went wrong
cat tracker/data/TASK_HISTORY.json  # See P2-PROF-T2 failed
cat tracker/data/BUG_TRACKER.json    # See bug: "Assumed UUID, was INTEGER"
```

**Step 2: Build Regeneration Context**
```json
{
  "mode": "adhoc-single",
  "taskId": "P2-PROF-T2",
  "layer": "all",
  "qualityFirst": true,
  "noTestBudgetConstraint": false,
  "dependencies": {
    "P2-PROF-T1": "✅ Complete - UserRepository.getUserWithSports()"
  },
  "context": {
    "databaseSchema": {
      "validated": true,
      "critical": {
        "users.id": "INTEGER (not UUID)",
        "users.status": "ENUM (not boolean)"
      }
    },
    "architecturePatterns": {
      "layered": true,
      "testingApproach": "integration-style-unit-tests"
    }
  },
  "pmThoughts": "Regenerating P2-PROF-T2 due to schema mismatch bug (BUG-004).
  Previous attempt assumed users.id was UUID but it's INTEGER. This caused 30K
  token waste. MUST verify schema from migrations FIRST (Phase 0 step).
  Previous task hit 95K tokens. Add checkpoint at 30K to catch issues early.
  Target 50 tests (20 repo + 15 controller + 15 route). Quality over speed."
}
```

**Step 3: Archive Old Version**
```bash
# Task Generation Agent moves old files
mv backend/.claude/tasks/P2-PROF-T2 \
   backend/.claude/tasks/archive/2025-11-11_P2-PROF-T2_schema_bug/
```

**Step 4: Generate Fresh Version**
```
Task Generation Agent creates new P2-PROF-T2/ with:
- Schema discovery Phase 0 step added
- Correct INTEGER types
- 50 tests (per budget)
- Checkpoints at 10K, 30K tokens
```

**Step 5: PM Agent Output**
```markdown
✅ P2-PROF-T2 Regenerated

**Changes from v1:**
- ✅ Schema validation added (Phase 0)
- ✅ users.id correctly typed as INTEGER
- ✅ Checkpoints added (10K, 30K)
- ✅ 50 tests (on budget)

**Old version archived:**
`backend/.claude/tasks/archive/2025-11-11_P2-PROF-T2_schema_bug/`

**Ready to execute:**
Say: "Execute P2-PROF-T2" to start with corrected version
```

---

## Example 3: Continue After Task Completion

### Human Request
```
"Continue project"
```

### PM Agent Orchestrator Workflow

**Step 1: Determine Next Task**
```bash
# Read current state
cat tracker/data/PROJECT_STATUS.json

# Shows:
{
  "currentPhase": { "id": "P2", "name": "User Profiles" },
  "currentTask": { "id": "P2-PROF-T2", "status": "pending" },
  "lastCompletedTask": "P2-PROF-T1"
}

# Decision: Execute P2-PROF-T2 (next in sequence)
```

**Step 2: Check if Task Exists**
```bash
ls backend/.claude/tasks/P2-PROF-T2/
# Found → Skip task generation, proceed to execution
```

**Step 3: Assign to Executor**
```markdown
📋 Next Task: P2-PROF-T2

**Task:** PATCH /api/users/:id - Update User Profile
**Subtasks:**
1. P2-PROF-T2.1-repo (20 tests)
2. P2-PROF-T2.2-controller (15 tests)
3. P2-PROF-T2.3-route (15 tests)

**Dependencies:** ✅ P2-PROF-T1 complete

**Execution Strategy:** Direct (medium complexity, 50 tests)

**Key Patterns:**
- Zod validation for PATCH body
- Partial updates (only modified fields)
- Field-level access control (users.id === req.user.id)

Ready to start P2-PROF-T2.1-repo?
```

---

## Example 4: Phase Completion

### Human Request
```
[P2-PROF-T5 just completed]
```

### PM Agent Orchestrator Workflow

**Step 1: Detect Phase Completion**
```bash
# All 5 tasks complete
cat tracker/data/PROJECT_STATUS.json
# shows: tasksComplete = 5, tasksTotal = 5
```

**Step 2: Generate Learning Summary**
```bash
# PM agent creates:
backend/.claude/phases/phase-2/PHASE_LEARNINGS_2.md

# Contains:
- Key insights (schema, architecture, token efficiency)
- Test budget analysis (planned vs actual)
- Common issues & solutions
- Recommendations for Phase 3
- Git commits (5 commits)
```

**Step 3: Update Tracker**
```json
// tracker/data/PROJECT_STATUS.json
{
  "currentPhase": { "id": "P2", "status": "complete" },
  "phaseTransitions": [
    {
      "fromPhase": "P2",
      "toPhase": "P3",
      "status": "pending_human_approval",
      "learningsDocPath": "backend/.claude/phases/phase-2/PHASE_LEARNINGS_2.md"
    }
  ]
}
```

**Step 4: Request Human Approval**
```markdown
# 🎉 Phase 2 Complete!

## Summary
- ✅ All 5 tasks completed
- ✅ 250/250 tests passing
- ✅ 92% code coverage
- ✅ All builds successful

## Phase Learnings
See: `backend/.claude/phases/phase-2/PHASE_LEARNINGS_2.md`

## Maturity Gate
**Pending:**
- [ ] Performance benchmarks
- [ ] Security tests

## Next Steps
1. Review learnings
2. Run: `npm run benchmark && npm run test:security`
3. Say: **"Start Phase 3"** (if gate passes)

⚠️ **PM AGENT STOPPED** - Awaiting approval
```

---

## Key Takeaways

1. **Mode A (Single Task):** PM agent invokes task-gen ONE TASK AT A TIME (~25K tokens, 5-7 min)
2. **Mode B (Ad-hoc):** PM agent invokes task-gen for single task regeneration
3. **pmThoughts:** Critical for passing learnings (schema, tokens, quality)
4. **Test Budget:** PM calculates, task-gen enforces
5. **Human Approval:** Required at phase boundaries, not during task generation
6. **Iterative Flow:** Generate T1 → Execute T1 → Generate T2 → Execute T2 → ...

---

**Last Updated:** 2025-11-11
**Status:** Ready for integration testing
