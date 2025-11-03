# Task System Design - Separated Architecture

## Overview

This document describes the optimized task management system with separated concerns for tasks, tests, plans, and workflows. The primary goals are:
- **Token efficiency**: Load only what's needed (93% reduction)
- **Reusability**: Share workflow templates across tasks
- **Selective testing**: Run only necessary tests with trust flags
- **Version control**: Archive previous versions for rollback

## File Structure

```
.claude/tasks/
├── schema.ts                           # TypeScript interfaces
├── index.json                          # Task registry
├── tasks/
│   ├── task-3.json                     # ~1 KB (minimal task definition)
│   └── task-4.json
├── tests/
│   ├── task-3-tests.json               # ~3 KB (test suite)
│   ├── task-4-tests.json
│   └── archive/
│       └── task-3-tests-v1.json        # Previous version (rollback)
├── plans/
│   ├── task-3-plan.json                # ~5 KB (planning results)
│   ├── task-4-plan.json
│   └── archive/
│       └── task-3-plan-v1.json         # Previous version (rollback)
└── workflows/
    ├── tdd.json                        # ~4 KB (reusable template)
    ├── test-after.json
    └── exploratory.json
```

## Core Interfaces

### 1. Task Object (Minimal)

**File**: `tasks/task-{id}.json`
**Size**: ~1 KB
**Token cost**: ~250 tokens

```typescript
interface TaskCore {
  id: string;
  version: string;
  content: string;              // "Complete JWT utils implementation and testing"
  activeForm: string;           // "Completing JWT utils implementation and testing"
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';

  // References to external files (not embedded)
  testSuiteRef: string;         // "tests/task-3-tests.json"
  workflowRef: string;          // "workflows/tdd.json"
  planningResultRef?: string;   // "plans/task-3-plan.json" (added after planning)

  dependencies?: string[];      // ["2"] - depends on Task 2
  blockers?: string[];
  tags?: string[];
  estimatedDuration?: string;
}
```

**Key principle**: Task object contains only identity and references. All detailed data lives in separate files.

### 2. Test Suite (Separate File)

**File**: `tests/task-{id}-tests.json`
**Size**: ~3 KB
**Token cost**: ~750 tokens (only loaded when running tests)

```typescript
interface TestSuiteFile {
  taskId: string;               // Back-reference to task
  version: string;
  lastModified: string;

  testCases: TestCase[];

  coverageRequirements: {
    enabled: boolean;
    minimumPercentage?: number;
    criticalFiles: string[];
  };

  successCriteria: {
    allTestsMustPass: boolean;
    noTypeScriptErrors: boolean;
    buildMustSucceed: boolean;
  };

  executionConfig: {
    runInOrder: string[];       // ["jwt-utils.unit", "jwt-utils.regression"]
    stopOnFirstFailure: boolean;
    parallelizable: boolean;
  };

  previousVersion?: {
    archivedAt: string;
    archivePath: string;        // "tests/archive/task-3-tests-v1.json"
    reason: string;
  };
}

interface TestCase {
  id: string;                   // "jwt-utils.unit"
  category: 'unit' | 'integration' | 'e2e' | 'regression' | 'performance';
  description: string;
  required: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';

  testFile: {
    path: string;               // "/path/to/jwt.utils.test.ts"
    status: 'not_created' | 'created' | 'passing' | 'failing' | 'blocked';
    testCount?: number;
    estimatedDuration?: string;
  };

  coverage: {
    targetFunctions: string[];  // ["generateAccessToken", "verifyAccessToken"]
    scenarios: string[];
    edgeCases: string[];
  };

  // Trust flag (simple boolean)
  trust: boolean;               // true = test is known to pass, can skip

  skipConditions: {
    ifTrusted: boolean;         // Skip this test if trust=true
    unlessFileChanged: string[]; // ["src/shared/utils/jwt.utils.ts"] - re-run if changed
  };

  dependsOn?: string[];         // ["jwt-utils.unit"] - run this test first
  blockers?: string[];
}
```

**Key principle**: Each test has a trust flag and file watch list. Trusted tests are skipped unless watched files change.

### 3. Plan Result (Separate File)

**File**: `plans/task-{id}-plan.json`
**Size**: ~5 KB
**Token cost**: ~1,250 tokens (only loaded when reviewing plan)

