**CRITICAL OPTIMIZATION:** Load task info from tracker JSON files efficiently.

## Usage:
- `/gullycontinue` - Auto-detect next task from `/gullystatus` output or index.json
- `/gullycontinue P2-PROF-T1.1` - Explicitly load specific task/subtask

## Workflow:

1. **Determine task to load**
   - If task ID provided (e.g., "P2-PROF-T1.1"), use that directly
   - Otherwise, check for `/gullystatus` output in conversation history
   - Look for the most recent message containing "⏭️ Next: [task-id]"
   - Extract the task ID from that line

2. **Read task registry**
   - Read `tools/tracker/data/tasks/index.json`
   - Find task entry by ID
   - Check if task has subtasks (hasSubtasks: true)

3. **Load specific task JSON file**
   - For parent tasks: `tools/tracker/data/tasks/{TASK_ID}/task.json`
   - For subtasks: `tools/tracker/data/tasks/{PARENT_ID}/{SUBTASK_ID}.json`
   - Parse task JSON structure (id, description, workflow, dependencies, etc.)

4. **Extract and display task info**
   - Task description and activeForm
   - Workflow phases and actions
   - Dependencies and blockers
   - Test suite reference
   - Estimated duration
   - Checkpoints

5. **Ask for confirmation**

## Fallback Behavior:

If no task ID provided AND no `/gullystatus` output found in conversation history:
- Read `tools/tracker/data/tasks/index.json` to find next pending task
- Then proceed with loading that specific task JSON file

**Token Optimization:**
- Primary path: ~1,500 tokens (task JSON file only)
- Fallback path: ~2,000 tokens (index.json + task JSON)
- Efficient: Direct file access, no searching required
- **Benefit: 100% accurate, structured data from source of truth**

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
