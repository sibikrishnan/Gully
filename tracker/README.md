# Gully Project Tracker

**Structured tracking system for project progress, task execution, and bug management.**

---

## Quick Start

### Launch Dashboard

```bash
cd tracker
./launch-dashboard.sh
```

Then open your browser to: **http://localhost:8080**

**Keyboard Shortcuts:**
- Press `R` to refresh dashboard data

---

## Directory Structure

```
tracker/
├── data/                           # JSON tracking data
│   ├── PROJECT_STATUS.json         # Current project state
│   ├── TASK_HISTORY.json           # Task execution history
│   └── BUG_TRACKER.json            # Bug tracking log
│
├── schemas/                        # JSON Schema definitions
│   ├── PROJECT_STATUS_SCHEMA.json  # Status schema
│   ├── TASK_HISTORY_SCHEMA.json    # History schema
│   └── BUG_TRACKER_SCHEMA.json     # Bug tracker schema
│
├── dashboard/                      # Dashboard UI
│   └── index.html                  # Browser dashboard
│
├── launch-dashboard.sh             # Launch script
└── README.md                       # This file
```

---

## Tracking Files

### 1. PROJECT_STATUS.json

**Purpose:** Current project state (phases, tasks, progress)

**Key Fields:**
- `currentPhase` - Active phase with progress percentage
- `currentTask` - Next task to execute with dependencies
- `phases[]` - All phases with task counts, test stats, maturity gates

**Updated by:** PM Agent (after each task completion)

### 2. TASK_HISTORY.json

**Purpose:** Execution history with metrics and learnings

**Key Fields:**
- `tasks[]` - Completed tasks with execution details
  - Token usage, duration, approach (direct/subagent/hybrid)
  - Test results and coverage
  - Git commit hash
  - Learnings and issues encountered
- `metrics` - Aggregate metrics (avg tokens, duration, coverage)

**Updated by:** PM Agent (when task completes)

### 3. BUG_TRACKER.json

**Purpose:** Bug discovery, resolution, and prevention learning

**Key Fields:**
- `bugs[]` - All bugs with:
  - Severity, priority, status, category
  - Discovery context (task, phase, date)
  - Resolution approach and cost
  - Prevention learning
  - Tags for filtering
- `stats` - Bug statistics (total, open, resolved, by severity/category)

**Updated by:** PM Agent or human (when bugs discovered/resolved)

---

## Dashboard Features

### Overview Cards
- Current phase with progress bar
- Tasks complete count
- Tests passing count and coverage
- Bug summary (open/resolved)

### Phases Tab
- Table view of all 7 phases
- Status, task progress, test results, coverage
- Maturity gate status

### Tasks Tab
- Detailed task cards with execution metrics
- Filters: Phase, Status
- Shows token usage, duration, tests, learnings
- Links to related bugs

### Bugs Tab
- Bug cards with full details
- Filters: Status, Severity, Category
- Shows discovery context, resolution, prevention
- Tags for quick filtering

### Metrics Tab
- Execution efficiency (tokens, duration, approach)
- Quality metrics (coverage, completion rate)
- Bug resolution rate
- Recent learnings list

---

## Manual Updates

### Adding a Completed Task

Edit `tracker/data/TASK_HISTORY.json`:

```json
{
  "tasks": [
    {
      "id": "P2-PROF-T2",
      "phaseId": "P2",
      "title": "PATCH /api/users/:id",
      "status": "complete",
      "priority": "P1",
      "complexity": "medium",
      "startDate": "2025-11-11T14:00:00Z",
      "completionDate": "2025-11-11T16:30:00Z",
      "execution": {
        "totalTokens": 52000,
        "totalDuration": "85 min",
        "approach": "direct",
        "subtasks": [...]
      },
      "tests": {...},
      "gitCommit": "a1b2c3d",
      "learnings": [...],
      "issuesEncountered": [...]
    }
  ]
}
```

### Logging a Bug

Edit `tracker/data/BUG_TRACKER.json`:

```json
{
  "bugs": [
    {
      "id": "BUG-003",
      "title": "Database connection timeout",
      "description": "Detailed description...",
      "severity": "high",
      "priority": "P1",
      "status": "open",
      "category": "database",
      "discoveredIn": {
        "taskId": "P2-PROF-T3",
        "phaseId": "P2",
        "date": "2025-11-11T15:30:00Z"
      },
      "tags": ["database", "timeout", "connection"]
    }
  ]
}
```

### Updating Project Status

Edit `tracker/data/PROJECT_STATUS.json`:

```json
{
  "currentPhase": {
    "id": "P2",
    "progress": {
      "tasksComplete": 2,
      "tasksTotal": 5,
      "percentComplete": 40
    }
  },
  "currentTask": {
    "id": "P2-PROF-T3",
    "status": "in_progress"
  }
}
```

---

## PM Agent Integration

PM agents automatically update tracking files:

### pm-agent-initialize
- Creates initial PROJECT_STATUS.json
- Sets up phase structure
- Initializes empty TASK_HISTORY and BUG_TRACKER

### pm-agent-orchestrator
- Updates PROJECT_STATUS after each task
- Logs completed tasks to TASK_HISTORY
- Logs bugs to BUG_TRACKER
- Updates metrics automatically

**File Paths in PM Agents:**
- `tracker/data/PROJECT_STATUS.json`
- `tracker/data/TASK_HISTORY.json`
- `tracker/data/BUG_TRACKER.json`

---

## Schema Validation

Validate JSON files against schemas:

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate PROJECT_STATUS
ajv validate -s tracker/schemas/PROJECT_STATUS_SCHEMA.json -d tracker/data/PROJECT_STATUS.json

# Validate TASK_HISTORY
ajv validate -s tracker/schemas/TASK_HISTORY_SCHEMA.json -d tracker/data/TASK_HISTORY.json

# Validate BUG_TRACKER
ajv validate -s tracker/schemas/BUG_TRACKER_SCHEMA.json -d tracker/data/BUG_TRACKER.json
```

---

## Backup & Version Control

**Git tracking:**
- Commit JSON data files after each session
- Track schema changes separately
- Dashboard HTML is static (no commits needed unless updating UI)

**Backup strategy:**
```bash
# Automatic backup on update
cp tracker/data/*.json tracker/data/backups/$(date +%Y%m%d-%H%M%S)/
```

---

## Troubleshooting

### Dashboard not loading?
1. Check that JSON files exist in `tracker/data/`
2. Verify JSON syntax (use validator)
3. Open browser console for errors
4. Ensure Python HTTP server is running

### Can't update JSON files?
1. Check file permissions
2. Validate JSON syntax before saving
3. Use schema validation to catch errors

### Dashboard shows old data?
- Press `R` to refresh
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Version History

**v1.0.0** (2025-11-11)
- Initial release
- PROJECT_STATUS, TASK_HISTORY, BUG_TRACKER tracking
- Dashboard with filtering
- PM agent integration

---

## Future Enhancements

- [ ] Auto-refresh dashboard on file changes
- [ ] Export dashboard as static HTML report
- [ ] Chart visualizations (token trends, coverage over time)
- [ ] Search functionality across all tracking data
- [ ] Dark mode toggle
- [ ] Mobile-responsive improvements
