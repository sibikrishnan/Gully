# PM Agent Tracking Reference

**Quick reference for PM agents to use the new structured tracking system**

---

## File Locations

### Tracking Data (JSON)
```
tracker/data/PROJECT_STATUS.json    # Current project state
tracker/data/TASK_HISTORY.json      # Task execution history
tracker/data/BUG_TRACKER.json       # Bug tracking log
```

### Schemas (for validation)
```
tracker/schemas/PROJECT_STATUS_SCHEMA.json
tracker/schemas/TASK_HISTORY_SCHEMA.json
tracker/schemas/BUG_TRACKER_SCHEMA.json
```

### Old Files (DEPRECATED - DO NOT USE)
```
❌ backend/.claude/STATUS.md (deleted)
❌ backend/.claude/TASK_HISTORY.md (deleted)
```

---

## PM Agent Updates

### pm-agent-initialize

**Replace all references:**
- OLD: `backend/.claude/STATUS.md`
- NEW: `tracker/data/PROJECT_STATUS.json`

**Replace all references:**
- OLD: `backend/.claude/TASK_HISTORY.md`
- NEW: `tracker/data/TASK_HISTORY.json`

**Create initial files:**
```json
// PROJECT_STATUS.json
{
  "version": "1.0.0",
  "lastUpdated": "ISO-8601-timestamp",
  "project": {...},
  "currentPhase": {...},
  "currentTask": {...},
  "phases": [...]
}

// TASK_HISTORY.json
{
  "version": "1.0.0",
  "lastUpdated": "ISO-8601-timestamp",
  "tasks": [],
  "metrics": {...}
}

// BUG_TRACKER.json
{
  "version": "1.0.0",
  "lastUpdated": "ISO-8601-timestamp",
  "bugs": [],
  "stats": {...}
}
```

### pm-agent-orchestrator

**Read project state:**
```javascript
// Read current state
const projectStatus = JSON.parse(fs.readFileSync('tracker/data/PROJECT_STATUS.json'));
const taskHistory = JSON.parse(fs.readFileSync('tracker/data/TASK_HISTORY.json'));
const bugTracker = JSON.parse(fs.readFileSync('tracker/data/BUG_TRACKER.json'));

// Get current phase
const currentPhase = projectStatus.currentPhase.id;  // e.g., "P2"

// Get current task
const currentTask = projectStatus.currentTask.id;    // e.g., "P2-PROF-T2"

// Check dependencies
const allDependenciesComplete = projectStatus.currentTask.allDependenciesComplete;
```

**Update after task completion:**
```javascript
// 1. Update PROJECT_STATUS.json
projectStatus.currentPhase.progress.tasksComplete++;
projectStatus.currentPhase.progress.percentComplete = Math.round(
  (projectStatus.currentPhase.progress.tasksComplete / projectStatus.currentPhase.progress.tasksTotal) * 100
);

// Update phase in phases array
const phaseIndex = projectStatus.phases.findIndex(p => p.id === currentPhase);
projectStatus.phases[phaseIndex].tasks.complete++;
projectStatus.phases[phaseIndex].tests.passing += newTestsCount;

// Move to next task
projectStatus.currentTask = {
  id: nextTaskId,
  title: nextTaskTitle,
  status: "pending",
  dependencies: [...],
  allDependenciesComplete: true,
  blockers: []
};

projectStatus.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync('tracker/data/PROJECT_STATUS.json', JSON.stringify(projectStatus, null, 2));

// 2. Add to TASK_HISTORY.json
taskHistory.tasks.push({
  id: completedTaskId,
  phaseId: currentPhase,
  title: taskTitle,
  status: "complete",
  priority: "P1",
  complexity: "medium",
  startDate: taskStartTime,
  completionDate: new Date().toISOString(),
  execution: {
    totalTokens: tokenCount,
    totalDuration: "XX min",
    approach: "direct|subagent|hybrid",
    subtasks: [...]
  },
  tests: {...},
  gitCommit: commitHash,
  learnings: [...],
  issuesEncountered: [...],
  filesCreated: [...],
  filesModified: [...],
  notes: "..."
});

// Update metrics
taskHistory.metrics.totalTasks++;
taskHistory.metrics.avgTokensPerTask = calculateAvg();
// ... update other metrics

taskHistory.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync('tracker/data/TASK_HISTORY.json', JSON.stringify(taskHistory, null, 2));
```

