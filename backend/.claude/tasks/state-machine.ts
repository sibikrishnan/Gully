/**
 * Workflow State Machine
 * Enforces TDD workflow with configurable enforcement modes
 */

import {
  Task,
  WorkflowState,
  WorkflowExecutionLog,
  ExecutionLogEntry,
  TestHealth
} from './schema';

/**
 * State Transition Definition
 */
interface StateTransition {
  from: WorkflowState | '*';
  to: WorkflowState[];
  condition?: (task: Task) => boolean;
  conditionDescription?: string;
  action?: (task: Task) => void;
}

/**
 * TDD Workflow State Transitions
 * Enforces: Plan → Write Tests → Verify Fail → Implement → Verify Pass → Refactor → Validate
 */
const TDD_TRANSITIONS: StateTransition[] = [
  // Start workflow from idle
  {
    from: 'idle',
    to: ['planning'],
  },

  // Planning completed → need user approval
  {
    from: 'planning',
    to: ['plan_review', 'blocked'],
    condition: (task) => task.planningResult?.overallStatus === 'completed',
    conditionDescription: 'Planning must be completed with all 4 phases'
  },

  // After approval → TDD mandates: write tests first
  {
    from: 'plan_review',
    to: ['test_writing', 'planning'],
    condition: (task) => {
      // Can go to test_writing if approved, back to planning if rejected
      if (task.planningResult?.userApproval?.approved === false) {
        return false; // Will transition to 'planning'
      }
      return task.planningResult?.userApproval?.approved === true;
    },
    conditionDescription: 'User must approve plan to proceed to test writing'
  },

  // Tests written → verify they fail (TDD red phase)
  {
    from: 'test_writing',
    to: ['test_verification'],
  },

  // Tests verified failing → now implement code
  {
    from: 'test_verification',
    to: ['implementation', 'test_writing', 'blocked'],
    condition: (task) => {
      // Check if tests exist and are in expected failing state
      const hasTests = task.testSuite.testCases.some(
        tc => tc.testFile.status === 'created' || tc.testFile.status === 'failing'
      );
      return hasTests;
    },
    conditionDescription: 'Tests must exist and be verified in failing state (TDD red)'
  },

  // Implementation done → run tests (TDD green phase)
  {
    from: 'implementation',
    to: ['test_execution'],
  },

  // Tests executed → evaluate results
  {
    from: 'test_execution',
    to: ['refactoring', 'validation', 'implementation', 'blocked'],
    condition: (task) => {
      // Can proceed to refactoring/validation if tests pass
      // Back to implementation if tests fail
      const allTestsPass = task.testSuite.testCases
        .filter(tc => tc.required)
        .every(tc => tc.testFile.status === 'passing');

      return allTestsPass;
    },
    conditionDescription: 'All required tests must pass to proceed'
  },

  // Refactoring done → re-run tests to ensure no regression
  {
    from: 'refactoring',
    to: ['test_execution'],
  },

  // Final validation (build, lint, coverage)
  {
    from: 'validation',
    to: ['completed', 'failed', 'implementation'],
    condition: (task) => {
      const criteria = task.testSuite.successCriteria;
      // Check if all success criteria met
      // This is a simplified check - actual validation happens externally
      return true; // Allow transition, external validation determines which target
    },
    conditionDescription: 'All success criteria (build, lint, coverage) must pass'
  },

  // Can always become blocked from any state
  {
    from: '*',
    to: ['blocked'],
  },

  // Can resume from blocked to previous state
  {
    from: 'blocked',
    to: ['idle', 'planning', 'test_writing', 'implementation'],
  },

  // Failed state can retry from planning
  {
    from: 'failed',
    to: ['planning', 'idle'],
  }
];

/**
 * Derive current workflow state from task
 * Falls back to progress.currentPhase or workflowState
 */
export function deriveWorkflowState(task: Task): WorkflowState {
  // Prefer explicit workflowState
  if (task.workflowState) {
    return task.workflowState;
  }

  // Fall back to progress.currentPhase if it matches WorkflowState
  if (task.progress?.currentPhase) {
    const phase = task.progress.currentPhase as WorkflowState;
    // Validate it's a valid state
    const validStates: WorkflowState[] = [
      'idle', 'planning', 'plan_review', 'test_writing', 'test_verification',
      'implementation', 'test_execution', 'refactoring', 'validation',
      'completed', 'blocked', 'failed'
    ];
    if (validStates.includes(phase)) {
      return phase;
    }
  }

  // Default to idle
  return 'idle';
}

/**
 * Check if transition from current state to target state is valid
 */
