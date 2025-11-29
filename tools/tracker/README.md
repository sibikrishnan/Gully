# Gully Project Tracker

Structured tracking system for project progress, task execution, and bug management.

## Launch Dashboard

```bash
cd tools/tracker
./launch-dashboard.sh
```

Then open: **http://localhost:8080**

**Keyboard Shortcuts:**
- Press `R` to refresh dashboard data

---

## Data Structure

```
tools/tracker/data/
├── status/current.json       # Current phase, task, progress
├── status/phases/P{N}.json   # Per-phase status
├── history/active.json       # Completed tasks log
├── bugs/BUG-{ID}.json        # Bug tracking
└── tasks/P{N}-*/task.json    # Task definitions
```

**Full documentation:** See `.claude/.claude.md` for tracker update protocol
