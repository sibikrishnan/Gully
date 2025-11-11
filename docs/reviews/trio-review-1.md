Final Design Plan Based on Your Decisions

  Architecture Overview

  Your Choices:
  - ✅ Full dependency graph (Gemini's proposal)
  - ✅ Git-native versioning (Gemini's proposal)
  - ✅ Modular progression (incremental robustness)
  - ✅ Simple structure (2-3 files per task)

  ---
  Simplified File Structure

  .claude/tasks/
  ├── schema.ts                           # TypeScript interfaces
  ├── index.json                          # Task registry
  ├── definitions/
  │   ├── task-3.json                     # TaskCore +
  TestSuiteDefinition (combined)
  │   ├── task-4.json
  │   └── workflows/
  │       ├── tdd.json                    # Workflow templates
  (reusable)
  │       ├── test-after.json
  │       └── exploratory.json
  └── state/
      ├── task-3-state.json               # TaskExecutionState
  (ephemeral, .gitignored)
      ├── task-4-state.json
      └── .gitignore                      # Ignore all state files

  Key Simplification:
  - ❌ Removed separate tests/ and plans/ folders
  - ✅ Combined TaskCore + TestSuiteDefinition into single
  task-{id}.json (~4 KB)
  - ✅ Plan results stored in TaskExecutionState (ephemeral, not
  separate file)
  - ✅ Only 2 files per task: definition + state

  Rationale: This reduces from 4 files to 2 files while maintaining
  separation of static (Git-versioned) vs dynamic (ephemeral) data.

  ---
  Core Interfaces (Simplified)

  1. Task Definition (Git-Versioned)

  File: definitions/task-{id}.jsonSize: ~4 KBToken cost: ~1,000 tokens

  interface TaskDefinition {
    // Core task info
    id: string;
    version: string;
    content: string;
    activeForm: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';

    // Workflow reference
    workflowRef: string;              // "workflows/tdd.json"

    // Git integration (Gemini's proposal)
    git: {
      lastKnownGoodCommit?: string;   // When all tests passed
      definitionPath: string;         // For git checkout operations
    };

    // Embedded test suite (simplified from separate file)
    testSuite: {
      testCases: TestCaseDefinition[];
      coverageRequirements: {
        enabled: boolean;
        minimumPercentage?: number;
        criticalFiles: string[];
      };
      executionConfig: {
        runInOrder?: string[];
        stopOnFirstFailure: boolean;
        parallelizable: boolean;
      };
    };

    dependencies?: string[];
    tags?: string[];
  }

  interface TestCaseDefinition {
    id: string;
    category: 'unit' | 'integration' | 'e2e' | 'regression';
    description: string;
    required: boolean;
    priority: 'critical' | 'high' | 'medium' | 'low';

    testFile: {
      path: string;                   // "/path/to/jwt.utils.test.ts"
      targetFunctions: string[];      // Functions being tested
      scenarios: string[];
      edgeCases: string[];
    };

    // Dependency tracking (Gemini's proposal - AST-based)
    dependencies: {
      watchFiles: string[];           // Direct file paths
      autoDetect: boolean;            // Use AST parser for transitive 
  deps
    };

    trustable: boolean;               // Can be trusted when passing
    dependsOn?: string[];             // Other test IDs
  }

  2. Task Execution State (Ephemeral, .gitignored)

  File: state/task-{id}-state.jsonSize: ~2-5 KB (grows with execution
  history)Token cost: ~500-1,250 tokens

  interface TaskExecutionState {
    taskId: string;
    lastUpdated: string;
    currentPhase: 'idle' | 'planning' | 'coding' | 'testing' |
  'blocked';

    // Planning results (embedded, not separate file)
    planning?: {
      timestamp: string;
      subagentUsed: 'Plan' | 'Explore';
      phases: {
        gather: { summary: string; filesRead: string[] };
        analyze: { summary: string; insights: string[] };
        design: { summary: string; steps: string[] };
        approve: { approved: boolean; feedback?: string };
      };
      approvedPlan?: {
        summary: string;
        implementationSteps: string[];
        testStrategy?: string;
      };
    };

    // Test execution results
    testResults: {
      [testId: string]: {
        status: 'passing' | 'failing' | 'skipped' | 'not_run';
        lastRun: string;
        duration?: number;
        errorMessage?: string;
        stackTrace?: string;
        trusted: boolean;             // Trust earned when passing
      };
    };

    // Git context for change detection
    gitContext: {
      branch: string;
      lastTestedCommit: string;
      changedFilesSince: string[];
      dependencyGraph?: {
        timestamp: string;
        graph: { [filePath: string]: string[] };  // file -> 
  dependencies
      };
    };

    // Execution log
    executionLog: Array<{
      timestamp: string;
      phase: string;
      action: string;
      result: 'success' | 'failure';
      tokensUsed?: number;
    }>;
  }

  3. Workflow Template (Git-Versioned, Reusable)

  File: definitions/workflows/{name}.jsonNo changes from original 
  design - kept as-is since it's already well-designed.

  ---
  Dependency Graph System (Gemini's Proposal)

  Implementation Strategy

  Module 1: Dependency Parser (Core feature)
  interface DependencyGraph {
    buildGraph(rootDir: string): Promise<FileGraph>;
    getTransitiveDependencies(filePath: string): string[];
    invalidateCache(): void;
  }

  interface FileGraph {
    [filePath: string]: {
      imports: string[];              // Direct imports
      importedBy: string[];           // Reverse dependencies
    };
  }

  // Uses TypeScript compiler API
  async function buildDependencyGraph(rootDir: string): 
  Promise<FileGraph> {
    // Parse all .ts/.tsx files
    // Extract import statements
    // Build bidirectional graph
    // Cache results
  }

  Module 2: Change Detection Integration
  async function selectTestsToRun(
    taskId: string,
    mode: TestSelectionMode
  ): Promise<string[]> {
    const definition = await loadTaskDefinition(taskId);
    const state = await loadTaskState(taskId);

    // Get changed files since last test run
    const changedFiles = await
  getGitDiff(state.gitContext.lastTestedCommit, 'HEAD');

    // Build or load cached dependency graph
    let graph = state.gitContext.dependencyGraph?.graph;
    if (!graph || isStale(state.gitContext.dependencyGraph.timestamp))
  {
      graph = await buildDependencyGraph('./');
      await updateStateGraph(taskId, graph);
    }

    // For each test, check if it should run
    const testsToRun: string[] = [];
    for (const testCase of definition.testSuite.testCases) {
      if (testCase.dependencies.autoDetect) {
        // Get all transitive dependencies of test file
        const testDeps = getTransitiveDependencies(graph,
  testCase.testFile.path);

        // Check if any changed files affect this test
        if (changedFiles.some(file => testDeps.includes(file))) {
          testsToRun.push(testCase.id);
          continue;
        }
      }

      // Fallback to manual watch list
      if (testCase.dependencies.watchFiles.some(file =>
  changedFiles.includes(file))) {
        testsToRun.push(testCase.id);
        continue;
      }

      // Apply trust filter
      if (mode === 'UNTRUSTED_ONLY') {
        const result = state.testResults[testCase.id];
        if (!result?.trusted) {
          testsToRun.push(testCase.id);
        }
      }
    }

    return testsToRun;
  }

  ---
  Git-Native Versioning (Gemini's Proposal)

  Core Operations

  1. Commit Checkpoint After Successful Tests
  async function createCheckpoint(taskId: string): Promise<void> {
    const state = await loadTaskState(taskId);

    // Verify all tests passed
    const allPassed = Object.values(state.testResults)
      .every(r => r.status === 'passing');

    if (!allPassed) {
      throw new Error('Cannot create checkpoint - tests are not all 
  passing');
    }

    // Git operations
    await bash('git add definitions/');
    const commitHash = await bash('git rev-parse HEAD');

    // Update task definition with last known good commit
    await updateTaskDefinition(taskId, {
      git: {
        lastKnownGoodCommit: commitHash.trim(),
        definitionPath: `definitions/task-${taskId}.json`
      }
    });
  }

  2. Rollback to Last Known Good
  async function rollbackTask(taskId: string): Promise<void> {
    const definition = await loadTaskDefinition(taskId);

    if (!definition.git.lastKnownGoodCommit) {
      throw new Error('No known good commit to rollback to');
    }

    // Checkout specific task definition file from commit
    await bash(`git checkout ${definition.git.lastKnownGoodCommit} -- 
  ${definition.git.definitionPath}`);

    // Clear execution state (start fresh)
    await deleteFile(`state/task-${taskId}-state.json`);

    console.log(`Rolled back to commit 
  ${definition.git.lastKnownGoodCommit.slice(0, 7)}`);
  }

  3. Automatic .gitignore Setup
  # state/ directory (ephemeral execution data)
  .claude/tasks/state/

  # Lock files
  *.lock

  # Temp files
  *.tmp

  ---
  Modular Implementation Progression

  Phase 1: Core System (Week 1)

  Deliverables:
  - ✅ Schema definitions (schema.ts)
  - ✅ Basic task definition CRUD operations
  - ✅ Simple file-watching change detection (no AST yet)
  - ✅ Basic state management (no atomic updates yet)
  - ✅ Git checkpoint/rollback functions

  Success Criteria:
  - Can create task with embedded tests
  - Can mark tests as trusted
  - Can rollback using Git
  - File watching detects direct changes

  Phase 2: Dependency Graph (Week 2)

  Deliverables:
  - ✅ TypeScript AST parser integration
  - ✅ Dependency graph builder
  - ✅ Graph caching in state
  - ✅ Transitive dependency detection

  Success Criteria:
  - Graph correctly identifies import chains
  - Test selection catches transitive changes
  - Graph cache invalidates when package.json changes

  Phase 3: Robustness Features (Week 3+)

  Deliverables:
  - ✅ Atomic state updates with file locks
  - ✅ JSON schema validation
  - ✅ Health check system
  - ✅ Orphan detection
  - ✅ Corruption recovery

  Success Criteria:
  - No race conditions during concurrent updates
  - Invalid JSON rejected with clear errors
  - Health checks identify stale state

  Phase 4: Developer Experience (Week 4+)

  Deliverables:
  - ✅ CLI commands for task management
  - ✅ Pretty-printed status reports
  - ✅ Token usage tracking and reporting
  - ✅ Performance metrics

  Success Criteria:
  - DX is smooth and intuitive
  - Token savings are measurable and reported
  - Performance is acceptable (< 1s for test selection)

  ---
  Token Efficiency Analysis (Revised)

  Realistic Benchmarks

  Operation 1: Check Task Status
  - Load: definitions/task-3.json (4 KB)
  - Token cost: ~1,000 tokens
  - Savings vs monolithic: 60% (was 2,500 tokens)

  Operation 2: Run Test Selection
  - Load: definitions/task-3.json + state/task-3-state.json (4 KB + 3
  KB)
  - Token cost: ~1,750 tokens
  - Savings vs monolithic: 30% (was 2,500 tokens)

  Operation 3: Full TDD Iteration
  - Load: Definition + State + Code Snippets + Test Files
  - Token cost: ~3,000-5,000 tokens (depends on code size)
  - Savings: 20-40% (selective test loading, cached graph)

  Honest Assessment:
  - ❌ Not 93% savings in real usage
  - ✅ 30-60% savings in typical operations
  - ✅ Biggest wins from selective test loading and graph caching
  - ✅ Still significant for enterprise-scale projects

  ---
  Risk Assessment & Mitigations

  | Risk                         | Likelihood | Impact | Mitigation
                                        |
  |------------------------------|------------|--------|---------------
  --------------------------------------|
  | AST parser complexity        | Medium     | High   | Use
  battle-tested library (TypeScript Compiler API) |
  | Git workflow discipline      | High       | Medium | Automated
  checkpoints, clear docs                   |
  | Dependency graph performance | Medium     | Medium | Aggressive
  caching, incremental updates             |
  | State file corruption        | Low        | High   | Phase 3:
  atomic updates, validation                 |
  | Learning curve               | Medium     | Low    | Good
  documentation, examples                        |

  ---
  Collaborative Workflow for This Implementation

  When to use each AI:

  Claude (for implementation):
  - Writing the actual TypeScript code
  - Creating file operations and Git integration
  - Implementing test selection logic
  - Debugging issues during development

  Gemini (for validation):
  - Review dependency graph algorithm correctness
  - Validate Git versioning strategy
  - Check for edge cases in test selection
  - Verify performance characteristics

  You (for decisions):
  - Approve each phase before moving to next
  - Validate UX and workflow feels right
  - Decide when to stop adding features
  - Provide real-world testing feedback

  ---
  Questions Before Implementation

  1. Does this simplified structure (2 files vs 4) make sense to you?
    - Task definition embeds tests instead of separate file
    - Plan results stored in state instead of separate file
  2. Are you comfortable with the Git-native approach?
    - Requires committing definitions/ regularly
    - State is never committed (always ephemeral)
  3. Should we start with Phase 1 immediately, or do you want to review
   with Gemini first?
    - I can implement Phase 1 now
    - Or you can share this plan with Gemini for final validation
  4. Any concerns about the dependency graph complexity?
    - This is the most complex part
    - Alternative: start with file watching, add graph in Phase 2

  What would you like to do next?
