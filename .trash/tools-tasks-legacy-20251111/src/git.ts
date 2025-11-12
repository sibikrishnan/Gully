/**
 * Task System Git Operations - Phase 1
 *
 * Git-native versioning using commits and hashes for rollback capability.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import {
  TaskDefinition,
  TaskExecutionState,
  OperationResult,
} from './schema';
import {
  loadTaskDefinition,
  updateTaskDefinition,
  loadTaskState,
  deleteTaskState,
} from './core';

const execAsync = promisify(exec);

// ============================================================================
// GIT UTILITIES
// ============================================================================

/**
 * Execute a git command and return stdout
 */
async function gitCommand(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`git ${command}`, {
      cwd: process.cwd(),
    });
    return stdout.trim();
  } catch (error) {
    throw new Error(`Git command failed: ${(error as Error).message}`);
  }
}

/**
 * Get current Git branch
 */
export async function getCurrentBranch(): Promise<string> {
  return await gitCommand('rev-parse --abbrev-ref HEAD');
}

/**
 * Get current commit hash
 */
export async function getCurrentCommit(): Promise<string> {
  return await gitCommand('rev-parse HEAD');
}

/**
 * Get list of changed files since a commit
 */
export async function getChangedFilesSince(commitHash: string): Promise<string[]> {
  if (!commitHash) {
    return [];
  }

  try {
    const output = await gitCommand(`diff --name-only ${commitHash} HEAD`);
    return output ? output.split('\n').filter(Boolean) : [];
  } catch (error) {
    console.warn(`Could not get changed files since ${commitHash}: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Get Git status for specific path pattern
 */
export async function getGitStatus(pathPattern: string = '.'): Promise<string> {
  return await gitCommand(`status --porcelain ${pathPattern}`);
}

/**
 * Check if there are uncommitted changes in definitions/
 */
export async function hasUncommittedDefinitions(): Promise<boolean> {
  const status = await getGitStatus('.claude/tasks/definitions/');
  return status.length > 0;
}

// ============================================================================
// CHECKPOINT OPERATIONS
// ============================================================================

/**
 * Create a checkpoint after successful tests
 *
 * This function:
 * 1. Verifies all tests are passing
 * 2. Adds definitions/ to Git staging
 * 3. Records current commit hash in task definition
 * 4. Updates task state with Git context
 */
export async function createCheckpoint(taskId: string): Promise<OperationResult<string>> {
  try {
    // Load task state to verify tests
    const state = await loadTaskState(taskId);

    // Verify all tests are passing
    const testResults = Object.values(state.testResults);
    if (testResults.length === 0) {
      return {
        success: false,
        error: 'Cannot create checkpoint - no tests have been run',
        timestamp: new Date().toISOString(),
      };
    }

    const allPassing = testResults.every(r => r.status === 'passing');
    if (!allPassing) {
      const failedTests = testResults.filter(r => r.status === 'failing');
      return {
        success: false,
        error: `Cannot create checkpoint - ${failedTests.length} test(s) failing`,
        timestamp: new Date().toISOString(),
      };
    }

    // Stage definitions directory for commit
    await gitCommand('add .claude/tasks/definitions/');

    // Get current commit hash
    const commitHash = await getCurrentCommit();

    // Update task definition with checkpoint
    const definition = await loadTaskDefinition(taskId);
    const result = await updateTaskDefinition(taskId, {
      git: {
        lastKnownGoodCommit: commitHash,
        definitionPath: `definitions/task-${taskId}.json`,
      },
    });

    if (!result.success) {
      return {
        success: false,
        error: `Failed to update task definition: ${result.error}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Mark all passing tests as trusted
    for (const testId in state.testResults) {
      if (state.testResults[testId].status === 'passing') {
        state.testResults[testId].trusted = true;
      }
    }

    // Update state with Git context
    state.gitContext = {
      branch: await getCurrentBranch(),
      lastTestedCommit: commitHash,
      changedFilesSince: [],
    };

    state.executionLog.push({
      timestamp: new Date().toISOString(),
      phase: 'testing',
      action: `Created checkpoint at commit ${commitHash.slice(0, 7)}`,
      result: 'success',
    });

    await require('./core').saveTaskState(state);

    return {
      success: true,
      data: commitHash,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create checkpoint: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Rollback task to last known good state
 *
 * This function:
 * 1. Checks for last known good commit
 * 2. Checks out task definition from that commit
 * 3. Clears execution state (fresh start)
 */
export async function rollbackTask(taskId: string): Promise<OperationResult<string>> {
  try {
    const definition = await loadTaskDefinition(taskId);

    // Check if we have a checkpoint to rollback to
    if (!definition.git.lastKnownGoodCommit) {
      return {
        success: false,
        error: 'No checkpoint found - cannot rollback',
        timestamp: new Date().toISOString(),
      };
    }

    const commitHash = definition.git.lastKnownGoodCommit;
    const definitionPath = definition.git.definitionPath;

    // Checkout task definition from last known good commit
    try {
      await gitCommand(`checkout ${commitHash} -- .claude/tasks/${definitionPath}`);
    } catch (error) {
      return {
        success: false,
        error: `Failed to checkout file from commit ${commitHash.slice(0, 7)}: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Clear execution state (start fresh)
    await deleteTaskState(taskId);

    return {
      success: true,
      data: commitHash,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to rollback task: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get Git context for a task
 *
 * Updates the state with current Git information:
 * - Current branch
 * - Changed files since last test
 */
export async function updateGitContext(taskId: string): Promise<OperationResult> {
  try {
    const state = await loadTaskState(taskId);
    const branch = await getCurrentBranch();
    const currentCommit = await getCurrentCommit();

    // Get changed files since last test
    let changedFiles: string[] = [];
    if (state.gitContext.lastTestedCommit) {
      changedFiles = await getChangedFilesSince(state.gitContext.lastTestedCommit);
    }

    // Update Git context
    state.gitContext = {
      branch,
      lastTestedCommit: state.gitContext.lastTestedCommit || currentCommit,
      changedFilesSince: changedFiles,
    };

    await require('./core').saveTaskState(state);

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to update Git context: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Initialize Git context for a new task
 */
export async function initializeGitContext(taskId: string): Promise<void> {
  const state = await loadTaskState(taskId);
  const branch = await getCurrentBranch();
  const currentCommit = await getCurrentCommit();

  state.gitContext = {
    branch,
    lastTestedCommit: currentCommit,
    changedFilesSince: [],
  };

  await require('./core').saveTaskState(state);
}

// ============================================================================
// DIAGNOSTIC FUNCTIONS
// ============================================================================

/**
 * Get checkpoint status for a task
 */
export async function getCheckpointStatus(taskId: string): Promise<{
  hasCheckpoint: boolean;
  commitHash?: string;
  commitAge?: string;
  uncommittedChanges: boolean;
}> {
  try {
    const definition = await loadTaskDefinition(taskId);
    const hasCheckpoint = !!definition.git.lastKnownGoodCommit;
    const uncommittedChanges = await hasUncommittedDefinitions();

    const result: any = {
      hasCheckpoint,
      uncommittedChanges,
    };

    if (hasCheckpoint) {
      result.commitHash = definition.git.lastKnownGoodCommit;

      // Try to get commit age
      try {
        const timestamp = await gitCommand(
          `show -s --format=%ct ${definition.git.lastKnownGoodCommit}`
        );
        const commitTime = parseInt(timestamp) * 1000;
        const ageMs = Date.now() - commitTime;
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
        const ageHours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (ageDays > 0) {
          result.commitAge = `${ageDays}d ${ageHours}h ago`;
        } else {
          result.commitAge = `${ageHours}h ago`;
        }
      } catch {
        // Ignore - commit age is optional info
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get checkpoint status: ${(error as Error).message}`);
  }
}
