Read STATUS.md and provide a concise summary for quick session startup.

**CRITICAL:** Read ONLY `STATUS.md` (not TASK_HISTORY.md). STATUS.md contains all current session info.

Format the output as:
```
📍 Status: Week X, [Phase Name]
✅ Last: Task X.Y - [Name] (commit: abc1234)
⏸️ Paused: Task X.Y - [Name] (reason: ...)  # Only if tasks are paused
⏭️ Next: Task X.Y - [Name]
💡 Notes: [any blockers or important context]
```

Keep it concise - 3-5 sentences max.

**After completing the command, print token expenditure:**
```
🔢 Tokens: X,XXX used | XXX,XXX remaining (X.X% of budget)
```
