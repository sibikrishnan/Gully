**CRITICAL OPTIMIZATION:** Parse task info from conversation history, NOT by reading full files.

## Usage:
- `/gullycontinue` - Auto-detect next task from `/gullystatus` output or STATUS.md
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
- Read STATUS.md to get the next task number (lightweight read)
- Then proceed with targeted TASK_HISTORY.md read for that specific task

**Token Optimization:**
- Primary path: ~200 tokens (targeted task section only)
- Fallback path: ~500 tokens (STATUS.md + targeted task section)
- OLD approach: ~2,500 tokens (entire 402-line TASK_HISTORY.md)
- NEW architecture: ~500 tokens (streamlined 86-line TASK_HISTORY.md)
- **Savings: 80-92% reduction**

**Archive Structure (2025-11-04):**
- TASK_HISTORY.md contains ONLY pending/active tasks (86 lines, ~500 tokens)
- Completed tasks archived by week in `docs/archives/tasks/WEEKN_TASKS.md`
- Week 1 archive: `docs/archives/tasks/WEEK1_TASKS.md` (303 lines, never loaded unless needed)

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