export function canTransition(
  task: Task,
  targetState: WorkflowState
): { allowed: boolean; reason?: string; validNextStates?: WorkflowState[] } {
  const currentState = deriveWorkflowState(task);

  // Find all valid transitions from current state
  const validTransitions = TDD_TRANSITIONS.filter(
    t => t.from === currentState || t.from === '*'
  );

  // Filter by conditions
  const allowedTransitions = validTransitions.filter(t => {
    if (!t.condition) return true;
    try {
      return t.condition(task);
    } catch (error) {
      console.error(`Error evaluating transition condition: ${error}`);
      return false;
    }
  });

  // Collect all valid next states
  const validNextStates = Array.from(
    new Set(allowedTransitions.flatMap(t => t.to))
  );

  // Check if target is in valid next states
  const canTransition = validNextStates.includes(targetState);

  if (!canTransition) {
    // Find the transition rule for better error message
    const rule = TDD_TRANSITIONS.find(
      t => (t.from === currentState || t.from === '*') && t.to.includes(targetState)
    );

    const reason = rule?.conditionDescription
      ? `Cannot transition from ${currentState} to ${targetState}. Reason: ${rule.conditionDescription}`
      : `Cannot transition from ${currentState} to ${targetState}. Valid next states: ${validNextStates.join(', ')}`;

    return {
      allowed: false,
      reason,
      validNextStates
    };
  }

  return { allowed: true, validNextStates };
}

/**
 * Transition task to new state with enforcement
 */
export function transitionState(
  task: Task,
  targetState: WorkflowState,
  enforcementMode: 'ERROR' | 'WARN' | 'SILENT' = 'ERROR',
  notes?: string
): Task {
  const currentState = deriveWorkflowState(task);
  const validation = canTransition(task, targetState);

  // Handle validation failure based on enforcement mode
  if (!validation.allowed) {
    if (enforcementMode === 'ERROR') {
      throw new Error(`Workflow violation: ${validation.reason}`);
    } else if (enforcementMode === 'WARN') {
      console.warn(`⚠️  WARNING: ${validation.reason}`);
    }
    // SILENT mode: allow transition anyway (logs but doesn't block)
  }

  // Find and execute transition action if defined
  const transition = TDD_TRANSITIONS.find(
    t => (t.from === currentState || t.from === '*') && t.to.includes(targetState)
  );

  if (transition?.action) {
    try {
      transition.action(task);
    } catch (error) {
      console.error(`Error executing transition action: ${error}`);
    }
  }

  // Create workflow log entry
  const now = new Date().toISOString();
  const previousLog = task.workflowHistory?.find(log => log.state === currentState && !log.exitedAt);

  // Close previous state
  const updatedHistory = (task.workflowHistory || []).map(log => {
    if (log.state === currentState && !log.exitedAt) {
      const duration = new Date(now).getTime() - new Date(log.enteredAt).getTime();
      return {
        ...log,
        exitedAt: now,
        duration,
        outcome: 'success' as const
      };
    }
    return log;
  });

  // Add new state entry
  const newLogEntry: WorkflowExecutionLog = {
    state: targetState,
    enteredAt: now,
    notes: notes || `Transitioned from ${currentState} to ${targetState}`
  };

  // Update task
  return {
    ...task,
    workflowState: targetState,
    workflowHistory: [...updatedHistory, newLogEntry],
    progress: {
      ...task.progress,
      percentage: task.progress?.percentage || 0,
      currentPhase: targetState,
      lastUpdated: now
    }
  };
}

/**
 * Enforce workflow rules for specific actions
 */
export function enforceWorkflowRules(
  task: Task,
  proposedAction: 'write_code' | 'write_test' | 'skip_planning' | 'skip_approval'
): { allowed: boolean; reason?: string } {
  const enforcement = task.workflow.enforcement;
  const currentState = deriveWorkflowState(task);

  // TDD Rule: Must write tests before implementation
  if (enforcement.rules.testFirst && proposedAction === 'write_code') {
    const allowedStates: WorkflowState[] = ['implementation', 'refactoring'];

    if (!allowedStates.includes(currentState)) {
      const message = `TDD violation: Must write tests before implementation. Current state: ${currentState}`;

      if (enforcement.mode === 'ERROR') {
        return { allowed: false, reason: message };
      } else if (enforcement.mode === 'WARN') {
        console.warn(`⚠️  WARNING: ${message}`);
        return { allowed: true, reason: message };
      }
    }
  }

  // Planning Rule: Subagent required for planning phase
  if (enforcement.rules.subagentRequired && proposedAction === 'skip_planning') {
    if (task.workflow.subagent.required) {
      const message = 'Workflow requires planning phase with subagent';

      if (enforcement.mode === 'ERROR') {
        return { allowed: false, reason: message };
      } else if (enforcement.mode === 'WARN') {
        console.warn(`⚠️  WARNING: ${message}`);
        return { allowed: true, reason: message };
      }
    }
  }

  // Approval Rule: Must get user approval before coding
  if (enforcement.rules.approvalRequired && proposedAction === 'skip_approval') {
    const message = 'Workflow requires user approval before proceeding to implementation';

    if (enforcement.mode === 'ERROR') {
      return { allowed: false, reason: message };
    } else if (enforcement.mode === 'WARN') {
      console.warn(`⚠️  WARNING: ${message}`);
      return { allowed: true, reason: message };
    }
  }

  // Phase Sequence Rule: Must complete phases in order
  if (enforcement.rules.phaseSequence && proposedAction === 'skip_planning') {
    if (currentState === 'idle') {
      const message = 'Workflow requires completing phases in sequence (planning → approval → implementation)';

      if (enforcement.mode === 'ERROR') {
        return { allowed: false, reason: message };
      } else if (enforcement.mode === 'WARN') {
        console.warn(`⚠️  WARNING: ${message}`);
        return { allowed: true, reason: message };
      }
    }
  }

  return { allowed: true };
}

