# Agent Handoff Protocols

**Version:** 1.0
**Purpose:** Define communication contracts and handoff procedures between specialized agents in the AI development funnel.
**Last Updated:** 2025-11-09

---

## Overview: Agent Interaction Model

```
Human/Claude (Strategic Input)
    │
    ↓ (provides TECH_SPEC or directs PM Agent)
    │
PM AGENT (Orchestrator)
    │
    ├──→ invokes TASK GENERATION AGENT (per phase)
    │    └──→ outputs: TASK_OBJECTS (comprehensive task JSONs)
    │
    └──→ invokes TASK EXECUTION AGENTS (fleet of specialized agents)
         └──→ outputs: Implemented code, tests, documentation
```

**Key Principle:** Human/Claude ONLY interacts with PM Agent. PM Agent controls all downstream agents.

---

## Agent 1: Refinement Agent

### Responsibility
Transform raw IDEA (freeform text, conversation, prompt) into structured RefinedIDEA.md following schema.

### Input
- **Type:** IDEA (freeform text)
- **Format:** Any (conversation, document, bullet points, stream of consciousness)
- **Source:** Human or Claude (strategic planning session)
- **Location:** Provided directly in prompt or file reference

### Output
- **Type:** RefinedIDEA
- **Format:** Markdown (structured sections per schema)
- **Schema:** `.claude/schemas/REFINED_IDEA_SCHEMA.md`
- **Size:** 500-1500 lines
- **Location:** `docs/planning/RefinedIDEA.md`

### Handoff Protocol: IDEA → RefinedIDEA

**Step 1: Agent Invocation**
```
Human/Claude → Refinement Agent:
"Transform this IDEA into RefinedIDEA.md following the schema at .claude/schemas/REFINED_IDEA_SCHEMA.md"

Input: {raw_idea_text or file_reference}
Schema: .claude/schemas/REFINED_IDEA_SCHEMA.md
Example: docs/planning/RefinedIDEA.md (Gully example)
```

**Step 2: Agent Processing**
- Read and analyze raw IDEA
- Extract key information (project overview, features, workflows, NFRs, constraints)
- Ask clarifying questions if critical information is missing (interactive refinement)
- Structure information according to REFINED_IDEA_SCHEMA.md
- Fill required sections (1-6), optional sections (7-10) if data available
- Capture everything else in Unstructured Notes section (11)

**Step 3: Quality Gate (Self-Check)**
Before outputting, Refinement Agent verifies:
- ✅ All required sections (1-6) are present and non-empty
- ✅ Core features clearly prioritized (P0/P1/P2)
- ✅ At least 2 detailed user workflows documented
- ✅ Non-functional requirements specified (performance, security, scalability)
- ✅ All constraints documented (budget, timeline, team, technical)
- ✅ Success metrics are quantifiable
- ✅ Document is 500-1500 lines (comprehensive but not bloated)

**Step 4: Output Delivery**
```
Refinement Agent → Architect Agent:
"RefinedIDEA.md created at docs/planning/RefinedIDEA.md"

Output File: docs/planning/RefinedIDEA.md
Status: READY_FOR_ARCHITECT
Next Agent: Architect Agent
```

**Step 5: Handoff to Architect Agent**
Human/Claude reviews RefinedIDEA.md, approves, then invokes Architect Agent with RefinedIDEA.md as input.

---

## Agent 2: Architect Agent

### Responsibility
Analyze RefinedIDEA.md and create TECH_SPEC.json with architectural blueprint (WHAT architecture, not HOW to implement).

### Input
- **Type:** RefinedIDEA
- **Format:** Markdown (structured)
- **Schema:** `.claude/schemas/REFINED_IDEA_SCHEMA.md`
- **Location:** `docs/planning/RefinedIDEA.md`
- **Source:** Refinement Agent output

### Output
- **Type:** TECH_SPEC
- **Format:** JSON (strict schema)
- **Schema:** `.claude/schemas/TECH_SPEC_SCHEMA.json`
- **Size:** 200-400 lines (lightweight architectural blueprint)
- **Location:** `docs/planning/TECH_SPEC.json`

### Handoff Protocol: RefinedIDEA → TECH_SPEC

