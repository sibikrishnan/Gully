/**
 * Task System Test Selection - Phase 1
 *
 * Test selection logic using simple file-watching.
 * Note: Dependency graph (AST parsing) is deferred to Phase 2.
 */

import {
  TaskDefinition,
  TaskExecutionState,
  TestSelectionMode,
  TestSelectionOptions,
  TestCaseDefinition,
} from './schema';
import {
  loadTaskDefinition,
  loadTaskState,
} from './core';
import {
  getChangedFilesSince,
} from './git';

// ============================================================================
// TEST SELECTION
// ============================================================================

/**
 * Select which tests to run based on mode and context
 */
export async function selectTestsToRun(
  taskId: string,
  options: TestSelectionOptions
): Promise<string[]> {
  const definition = await loadTaskDefinition(taskId);
  const state = await loadTaskState(taskId);

  // Check for major changes that require running ALL tests
  if (options.forceMajorChange || await isMajorChange(state)) {
    console.log('Major change detected - running ALL tests');
    return definition.testSuite.testCases.map(tc => tc.id);
  }

  // Apply selection mode
  switch (options.mode) {
    case 'ALL':
      return selectAll(definition);

    case 'UNTRUSTED_ONLY':
      return await selectUntrustedOnly(definition, state);

    case 'CRITICAL_ONLY':
      return selectCriticalOnly(definition);

    case 'SELECTIVE':
      return selectSpecific(definition, options);

    case 'CHANGED_FILES':
      return await selectByChangedFiles(definition, state);

    default:
      throw new Error(`Unknown test selection mode: ${options.mode}`);
  }
}

// ============================================================================
// SELECTION MODE IMPLEMENTATIONS
// ============================================================================

/**
 * Select all tests
 */
function selectAll(definition: TaskDefinition): string[] {
  return definition.testSuite.testCases.map(tc => tc.id);
}

/**
 * Select only untrusted tests or tests affected by file changes
 */
async function selectUntrustedOnly(
  definition: TaskDefinition,
  state: TaskExecutionState
): Promise<string[]> {
  const selected: string[] = [];

  // Get changed files since last test run
  const changedFiles = state.gitContext.changedFilesSince || [];

  for (const testCase of definition.testSuite.testCases) {
    const result = state.testResults[testCase.id];

    // If test is not trusted, always run it
    if (!result || !result.trusted) {
      selected.push(testCase.id);
      continue;
    }

    // If test is trusted but watched files changed, run it
    if (testCase.dependencies.watchFiles.some(file => changedFiles.includes(file))) {
      selected.push(testCase.id);
    }
  }

  return selected;
}

/**
 * Select only critical priority tests
 */
function selectCriticalOnly(definition: TaskDefinition): string[] {
  return definition.testSuite.testCases
    .filter(tc => tc.priority === 'critical')
    .map(tc => tc.id);
}

/**
 * Select specific tests by ID
 */
