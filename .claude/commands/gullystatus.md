Query the task tracking system and provide a concise status summary for quick session startup.

**CRITICAL:** Read `tools/tracker/data/tasks/index.json` to get current project status.

**Workflow:**
1. Read `tools/tracker/data/tasks/index.json`
2. Identify current phase (group tasks by phase number)
3. Find last completed task (status: "completed")
4. Find next pending task (status: "pending")
5. Check for any in-progress tasks (status: "in_progress")

Format the output as:
```
📍 Status: Phase X - [Phase Name based on task titles]
✅ Last Completed: [task-id] - [title]
🔄 In Progress: [task-id] - [title]  # Only if any tasks have this status
⏭️ Next: [task-id] - [title]
💡 Notes: [X tasks completed in phase, Y remaining]
```

Keep it concise - 3-5 sentences max.

**After completing the command, print token expenditure:**
```
🔢 Tokens: X,XXX used | XXX,XXX remaining (X.X% of budget)
```