```typescript
interface PlanResultFile {
  taskId: string;               // Back-reference
  version: number;
  timestamp: string;

  subagentUsed: 'Plan' | 'Explore' | 'Manual';
  overallStatus: 'completed' | 'partial' | 'failed';
  startTime: string;
  endTime?: string;

  phases: {
    phase1_gather: PlanningPhaseOutput;
    phase2_analyze: PlanningPhaseOutput;
    phase3_design: PlanningPhaseOutput;
    phase4_approve: PlanningPhaseOutput;
  };

  approvedPlan: {
    summary: string;
    implementationSteps: string[];
    codeStructure?: any;
    testStrategy?: string;
  };

  userApproval: {
    approved: boolean;
    feedback?: string;
    timestamp: string;
  };

  previousVersion?: {
    archivedAt: string;
    archivePath: string;
    reason: string;
  };
}

interface PlanningPhaseOutput {
  phase: 'phase1_gather' | 'phase2_analyze' | 'phase3_design' | 'phase4_approve';
  status: 'completed' | 'failed';
  startTime: string;
  endTime: string;
  output: {
    summary: string;
    details: string;
    artifacts?: any;
  };
  filesRead?: string[];
  toolsUsed?: string[];
}
```

**Key principle**: Planning results stored separately, only loaded when needed. One-to-one relationship with task.

### 4. Workflow Template (Reusable)

**File**: `workflows/{name}.json`
**Size**: ~4 KB
**Token cost**: ~1,000 tokens (loaded once per task)

```typescript
interface WorkflowTemplate {
  name: string;                 // "TDD", "test-after", "exploratory"
  description: string;

  subagent: {
    required: boolean;
    type: 'Plan' | 'Explore' | null;
    thoroughness?: 'quick' | 'medium' | 'very thorough';
    description: string;
  };

  planningPhases: {
    phase1_gather: {
      description: string;
      objectives: string[];
      requiredTools: string[];  // ["Read", "Grep", "WebFetch"]
      outputFormat: string;
    };
    phase2_analyze: {
      description: string;
      objectives: string[];
      outputFormat: string;
    };
    phase3_design: {
      description: string;
      objectives: string[];
      deliverables: string[];
      outputFormat: string;
    };
    phase4_approve: {
      description: string;
      approvalRequired: boolean;
      presentationFormat: string;
    };
  };

  execution: {
    strategy: 'TDD' | 'test-after' | 'test-alongside';
    iterative: boolean;
    maxAttempts: number;
    rollbackOnFailure: boolean;
  };

  enforcement: {
    mode: 'ERROR' | 'WARN' | 'SILENT';
    rules: {
      subagentRequired: boolean;
      phaseSequence: boolean;
      approvalRequired: boolean;
      testFirst: boolean;
    };
  };
}
```

**Key principle**: Workflows are templates shared across tasks. Three defaults: TDD, test-after, exploratory.

## Test Selection System

### Selection Modes

```typescript
type TestSelectionMode =
  | 'ALL'                    // Run all tests
  | 'UNTRUSTED_ONLY'         // Skip tests where trust=true
  | 'CRITICAL_ONLY'          // Only run critical priority tests
  | 'SELECTIVE'              // Manually specify test IDs
  | 'CHANGED_FILES';         // Run tests watching changed files
```

### Logic Flow

```
1. Load test suite (750 tokens)
2. Detect if major change occurred
3. If major change → override to ALL mode
4. Else → apply selected mode filtering
5. Return filtered test IDs to run
```

### Major Change Detection

Automatically runs ALL tests if any of these conditions are true:

- **Migration files changed**: `*.migrations/*.ts`
- **Core utilities changed**: `src/shared/utils/*` or `src/shared/database/*`
- **Dependencies changed**: `package.json` or `package-lock.json`
- **Large changeset**: More than 10 files modified
- **Explicit flag**: User/workflow sets `forceMajorChange=true`

**Rationale**: Major architectural changes could break anything, so run full test suite.

### Mode Examples

#### Mode: UNTRUSTED_ONLY
```typescript
// Test case definition
{
  "id": "jwt-utils.unit",
  "trust": true,
  "skipConditions": {
    "ifTrusted": true,
    "unlessFileChanged": ["src/shared/utils/jwt.utils.ts"]
  }
}

// Scenario 1: jwt.utils.ts NOT modified
// Result: SKIP (trust=true, file not changed)

// Scenario 2: jwt.utils.ts WAS modified
// Result: RUN (file in watch list changed)
```

