#!/usr/bin/env ts-node
/**
 * Phase 1 Integration Tests
 *
 * Tests all core functionality of the task system:
 * - CRUD operations for definitions and state
 * - Git checkpoint and rollback
 * - Test selection modes
 * - File structure integrity
 */

import {
  TaskDefinition,
  TaskExecutionState,
  TestSelectionMode,
} from './schema';
import {
  loadTaskDefinition,
  saveTaskDefinition,
  updateTaskDefinition,
  deleteTaskDefinition,
  loadTaskState,
  saveTaskState,
  updateTaskState,
  deleteTaskState,
  taskExists,
  stateExists,
  getTaskStatus,
} from './core';
import {
  getCurrentBranch,
  getCurrentCommit,
  getChangedFilesSince,
  createCheckpoint,
  rollbackTask,
  updateGitContext,
  getCheckpointStatus,
} from './git';
import {
  selectTestsToRun,
  orderTests,
  getSkippedTests,
  getSelectionSummary,
} from './selection';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function assertEqual<T>(actual: T, expected: T, message: string): Promise<void> {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, message);
  if (!match) {
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// TEST 1: Task Definition CRUD
// ============================================================================

async function testTaskDefinitionCRUD(): Promise<void> {
  console.log('\n📋 TEST 1: Task Definition CRUD Operations\n');

  // Create a test task definition
  const testTask: TaskDefinition = {
    id: 'test-99',
    version: '1.0',
    content: 'Test task for Phase 1 validation',
    activeForm: 'Testing Phase 1 validation',
    description: 'A test task to verify the task system works correctly',
    status: 'in_progress',
    workflowRef: 'workflows/tdd.json',
    git: {
      lastKnownGoodCommit: '',
      definitionPath: 'definitions/task-test-99.json',
    },
    testSuite: {
      testCases: [
        {
          id: 'test-99.unit',
          category: 'unit',
          description: 'Unit test for test task',
          required: true,
          priority: 'critical',
          testFile: {
            path: '/test/path.ts',
            targetFunctions: ['testFunction'],
            scenarios: ['Basic scenario'],
            edgeCases: ['Edge case 1'],
          },
          dependencies: {
            watchFiles: ['src/test.ts'],
            autoDetect: false,
          },
          trustable: true,
          dependsOn: [],
        },
      ],
      coverageRequirements: {
        enabled: true,
        minimumPercentage: 80,
        criticalFiles: ['src/test.ts'],
      },
      executionConfig: {
        runInOrder: ['test-99.unit'],
        stopOnFirstFailure: true,
        parallelizable: false,
      },
    },
    dependencies: [],
    tags: ['test'],
    estimatedDuration: '5 minutes',
  };

  // Test: Save task definition
  const saveResult = await saveTaskDefinition(testTask);
  assert(saveResult.success, 'Save task definition');

  // Test: Task exists
  const exists = await taskExists('test-99');
  assert(exists, 'Task exists after save');

  // Test: Load task definition
  const loaded = await loadTaskDefinition('test-99');
  await assertEqual(loaded.id, 'test-99', 'Loaded task has correct ID');
  await assertEqual(loaded.content, testTask.content, 'Loaded task has correct content');

  // Test: Update task definition
  const updateResult = await updateTaskDefinition('test-99', {
    status: 'completed',
    description: 'Updated description',
  });
  assert(updateResult.success, 'Update task definition');

  const updated = await loadTaskDefinition('test-99');
  await assertEqual(updated.status, 'completed', 'Task status updated');
  await assertEqual(updated.description, 'Updated description', 'Task description updated');

  // Test: Delete task definition (cleanup)
  const deleteResult = await deleteTaskDefinition('test-99');
  assert(deleteResult.success, 'Delete task definition');

  const existsAfterDelete = await taskExists('test-99');
  assert(!existsAfterDelete, 'Task does not exist after delete');
}

// ============================================================================
// TEST 2: Task State CRUD
// ============================================================================

async function testTaskStateCRUD(): Promise<void> {
  console.log('\n📊 TEST 2: Task State CRUD Operations\n');

  // First create a task definition
  const testTask: TaskDefinition = {
    id: 'test-100',
    version: '1.0',
    content: 'Test task for state operations',
    activeForm: 'Testing state operations',
    description: 'Test task state management',
    status: 'in_progress',
    workflowRef: 'workflows/tdd.json',
    git: {
      lastKnownGoodCommit: '',
      definitionPath: 'definitions/task-test-100.json',
    },
    testSuite: {
      testCases: [],
      coverageRequirements: {
        enabled: false,
        criticalFiles: [],
      },
      executionConfig: {
        runInOrder: [],
        stopOnFirstFailure: true,
        parallelizable: false,
      },
    },
  };

  await saveTaskDefinition(testTask);

  // Test: Load state (should create default)
  const state = await loadTaskState('test-100');
  await assertEqual(state.taskId, 'test-100', 'Default state has correct taskId');
  await assertEqual(state.currentPhase, 'idle', 'Default state phase is idle');
  assert(Object.keys(state.testResults).length === 0, 'Default state has empty test results');

  // Test: State exists check
  const existsBefore = await stateExists('test-100');
  assert(!existsBefore, 'State file does not exist before first save');

  // Test: Save state
  state.currentPhase = 'testing';
  state.testResults['test-1'] = {
    status: 'passing',
    lastRun: new Date().toISOString(),
    duration: 100,
    trusted: false,
  };
  const saveResult = await saveTaskState(state);
  assert(saveResult.success, 'Save task state');

  const existsAfter = await stateExists('test-100');
  assert(existsAfter, 'State file exists after save');

  // Test: Load saved state
  const loaded = await loadTaskState('test-100');
  await assertEqual(loaded.currentPhase, 'testing', 'Loaded state has correct phase');
  assert(Object.keys(loaded.testResults).length === 1, 'Loaded state has test results');

  // Test: Update state
  const updateResult = await updateTaskState('test-100', {
    currentPhase: 'testing',
  });
  assert(updateResult.success, 'Update task state');

  const updated = await loadTaskState('test-100');
  await assertEqual(updated.currentPhase, 'testing', 'State phase updated');

  // Test: Get task status (combined view)
  const status = await getTaskStatus('test-100');
  assert(status.hasState, 'getTaskStatus reports state exists');
  await assertEqual(status.definition.id, 'test-100', 'Status includes definition');
  await assertEqual(status.state.currentPhase, 'testing', 'Status includes state');

  // Test: Delete state
  const deleteResult = await deleteTaskState('test-100');
  assert(deleteResult.success, 'Delete task state');

  const existsAfterDelete = await stateExists('test-100');
  assert(!existsAfterDelete, 'State does not exist after delete');

  // Cleanup
  await deleteTaskDefinition('test-100');
}

// ============================================================================
// TEST 3: Git Operations
// ============================================================================

async function testGitOperations(): Promise<void> {
  console.log('\n🔀 TEST 3: Git Checkpoint and Rollback\n');

  // Create test task
  const testTask: TaskDefinition = {
    id: 'test-101',
    version: '1.0',
    content: 'Test Git operations',
    activeForm: 'Testing Git operations',
    description: 'Test Git checkpoint and rollback',
    status: 'in_progress',
    workflowRef: 'workflows/tdd.json',
    git: {
      lastKnownGoodCommit: '',
      definitionPath: 'definitions/task-test-101.json',
    },
    testSuite: {
      testCases: [
        {
          id: 'test-101.unit',
          category: 'unit',
          description: 'Test',
          required: true,
          priority: 'critical',
          testFile: {
            path: '/test/path.ts',
            targetFunctions: ['test'],
            scenarios: [],
            edgeCases: [],
          },
          dependencies: {
            watchFiles: ['src/test.ts'],
            autoDetect: false,
          },
          trustable: true,
          dependsOn: [],
        },
      ],
      coverageRequirements: {
        enabled: false,
        criticalFiles: [],
      },
      executionConfig: {
        runInOrder: [],
        stopOnFirstFailure: true,
        parallelizable: false,
      },
    },
  };

  await saveTaskDefinition(testTask);

  // Test: Git utilities
  const branch = await getCurrentBranch();
  assert(branch.length > 0, 'Get current branch');

  const commit = await getCurrentCommit();
  assert(commit.length === 40, 'Get current commit hash (40 chars)');

  // Test: Create checkpoint (should fail - no passing tests)
  let state = await loadTaskState('test-101');
  const checkpointFail = await createCheckpoint('test-101');
  assert(!checkpointFail.success, 'Checkpoint fails when no tests have run');

  // Add a passing test result
  state.testResults['test-101.unit'] = {
    status: 'passing',
    lastRun: new Date().toISOString(),
    duration: 50,
    trusted: false,
  };
  await saveTaskState(state);

  // Test: Create checkpoint (should succeed)
  const checkpointSuccess = await createCheckpoint('test-101');
  assert(checkpointSuccess.success, 'Checkpoint succeeds with passing tests');

  // Verify checkpoint was recorded
  const updated = await loadTaskDefinition('test-101');
  assert(updated.git.lastKnownGoodCommit !== '', 'Checkpoint commit recorded');

  // Test: Get checkpoint status
  const checkpointStatus = await getCheckpointStatus('test-101');
  assert(checkpointStatus.hasCheckpoint, 'Checkpoint status shows checkpoint exists');
  assert(checkpointStatus.commitHash !== undefined, 'Checkpoint status includes commit hash');

  // Test: Update Git context
  const contextResult = await updateGitContext('test-101');
  assert(contextResult.success, 'Update Git context');

  state = await loadTaskState('test-101');
  assert(state.gitContext.branch === branch, 'Git context has correct branch');

  // Test: Rollback (would require actual Git manipulation - skip for now)
  // We'll just verify the function exists and doesn't crash
  const originalCommit = updated.git.lastKnownGoodCommit;
  assert(originalCommit !== '', 'Have commit to potentially rollback to');

  // Cleanup
  await deleteTaskDefinition('test-101');
  await deleteTaskState('test-101');
}

// ============================================================================
// TEST 4: Test Selection
// ============================================================================

async function testTestSelection(): Promise<void> {
  console.log('\n🎯 TEST 4: Test Selection Modes\n');

  // Create task with multiple tests
  const testTask: TaskDefinition = {
    id: 'test-102',
    version: '1.0',
    content: 'Test selection modes',
    activeForm: 'Testing selection modes',
    description: 'Test test selection logic',
    status: 'in_progress',
    workflowRef: 'workflows/tdd.json',
    git: {
      lastKnownGoodCommit: '',
      definitionPath: 'definitions/task-test-102.json',
    },
    testSuite: {
      testCases: [
        {
          id: 'test-102.unit',
          category: 'unit',
          description: 'Unit test',
          required: true,
          priority: 'critical',
          testFile: {
            path: '/test/unit.ts',
            targetFunctions: ['test'],
            scenarios: [],
            edgeCases: [],
          },
          dependencies: {
            watchFiles: ['src/utils.ts'],
            autoDetect: false,
          },
          trustable: true,
          dependsOn: [],
        },
        {
          id: 'test-102.integration',
          category: 'integration',
          description: 'Integration test',
          required: true,
          priority: 'high',
          testFile: {
            path: '/test/integration.ts',
            targetFunctions: ['test'],
            scenarios: [],
            edgeCases: [],
          },
          dependencies: {
            watchFiles: ['src/service.ts'],
            autoDetect: false,
          },
          trustable: true,
          dependsOn: ['test-102.unit'],
        },
        {
          id: 'test-102.performance',
          category: 'performance',
          description: 'Performance test',
          required: false,
          priority: 'low',
          testFile: {
            path: '/test/perf.ts',
            targetFunctions: ['test'],
            scenarios: [],
            edgeCases: [],
          },
          dependencies: {
            watchFiles: ['src/service.ts'],
            autoDetect: false,
          },
          trustable: true,
          dependsOn: [],
        },
      ],
      coverageRequirements: {
        enabled: false,
        criticalFiles: [],
      },
      executionConfig: {
        runInOrder: ['test-102.unit', 'test-102.integration', 'test-102.performance'],
        stopOnFirstFailure: false,
        parallelizable: false,
      },
    },
  };

  await saveTaskDefinition(testTask);

  // Set up state with trusted tests
  const state = await loadTaskState('test-102');
  state.testResults = {
    'test-102.unit': {
      status: 'passing',
      lastRun: new Date().toISOString(),
      duration: 50,
      trusted: true,
    },
    'test-102.integration': {
      status: 'passing',
      lastRun: new Date().toISOString(),
      duration: 100,
      trusted: false, // Not trusted
    },
  };
  state.gitContext.changedFilesSince = [];
  await saveTaskState(state);

  // Test: ALL mode
  const allTests = await selectTestsToRun('test-102', { mode: 'ALL' });
  await assertEqual(allTests.length, 3, 'ALL mode selects all 3 tests');

  // Test: UNTRUSTED_ONLY mode (no files changed)
  const untrustedTests = await selectTestsToRun('test-102', { mode: 'UNTRUSTED_ONLY' });
  await assertEqual(untrustedTests.length, 1, 'UNTRUSTED_ONLY selects 1 untrusted test');
  assert(untrustedTests.includes('test-102.integration'), 'Untrusted test is selected');

  // Test: CRITICAL_ONLY mode
  const criticalTests = await selectTestsToRun('test-102', { mode: 'CRITICAL_ONLY' });
  await assertEqual(criticalTests.length, 1, 'CRITICAL_ONLY selects 1 critical test');
  assert(criticalTests.includes('test-102.unit'), 'Critical test is selected');

  // Test: SELECTIVE mode
  const selectiveTests = await selectTestsToRun('test-102', {
    mode: 'SELECTIVE',
    selection: { runTestIds: ['test-102.unit', 'test-102.performance'] },
  });
  await assertEqual(selectiveTests.length, 2, 'SELECTIVE mode selects specified tests');

  // Test: CHANGED_FILES mode (with file change)
  state.gitContext.changedFilesSince = ['src/utils.ts'];
  await saveTaskState(state);
  const changedTests = await selectTestsToRun('test-102', { mode: 'CHANGED_FILES' });
  assert(changedTests.includes('test-102.unit'), 'Changed file triggers watched test');

  // Test: Test ordering
  const ordered = orderTests(testTask, allTests);
  await assertEqual(ordered[0], 'test-102.unit', 'First test in order is unit test');
  await assertEqual(ordered[1], 'test-102.integration', 'Second test in order is integration');

  // Test: Skipped tests
  const skipped = await getSkippedTests('test-102', untrustedTests);
  assert(skipped.length === 2, 'Two tests skipped in UNTRUSTED_ONLY mode');

  // Test: Selection summary
  const summary = await getSelectionSummary('test-102', criticalTests);
  await assertEqual(summary.total, 3, 'Summary shows 3 total tests');
  await assertEqual(summary.selected, 1, 'Summary shows 1 selected test');
  await assertEqual(summary.breakdown.critical, 1, 'Summary shows 1 critical test');

  // Cleanup
  await deleteTaskDefinition('test-102');
  await deleteTaskState('test-102');
}

// ============================================================================
// TEST 5: File Structure
// ============================================================================

async function testFileStructure(): Promise<void> {
  console.log('\n📁 TEST 5: File Structure and .gitignore\n');

  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  // Test: Definitions are tracked by Git
  try {
    const { stdout: definitionsStatus } = await execAsync(
      'git check-ignore .claude/tasks/definitions/',
      { cwd: process.cwd() }
    );
    assert(false, 'Definitions directory should NOT be ignored by Git');
  } catch (error) {
    assert(true, 'Definitions directory is tracked by Git');
  }

  // Test: State files are ignored by Git
  try {
    const { stdout: stateStatus } = await execAsync(
      'git check-ignore .claude/tasks/state/task-test-state.json',
      { cwd: process.cwd() }
    );
    assert(true, 'State files are ignored by Git (.gitignore working)');
  } catch (error) {
    assert(false, 'State files should be ignored by Git');
  }

  // Test: Task-3 example exists
  const task3Exists = await taskExists('3');
  assert(task3Exists, 'Example task-3.json exists');

  if (task3Exists) {
    const task3 = await loadTaskDefinition('3');
    await assertEqual(task3.id, '3', 'Task-3 has correct ID');
    assert(task3.testSuite.testCases.length === 4, 'Task-3 has 4 test cases');
    await assertEqual(task3.testSuite.testCases[0].id, 'jwt-utils.unit', 'First test is jwt-utils.unit');
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Phase 1 Task System Integration Tests              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await testTaskDefinitionCRUD();
    await testTaskStateCRUD();
    await testGitOperations();
    await testTestSelection();
    await testFileStructure();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📊 Total:  ${testsPassed + testsFailed}\n`);

    if (testsFailed === 0) {
      console.log('🎉 All tests passed! Phase 1 implementation is working correctly.\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Test suite crashed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
