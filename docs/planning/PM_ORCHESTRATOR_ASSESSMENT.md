# PM Orchestrator & Task Executor Assessment

## 🎯 Objective
Review and enhance the PM agent system to ensure intelligent model selection, curated context delivery, and proper CSV tracker updates.

## 📋 Assessment Checklist

### 1. PM Orchestrator Agent Review

**File to Review:** `.claude/agents/pm-agent-orchestrator.md`

**Required Capabilities:**
- [ ] Reads `TASK_TRACKER.csv` to find next pending task
- [ ] Extracts task details (parent_id, subtask_file) from CSV
- [ ] Loads task JSON from `tools/tracker/data/tasks/{parent_id}/{subtask_file}`
- [ ] Curates focused context for the specific task (not entire project)
- [ ] Makes intelligent model selection:
  - Haiku: Simple CRUD, straightforward implementations, single-file changes
  - Sonnet: Complex logic, multi-file refactoring, architectural decisions
  - Opus: Critical systems, security-sensitive code, major architectural changes
- [ ] Invokes task-executor-agent with:
  - Selected model
  - Curated context (task JSON, relevant schemas, dependencies)
  - Clear success criteria
- [ ] Receives completion report from task-executor
- [ ] Updates `TASK_TRACKER.csv` with:
  - `status=completed`
  - `completed=YYYY-MM-DD`
  - `test_count=N`
  - `notes=brief summary`
- [ ] Updates phase summary file (`tools/tracker/data/status/P{X}.json`) if phase completed
- [ ] Commits CSV updates

**Context Curation Strategy:**
- Task JSON file (full workflow, phases, checkpoints)
- Database schema (only relevant tables for the task)
- Dependent service interfaces (if task crosses service boundaries)
- Previous subtask outputs (if sequential dependency exists)
- Test patterns from phase learnings (TDD approach examples)

**Model Selection Logic:**
```
IF task involves:
  - Single controller/route/repository file
  - Clear acceptance criteria
  - < 25 tests
  - No architectural changes
→ USE Haiku (cost-effective, fast)

ELSE IF task involves:
  - Multiple service coordination
  - Complex authorization logic
  - New patterns/abstractions
  - 25-50 tests
→ USE Sonnet (balanced capability)

ELSE:
  - Security-critical (auth, payments)
  - > 50 tests
  - Major refactoring
→ USE Opus (maximum capability)
```

### 2. Task Executor Agent Creation

**File to Create:** `.claude/agents/task-executor-agent.md`

**Required Capabilities:**
- [ ] Receives curated context from PM orchestrator
- [ ] Loads task JSON and follows workflow phases sequentially
- [ ] Implements TDD approach (tests first, then implementation)
- [ ] Respects checkpoints (token limits, human review gates)
- [ ] Runs tests after each phase
- [ ] Reports back to PM orchestrator with:
  - Completion status (success/blocked/failed)
  - Test count and coverage
  - Files modified
  - Execution summary
  - Token usage
  - Any blockers encountered
- [ ] Does NOT update TASK_TRACKER.csv (PM orchestrator does this)

**Execution Protocol:**
1. Parse task JSON workflow
2. For each phase in workflow:
   - State the phase goal
   - Implement changes (TDD: tests → code → verify)
   - Run tests
   - Check checkpoint requirements
   - If askHuman=true at checkpoint, pause and report
3. Generate completion report
4. Return report to PM orchestrator

### 3. Integration Validation

**Test Scenario:**
1. Set P2-PROF-T2.2 status to pending in CSV
2. Invoke pm-agent-orchestrator
3. Verify it:
   - Reads CSV correctly
   - Loads P2-PROF-T2.2-controller.json
   - Selects Haiku (simple controller task)
   - Curates context (user schema, T2.1 repository, validation patterns)
   - Spawns task-executor-agent
4. Task executor completes work
5. Verify pm-orchestrator:
   - Updates CSV with completed status
   - Commits CSV changes
   - Reports summary

## 🔍 Questions to Answer

1. **Context Efficiency:**
   - How does PM orchestrator decide which context files to load?
   - Is there a token budget for context curation?
   - Should context include full files or summaries?

2. **Error Handling:**
   - What if task-executor fails tests?
   - Should PM orchestrator retry with different model?
   - How to handle partial completions?

3. **Human-in-the-Loop:**
   - When task has `askHuman=true` checkpoint, who handles it?
   - Does task-executor pause and report, or does PM orchestrator intervene?

4. **Handoff Protocol:**
   - What's the exact format of completion report from task-executor?
   - Does PM orchestrator validate the report before updating CSV?

## 📝 Deliverables

1. **Updated:** `.claude/agents/pm-agent-orchestrator.md`
   - Add model selection logic
   - Add context curation strategy
   - Add CSV update protocol
   - Add phase completion detection

2. **Created:** `.claude/agents/task-executor-agent.md`
   - Agent prompt for autonomous task execution
   - Checkpoint handling
   - Completion report format
   - TDD workflow enforcement

3. **Updated:** `.claude/.claude.md` (if needed)
   - Document when to use PM agents vs manual work
   - Clarify agent invocation workflow

## 🚀 Next Session Prompt

```
I need to assess and enhance the PM orchestrator system. Please:

1. Read: docs/planning/PM_ORCHESTRATOR_ASSESSMENT.md
2. Review: .claude/agents/pm-agent-orchestrator.md against checklist
3. Identify gaps in current implementation
4. Create: .claude/agents/task-executor-agent.md with full prompt
5. Update pm-agent-orchestrator.md with:
   - Model selection logic
   - Context curation strategy
   - CSV update protocol
6. Test the integration with P2-PROF-T2.2 as pilot task

Focus on: intelligent model selection, minimal context delivery, and proper tracker updates.
```

---

**Created:** 2025-11-14
**Purpose:** Guide next session to build production-ready PM agent system