function selectSpecific(
  definition: TaskDefinition,
  options: TestSelectionOptions
): string[] {
  if (!options.selection || !options.selection.runTestIds) {
    throw new Error('SELECTIVE mode requires selection.runTestIds');
  }

  const availableIds = new Set(definition.testSuite.testCases.map(tc => tc.id));
  const requestedIds = options.selection.runTestIds;

  // Validate all requested IDs exist
  const invalidIds = requestedIds.filter(id => !availableIds.has(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid test IDs: ${invalidIds.join(', ')}`);
  }

  return requestedIds;
}

/**
 * Select tests by changed files (file-watching only, no AST)
 */
async function selectByChangedFiles(
  definition: TaskDefinition,
  state: TaskExecutionState
): Promise<string[]> {
  const selected: string[] = [];
  const changedFiles = state.gitContext.changedFilesSince || [];

  if (changedFiles.length === 0) {
    console.log('No files changed - no tests selected');
    return [];
  }

  for (const testCase of definition.testSuite.testCases) {
    // Check if any watched files changed
    if (testCase.dependencies.watchFiles.some(file => changedFiles.includes(file))) {
      selected.push(testCase.id);
    }
  }

  return selected;
}

// ============================================================================
// MAJOR CHANGE DETECTION
// ============================================================================

/**
 * Detect if a major change occurred that requires running ALL tests
 */
async function isMajorChange(state: TaskExecutionState): Promise<boolean> {
  const changedFiles = state.gitContext.changedFilesSince || [];

  if (changedFiles.length === 0) {
    return false;
  }

  // Check for migration file changes
  const migrationChanged = changedFiles.some(file =>
    file.includes('/migrations/') && file.endsWith('.ts')
  );
  if (migrationChanged) {
    console.log('Migration files changed - triggering major change');
    return true;
  }

  // Check for core utility changes
  const coreUtilityChanged = changedFiles.some(file =>
    file.includes('src/shared/utils/') ||
    file.includes('src/shared/database/')
  );
  if (coreUtilityChanged) {
    console.log('Core utilities changed - triggering major change');
    return true;
  }

  // Check for dependency changes
  const dependencyChanged = changedFiles.some(file =>
    file.includes('package.json') ||
    file.includes('package-lock.json')
  );
  if (dependencyChanged) {
    console.log('Dependencies changed - triggering major change');
    return true;
  }

  // Check for large changeset (configurable threshold)
  const LARGE_CHANGESET_THRESHOLD = 10;
  if (changedFiles.length > LARGE_CHANGESET_THRESHOLD) {
    console.log(`Large changeset (${changedFiles.length} files) - triggering major change`);
    return true;
  }

  return false;
}

// ============================================================================
// TEST ORDERING & DEPENDENCIES
// ============================================================================

/**
 * Order tests based on dependencies and execution config
 */
export function orderTests(
  definition: TaskDefinition,
  selectedTestIds: string[]
): string[] {
  const testCases = definition.testSuite.testCases.filter(tc =>
    selectedTestIds.includes(tc.id)
  );

  // If execution config specifies order, use it
  if (definition.testSuite.executionConfig.runInOrder) {
    const ordered = definition.testSuite.executionConfig.runInOrder.filter(id =>
      selectedTestIds.includes(id)
    );
    // Add any remaining tests not in runInOrder
    const remaining = selectedTestIds.filter(id => !ordered.includes(id));
    return [...ordered, ...remaining];
  }

  // Otherwise, resolve dependencies using topological sort
  return topologicalSort(testCases);
}

/**
 * Topological sort of tests based on dependsOn relationships
 */
function topologicalSort(testCases: TestCaseDefinition[]): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const testMap = new Map(testCases.map(tc => [tc.id, tc]));

  function visit(testId: string): void {
    if (visited.has(testId)) return;
    if (visiting.has(testId)) {
      throw new Error(`Circular dependency detected involving test: ${testId}`);
    }

    visiting.add(testId);

    const testCase = testMap.get(testId);
    if (testCase && testCase.dependsOn) {
      for (const depId of testCase.dependsOn) {
        if (testMap.has(depId)) {
          visit(depId);
        }
      }
    }

    visiting.delete(testId);
    visited.add(testId);
    sorted.push(testId);
  }

  for (const testCase of testCases) {
    visit(testCase.id);
  }

  return sorted;
}

// ============================================================================
// SELECTION UTILITIES
// ============================================================================

/**
 * Get tests that should be skipped (for reporting)
 */
export async function getSkippedTests(
  taskId: string,
  selectedTestIds: string[]
): Promise<Array<{ id: string; reason: string }>> {
  const definition = await loadTaskDefinition(taskId);
  const state = await loadTaskState(taskId);
  const skipped: Array<{ id: string; reason: string }> = [];

  for (const testCase of definition.testSuite.testCases) {
    if (!selectedTestIds.includes(testCase.id)) {
      const result = state.testResults[testCase.id];
      let reason = 'Not selected';

      if (result?.trusted) {
        const changedFiles = state.gitContext.changedFilesSince || [];
        const watchedChanged = testCase.dependencies.watchFiles.some(file =>
          changedFiles.includes(file)
        );
        if (!watchedChanged) {
          reason = 'Trusted and no watched files changed';
        }
      }

      skipped.push({ id: testCase.id, reason });
    }
  }

  return skipped;
}

/**
 * Validate test selection options
 */
export function validateSelectionOptions(options: TestSelectionOptions): void {
  if (options.mode === 'SELECTIVE') {
    if (!options.selection || !options.selection.runTestIds) {
      throw new Error('SELECTIVE mode requires selection.runTestIds array');
    }
    if (options.selection.runTestIds.length === 0) {
      throw new Error('SELECTIVE mode requires at least one test ID');
    }
  }
}

/**
 * Get selection summary for logging
 */
export async function getSelectionSummary(
  taskId: string,
  selectedTestIds: string[]
): Promise<{
  total: number;
  selected: number;
  skipped: number;
  breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}> {
  const definition = await loadTaskDefinition(taskId);
  const total = definition.testSuite.testCases.length;
  const selected = selectedTestIds.length;
  const skipped = total - selected;

  const selectedTests = definition.testSuite.testCases.filter(tc =>
    selectedTestIds.includes(tc.id)
  );

  const breakdown = {
    critical: selectedTests.filter(tc => tc.priority === 'critical').length,
    high: selectedTests.filter(tc => tc.priority === 'high').length,
    medium: selectedTests.filter(tc => tc.priority === 'medium').length,
    low: selectedTests.filter(tc => tc.priority === 'low').length,
  };

  return { total, selected, skipped, breakdown };
}
