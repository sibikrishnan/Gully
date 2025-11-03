/**
 * Task Management Schema
 * Defines structured task objects with test suites and workflow automation
 */

export interface TestCase {
  id: string;                          // e.g., "jwt-utils.unit", "jwt-utils.regression"
  category: 'unit' | 'integration' | 'e2e' | 'regression' | 'performance';
  description: string;
  required: boolean;                   // Must pass for task completion?
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Test file details
  testFile: {
    path: string;
    status: 'not_created' | 'created' | 'passing' | 'failing' | 'blocked';
    testCount?: number;
    estimatedDuration?: string;
  };

  // Test scope
  coverage: {
    targetFunctions: string[];
    scenarios: string[];
    edgeCases: string[];
  };

  // Dependencies
  dependsOn?: string[];                // Other TestCase IDs that must pass first
  blockers?: string[];
}

export interface TaskTestSuite {
  // Collection of all test cases
  testCases: TestCase[];

  // Overall coverage requirements
  coverageRequirements: {
    enabled: boolean;
    minimumPercentage?: number;
    criticalFiles: string[];           // Files that MUST be covered
  };

  // Success criteria (ALL must be true)
  successCriteria: {
    allTestsMustPass: boolean;
    noTypeScriptErrors: boolean;
    noLintingErrors: boolean;
    buildMustSucceed: boolean;
  };

  // Execution configuration
  executionConfig: {
    runInOrder: string[];              // TestCase IDs in execution order
    stopOnFirstFailure: boolean;
    parallelizable: boolean;
  };
}

export interface PlanningPhaseOutput {
  phase: 'phase1_gather' | 'phase2_analyze' | 'phase3_design' | 'phase4_approve';
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;

  // Phase-specific output
  output: {
    summary: string;                   // Brief summary of findings
    details: string;                   // Full detailed output
    artifacts?: {                      // Any structured data/code produced
      [key: string]: any;
    };
  };

  // References
  filesRead?: string[];
  toolsUsed?: string[];
}

export interface TaskPlanningResult {
  subagentUsed: 'Plan' | 'Explore' | 'Manual';
  overallStatus: 'completed' | 'partial' | 'failed';
  startTime: string;
  endTime?: string;

  // All 4 phases
  phases: {
    phase1_gather: PlanningPhaseOutput;
    phase2_analyze: PlanningPhaseOutput;
    phase3_design: PlanningPhaseOutput;
    phase4_approve: PlanningPhaseOutput;
  };

  // Final deliverables
  approvedPlan?: {
    summary: string;
    implementationSteps: string[];
    codeStructure?: any;
    testStrategy?: string;
  };

  userApproval?: {
    approved: boolean;
    feedback?: string;
    timestamp: string;
  };
}

export interface WorkflowEnforcement {
  mode: 'ERROR' | 'WARN' | 'SILENT';   // Easily changeable
  rules: {
    subagentRequired: boolean;         // Must use subagent if specified?
    phaseSequence: boolean;            // Must complete phases in order?
    approvalRequired: boolean;         // Must get approval before coding?
    testFirst: boolean;                // Must write tests before implementation?
  };
}

export interface TaskWorkflow {
  // Subagent configuration
  subagent: {
    required: boolean;
    type: 'Plan' | 'Explore' | null;
    thoroughness?: 'quick' | 'medium' | 'very thorough';
    description: string;
  };

  // 4-phase planning process
  planningPhases: {
    phase1_gather: {
      description: string;
      objectives: string[];
      requiredTools: string[];
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

  // Execution strategy
  execution: {
    strategy: 'TDD' | 'test-after' | 'test-alongside';
    iterative: boolean;
    maxAttempts: number;
    rollbackOnFailure: boolean;
  };

  // Enforcement rules
  enforcement: WorkflowEnforcement;
}

export interface Task {
  // Identity
  id: string;
  parentId?: string;

  // Versioning
  version: string;
  changelog?: {
    version: string;
    timestamp: string;
    change: string;
    author: string;
    approvedBy?: string;
  }[];

  // Description
  content: string;                     // Imperative form
  activeForm: string;                  // Present continuous form
  description: string;                 // Detailed explanation

  // Status tracking
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  progress?: {
    percentage: number;
    currentPhase: string;
    lastUpdated: string;
  };

  // Dependencies & Blockers
  dependencies?: string[];
  blockers?: {
    description: string;
    blockingTaskId?: string;
    resolution?: string;
  }[];

  // Test suite
  testSuite: TaskTestSuite;

  // Workflow
  workflow: TaskWorkflow;

  // Planning results (separate object)
  planningResult?: TaskPlanningResult;

  // Execution context (avoid re-reading files)
  context?: {
    relevantFiles: string[];
    keyFindings: string[];
    previousAttempts?: {
      attemptNumber: number;
      approach: string;
      outcome: 'failed' | 'partial' | 'success';
      reason: string;
      timestamp: string;
    }[];
  };

  // Metadata
  estimatedDuration?: string;
  actualDuration?: string;
  tags?: string[];
}

export interface TaskRegistry {
  version: string;
  lastUpdated: string;
  tasks: {
    id: string;
    file: string;
    status: string;
    priority: string;
  }[];
}
