**CRITICAL OPTIMIZATION:** Parse task info from conversation history, NOT by reading full files.

## Usage:
- `/gullycontinue` - Auto-detect next task from `/gullystatus` output or Current Status
- `/gullycontinue 3.1` - Explicitly load Task 3.1 (bypasses auto-detection)

## Workflow:

1. **Parse command arguments**
   - If task number provided (e.g., "3.1"), use that directly
   - Otherwise, check for `/gullystatus` output in conversation history
   - Look for the most recent message containing "⏭️ Next: Task X.Y"
   - Extract the task number (e.g., "3.1") from that line

2. **Targeted file read of ONLY that task section**
   - Search TASK_HISTORY.md for the heading `### ⏳ Task X.Y:` or `### ⏸️ Task X.Y:`
   - Read ONLY that task section (not the entire file)
   - Use Grep to find the line number, then Read with offset+limit

3. **Extract and display task info**
   - Commit message template
   - Planned work bullets
   - Files to create
   - Duration estimate

4. **Ask for confirmation**

## Fallback Behavior:

If no task number provided AND no `/gullystatus` output found in conversation history:
- Search TASK_HISTORY.md for tasks with `status=paused`
- If found, ask user which paused task to resume
- If not found, read the "Current Status" section (lines 1-13 only) to find next task

**Token Optimization:**
- Primary path: ~200 tokens (targeted task section only)
- Fallback path: ~100 tokens (Current Status section only)
- OLD approach: ~1800 tokens (entire file)
- **Savings: 89-94% reduction**

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