**Step 1: Agent Invocation**
```
Human/Claude → Architect Agent:
"Create TECH_SPEC.json from RefinedIDEA.md following the schema"

Input: docs/planning/RefinedIDEA.md
Schema: .claude/schemas/TECH_SPEC_SCHEMA.json
Example: .claude/schemas/TECH_SPEC_EXAMPLE_GULLY.json
```

**Step 2: Agent Processing**
- Read entire RefinedIDEA.md
- Focus on: Core Features, Non-Functional Requirements, Constraints, User Workflows
- Make architectural decisions:
  - System architecture style (monolith, modular-monolith, microservices, etc.)
  - Technology stack (backend, frontend, database, auth, testing)
  - Data architecture (relational, document, graph, hybrid)
  - Major components/services and dependencies
  - Communication patterns (REST, GraphQL, events, etc.)
- Define development strategy:
  - Parallelization readiness (sequential → controlled → full parallel)
  - Critical path guidance (what must be built first)
  - Service isolation approach
  - Testing strategy
- Translate RefinedIDEA NFRs into concrete technical requirements
- Capture architectural rationale in unstructuredNotes field

**Step 3: Quality Gate (Self-Check)**
Before outputting, Architect Agent verifies:
- ✅ All required fields present (systemArchitecture, technologyStack, dataArchitecture, NFRs, developmentStrategy)
- ✅ Major components have clear responsibilities and dependencies mapped
- ✅ Critical path components identified (criticalPath: true)
- ✅ NFRs are specific and measurable (not vague)
- ✅ Development strategy provides clear guidance for PM Agent
- ✅ Unstructured notes explain key architectural decisions and trade-offs
- ✅ TECH_SPEC is lightweight (200-400 lines, not overly prescriptive)

**Step 4: Output Delivery**
```
Architect Agent → PM Agent:
"TECH_SPEC.json created at docs/planning/TECH_SPEC.json"

Output File: docs/planning/TECH_SPEC.json
Status: READY_FOR_PM
Next Agent: PM Agent
```

**Step 5: Handoff to PM Agent**
Human/Claude reviews TECH_SPEC.json, approves, then invokes PM Agent with TECH_SPEC.json as input.

---

## Agent 3: PM Agent (Orchestrator)

### Responsibility
Analyze TECH_SPEC.json and create PROJECT_PLAN.json with execution strategy, phases, and task skeletons. Orchestrate Task Generation Agent and Task Execution Agents.

### Input
- **Type:** TECH_SPEC
- **Format:** JSON (strict schema)
- **Schema:** `.claude/schemas/TECH_SPEC_SCHEMA.json`
- **Location:** `docs/planning/TECH_SPEC.json`
- **Source:** Architect Agent output

### Output (Primary)
- **Type:** PROJECT_PLAN
- **Format:** JSON (strict schema)
- **Schema:** `.claude/schemas/PROJECT_PLAN_SCHEMA.json`
- **Size:** Variable (depends on number of phases)
- **Location:** `docs/planning/PROJECT_PLAN.json`

### Output (Secondary - Orchestration Actions)
- Invokes Task Generation Agent per phase (on-demand)
- Invokes Task Execution Agents for task execution (fleet management)
- Reports maturity gate status to Human/Claude
- Requests human approval before phase progression

### Handoff Protocol: TECH_SPEC → PROJECT_PLAN

**Step 1: Agent Invocation**
```
Human/Claude → PM Agent:
"Create PROJECT_PLAN.json from TECH_SPEC.json and orchestrate development"

Input: docs/planning/TECH_SPEC.json
Schema: .claude/schemas/PROJECT_PLAN_SCHEMA.json
Example: .claude/schemas/PROJECT_PLAN_EXAMPLE_GULLY.json
```

**Step 2: Agent Processing**
- Read TECH_SPEC.json in full
- Analyze system architecture and critical path
- Decide phase grouping based on:
  - Feature dependencies from TECH_SPEC
  - Critical path components (must be built first)
  - Maturity model (sequential → controlled → full parallel)
- For each phase, create:
  - Phase definition (phaseId, phaseName, features, maturityLevel)
  - Dependencies (which phases must complete first)
  - Maturity gate (NFRs from TECH_SPEC + phase-specific checks)
  - Task skeletons (lightweight, for Task Generation Agent)
