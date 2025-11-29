---
name: breakdown-task
description: Break down monolithic task into 3-4 token-efficient subtasks with separated test suites following P2-PROF-T4 pattern
---

# Task Breakdown Automation

Break monolithic task.json into manageable subtasks for efficient execution.

## Usage

```bash
/breakdown-task P2-PROF-T5   # Single task
/breakdown-task P3-TEAM-T1   # Another task
/breakdown-task P3-TEAM-T2   # Another task
```

## Process

1. **Read Monolithic Task** → Load `tools/tracker/data/tasks/{TASK_ID}/task.json`
2. **Analyze Scope** → Extract description, test suite, workflow, dependencies
3. **Generate Breakdown Plan** → Create 3-4 subtasks following P2-PROF-T4 pattern:
   - **T{N}.1**: Repository/Data layer + validation (8 MVP tests)
   - **T{N}.2**: Controllers/Business logic (8-10 MVP tests)
   - **T{N}.3**: Routes/Integration (6-8 MVP tests)
   - **T{N}.4**: E2E/Regression (optional, if needed)
4. **Show Preview** → Display subtask breakdown to user
5. **Get Approval** → Ask: "Proceed with this breakdown? (yes/no)"
6. **Generate Subtasks** → Create `{TASK_ID}.{X}-{name}.json` files
7. **Generate Test Suites** → Create `tests/{TASK_ID}.{X}-{name}-tests.json` files
8. **Update Parent** → Keep parent task.json as coordination file (optional)

## Subtask Template (Follow P2-PROF-T4.1 Structure)

Each subtask MUST have:
- **id**: `{PARENT_ID}.{X}` (e.g., P2-PROF-T5.1)
- **version**: "1.0"
- **content**: Brief imperative form (e.g., "Implement repository and validation schemas")
- **activeForm**: Present continuous form (e.g., "Implementing repository and validation schemas")
- **description**: Detailed description (200-300 words) including what will be created, test count, and how it connects to other subtasks
- **status**: "pending"
- **testSuiteRef**: `tests/{TASK_ID}.{X}-{name}-tests.json`
- **workflowRef**: `workflows/tdd.json`
- **planningResultRef**: null
- **dependencies**: Array of prerequisite task IDs
- **blockers**: []
- **tags**: Array matching parent task
- **estimatedDuration**: "30-40 min" (must be token-efficient)
- **metadata**:
  - **phase**: Number from parent
  - **feature**: String from parent
  - **parentTask**: Parent task ID
  - **subtaskIndex**: "X.Y" notation
  - **estimatedTokens**: 15000-25000
  - **testTier**: "mvp"
  - **testCount**: 8-10 tests
- **workflow**:
  - **planningRequired**: true
  - **checkpoints**: Array of 2-3 gates with token limits, requirements, askHuman flags
  - **phases**: Array of 3 phases (Implementation → Schema/Tests → Verification)

## Breakdown Strategy

**Analyze monolithic task by:**
1. **File count**: How many files will be created/modified?
2. **Test count**: How many tests in test suite?
3. **Logical layers**: Repository → Controller → Routes → E2E
4. **Dependencies**: What must be built first?

**Standard breakdown pattern:**
- **Subtask .1** (Data Layer): Repository + Validation Schemas + Database tests
  - Files: `repositories/*.repository.ts`, `schemas/*.schema.ts`
  - Tests: 8 MVP tests (4 unit, 4 integration for DB operations)
  - Duration: 30-40 min

- **Subtask .2** (Logic Layer): Controllers + Business Logic + Unit tests
  - Files: `controllers/*.controller.ts`, `services/*.service.ts` (if needed)
  - Tests: 8-10 MVP tests (unit tests for controller methods)
  - Duration: 30-40 min

- **Subtask .3** (API Layer): Routes + Integration Tests + Middleware
  - Files: `routes/*.routes.ts`, `middleware/*` (if needed)
  - Tests: 6-8 MVP tests (integration tests for HTTP endpoints)
  - Duration: 30-40 min

- **Subtask .4** (Verification) [OPTIONAL]: E2E + Regression
  - Only create if total test count > 30 or complex cross-service flows
  - Tests: 5-7 E2E tests
  - Duration: 30-40 min

## Test Suite Separation

For each subtask, create a separate test suite file in `tools/tracker/data/tasks/{TASK_ID}/tests/`:

**File**: `{TASK_ID}.{X}-{name}-tests.json`

**Structure**:
```json
{
  "taskId": "P2-PROF-T5.1",
  "testSuiteVersion": "1.0",
  "testCases": [
    {
      "id": "test-case-id",
      "category": "unit|integration|e2e",
      "description": "Test description",
      "required": true,
      "priority": "critical|high|medium|low",
      "testFile": {
        "path": "Absolute path to test file",
        "status": "not_created|created|passing|failing",
        "testCount": 5,
        "estimatedDuration": "20 seconds"
      },
      "coverage": {
        "targetFunctions": ["function1", "function2"],
        "scenarios": ["scenario1", "scenario2"],
        "edgeCases": ["edge1", "edge2"]
      },
      "trust": false,
      "skipConditions": {
        "ifTrusted": false,
        "unlessFileChanged": ["path/to/source.ts"]
      }
    }
  ],
  "coverageRequirements": {
    "enabled": true,
    "minimumPercentage": 85,
    "criticalFiles": ["path1", "path2"]
  },
  "successCriteria": {
    "allTestsMustPass": true,
    "noTypeScriptErrors": true,
    "noLintingErrors": true,
    "buildMustSucceed": true
  },
  "executionConfig": {
    "runInOrder": ["test-id-1", "test-id-2"],
    "stopOnFirstFailure": false,
    "parallelizable": false
  }
}
```

