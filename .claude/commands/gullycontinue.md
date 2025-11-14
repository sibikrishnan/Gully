**CRITICAL OPTIMIZATION:** Load task info from CSV tracker and task JSON files efficiently.

## Usage:
- `/gullycontinue` - Auto-detect next task from CSV tracker
- `/gullycontinue P2-PROF-T2.2` - Explicitly load specific subtask

## Workflow:

1. **Determine task to load**
   - If subtask ID provided (e.g., "P2-PROF-T2.2"), use that directly
   - Otherwise, read `tools/tracker/data/TASK_TRACKER.csv`
   - Find first row with `status=pending` (this is the next task)
   - Extract parent_id and subtask_file from CSV row

2. **Load task JSON file**
   - CSV column `subtask_file` contains the JSON filename (e.g., "P2-PROF-T2.2-controller.json")
   - CSV column `parent_id` contains parent task ID (e.g., "P2-PROF-T2")
   - File path: `tools/tracker/data/tasks/{parent_id}/{subtask_file}`
   - Example: `tools/tracker/data/tasks/P2-PROF-T2/P2-PROF-T2.2-controller.json`
   - Parse task JSON structure (id, description, workflow, dependencies, etc.)

3. **Extract and display task info**
   - Task description and activeForm
   - Workflow phases and actions
   - Dependencies and blockers
   - Test suite reference
   - Estimated duration
   - Checkpoints

4. **Ask for confirmation to proceed**

## CSV Integration:

The CSV tracker (`TASK_TRACKER.csv`) is the single source of truth for:
- Which tasks are pending/in_progress/completed
- Task order and dependencies
- Location of task JSON files (subtask_file column)

The JSON files contain detailed implementation instructions but don't track status.

**Token Optimization:**
- Primary path: ~1,500 tokens (CSV scan + task JSON file)
- Efficient: Direct file access from CSV reference
- **Benefit: 100% accurate, CSV is single source of truth for status**

Format:
```
📋 Next Task: Task X.Y - [Name]

Will implement:
- [Bullet 1]
- [Bullet 2]
- [Bullet 3]

Files to create/modify: X files
Estimated duration: XX min

Ready to proceed? (yes/no)
```

**After completing the command, print token expenditure:**
```
🔢 Tokens: X,XXX used | XXX,XXX remaining (X.X% of budget)
```
