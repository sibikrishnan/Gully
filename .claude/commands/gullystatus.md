Query the task tracking system and provide a concise status summary for quick session startup.

**CRITICAL:** Read `tools/tracker/data/TASK_TRACKER.csv` as the single source of truth for all task status.

**Workflow:**
1. Read `tools/tracker/data/TASK_TRACKER.csv`
2. Find the first task with `status=pending` (this is the current task to work on)
3. Count completed vs total tasks for the current phase
4. Extract phase information from task IDs (e.g., P2 = Phase 2)

**CSV Columns:**
- phase, parent_id, subtask_file, title, status, created, started, completed, test_count, notes

**Status Values:**
- `pending`: Not started yet
- `in_progress`: Currently being worked on (should be rare, usually tasks complete in one session)
- `completed`: Finished and tested

Format the output as:
```
📍 Status: Phase X - [Phase Name from parent_id pattern]
⏳ Current: [parent_id] - [title] (subtask: [subtask_file])
📊 Progress: X/Y tasks (Z%)
💡 Notes: [extract from notes column if relevant]
```

**Phase Mapping:**
- P2 = User Profiles
- P3 = Team Management
- P4 = Booking System
- P5 = Venue Management

Keep it concise - 3-5 sentences max.
