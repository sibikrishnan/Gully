# AI Development Funnel - Artifact Definitions

**Version:** 1.1
**Status:** DRAFT - In Progress
**Last Updated:** 2025-11-10

---

## Purpose

This document defines the **4 core artifacts** in the AI-driven development funnel:

```
Idea → RefinedIDEA → TECH_SPEC → PROJECT_PLAN → TASK_OBJECTS
```

Each section will be filled in collaboratively to create world-class artifact specifications.

---

## 1. RefinedIDEA

**Stage:** Idea → RefinedIDEA
**Agent:** Refinement Agent
**Output Location:** `docs/planning/RefinedIDEA.md`
**Output Format:** Structured Markdown
**Size:** ~500-1500 lines
**Focus:** Product Vision & Requirements

### Definition
RefinedIDEA is a comprehensive product specification document that transforms raw ideas into structured requirements. It provides the Architect Agent with complete product context needed to make architectural decisions.

**Purpose:** Bridge between human vision and technical architecture
**Input:** Raw IDEA (freeform text, conversation, prompt)
**Output:** Structured markdown document with product vision, features, workflows, requirements, constraints

### Schema
**Location:** `backend/.claude/schemas/REFINED_IDEA_SCHEMA.md`
**Format:** Markdown with required/optional sections

**Required Sections:**
1. PROJECT OVERVIEW (vision, target users, value proposition)
2. CORE FEATURES (prioritized P0/P1/P2 with acceptance criteria)
3. USER WORKFLOWS (step-by-step user journeys)
4. NON-FUNCTIONAL REQUIREMENTS (performance, security, scalability, reliability)
5. CONSTRAINTS (budget, timeline, team, technical)
6. SUCCESS METRICS (technical, product, business)

**Optional Sections:**
7. USER STORIES (detailed as-a-user format)
8. EDGE CASES & NON-GOALS (explicit scope boundaries)
9. INTEGRATION REQUIREMENTS (external services)
10. REFERENCES & INSPIRATION (links, competitors)

**Unstructured Section:**
11. UNSTRUCTURED NOTES (freeform context, open questions, brainstorming)

### Agent Specification
**Status:** To be defined
**Next Step:** Define Refinement Agent prompt and instructions

---

## 2. TECH_SPEC

**Stage:** RefinedIDEA → TECH_SPEC
**Agent:** Architect Agent
**Output Location:** `docs/planning/TECH_SPEC.json`
**Output Format:** JSON
**Size:** ~200-400 lines (focused architectural blueprint)
**Focus:** Technical Architecture & Technology Decisions

### Definition
TECH_SPEC is a lightweight architectural blueprint that defines WHAT the system architecture is and WHY technology choices were made, without prescribing HOW to implement. It provides the PM Agent with architectural constraints and guidance for execution planning.

**Purpose:** Architectural mandate and constraint boundary (not implementation prescription)
**Input:** RefinedIDEA.md (product requirements)
**Output:** JSON document with system architecture, technology stack, data architecture, NFRs, development strategy

**Key Principle:** TECH_SPEC defines "WHAT architecture" - PM Agent defines "WHEN to build"

### Schema
**Location:** `backend/.claude/schemas/TECH_SPEC_SCHEMA.json`
**Format:** JSON Schema (strict validation)
**Example:** `backend/.claude/schemas/TECH_SPEC_EXAMPLE_GULLY.json`

**Required Fields:**
1. **systemArchitecture** (style, major components, communication patterns, deployment model)
2. **technologyStack** (backend, frontend, database, auth, testing, infrastructure, CI/CD)
3. **dataArchitecture** (approach, major entities, relationships, key patterns)
4. **nonFunctionalRequirements** (performance, security, quality, availability) - These become maturity gates
5. **developmentStrategy** (parallelization readiness, service isolation, testing strategy, critical path guidance)

**Optional Fields:**
6. **integrationPoints** (external systems and third-party services)
7. **constraints** (budget, timeline, team, technical)

**Unstructured Field:**
8. **unstructuredNotes** (architectural rationale, trade-offs, warnings, context for PM Agent)

### Agent Specification
**Status:** To be defined
**Next Step:** Define Architect Agent prompt and instructions

---

## 3. PROJECT_PLAN

**Stage:** TECH_SPEC → PROJECT_PLAN
**Agent:** PM Agent (Orchestrator)
**Output Location:** `docs/planning/PROJECT_PLAN.json`
**Output Format:** JSON
**Size:** Variable (depends on number of phases)
**Focus:** Execution Strategy & Phase Planning

### Definition
PROJECT_PLAN is the strategic execution plan created by PM Agent (the orchestrator). It analyzes TECH_SPEC to decide phase grouping based on critical path and dependencies, creates lightweight task skeletons for each phase, defines maturity gates combining NFRs with phase-specific checks, and provides parallelization guidance based on the maturity model (sequential → controlled → full parallel).

**Purpose:** Strategic execution roadmap for PM Agent to orchestrate Task Generation Agent and Task Execution Agents
**Input:** TECH_SPEC.json (architectural blueprint from Architect Agent)
**Output:** JSON document with phases, task skeletons, maturity gates, and execution strategy

