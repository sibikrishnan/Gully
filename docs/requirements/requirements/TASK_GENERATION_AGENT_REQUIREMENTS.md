# Task Generation Agent Requirements & Learnings

**Date**: 2025-11-11
**Context**: Session 2 learnings from P2-PROF-T1 execution
**Purpose**: Document requirements for task-generation-agent to inform PM agent design

---

## Executive Summary

The task-generation-agent needs **structured input** from a PM agent to generate world-class tasks. Current manual invocation works but lacks consistency. Key insight: **The PM agent is the orchestrator that provides curated context.**

---

## Core Requirements for task-generation-agent

### 1. Two Operating Modes

#### Mode A: Full Phase Generation (PM-driven)
**Trigger**: PM agent invokes for entire phase
**Input**: Structured JSON with phase skeleton, test budget, dependencies
**Output**: All subtasks for phase with correct test allocation
**Constraint**: Strict test budget enforcement

#### Mode B: Ad-hoc Single Task (Human-driven)
**Trigger**: Human asks to regenerate/review specific task
**Input**: Task ID, dependencies, quality-first guidance
**Output**: Single high-quality task with comprehensive tests
**Constraint**: No test budget limit, quality-first

### 2. Essential Context Requirements

The task-generation-agent must receive:

1. **Database Schema** (validated from migrations)
   - Field types (INTEGER vs UUID, ENUM vs boolean)
   - Table relationships (JOINs, foreign keys)
   - Constraints and indexes
   - **Critical**: Must read migrations FIRST (Phase 0)

2. **Architecture Patterns**
   - Layered architecture (repo → controller → route)
   - Testing approach (integration-style unit tests)
   - Mocking policy (avoid mocks, use real DB)
   - Naming conventions (files, tests, IDs)

3. **Test Budget Allocation** (Mode A only)
   - Total tests for phase
   - Per-feature breakdown
   - Per-layer allocation with rationale
   - Example: Repository 25 tests, Controller 15, Route 12

4. **Lessons from Failures**
   - Schema Discovery Phase 0 (non-negotiable)
   - Separated Architecture (task 1KB, tests separate)
   - Integration-style tests (avoid Jest mocking)
   - Checkpoints (10K, 30K token gates)

5. **Dependencies**
   - What tasks must complete first
   - What methods/interfaces are available to use
   - What patterns to follow from previous tasks

---

## Naming Conventions & Directory Structure

### Task Naming Format
```
P{phase}-{category}-T{task}[.{subtask}][-{layer}]

Examples:
- P2-PROF-T1              → Parent task (Phase 2, Profiles, Task 1)
- P2-PROF-T1.1-repo       → Subtask 1 (repository layer)
- P2-PROF-T1.2-controller → Subtask 2 (controller layer)
- P2-PROF-T1.3-route      → Subtask 3 (route layer)

Category Codes:
- PROF: User Profiles
- TEAM: Team Management
- MATCH: Matchmaking
- CHAL: Challenge System
- AUTH: Authentication
```

### Directory Structure
```
.claude/
├── phases/
│   └── phase-{N}-{name}/
│       ├── PHASE_OVERVIEW.md           # PM agent output
│       ├── PHASE_TEST_BUDGET.json      # Test allocation
│       ├── AGENT_CONTEXT.json          # Curated context for task-gen
│       └── SKELETON.json               # PM skeleton (tasks breakdown)
│
├── tasks/
│   ├── P{N}-{CAT}-T{N}/                # Feature-level folder
│   │   ├── P{N}-{CAT}-T{N}.json       # Parent task (metadata)
│   │   ├── P{N}-{CAT}-T{N}.1-{layer}.json  # Subtask
│   │   └── tests/
│   │       └── P{N}-{CAT}-T{N}.1-{layer}-tests.json
│   │
│   └── archive/
│       └── [dated folders with failed attempts]
│
├── workflows/
│   ├── tdd-layered.json               # For layered features
│   ├── tdd-simple.json                # For simple features
│   └── exploration.json               # For spike tasks
│
└── learnings/
    ├── LEARNINGS_P{N}_{FEATURE}.md    # Per-feature learnings
    └── OPTIMIZATION_PATTERNS.md        # Cross-phase patterns
```

---

## Test Budget Philosophy (Revised)

### Problem with Original Approach
- Arbitrary limits (25 tests) too aggressive for layered architecture
- Led to quality compromises and selective test implementation

### Better Approach: Layer-Based Allocation

**For a typical CRUD feature (GET, PATCH, DELETE, etc.):**

```
Repository Layer: 20-30 tests
- Complex DB queries, JOINs, edge cases
- Performance, consistency, schema validation
- Critical: Data integrity

Controller Layer: 12-18 tests
- Business logic paths
- Field-level access control
- Error handling
- Security scenarios

Route Layer: 10-15 tests
- Middleware integration (auth, validation)
- E2E HTTP request/response
- Status codes, response formats

Total: 50-70 tests for full CRUD feature (all layers)
```

