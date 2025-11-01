# Custom Claude Code Commands

These slash commands help maintain context and smooth session-to-session continuation.

## Available Commands

### `/status`
Quick context check - shows current project status in 3-5 sentences.

**When to use:** At the start of every new Claude Code session.

**Output:**
```
📍 Status: Week X, [Phase Name]
✅ Last: Task X.Y - [Name] (commit: abc1234)
⏭️ Next: Task X.Y - [Name]
💡 Notes: [any important context]
```

---

### `/continue`
Auto-load next task and ask for confirmation to proceed.

**When to use:** After checking status, when you're ready to start the next task.

**Output:**
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

---

### `/verify`
Run environment verification checks (Docker, database, git).

**When to use:**
- After starting Docker services
- After completing a task
- When troubleshooting issues

**Output:**
```
✅/❌ Docker Services: [status]
✅/❌ Database: [X migrations, Y records]
✅/❌ Git: [branch, clean/dirty]
```

**Note:** This is a manual step - human must type `/verify` in Claude Code.

---

## Typical Session Flow

```bash
# 1. Human starts Docker (manual)
cd backend && docker compose up -d

# 2. Human types in Claude Code
/status

# 3. If everything looks good
/verify

# 4. When ready to work
/continue

# 5. After task completion
/verify  # (optional - confirm everything still works)
```

---

## Benefits

- **Token Efficient:** Avoids loading full project context repeatedly
- **Smooth Continuation:** Pick up exactly where you left off
- **Quick Health Checks:** Verify environment without manual commands
- **Consistent Workflow:** Same flow every session

---

## Maintenance

After completing each task, Claude should update `TASK_HISTORY.md` automatically. These commands read from that file to provide accurate status.
