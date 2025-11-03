/**
 * Task System Schema - Phase 1
 *
 * Core interfaces for the simplified 2-file task management system:
 * 1. TaskDefinition (Git-versioned, static)
 * 2. TaskExecutionState (Ephemeral, .gitignored)
 * 3. WorkflowTemplate (Git-versioned, reusable)
 */

// ============================================================================
// TASK DEFINITION (Static, Git-Versioned)
// ============================================================================

export interface TaskDefinition {
  // Core task identity
  id: string;
  version: string;
  content: string;              // "Complete JWT utils implementation and testing"
  activeForm: string;           // "Completing JWT utils implementation and testing"
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';

  // Workflow reference
  workflowRef: string;          // "workflows/tdd.json"

  // Git integration for versioning
  git: {
    lastKnownGoodCommit?: string;  // Commit hash when all tests passed
    definitionPath: string;        // Relative path for git operations
  };

  // Embedded test suite (simplified from separate file)
  testSuite: TestSuite;

  // Task relationships
  dependencies?: string[];      // Task IDs this depends on
  tags?: string[];
  estimatedDuration?: string;
}

export interface TestSuite {
  testCases: TestCaseDefinition[];

  coverageRequirements: {
    enabled: boolean;
    minimumPercentage?: number;
    criticalFiles: string[];
  };

  executionConfig: {
    runInOrder?: string[];      // Test IDs in specific order
    stopOnFirstFailure: boolean;
    parallelizable: boolean;
  };
}

export interface TestCaseDefinition {
  id: string;                   // "jwt-utils.unit"
  category: 'unit' | 'integration' | 'e2e' | 'regression' | 'performance';
  description: string;
  required: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';

  testFile: {
    path: string;               // Absolute path to test file
    targetFunctions: string[];  // Functions being tested
    scenarios: string[];        // Test scenarios covered
    edgeCases: string[];        // Edge cases tested
  };

  // Phase 1: Simple file watching (no AST)
  dependencies: {
    watchFiles: string[];       // Files that trigger re-run if changed
    autoDetect: boolean;        // Reserved for Phase 2 (AST parser)
  };

  trustable: boolean;           // Can this test be trusted when passing?
  dependsOn?: string[];         // Other test IDs that must run first
}

// ============================================================================
// TASK EXECUTION STATE (Ephemeral, .gitignored)
// ============================================================================

export interface TaskExecutionState {
  taskId: string;
  lastUpdated: string;          // ISO timestamp
  currentPhase: 'idle' | 'planning' | 'coding' | 'testing' | 'blocked';

  // Planning results (embedded, not separate file)
  planning?: PlanningResult;

  // Test execution results
  testResults: {
    [testId: string]: TestResult;
  };

  // Git context for change detection
  gitContext: GitContext;

  // Execution history for debugging
  executionLog: ExecutionLogEntry[];
}

export interface PlanningResult {
  timestamp: string;
  subagentUsed: 'Plan' | 'Explore' | 'Manual';

  phases: {
    gather?: PhaseOutput;
    analyze?: PhaseOutput;
    design?: PhaseOutput;
    approve?: PhaseOutput;
  };

  approvedPlan?: {
    summary: string;
    implementationSteps: string[];
    testStrategy?: string;
    codeStructure?: any;
  };
}

export interface PhaseOutput {
  summary: string;
  details?: string;
  filesRead?: string[];
  insights?: string[];
  artifacts?: any;
}

export interface TestResult {
  status: 'passing' | 'failing' | 'skipped' | 'not_run';
  lastRun: string;              // ISO timestamp
  duration?: number;            // Milliseconds
  errorMessage?: string;
  stackTrace?: string;
  trusted: boolean;             // Trust earned when passing
}

export interface GitContext {
  branch: string;
  lastTestedCommit: string;     // Last commit where tests were run
  changedFilesSince: string[];  // Files changed since lastTestedCommit

  // Reserved for Phase 2 (dependency graph)
  dependencyGraph?: {
    timestamp: string;
    graph: { [filePath: string]: string[] };
  };
}

export interface ExecutionLogEntry {
  timestamp: string;
  phase: 'planning' | 'coding' | 'testing' | 'debugging';
  action: string;               // Human-readable action description
  result: 'success' | 'failure' | 'partial';
  details?: string;
  tokensUsed?: number;
}

// ============================================================================
// WORKFLOW TEMPLATE (Static, Git-Versioned, Reusable)
// ============================================================================

export interface WorkflowTemplate {
  name: string;                 // "TDD", "test-after", "exploratory"
  description: string;

  subagent: {
    required: boolean;
    type: 'Plan' | 'Explore' | null;
    thoroughness?: 'quick' | 'medium' | 'very thorough';
    description: string;
  };

  planningPhases: {
    phase1_gather: PlanningPhaseConfig;
    phase2_analyze: PlanningPhaseConfig;
    phase3_design: PlanningPhaseConfig;
    phase4_approve: PlanningPhaseConfig;
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

export interface PlanningPhaseConfig {
  description: string;
  objectives: string[];
  requiredTools?: string[];     // Tool names that should be used
  deliverables?: string[];
  outputFormat: string;
  approvalRequired?: boolean;
  presentationFormat?: string;
}

// ============================================================================
// TEST SELECTION
// ============================================================================

export type TestSelectionMode =
  | 'ALL'                       // Run all tests
  | 'UNTRUSTED_ONLY'            // Skip tests where trusted=true
  | 'CRITICAL_ONLY'             // Only run critical priority tests
  | 'SELECTIVE'                 // Manually specify test IDs
  | 'CHANGED_FILES';            // Run tests watching changed files

export interface TestSelectionOptions {
  mode: TestSelectionMode;

  // For SELECTIVE mode
  selection?: {
    runTestIds: string[];
  };

  // Force running all tests despite trust flags
  forceMajorChange?: boolean;
}

// ============================================================================
// TASK REGISTRY
// ============================================================================

export interface TaskRegistry {
  version: string;
  lastUpdated: string;
  tasks: {
    [taskId: string]: {
      definitionPath: string;   // "definitions/task-3.json"
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
      lastModified: string;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