**Guidance for task-generation-agent:**
> "Generate comprehensive tests for quality. For a layered GET endpoint with field-level access control, expect ~60 tests across 3 layers. If generating 100+ tests, reconsider scope or split into more subtasks."

---

## Critical Lessons from P2-PROF-T1

### What Caused First Failure (v1)
1. **No schema discovery** → Assumed UUID (was INTEGER), boolean (was ENUM) → 30K wasted
2. **Embedded tests** → 48K token task file → Context pollution
3. **Exhaustive coverage** → 74 tests for simple GET → Over-engineering
4. **No checkpoints** → Ran 95K tokens without validation gates

### What Made Second Attempt Succeed (v2 - T1.1, T1.2, T1.3)
1. **Schema Discovery Phase 0** → Read migrations first, document findings
2. **Separated Architecture** → Task 1KB, tests separate (93% reduction)
3. **MVP Test Tier** → 43 repo + 15 controller + 11 route = 69 total (quality maintained)
4. **Checkpoints** → 10K (schema validated?), 30K (first tests passing?)
5. **Integration-style tests** → Real DB, not mocks (simpler, faster)

### Token Efficiency Results
- **Subagent execution**: 70K tokens (T1.1)
- **Direct execution**: 22K + 13K = 35K tokens (T1.2 + T1.3)
- **Savings**: 50% reduction with equal quality

---

## Input Contract: What task-generation-agent Expects

### Mode A: Full Phase Generation (from PM agent)

```json
{
  "mode": "full-phase",
  "phase": {
    "number": 2,
    "name": "User Profiles",
    "totalFeatures": 3,
    "complexity": "medium"
  },
  "skeleton": {
    "P2-PROF-T1": {
      "feature": "GET /api/users/:id",
      "layers": ["repository", "controller", "route"],
      "complexity": "medium",
      "dependencies": ["Phase 1 Auth"]
    }
  },
  "testBudget": {
    "totalForPhase": 180,
    "P2-PROF-T1": {
      "total": 60,
      "repository": 25,
      "controller": 15,
      "route": 12,
      "validation": 8
    }
  },
  "context": {
    "databaseSchema": {
      "validated": true,
      "source": "migrations/*.ts",
      "critical": {
        "users.id": "INTEGER (not UUID)",
        "users.status": "ENUM (not boolean)"
      }
    },
    "architecturePatterns": {
      "layered": true,
      "testingApproach": "integration-style-unit-tests",
      "mockingPolicy": "avoid-mocks"
    },
    "lessonsFromFailures": [
      "Schema discovery mandatory",
      "Separated architecture",
      "Checkpoints at 10K/30K"
    ]
  }
}
```

### Mode B: Ad-hoc Single Task (from Human)

```json
{
  "mode": "adhoc-single",
  "taskId": "P2-PROF-T1.2",
  "layer": "controller",
  "qualityFirst": true,
  "noTestBudgetConstraint": true,
  "dependencies": {
    "P2-PROF-T1.1": "✅ Complete - UserRepository.getUserWithSports()"
  },
  "context": {
    "inheritsFrom": "phase-2/AGENT_CONTEXT.json",
    "specificRequirements": [
      "Field-level access control (own vs other)",
      "Integration-style tests",
      "TypeScript type safety"
    ]
  }
}
```

---

## PM Agent Responsibilities (Next to Build)

The PM agent is the **orchestrator/master** that:

1. **Reads MVP timeline** (7 phases)
2. **Breaks down each phase** into features and tasks
3. **Creates PHASE_OVERVIEW.md** with context
4. **Generates PHASE_TEST_BUDGET.json** with intelligent allocation
5. **Produces AGENT_CONTEXT.json** with curated context
6. **Creates SKELETON.json** with task breakdown
7. **Invokes task-generation-agent** with structured input
8. **Validates generated tasks** for quality and consistency

---

## Next Steps

1. **Build PM Agent** (orchestrator/master)
   - Input: MVP timeline, phase requirements
   - Output: Structured context for task-generation-agent
   - Responsibility: Intelligent test budget allocation, context curation

2. **Refine task-generation-agent** based on PM outputs
   - Consume structured JSON input
   - Enforce mode-specific behavior
   - Generate consistent, high-quality tasks

3. **Establish Workflow**
   ```
   Human → PM Agent → task-generation-agent → Executor (Human/Subagent)
   ```

---

## Key Insights

1. **PM agent is critical** - task-generation-agent needs structured input
2. **Two modes essential** - Phase-wide vs ad-hoc have different needs
3. **Test budgets are guidance** - Quality matters more than arbitrary limits
4. **Context curation is key** - Right context > more context
5. **Lessons must propagate** - Schema discovery, separated arch, checkpoints

---

**Status**: Ready to design and implement PM agent
**Next Session**: Build PM agent as orchestrator/master