**Key Principle:** PM Agent is the ORCHESTRATOR - Human/Claude only interacts with PM Agent, who controls all downstream agents

### Schema
**Location:** `backend/.claude/schemas/PROJECT_PLAN_SCHEMA.json`
**Format:** JSON Schema (strict validation)
**Example:** `backend/.claude/schemas/PROJECT_PLAN_EXAMPLE_GULLY.json`

**Required Fields:**
1. **projectContext** (tech spec reference, architecture summary, maturity model, tech stack)
2. **phases[]** (phaseId, phaseName, features, maturityLevel, dependencies, criticalPath, maturityGate, taskSkeletons[])
3. **executionStrategy** (recommended start phase, parallelization guidance, integration checkpoints, task generation strategy)

**Task Skeleton Structure (lightweight):**
- taskId, title, priority, feature, scope, requirements[], complexity, dependencies[], context{}
- PM Agent provides lightweight skeleton → Task Generation Agent fills comprehensive details

**Maturity Gate Structure:**
- nfrChecks (from TECH_SPEC: test coverage, performance, security)
- phaseSpecificChecks (phase exit criteria)
- integrationTestsPassing, buildSuccessful flags

**Unstructured Field:**
- **unstructuredNotes** (strategic context, risks, guidance for Task Generation/Execution agents)

### Agent Specification
**Status:** To be defined
**Next Step:** Define PM Agent prompt and orchestration instructions

---

## 4. TASK_OBJECTS

**Stage:** PROJECT_PLAN (Task Skeletons) → TASK_OBJECTS
**Agent:** Task Generation Agent (invoked by PM Agent)
**Output Location:** `backend/.claude/tasks/*.json`
**Output Format:** JSON
**Size:** 300-500 lines per task
**Focus:** Comprehensive Task Definitions with Test Suites

### Definition
TASK_OBJECTS are comprehensive, execution-ready task definitions generated by Task Generation Agent from lightweight task skeletons provided by PM Agent. Each TASK_OBJECT includes complete test suite specification (unit, integration, e2e, regression, performance tests), coverage requirements, success criteria, execution config, and relevant context files.

**Purpose:** Provide Task Execution Agents with complete specification for TDD-driven development
**Input:** Task Skeleton (from PROJECT_PLAN) + TECH_SPEC context
**Output:** Comprehensive JSON task with full test suite, coverage scenarios, edge cases, and execution instructions

**Key Principle:** Task Generation Agent converts lightweight skeleton → world-class comprehensive task

### Schema
**Location:** `backend/.claude/schemas/` (formalized separated architecture)
**Schemas:**
- `TASK_OBJECT_SCHEMA.json` - Minimal task with references (testSuiteRef, workflowRef)
- `TEST_SUITE_SCHEMA.json` - Separate test suite file structure
- `TASK_SYSTEM_DESIGN.md` - Complete architecture documentation

**Format:** JSON (separated architecture - task + test suite as separate files)
**Examples (Legacy Embedded Format):**
- `backend/.claude/tasks/P2-PROF-T1.json` (User Profile GET endpoint - embedded tests)
- `backend/.claude/tasks/P3-TEAM-T2.json` (Team Details GET endpoint - embedded tests)

**Note:** Existing P2/P3 tasks use embedded format. New tasks will use separated format.

**Required Fields:**
1. **id, version, changelog** (task metadata and version history)
2. **content, activeForm, description** (task summary and active status text)
3. **status, dependencies** (execution status and task dependencies)
4. **testSuite** (comprehensive test specification):
   - testCases[] (unit, integration, e2e, regression, performance)
   - coverageRequirements (90%+ for critical files)
   - successCriteria (all tests pass, no TS errors, build succeeds)
   - executionConfig (test order, parallelizable, stop on failure)
5. **workflow** (TDD workflow reference: `workflows/tdd.json`)
6. **context** (relevantFiles[], keyFindings[], previousAttempts[])
7. **metadata** (phase, feature, estimatedDuration, tags)

**Test Suite Structure:**
Each test case includes:
- id, category (unit/integration/e2e/regression/performance)
- description, required flag, priority
- testFile (path, status, testCount, estimatedDuration)
- coverage (targetFunctions[], scenarios[], edgeCases[])
- trust/skipConditions (for efficiency)
- dependsOn (test dependencies)

### Agent Specification
**Status:** ✅ **COMPLETED** (2025-11-10)
**Agent File:** `.claude/agents/task-generation-agent.md`
**Slash Command:** `.claude/commands/generate-tasks.md`

**Key Features:**
- Autonomous fire-and-forget operation (one phase at a time)
- Generates 20-25 test cases per task (30% unit, 40% integration, 20% edge, 10% e2e/security)
- Separated architecture (task + test suite as separate JSON files)
- Security tests mandatory (IDOR, SQL injection, XSS, auth bypass)
- File watch lists for selective test execution
- Interactive mode with human-in-loop feedback available via `/generate-tasks`

