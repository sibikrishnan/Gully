/**
 * Dashboard API Compatibility Layer
 *
 * This module provides backward-compatible API endpoints that aggregate
 * data from the fragmented structure for the dashboard.
 *
 * Purpose: Allow dashboard to work with new fragmented structure without changes
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Aggregate PROJECT_STATUS from fragmented structure
 */
function getProjectStatus() {
  try {
    // Read current status (hot data)
    const current = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'status/current.json'), 'utf8')
    );

    // Read all phase files
    const phases = [];
    for (let i = 1; i <= 7; i++) {
      const phaseFile = path.join(DATA_DIR, `status/phases/P${i}.json`);
      if (fs.existsSync(phaseFile)) {
        phases.push(JSON.parse(fs.readFileSync(phaseFile, 'utf8')));
      }
    }

    // Reconstruct PROJECT_STATUS structure
    return {
      version: current.version,
      lastUpdated: current.lastUpdated,
      project: current.project,
      currentPhase: current.currentPhase,
      currentTask: current.currentTask,
      phases: phases
    };
  } catch (error) {
    console.error('Error aggregating PROJECT_STATUS:', error);
    // Fallback to old monolithic file if it exists
    const fallbackPath = path.join(DATA_DIR, 'PROJECT_STATUS.json');
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
    throw error;
  }
}

/**
 * Aggregate BUG_TRACKER from fragmented structure
 */
function getBugTracker() {
  try {
    // Read bug index
    const index = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'bugs/index.json'), 'utf8')
    );

    // Read individual bug files
    const bugs = index.bugs.map(bugMeta => {
      const bugFile = path.join(DATA_DIR, `bugs/${bugMeta.id}.json`);
      return JSON.parse(fs.readFileSync(bugFile, 'utf8'));
    });

    // Reconstruct BUG_TRACKER structure
    return {
      version: index.version,
      lastUpdated: index.lastUpdated,
      bugs: bugs,
      stats: index.stats
    };
  } catch (error) {
    console.error('Error aggregating BUG_TRACKER:', error);
    // Fallback to old monolithic file if it exists
    const fallbackPath = path.join(DATA_DIR, 'BUG_TRACKER.json');
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
    throw error;
  }
}

/**
 * Aggregate TASK_HISTORY from fragmented structure
 */
function getTaskHistory() {
  try {
    // Read active history (recent tasks)
    const active = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'history/active.json'), 'utf8')
    );

    // TODO: In future, also read archived months if needed
    // For now, just return active tasks

    return active;
  } catch (error) {
    console.error('Error aggregating TASK_HISTORY:', error);
    // Fallback to old monolithic file if it exists
    const fallbackPath = path.join(DATA_DIR, 'TASK_HISTORY.json');
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
    throw error;
  }
}

/**
 * Lightweight status endpoint (only current data)
 * This is the new efficient endpoint that should be used going forward
 */
function getCurrentStatus() {
  const currentPath = path.join(DATA_DIR, 'status/current.json');
  return JSON.parse(fs.readFileSync(currentPath, 'utf8'));
}

module.exports = {
  getProjectStatus,
  getBugTracker,
  getTaskHistory,
  getCurrentStatus
};