**Log bug:**
```javascript
// Add to BUG_TRACKER.json
const nextBugId = `BUG-${String(bugTracker.stats.total + 1).padStart(3, '0')}`;

bugTracker.bugs.push({
  id: nextBugId,
  title: "Bug title",
  description: "Detailed description",
  severity: "critical|high|medium|low",
  priority: "P0|P1|P2|P3",
  status: "open",
  category: "testing|types|database|performance|security|...",
  discoveredIn: {
    taskId: currentTaskId,
    phaseId: currentPhase,
    date: new Date().toISOString()
  },
  tags: [...]
});

// Update stats
bugTracker.stats.total++;
bugTracker.stats.open++;
bugTracker.stats.bySeverity[severity]++;
bugTracker.stats.byCategory[category]++;

bugTracker.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync('tracker/data/BUG_TRACKER.json', JSON.stringify(bugTracker, null, 2));
```

**Resolve bug:**
```javascript
// Find bug
const bug = bugTracker.bugs.find(b => b.id === bugId);

// Update resolution
bug.status = "resolved";
bug.resolution = {
  approach: "How it was fixed",
  rationale: "Why this approach",
  resolvedDate: new Date().toISOString(),
  resolvedBy: "pm-agent-orchestrator",
  tokenCost: 5000,
  timeCost: "20 min"
};

// Update stats
bugTracker.stats.open--;
bugTracker.stats.resolved++;

bugTracker.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync('tracker/data/BUG_TRACKER.json', JSON.stringify(bugTracker, null, 2));
```

---

## Update Protocols

### After Task Completion
1. Update PROJECT_STATUS.json (progress, current task)
2. Add task to TASK_HISTORY.json
3. Log any bugs to BUG_TRACKER.json
4. Commit tracking files to git

### At Phase Completion
1. Mark phase as "complete" in PROJECT_STATUS
2. Update maturity gate status to "passed" or "failed"
3. Update completionDate for phase
4. Move currentPhase to next phase
5. Reset currentTask to first task of next phase

### When Bug Discovered
1. Generate new BUG-XXX ID
2. Add to BUG_TRACKER.json with discovery context
3. If blocks task, add to PROJECT_STATUS.currentTask.blockers
4. Update bug stats

### When Bug Resolved
1. Update bug status to "resolved"
2. Add resolution details (approach, cost, date)
3. If had blocker, remove from PROJECT_STATUS.currentTask.blockers
4. Update bug stats

---

## Git Commit Strategy

**After each task completion:**
```bash
git add tracker/data/*.json
git commit -m "chore(tracking): update after P2-PROF-T2 completion

- PROJECT_STATUS: Phase 2 progress 40% (2/5 tasks)
- TASK_HISTORY: Added P2-PROF-T2 execution details
- BUG_TRACKER: No new bugs
"
```

**After phase completion:**
```bash
git add tracker/data/*.json
git commit -m "chore(tracking): Phase 2 complete, maturity gate passed

- PROJECT_STATUS: Phase 2 marked complete
- TASK_HISTORY: 5/5 tasks logged
- BUG_TRACKER: All bugs resolved
"
```

---

## Common Patterns

### Check if task can start
```javascript
const canStart = projectStatus.currentTask.allDependenciesComplete
  && projectStatus.currentTask.blockers.length === 0;
```

### Get next task ID
```javascript
const currentTaskNum = parseInt(projectStatus.currentTask.id.match(/T(\d+)$/)[1]);
const nextTaskId = projectStatus.currentTask.id.replace(/T\d+$/, `T${currentTaskNum + 1}`);
```

### Calculate phase progress
```javascript
const progress = Math.round(
  (phase.tasks.complete / phase.tasks.total) * 100
);
```

### Get recent learnings
```javascript
const recentLearnings = taskHistory.tasks
  .slice(-5)  // Last 5 tasks
  .flatMap(t => t.learnings);
```

### Get open bugs for current phase
```javascript
const phaseBugs = bugTracker.bugs.filter(b =>
  b.discoveredIn.phaseId === currentPhase &&
  b.status === "open"
);
```

---

## Dashboard Integration

Dashboard reads from tracking files automatically:
- No PM action needed
- User runs `./tracker/launch-dashboard.sh`
- Dashboard loads JSON files via JavaScript fetch
- User presses `R` to refresh data

**Screenshot workflow:**
```
1. User: "Here's my dashboard screenshot"
2. PM reads screenshot
3. PM extracts current phase, task, bugs
4. PM updates strategy based on visual data
```

---

## Migration Notes

**Old system:**
- STATUS.md (Markdown, manual parsing)
- TASK_HISTORY.md (Markdown, manual parsing)
- No bug tracking

**New system:**
- PROJECT_STATUS.json (structured, machine-readable)
- TASK_HISTORY.json (structured, queryable)
- BUG_TRACKER.json (comprehensive bug management)
- Dashboard UI (visual, filterable)

**Benefits:**
- ✅ Faster parsing (JSON vs Markdown)
- ✅ Queryable data (filter, aggregate, analyze)
- ✅ Visual dashboard (browser UI)
- ✅ Bug tracking (previously missing)
- ✅ Structured metrics (automatic calculations)

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