---

## Summary: Completed Artifacts

### ✅ Completed (2025-11-09 Session 1)
1. **RefinedIDEA Schema** - `backend/.claude/schemas/REFINED_IDEA_SCHEMA.md`
2. **TECH_SPEC Schema** - `backend/.claude/schemas/TECH_SPEC_SCHEMA.json`
3. **TECH_SPEC Example** - `backend/.claude/schemas/TECH_SPEC_EXAMPLE_GULLY.json`

### ✅ Completed (2025-11-09 Session 2)
4. **PROJECT_PLAN Schema** - `backend/.claude/schemas/PROJECT_PLAN_SCHEMA.json`
5. **PROJECT_PLAN Example** - `backend/.claude/schemas/PROJECT_PLAN_EXAMPLE_GULLY.json` (Phases 1-3)
6. **RefinedIDEA Example** - `docs/planning/RefinedIDEA.md` (Gully project, ~1200 lines)
7. **Agent Handoff Protocols** - `backend/.claude/AGENT_HANDOFF_PROTOCOLS.md`

### ✅ Completed (2025-11-10 Session 3 - Task Generation System)
8. **TASK_OBJECTS Schema Formalization** - Separated architecture schemas:
   - `backend/.claude/schemas/TASK_OBJECT_SCHEMA.json` (minimal task with references)
   - `backend/.claude/schemas/TEST_SUITE_SCHEMA.json` (separate test suite files)
   - `backend/.claude/schemas/TASK_SYSTEM_DESIGN.md` (architecture documentation)
9. **Task Generation Agent** - `.claude/agents/task-generation-agent.md` (autonomous, fire-and-forget)
10. **Task Generation Slash Command** - `.claude/commands/generate-tasks.md` (interactive, human-in-loop)

**Key Achievement:** Separated architecture implemented for future tasks (testSuiteRef instead of embedded). Existing P2/P3 tasks remain embedded (will refactor in future session).

### ⏳ Remaining Work
1. **Agent Specifications** - Define prompts/instructions for upstream agents:
   - Refinement Agent (IDEA → RefinedIDEA)
   - Architect Agent (RefinedIDEA → TECH_SPEC) - **Partially complete** (`.claude/agents/tech-spec-architect.md`)
   - PM Agent (TECH_SPEC → PROJECT_PLAN, orchestration logic)
   - Task Execution Agent (Executes TASK_OBJECTS with TDD workflow)
2. **Validation Gates** - Formal quality gate definitions (partially covered in AGENT_HANDOFF_PROTOCOLS)
3. **Agent Isolation Strategy** - Define sandbox/skill approach for agent specialization
4. **Refactor Existing Tasks** - Convert P2/P3 tasks from embedded to separated architecture (future session)

---

## Agent Architecture Summary

```
IDEA (raw freeform text)
    ↓
Refinement Agent
    ↓ outputs: RefinedIDEA.md (500-1500 lines, structured markdown)
    ↓
Architect Agent
    ↓ outputs: TECH_SPEC.json (200-400 lines, lightweight architectural blueprint)
    ↓
PM Agent (ORCHESTRATOR)
    ↓ outputs: PROJECT_PLAN.json (phases, task skeletons, maturity gates)
    ├──→ Task Generation Agent (per phase, on-demand)
    │    └──→ outputs: TASK_OBJECTS (P*-*-T*.json, 300-500 lines each)
    └──→ Task Execution Agents (fleet, sequential or parallel based on maturity)
         └──→ outputs: Implemented code, tests, documentation
```

**Key Decisions:**
- PM Agent = ORCHESTRATOR (Human/Claude only interacts with PM Agent)
- Maturity-driven parallelization: sequential → controlled (2-3 streams) → full parallel
- Task skeletons are lightweight (PM Agent) → comprehensive TASK_OBJECTS (Task Generation Agent)
- Maturity gates = TECH_SPEC NFRs + phase-specific exit criteria
- Feature-based development (no time constraints)

---

**Session Notes:**
- **2025-11-09 Session 1:** Completed RefinedIDEA and TECH_SPEC schemas. Established 5-stage funnel with clear agent responsibilities. Removed time-based constraints in favor of feature-based, maturity-driven development.
- **2025-11-09 Session 2:** Completed PROJECT_PLAN schema and example for Gully (Phases 1-3). Created comprehensive RefinedIDEA.md example transforming prompt01.md. Documented complete agent handoff protocols including error handling, maturity gate verification, and human-in-loop checkpoints. Clarified PM Agent as orchestrator controlling fleet of specialized agents.
- **2025-11-10 Session 3:** Formalized TASK_OBJECTS schemas with separated architecture (TASK_OBJECT_SCHEMA.json, TEST_SUITE_SCHEMA.json, TASK_SYSTEM_DESIGN.md). Created Task Generation Agent (autonomous) and /generate-tasks command (interactive). Aligned schemas to use testSuiteRef instead of embedded tests for future tasks. Existing P2/P3 tasks remain embedded format (refactor planned for future session).
