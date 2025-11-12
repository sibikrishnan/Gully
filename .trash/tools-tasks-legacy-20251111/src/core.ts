/**
 * Task System Core Operations - Phase 1
 *
 * Basic CRUD operations for TaskDefinition and TaskExecutionState.
 * Note: Atomic updates are deferred to Phase 3.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import {
  TaskDefinition,
  TaskExecutionState,
  TaskRegistry,
  WorkflowTemplate,
  OperationResult,
} from './schema';

// ============================================================================
// CONFIGURATION
// ============================================================================

const TASKS_ROOT = path.join(process.cwd(), '.claude/tasks');
const DEFINITIONS_DIR = path.join(TASKS_ROOT, 'definitions');
const STATE_DIR = path.join(TASKS_ROOT, 'state');
const WORKFLOWS_DIR = path.join(DEFINITIONS_DIR, 'workflows');
const REGISTRY_PATH = path.join(TASKS_ROOT, 'index.json');

// ============================================================================
// TASK DEFINITION OPERATIONS (Git-Versioned)
// ============================================================================

/**
 * Load a task definition by ID
 */
export async function loadTaskDefinition(taskId: string): Promise<TaskDefinition> {
  const filePath = path.join(DEFINITIONS_DIR, `task-${taskId}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as TaskDefinition;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Task ${taskId} not found at ${filePath}`);
    }
    throw new Error(`Failed to load task ${taskId}: ${(error as Error).message}`);
  }
}

/**
 * Save a task definition
 */
export async function saveTaskDefinition(
  definition: TaskDefinition
): Promise<OperationResult> {
  const filePath = path.join(DEFINITIONS_DIR, `task-${definition.id}.json`);

  try {
    // Ensure definitions directory exists
    await fs.mkdir(DEFINITIONS_DIR, { recursive: true });

    // Write with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(definition, null, 2), 'utf-8');

    // Update registry
    await updateRegistry(definition.id, {
      definitionPath: `definitions/task-${definition.id}.json`,
      status: definition.status,
      lastModified: new Date().toISOString(),
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save task ${definition.id}: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update specific fields in a task definition
 */
export async function updateTaskDefinition(
  taskId: string,
  updates: Partial<TaskDefinition>
): Promise<OperationResult> {
  try {
    const definition = await loadTaskDefinition(taskId);
    const updated = { ...definition, ...updates };
    return await saveTaskDefinition(updated);
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Delete a task definition
 */
export async function deleteTaskDefinition(taskId: string): Promise<OperationResult> {
  const filePath = path.join(DEFINITIONS_DIR, `task-${taskId}.json`);

  try {
    await fs.unlink(filePath);

    // Remove from registry
    const registry = await loadRegistry();
    delete registry.tasks[taskId];
    await saveRegistry(registry);

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete task ${taskId}: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// TASK EXECUTION STATE OPERATIONS (Ephemeral)
// ============================================================================

/**
 * Load task execution state
 */
export async function loadTaskState(taskId: string): Promise<TaskExecutionState> {
  const filePath = path.join(STATE_DIR, `task-${taskId}-state.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as TaskExecutionState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // State file doesn't exist - create default
      return createDefaultState(taskId);
    }
    throw new Error(`Failed to load state for task ${taskId}: ${(error as Error).message}`);
  }
}

/**
 * Save task execution state
 */
export async function saveTaskState(
  state: TaskExecutionState
): Promise<OperationResult> {
  const filePath = path.join(STATE_DIR, `task-${state.taskId}-state.json`);

  try {
    // Ensure state directory exists
    await fs.mkdir(STATE_DIR, { recursive: true });

    // Update timestamp
    state.lastUpdated = new Date().toISOString();

    // Write with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save state for task ${state.taskId}: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update specific fields in task execution state
 */
export async function updateTaskState(
  taskId: string,
  updates: Partial<TaskExecutionState>
): Promise<OperationResult> {
  try {
    const state = await loadTaskState(taskId);
    const updated = { ...state, ...updates };
    return await saveTaskState(updated);
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Delete task execution state (clear ephemeral data)
 */
export async function deleteTaskState(taskId: string): Promise<OperationResult> {
  const filePath = path.join(STATE_DIR, `task-${taskId}-state.json`);

  try {
    await fs.unlink(filePath);
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Ignore ENOENT - file already doesn't exist
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: `Failed to delete state for task ${taskId}: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create default state for a new task
 */
function createDefaultState(taskId: string): TaskExecutionState {
  return {
    taskId,
    lastUpdated: new Date().toISOString(),
    currentPhase: 'idle',
    testResults: {},
    gitContext: {
      branch: '',
      lastTestedCommit: '',
      changedFilesSince: [],
    },
    executionLog: [],
  };
}

// ============================================================================
// WORKFLOW TEMPLATE OPERATIONS
// ============================================================================

/**
 * Load a workflow template by name
 */
export async function loadWorkflow(name: string): Promise<WorkflowTemplate> {
  const filePath = path.join(WORKFLOWS_DIR, `${name}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as WorkflowTemplate;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Workflow '${name}' not found at ${filePath}`);
    }
    throw new Error(`Failed to load workflow '${name}': ${(error as Error).message}`);
  }
}

/**
 * List all available workflows
 */
export async function listWorkflows(): Promise<string[]> {
  try {
    const files = await fs.readdir(WORKFLOWS_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// ============================================================================
// TASK REGISTRY OPERATIONS
// ============================================================================

/**
 * Load the task registry
 */
export async function loadRegistry(): Promise<TaskRegistry> {
  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    return JSON.parse(content) as TaskRegistry;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Create default registry
      return {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        tasks: {},
      };
    }
    throw error;
  }
}

/**
 * Save the task registry
 */
export async function saveRegistry(registry: TaskRegistry): Promise<void> {
  registry.lastUpdated = new Date().toISOString();
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
}

/**
 * Update registry entry for a task
 */
async function updateRegistry(
  taskId: string,
  entry: TaskRegistry['tasks'][string]
): Promise<void> {
  const registry = await loadRegistry();
  registry.tasks[taskId] = entry;
  await saveRegistry(registry);
}

/**
 * List all tasks from registry
 */
export async function listTasks(): Promise<string[]> {
  const registry = await loadRegistry();
  return Object.keys(registry.tasks);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a task exists
 */
export async function taskExists(taskId: string): Promise<boolean> {
  const filePath = path.join(DEFINITIONS_DIR, `task-${taskId}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if task state exists
 */
export async function stateExists(taskId: string): Promise<boolean> {
  const filePath = path.join(STATE_DIR, `task-${taskId}-state.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get task status summary
 */
export async function getTaskStatus(taskId: string): Promise<{
  definition: TaskDefinition;
  state: TaskExecutionState;
  hasState: boolean;
}> {
  const definition = await loadTaskDefinition(taskId);
  const hasState = await stateExists(taskId);
  const state = hasState ? await loadTaskState(taskId) : createDefaultState(taskId);

  return {
    definition,
    state,
    hasState,
  };
}