#### Mode: CHANGED_FILES
```typescript
// Git shows: jwt.utils.ts and passport.config.ts modified

// jwt-utils.unit watches ["jwt.utils.ts"] → RUN
// passport.integration watches ["passport.config.ts"] → RUN
// auth-flow.e2e watches ["auth.routes.ts"] → SKIP

// Result: Run 2 of 3 tests
```

#### Mode: SELECTIVE
```typescript
// Manually specify exact tests
{
  "mode": "SELECTIVE",
  "selection": {
    "runTestIds": ["jwt-utils.unit", "passport.integration"]
  }
}

// Result: Run only these 2 tests, ignore trust flags
```

## Versioning & Archival

### Update Process

1. **Before update**: Archive current version
   ```
   tests/task-3-tests.json → tests/archive/task-3-tests-v1.json
   ```

2. **Update**: Write new version with archive reference
   ```json
   {
     "version": "2.0",
     "previousVersion": {
       "archivedAt": "2025-11-03T14:30:00Z",
       "archivePath": "tests/archive/task-3-tests-v1.json",
       "reason": "Added 5 new edge cases after planning"
     }
   }
   ```

3. **Retention**: Keep only last version in archive (not full history)

### Rollback Function

```typescript
async function rollbackTestSuite(taskId: string) {
  const current = await readJSON(`tests/task-${taskId}-tests.json`);
  const previous = await readJSON(current.previousVersion.archivePath);
  await writeJSON(`tests/task-${taskId}-tests.json`, previous);
}
```

**Use case**: Planning added bad tests, need to revert to previous working state.

## Token Efficiency

### Current Embedded Approach
- Task file: 8 KB → ~2,000 tokens
- After planning: 15 KB → ~3,750 tokens
- **Every operation loads everything**

### Separated Approach
- Load task only: 1 KB → ~250 tokens (93% reduction)
- Load task + workflow: 5 KB → ~1,250 tokens (67% reduction)
- Load task + tests: 4 KB → ~1,000 tokens (73% reduction)
- Load everything: 9 KB → ~2,250 tokens (40% reduction)

**Key benefit**: Load only what's needed for each operation.

### Example Operations

```typescript
// Check task status
loadTask('3');  // 250 tokens

// Start planning
loadTask('3') + loadWorkflow('tdd');  // 1,250 tokens

// Run tests
loadTask('3') + loadTests('3') + determineTestsToRun();  // 1,000 tokens

// Review plan
loadTask('3') + loadPlan('3');  // 1,500 tokens
```

## Workflow Templates (3 Defaults)

### 1. TDD Workflow
- **Strategy**: Test-first development
- **Enforcement**: ERROR mode, testFirst=true
- **Planning**: Medium thoroughness
- **Use case**: New features, critical functionality

### 2. Test-After Workflow
- **Strategy**: Implement then test
- **Enforcement**: WARN mode, testFirst=false
- **Planning**: Quick thoroughness
- **Use case**: Bug fixes, minor changes

### 3. Exploratory Workflow
- **Strategy**: Research-focused, tests optional
- **Enforcement**: SILENT mode
- **Planning**: Very thorough
- **Use case**: Spike work, prototyping, understanding codebase

**Size**: 130-150 lines each (verbose for clarity and self-documentation)

## Implementation Priority

1. ✅ Define schema.ts with all interfaces
2. ✅ Create 3 workflow templates (tdd.json, test-after.json, exploratory.json)
3. ✅ Convert Task 3 and Task 4 to separated structure
4. ⏳ Implement test selection logic
5. ⏳ Implement versioning/archival logic
6. ⏳ Test the system with Task 3 execution

## Summary

**Core Innovation**: Separate concerns into dedicated files with simple references, enabling:
- Selective loading (93% token reduction)
- Reusable workflow templates
- Smart test selection with trust flags
- Version control with rollback capability

**Design Principles**:
- Minimal task object (identity + references only)
- One-to-one relationships (task ↔ tests ↔ plan)
- File-based change detection for selective testing
- Simple boolean trust flag (no over-engineering)
- Archive last version only (not full history)