- Define execution strategy:
  - Recommended start phase
  - Parallelization guidance (when it's safe to parallelize)
  - Integration checkpoints (when to verify cross-phase integration)
  - Task generation strategy (upfront vs on-demand)
- Capture strategic context in unstructuredNotes for downstream agents

**Step 3: Quality Gate (Self-Check)**
Before outputting, PM Agent verifies:
- ✅ All phases have clear dependencies (no circular dependencies)
- ✅ Critical path phases identified and sequenced correctly
- ✅ Maturity gates align with TECH_SPEC NFRs
- ✅ Task skeletons are lightweight (not overly detailed)
- ✅ Execution strategy provides clear parallelization guidance
- ✅ Integration checkpoints defined at logical boundaries

**Step 4: Output Delivery**
```
PM Agent → Human/Claude:
"PROJECT_PLAN.json created at docs/planning/PROJECT_PLAN.json"

Output File: docs/planning/PROJECT_PLAN.json
Status: READY_FOR_TASK_GENERATION
Recommended Action: "Generate tasks for Phase P1 to start development"
```

**Step 5: Orchestration Mode**
PM Agent now enters orchestration mode. Human/Claude can issue commands:
- "Generate tasks for Phase P1" → PM Agent invokes Task Generation Agent
- "Execute task P2-PROF-T1" → PM Agent invokes Task Execution Agent
- "Report maturity gate status for Phase P1" → PM Agent checks tests, coverage, criteria
- "Proceed to Phase P2" → PM Agent verifies P1 maturity gate, then generates P2 tasks

---

## Agent 4: Task Generation Agent

### Responsibility
Convert lightweight task skeleton from PROJECT_PLAN into comprehensive TASK_OBJECT with full test suite, coverage scenarios, and execution config.

### Input
- **Type:** Task Skeleton (from PROJECT_PLAN)
- **Format:** JSON object (lightweight)
- **Schema:** Subset of `.claude/schemas/PROJECT_PLAN_SCHEMA.json` (taskSkeletons field)
- **Source:** PM Agent (extracted from PROJECT_PLAN.json)
- **Context:** Full TECH_SPEC.json and phase context

### Output
- **Type:** TASK_OBJECT
- **Format:** JSON (comprehensive task definition)
- **Schema:** Existing task schema (see P2-PROF-T1.json, P3-TEAM-T2.json)
- **Size:** 300-500 lines per task
- **Location:** `tools/tracker/data/tasks/{taskId}.json`

### Handoff Protocol: Task Skeleton → TASK_OBJECT

**Step 1: Agent Invocation (by PM Agent)**
```
PM Agent → Task Generation Agent:
"Generate comprehensive TASK_OBJECT for task skeleton P2-PROF-T1"

Input:
{
  "taskSkeleton": {
    "taskId": "P2-PROF-T1",
    "title": "GET /api/users/:id - Retrieve User Profile",
    "priority": "critical",
    "feature": "User Profiles",
    "scope": "Implement user profile retrieval...",
    "requirements": [...],
    "complexity": "moderate",
    "dependencies": [],
    "context": {
      "architecturalGuidance": "modular-monolith...",
      "technologyStack": "Node.js + Express...",
      "testingApproach": "TDD with 90%+ coverage...",
      ...
    }
  },
  "techSpecRef": "docs/planning/TECH_SPEC.json",
  "phaseId": "P2",
  "phaseName": "User Profiles & Sports Preferences",
  "maturityLevel": "sequential"
}
```

**Step 2: Agent Processing**
- Read task skeleton and context
- Read TECH_SPEC.json for architectural context
- Generate comprehensive test suite:
  - Unit tests (controller, validation, repository)
  - Integration tests (auth, database, route)
  - E2E tests (complete flow)
  - Regression tests (ensure no breakage)
  - Performance tests (optional, for complex tasks)
- For each test case, define:
  - Test file path and structure
  - Coverage (target functions, scenarios, edge cases)
  - Test count and estimated duration
  - Trust/skip conditions
- Define coverage requirements (90%+ for critical files)
- Define success criteria (all tests pass, no TS errors, build succeeds)
- Define execution config (test order, parallelizable, stop on failure)
- Add relevant files to context
- Capture key findings and previous attempts

**Step 3: Quality Gate (Self-Check)**
Before outputting, Task Generation Agent verifies:
- ✅ All required fields present (id, content, description, status, dependencies, testSuite, workflow, context, metadata)
- ✅ Test suite includes unit, integration, e2e tests (minimum)
- ✅ Coverage scenarios are comprehensive (not just happy path)
- ✅ Edge cases identified and tested
- ✅ Success criteria align with TECH_SPEC NFRs (90% coverage, no errors, build succeeds)
- ✅ Dependencies mapped correctly from task skeleton
- ✅ Relevant files identified (controllers, routes, repos, schemas)

**Step 4: Output Delivery**
```
Task Generation Agent → PM Agent:
"TASK_OBJECT created for P2-PROF-T1"

Output File: tools/tracker/data/tasks/P2-PROF-T1.json
Status: READY_FOR_EXECUTION
Next Agent: Task Execution Agent (when PM Agent delegates)
```

**Step 5: PM Agent Updates Index**
PM Agent updates `tools/tracker/data/tasks/index.json` with new task entry:
```json
{
  "id": "P2-PROF-T1",
  "file": "P2-PROF-T1.json",
  "status": "pending",
  "priority": "critical",
  "title": "GET /api/users/:id - Retrieve User Profile",
  "phase": 2
}
```

---

## Agent 5: Task Execution Agent

### Responsibility
Execute TASK_OBJECT following TDD workflow. Write tests first, then implement code to pass tests. Achieve 90%+ coverage and all success criteria.

### Input
- **Type:** TASK_OBJECT
- **Format:** JSON (comprehensive task definition)
- **Location:** `tools/tracker/data/tasks/{taskId}.json`
- **Source:** Task Generation Agent output
- **Assigned By:** PM Agent

### Output
- **Type:** Implemented Code + Tests + Documentation
- **Format:** TypeScript files, test files, updated schemas
- **Locations:** Various (controllers, routes, repositories, tests, etc.)
- **Verification:** All tests pass, 90%+ coverage, build succeeds

### Handoff Protocol: TASK_OBJECT → Implemented Code

**Step 1: Agent Invocation (by PM Agent)**
```
PM Agent → Task Execution Agent:
"Execute task P2-PROF-T1 using TDD workflow"

Input: tools/tracker/data/tasks/P2-PROF-T1.json
Workflow: backend/.claude/workflows/tdd.json
Context Files: [list from task.context.relevantFiles]
```

**Step 2: Agent Processing (TDD Workflow)**
- Read TASK_OBJECT in full
- Read workflow definition (workflows/tdd.json)
- Read context files (existing code structure)
- Follow TDD workflow:
  1. **Red:** Write failing test for first scenario
  2. **Green:** Write minimal code to pass test
  3. **Refactor:** Improve code while keeping tests green
  4. Repeat for all test scenarios
- Execute tests in order (unit → integration → e2e → regression)
- Verify coverage meets 90%+ requirement
- Run build to ensure no TypeScript errors
- Run linting to ensure no linting errors

**Step 3: Quality Gate (Self-Check)**
Before marking complete, Task Execution Agent verifies:
- ✅ All tests pass (no failures, no skipped tests)
- ✅ Test coverage ≥90% for critical files
- ✅ No TypeScript errors (tsc --noEmit succeeds)
- ✅ No linting errors (eslint succeeds)
- ✅ Build succeeds (npm run build)
- ✅ All success criteria from TASK_OBJECT met
- ✅ Code follows project conventions (naming, structure, patterns)

**Step 4: Output Delivery**
```
Task Execution Agent → PM Agent:
"Task P2-PROF-T1 completed successfully"

Files Changed: [list of created/modified files]
Tests Added: [count and breakdown by category]
Coverage Achieved: 92% (target: 90%)
Status: COMPLETED
```

**Step 5: PM Agent Updates Status**
PM Agent updates `tools/tracker/data/tasks/index.json`:
```json
{
  "id": "P2-PROF-T1",
  "file": "P2-PROF-T1.json",
  "status": "completed",  // changed from "pending"
  "priority": "critical",
  "title": "GET /api/users/:id - Retrieve User Profile",
  "phase": 2
}
```

PM Agent also updates task file `tools/tracker/data/tasks/P2-PROF-T1.json`:
```json
{
  "status": "completed",  // changed from "pending"
  "context": {
    ...
    "previousAttempts": [
      {
        "timestamp": "2025-11-09T10:30:00Z",
        "result": "completed",
        "coverage": "92%",
        "testsAdded": 58,
        "filesChanged": [...],
        "agent": "task-execution-agent-001"
      }
    ]
  }
}
```

---

## Maturity Gate Verification Protocol

### When Maturity Gates Are Checked
PM Agent checks maturity gates at phase completion:
- All tasks in phase marked "completed"
- Human/Claude requests phase progression: "Proceed to Phase P2"

### Maturity Gate Verification Process

**Step 1: PM Agent Gathers Evidence**
```
PM Agent Actions:
1. Run full test suite for phase: npm test -- --coverage
2. Check TypeScript compilation: npx tsc --noEmit
3. Run build: npm run build
4. Check coverage report against target (90%+)
5. Run integration tests (cross-service if applicable)
6. Verify NFR checks (performance, security)
7. Review phase-specific checks from PROJECT_PLAN
```

**Step 2: PM Agent Reports Results**
```
PM Agent → Human/Claude:
"Phase P1 Maturity Gate Report"

✅ Test Coverage: 93% (target: 90%+)
✅ All Tests Passing: 127/127 passed
✅ TypeScript Errors: 0
✅ Build Status: SUCCESS
✅ NFR Checks:
   ✅ Performance: <100ms response time (measured: 87ms avg)
   ✅ Security: JWT working, bcrypt hashing verified, no vulnerabilities
✅ Phase-Specific Checks:
   ✅ User registration endpoint complete
   ✅ User login endpoint complete
   ✅ JWT token generation working
   ✅ Password reset flow implemented
   ✅ Auth middleware integration tests passing

Gate Status: PASSED ✅
Recommendation: Safe to proceed to Phase P2
```

**Step 3: Human/Claude Approval**
```
Human/Claude → PM Agent:
"Approved. Proceed to Phase P2."
```

**Step 4: PM Agent Progression**
```
PM Agent Actions:
1. Update maturityModel.currentLevel in PROJECT_PLAN.json
2. Generate tasks for Phase P2 (invoke Task Generation Agent)
3. Report: "Phase P2 tasks generated. Ready to begin development."
```

---

## Error Handling & Recovery Protocols

### Scenario 1: Task Execution Failure
**Trigger:** Task Execution Agent reports task failed (tests failing, coverage below 90%, build errors)

**Protocol:**
1. Task Execution Agent reports failure with detailed error log
2. PM Agent marks task status as "failed" in index.json
3. PM Agent logs attempt in task's previousAttempts array
4. PM Agent reports to Human/Claude: "Task P2-PROF-T1 failed. Review error log at [path]."
5. Human/Claude reviews error, provides guidance
6. PM Agent re-invokes Task Execution Agent with updated context
7. Maximum 3 retry attempts before escalating to human intervention

### Scenario 2: Maturity Gate Failure
**Trigger:** Phase maturity gate verification fails (coverage <90%, tests failing, NFR checks fail)

**Protocol:**
1. PM Agent reports gate failure with specific criteria that failed
2. PM Agent identifies which tasks need rework
3. PM Agent does NOT proceed to next phase (blocks progression)
4. PM Agent reports to Human/Claude: "Phase P1 maturity gate FAILED. Address [specific issues] before proceeding."
5. Human/Claude reviews and decides: fix in current phase or adjust gate criteria
6. PM Agent re-executes failed tasks or adjusts PROJECT_PLAN if criteria changed
7. PM Agent re-verifies maturity gate after fixes

### Scenario 3: Task Generation Agent Produces Incomplete TASK_OBJECT
**Trigger:** TASK_OBJECT missing required fields or test suite is inadequate

**Protocol:**
1. PM Agent validates TASK_OBJECT against schema
2. If validation fails, PM Agent reports to Task Generation Agent: "TASK_OBJECT invalid. Missing [fields]."
3. Task Generation Agent regenerates TASK_OBJECT
4. Maximum 2 retry attempts before escalating to human review
5. If persistent failure, Human/Claude reviews task skeleton and provides clarification

---

## Agent Communication Format Standards

### Standard Message Format (Agent-to-Agent)

```json
{
  "from": "agent_name",
  "to": "agent_name",
  "type": "request | response | report | error",
  "timestamp": "ISO 8601 timestamp",
  "payload": {
    "action": "specific action being requested/reported",
    "context": {
      "taskId": "optional",
      "phaseId": "optional",
      "files": ["array of relevant files"]
    },
    "data": {
      "specific data for the action"
    }
  },
  "status": "pending | in_progress | completed | failed"
}
```

### Example: PM Agent → Task Generation Agent

```json
{
  "from": "pm-agent",
  "to": "task-generation-agent",
  "type": "request",
  "timestamp": "2025-11-09T10:00:00Z",
  "payload": {
    "action": "generate_task",
    "context": {
      "phaseId": "P2",
      "phaseName": "User Profiles & Sports Preferences",
      "techSpecRef": "docs/planning/TECH_SPEC.json"
    },
    "data": {
      "taskSkeleton": {
        "taskId": "P2-PROF-T1",
        "title": "GET /api/users/:id - Retrieve User Profile",
        ...
      }
    }
  },
  "status": "pending"
}
```

### Example: Task Execution Agent → PM Agent (Success)

```json
{
  "from": "task-execution-agent-001",
  "to": "pm-agent",
  "type": "report",
  "timestamp": "2025-11-09T11:30:00Z",
  "payload": {
    "action": "task_completed",
    "context": {
      "taskId": "P2-PROF-T1",
      "phaseId": "P2"
    },
    "data": {
      "filesChanged": [
        "src/services/user-service/controllers/user.controller.ts",
        "tests/unit/user-profile-controller.test.ts",
        ...
      ],
      "testsAdded": 58,
      "coverage": "92%",
      "buildStatus": "SUCCESS",
      "allTestsPassed": true
    }
  },
  "status": "completed"
}
```

---

## Human-in-Loop Checkpoints

PM Agent MUST request human approval at these checkpoints:

1. **Before Proceeding to Next Phase**
   - After maturity gate verification passes
   - Await explicit approval: "Proceed to Phase P2"

2. **After Task Execution Failure (3+ retries)**
   - Escalate to human for debugging assistance
   - Provide full error context and previous attempts

3. **When Maturity Gate Fails**
   - Report specific failures and recommendations
   - Await decision: fix tasks or adjust criteria

4. **When Architectural Decisions Are Ambiguous**
   - If TECH_SPEC is unclear or contradictory
   - Request clarification before generating tasks

5. **When Resource Constraints Detected**
   - If test execution time exceeds reasonable limits (>10 min per task)
   - If build size exceeds thresholds
   - If dependencies introduce security vulnerabilities

---

## Summary: Complete Handoff Flow

```
1. IDEA (raw)
   ↓ [Human provides]

2. Refinement Agent
   ↓ [outputs RefinedIDEA.md]
   ↓ [Human reviews & approves]

3. Architect Agent
   ↓ [reads RefinedIDEA.md]
   ↓ [outputs TECH_SPEC.json]
   ↓ [Human reviews & approves]

4. PM Agent
   ↓ [reads TECH_SPEC.json]
   ↓ [outputs PROJECT_PLAN.json]
   ↓ [Human reviews & approves]
   ↓ [Human: "Generate tasks for Phase P1"]

5. PM Agent → Task Generation Agent (per task skeleton in P1)
   ↓ [outputs TASK_OBJECTS: P1-AUTH-T1.json, P1-AUTH-T2.json, ...]
   ↓ [PM Agent: "Phase P1 tasks ready"]
   ↓ [Human: "Execute Phase P1"]

6. PM Agent → Task Execution Agents (fleet, sequential or parallel)
   ↓ [Agent 1: Execute P1-AUTH-T1]
   ↓ [Agent 2: Execute P1-AUTH-T2]
   ↓ [...all P1 tasks complete]
   ↓ [PM Agent: "Phase P1 complete. Running maturity gate verification..."]

7. PM Agent → Maturity Gate Verification
   ↓ [Run tests, check coverage, verify NFRs]
   ↓ [Report: "Phase P1 maturity gate PASSED"]
   ↓ [Human: "Proceed to Phase P2"]

8. REPEAT Steps 5-7 for Phase P2, P3, ... until project complete
```

---

**END OF AGENT_HANDOFF_PROTOCOLS**
