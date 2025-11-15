# AI Development Funnel

**Version:** 1.0
**Last Updated:** 2025-11-10

---

## Overview

The AI Development Funnel is a systematic approach to transform raw ideas into production-ready code through specialized AI agents, each handling a specific stage of the software development lifecycle.

```
💡 IDEA
    ↓ Refinement Agent
📋 RefinedIDEA.md (Product Spec)
    ↓ Architect Agent
🏗️  TECH_SPEC.json (Architecture Blueprint)
    ↓ PM Agent (Orchestrator)
📊 PROJECT_PLAN.json (Execution Strategy)
    ↓ Task Generation Agent (per phase)
📝 TASK_OBJECTS (Implementation-Ready Tasks)
    ↓ Task Execution Agents (fleet)
✅ Production Code + Tests
```

---

## The 5 Stages

### Stage 1: IDEA → RefinedIDEA
**Agent:** Refinement Agent
**Input:** Raw freeform idea, conversation, prompt
**Output:** `docs/planning/RefinedIDEA.md` (~500-1500 lines)

Transforms unstructured product ideas into comprehensive product specification with:
- Project vision and target users
- Core features with acceptance criteria
- User workflows and journeys
- Non-functional requirements (performance, security, scalability)
- Constraints and success metrics

**Schema:** `backend/.claude/schemas/REFINED_IDEA_SCHEMA.md`

---

### Stage 2: RefinedIDEA → TECH_SPEC
**Agent:** Architect Agent (tech-spec-architect)
**Input:** `docs/planning/RefinedIDEA.md`
**Output:** `docs/planning/TECH_SPEC.json` (~200-400 lines)

Creates lightweight architectural blueprint defining:
- System architecture (monolith, microservices, serverless)
- Technology stack (backend, frontend, database, auth, infrastructure)
- Data architecture (entities, relationships, patterns)
- Non-functional requirements (converted to maturity gates)
- Development strategy (parallelization, testing, critical path)

**Key Principle:** Defines **WHAT** architecture, not **HOW** to implement.

**Schema:** `backend/.claude/schemas/TECH_SPEC_SCHEMA.json`
**Example:** `backend/.claude/schemas/TECH_SPEC_EXAMPLE_GULLY.json`
**Agent:** `.claude/agents/tech-spec-architect.md`

---

### Stage 3: TECH_SPEC → PROJECT_PLAN
**Agent:** PM Agent (Orchestrator) - *To be implemented*
**Input:** `docs/planning/TECH_SPEC.json`
**Output:** `docs/planning/PROJECT_PLAN.json` (variable size)

Strategic execution plan with:
- **Phases**: Feature groupings with maturity levels (sequential → controlled → full parallel)
- **Task Skeletons**: Lightweight task definitions (taskId, scope, requirements, dependencies)
- **Maturity Gates**: NFR checks + phase-specific exit criteria
- **Execution Strategy**: Parallelization guidance, integration checkpoints

**Key Principle:** PM Agent is the **ORCHESTRATOR** - controls all downstream agents.

**Schema:** `backend/.claude/schemas/PROJECT_PLAN_SCHEMA.json`
**Example:** `backend/.claude/schemas/PROJECT_PLAN_EXAMPLE_GULLY.json`

---

### Stage 4: Task Skeletons → TASK_OBJECTS
**Agent:** Task Generation Agent (invoked by PM Agent per phase)
**Input:** Task skeletons from PROJECT_PLAN
**Output:** `backend/.claude/tasks/*.json` (~300-500 lines per task)

Converts lightweight skeletons into comprehensive, implementation-ready tasks with:
- **Separated Architecture**:
  - Task object: `tasks/{id}.json` (minimal, with testSuiteRef and workflowRef)
  - Test suite: `tasks/tests/{id}-tests.json` (20-25 test cases)
- **Test Distribution**: 30% unit, 40% integration, 20% edge, 10% e2e/security
- **Security Tests**: Mandatory (IDOR, SQL injection, XSS, auth bypass)
- **File Watch Lists**: For selective test execution
- **Context Files**: Relevant files to read/modify

**Schemas:**
- `backend/.claude/schemas/TASK_OBJECT_SCHEMA.json` (minimal task with references)
- `backend/.claude/schemas/TEST_SUITE_SCHEMA.json` (separate test suite)
- `backend/.claude/schemas/TASK_SYSTEM_DESIGN.md` (architecture doc)