/**
 * Calculate test health summary from test suite
 */
export function calculateTestHealth(task: Task): TestHealth {
  const testCases = task.testSuite.testCases;
  const now = new Date().toISOString();

  const total = testCases.length;
  const passing = testCases.filter(tc => tc.testFile.status === 'passing').length;
  const failing = testCases.filter(tc => tc.testFile.status === 'failing').length;
  const notRun = testCases.filter(
    tc => tc.testFile.status === 'not_created' || tc.testFile.status === 'created'
  ).length;

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'failing' | 'unknown';

  if (total === 0) {
    overallStatus = 'unknown';
  } else if (passing === total) {
    overallStatus = 'healthy';
  } else if (failing > 0 && passing > 0) {
    overallStatus = 'degraded';
  } else if (failing > 0) {
    overallStatus = 'failing';
  } else {
    overallStatus = 'unknown';
  }

  return {
    total,
    passing,
    failing,
    notRun,
    lastUpdated: now,
    overallStatus
  };
}

/**
 * Log execution action with metrics
 */
export function logExecution(
  task: Task,
  entry: Omit<ExecutionLogEntry, 'timestamp'>
): Task {
  const logEntry: ExecutionLogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  return {
    ...task,
    executionLog: [...(task.executionLog || []), logEntry]
  };
}

/**
 * Generate metrics report in markdown format
 */
export function generateMetricsReport(task: Task): string {
  const executionLog = task.executionLog || [];
  const workflowHistory = task.workflowHistory || [];

  // Calculate totals
  const totalDuration = executionLog.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const totalTokens = executionLog.reduce((sum, entry) => sum + (entry.tokensUsed || 0), 0);
  const totalFilesRead = new Set(executionLog.flatMap(e => e.filesRead || [])).size;
  const totalFilesModified = new Set(executionLog.flatMap(e => e.filesModified || [])).size;
  const totalTestsRun = executionLog.reduce((sum, entry) => sum + (entry.testsRun || 0), 0);

  // Group by phase
  const byPhase = executionLog.reduce((acc, entry) => {
    if (!acc[entry.phase]) {
      acc[entry.phase] = {
        count: 0,
        duration: 0,
        tokens: 0,
        tests: 0
      };
    }
    acc[entry.phase].count++;
    acc[entry.phase].duration += entry.duration || 0;
    acc[entry.phase].tokens += entry.tokensUsed || 0;
    acc[entry.phase].tests += entry.testsRun || 0;
    return acc;
  }, {} as Record<string, { count: number; duration: number; tokens: number; tests: number }>);

  // Generate markdown report
  let report = `# Task ${task.id} Metrics Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Status:** ${task.status}\n`;
  report += `- **Workflow State:** ${task.workflowState || 'unknown'}\n`;
  report += `- **Test Health:** ${task.testHealth?.overallStatus || 'unknown'} (${task.testHealth?.passing || 0}/${task.testHealth?.total || 0} passing)\n\n`;

  report += `## Overall Metrics\n\n`;
  report += `- **Total Duration:** ${(totalDuration / 1000).toFixed(2)}s\n`;
  report += `- **Total Tokens:** ${totalTokens.toLocaleString()}\n`;
  report += `- **Files Read:** ${totalFilesRead}\n`;
  report += `- **Files Modified:** ${totalFilesModified}\n`;
  report += `- **Tests Run:** ${totalTestsRun}\n\n`;

  report += `## By Phase\n\n`;
  report += `| Phase | Actions | Duration | Tokens | Tests |\n`;
  report += `|-------|---------|----------|--------|-------|\n`;

  Object.entries(byPhase).forEach(([phase, metrics]) => {
    report += `| ${phase} | ${metrics.count} | ${(metrics.duration / 1000).toFixed(2)}s | ${metrics.tokens.toLocaleString()} | ${metrics.tests} |\n`;
  });

  report += `\n## Workflow History\n\n`;
  report += `| State | Entered | Duration | Outcome |\n`;
  report += `|-------|---------|----------|----------|\n`;

  workflowHistory.forEach(log => {
    const duration = log.duration ? `${(log.duration / 1000).toFixed(2)}s` : 'In progress';
    report += `| ${log.state} | ${log.enteredAt} | ${duration} | ${log.outcome || '-'} |\n`;
  });

  report += `\n## Recent Actions\n\n`;
  const recentActions = executionLog.slice(-10).reverse();
  recentActions.forEach(entry => {
    report += `- **${entry.action}** (${entry.phase}) - ${entry.outcome}\n`;
    if (entry.notes) {
      report += `  - ${entry.notes}\n`;
    }
  });

  return report;
}