## Workflow Phases Template

Each subtask should have 3 phases:

**Phase 1**: Implementation
- Create source files (repository/controller/routes)
- Implement core functionality
- Gate: "Core implementation complete before tests"

**Phase 2**: Schema/Tests
- Create validation schemas (if applicable)
- Write MVP test suite (8-10 tests)
- Gate: "Tests written and passing"

**Phase 3**: Verification
- Run full test suite
- Check TypeScript compilation
- Check linting
- Gate: "All quality checks pass"

## Checkpoints Template

Each subtask should have 2-3 checkpoints:

**Checkpoint 1**: Implementation Complete
- tokenLimit: 10000
- requirement: "Core files created and implementation complete"
- askHuman: false
- exitIfFail: false

**Checkpoint 2**: Tests Passing
- tokenLimit: 20000
- requirement: "All MVP tests written and passing with 85%+ coverage"
- askHuman: true
- exitIfFail: false

**Checkpoint 3** (optional): Full Verification
- tokenLimit: 25000
- requirement: "TypeScript compilation, linting, and build successful"
- askHuman: false
- exitIfFail: true

## Dependencies Between Subtasks

- **T{N}.1** (Data Layer): No dependencies (foundation)
- **T{N}.2** (Logic Layer): depends on T{N}.1
- **T{N}.3** (API Layer): depends on T{N}.2
- **T{N}.4** (E2E): depends on T{N}.3

## Success Criteria

Each subtask breakdown MUST satisfy:
- ✅ Completable in **30-40 min** (15K-25K tokens)
- ✅ Has **8-10 MVP tests** (not 20-25 comprehensive)
- ✅ Clear **layer separation** (Data → Logic → API → E2E)
- ✅ **Separated test suites** in dedicated JSON files
- ✅ **Explicit dependencies** between subtasks
- ✅ **Checkpoints** with token limits to prevent runaway sessions
- ✅ Parent task preserved as **coordination manifest**

## Key Principles

1. **Token Efficiency**: Each subtask designed to fit in a single focused session
2. **MVP Testing**: 8-10 high-value tests, not exhaustive coverage
3. **Clear Boundaries**: Each subtask has distinct scope and deliverables
4. **Incremental Build**: Each subtask builds on previous (T4.1 → T4.2 → T4.3)
5. **Test Separation**: Tests in separate files for better organization
6. **Human Approval**: Always ask before generating files

## Reference Example

**Study this structure**: `tools/tracker/data/tasks/P2-PROF-T4/`
- Parent: `task.json` (original monolithic)
- Subtask 1: `P2-PROF-T4.1-repo-validation.json`
- Subtask 2: `P2-PROF-T4.2-controllers.json`
- Subtask 3: `P2-PROF-T4.3-routes.json`
- Test Suite 1: `tests/P2-PROF-T4.1-repo-validation-tests.json`

## Output Format

After analysis, present breakdown in this format:

```
📋 Analyzing {TASK_ID}...

Found monolithic task:
- Description: {brief description}
- Total tests: {count}
- Files to create: {count}
- Estimated duration: {original estimate}

Proposed Breakdown:
├─ {TASK_ID}.1-{name} ({duration}, {test_count} tests)
│  └─ {brief scope description}
│  └─ Dependencies: {list or none}
├─ {TASK_ID}.2-{name} ({duration}, {test_count} tests)
│  └─ {brief scope description}
│  └─ Dependencies: {TASK_ID}.1
├─ {TASK_ID}.3-{name} ({duration}, {test_count} tests)
│  └─ {brief scope description}
│  └─ Dependencies: {TASK_ID}.2
└─ {TASK_ID}.4-{name} (optional, if needed)

Estimated total: {sum} min (vs {original} min monolithic)
Token efficiency: {percentage} reduction

Files to create:
- {TASK_ID}.1-{name}.json
- {TASK_ID}.2-{name}.json
- {TASK_ID}.3-{name}.json
- tests/{TASK_ID}.1-{name}-tests.json
- tests/{TASK_ID}.2-{name}-tests.json
- tests/{TASK_ID}.3-{name}-tests.json

Proceed with this breakdown? (yes/no)
```

## Notes

- **Always** analyze the monolithic task first before proposing breakdown
- **Always** follow the P2-PROF-T4 pattern exactly
- **Always** create separate test suite JSON files
- **Always** ask for approval before writing files
- **Never** create more than 4 subtasks (3 is ideal)
- **Never** exceed 40 min estimated duration per subtask
- **Never** put more than 10 tests in a subtask (MVP tier only)