**Agents:**
- Autonomous: `.claude/agents/task-generation-agent.md` (fire-and-forget, one phase at a time)
- Interactive: `/generate-tasks` slash command (human-in-loop feedback)

---

### Stage 5: TASK_OBJECTS → Production Code
**Agent:** Task Execution Agent (fleet) - *To be implemented*
**Input:** TASK_OBJECTS from `backend/.claude/tasks/*.json`
**Output:** Production code, tests, documentation

Executes tasks following TDD workflow:
1. Read task object and test suite
2. Write tests first (red)
3. Implement code to pass tests (green)
4. Refactor for quality (maintain green)
5. Verify coverage, TypeScript compilation, build success

**Workflow:** `backend/.claude/workflows/tdd.json`

---

## Key Design Principles

### 1. Agent Specialization
Each agent has a **single responsibility**:
- Refinement Agent = Product thinking
- Architect Agent = Technical architecture
- PM Agent = Orchestration and planning
- Task Generation Agent = Comprehensive task specs
- Task Execution Agent = Code implementation

### 2. Separated Architecture (Tasks)
**Token Efficiency**: Load only what's needed
- Task object: ~250 tokens (just identity + references)
- Test suite: ~750 tokens (loaded separately when running tests)
- **93% reduction** vs embedded architecture

### 3. Maturity-Driven Parallelization
**Progressive Scale**: Start sequential, scale to parallel
- **Phase 1 (Sequential)**: Foundation, auth, database - learn patterns
- **Phase 2 (Controlled)**: 2-3 parallel streams - validate patterns
- **Phase 3+ (Full Parallel)**: Many parallel streams - mature codebase

### 4. Feature-Based (Not Time-Based)
**No artificial deadlines**: Focus on quality and maturity gates
- Phases defined by features, not weeks
- Progress measured by maturity gates passed
- Teams scale based on maturity, not timeline

### 5. PM Agent = Orchestrator
**Single point of control**: Human/Claude only interacts with PM Agent
- PM Agent invokes Task Generation Agent (per phase)
- PM Agent manages Task Execution Agent fleet
- PM Agent verifies maturity gates
- PM Agent handles errors and retries

---

## How to Use This Funnel

### Starting from Scratch
1. **Have an idea?** → Use Refinement Agent to create RefinedIDEA.md
2. **Have RefinedIDEA?** → Use tech-spec-architect agent to create TECH_SPEC.json
3. **Have TECH_SPEC?** → Use PM Agent to create PROJECT_PLAN.json *(to be implemented)*
4. **Have PROJECT_PLAN?** → Use Task Generation Agent to create TASK_OBJECTS
5. **Have TASK_OBJECTS?** → Use Task Execution Agent to implement *(to be implemented)*

### Starting from Gully (Current State)
- ✅ **RefinedIDEA.md** exists
- ✅ **TECH_SPEC.json** exists (implicit in codebase)
- ✅ **PROJECT_PLAN.json** exists (Phases 1-3)
- ✅ **TASK_OBJECTS** exist (P2-PROF-T*, P3-TEAM-T* with embedded tests)
- 🎯 **Next**: Implement Gully tasks or generate Phase 4 tasks

---

## Current Implementation Status

### ✅ Completed
- RefinedIDEA schema + example (Gully)
- TECH_SPEC schema + example (Gully)
- PROJECT_PLAN schema + example (Gully Phases 1-3)
- TASK_OBJECTS schemas (separated architecture)
- Task Generation Agent (autonomous + interactive)
- Architect Agent (tech-spec-architect)
- Agent Handoff Protocols

### ⏳ To Be Implemented
- Refinement Agent (IDEA → RefinedIDEA)
- PM Agent (TECH_SPEC → PROJECT_PLAN, orchestration)
- Task Execution Agent (TASK_OBJECTS → Code)
- Validation gates automation
- Refactor existing P2/P3 tasks to separated architecture

---

## References

**Complete Artifact Definitions:** See `FUNNEL_ARTIFACTS.md`
**Schemas:** `backend/.claude/schemas/`
**Agents:** `.claude/agents/`
**Tasks:** `backend/.claude/tasks/`
**Workflows:** `backend/.claude/workflows/`

---

**Philosophy:** Transform complexity into clarity through specialized agents, each expert in their domain, working together in a structured funnel.
