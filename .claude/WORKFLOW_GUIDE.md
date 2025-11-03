# Optimized Session Workflow Guide

**Quick reference for starting and managing coding sessions with Claude Code.**

---

## 🚀 Starting a New Session (Recommended)

```bash
/clear              # Clear context (0 tokens)
/gullystatus        # Get 3-5 sentence status (~400 tokens)
/gullycontinue      # Load next task details (~200 tokens)
```

**Total:** ~600 tokens (vs 4,100 tokens before optimization - 85% reduction!)

---

## 📋 Task State Management

### Task States

| Emoji | State | Location | Meaning |
|-------|-------|----------|---------|
| ✅ | Completed | "Completed Tasks" section | Done, committed |
| ⏳ | Pending | "Pending Tasks" section | Not started |
| ⏸️ | Paused | "Paused Tasks" section | Started but interrupted |

### When to Pause a Task

Pause when:
- ❌ Blocked by external dependency
- 💬 Need clarification from user/team
- 🔄 Switching context to urgent task
- 🐛 Hit unexpected blocker

**How to Pause:**
1. Move task from "Pending" to "Paused Tasks" section
2. Change emoji from `⏳` to `⏸️`
3. Add `status=paused` to heading
4. Document:
   - Paused date
   - Reason for pause
   - Steps to resume

**Example:**
```markdown
### ⏸️ Task 3.1: Auth Utilities & Middleware `status=paused`
**Paused On:** 2025-11-02
**Reason:** Waiting for security review on JWT implementation
**Resume Steps:**
1. Incorporate security feedback
2. Update jwt.utils.ts
3. Re-run auth tests

[Rest of task details...]
```

---

## 🔄 Resuming Work

### Resuming Next Task
```bash
/gullycontinue
```
Claude will:
1. Parse `/gullystatus` output from conversation
2. Read only the next task section (~200 tokens)
3. Ask for confirmation to proceed

### Resuming Paused Task
If you have paused tasks, `/gullycontinue` will:
1. Detect `status=paused` tasks
2. Show list of paused tasks
3. Ask which one to resume

---

## 📝 After Completing a Task

1. **Commit your work:**
   ```bash
   git add .
   git commit -m "feat: [description]"
   ```

2. **Update TASK_HISTORY.md:**
   - Move task from "Pending" to "Completed Tasks"
   - Add commit hash, date, duration
   - Document what was done
   - Update "Current Status" section

3. **Optionally commit TASK_HISTORY.md:**
   ```bash
   git add TASK_HISTORY.md
   git commit -m "docs: update task history for Task X.Y"
   ```

---

## 🎯 Manual Task Selection (Alternative)

If you want to work on a specific task:

```
"Let's work on Task 3.2 from TASK_HISTORY.md"
```

Claude will read only that task section.

---

## 💡 Token Optimization Tips

### ✅ DO:
- Use `/clear` + `/gullystatus` + `/gullycontinue` workflow
- Keep TASK_HISTORY.md as single source of truth
- Add commit templates to pending tasks
- Use targeted file reads (Grep + offset/limit)
- Leverage conversation context

### ❌ DON'T:
- Ask Claude to read entire TASK_HISTORY.md
- Reference docs/WEEK1_TASKS.md during execution
- Read completed tasks unless debugging
- Load unnecessary context

---

## 🔍 Troubleshooting

### `/gullycontinue` doesn't work
**Likely cause:** No `/gullystatus` in conversation history

**Solution:** Run `/gullystatus` first, then `/gullycontinue`

### Need to switch tasks mid-session
**Option 1 (Pause current):**
1. Pause current task (see "When to Pause" above)
2. Update TASK_HISTORY.md
3. Run `/gullycontinue` to start new task

**Option 2 (Direct switch):**
```
"Let's switch to Task X.Y from TASK_HISTORY.md"
```

### Lost track of what was done
```
/gullystatus
```
Shows last completed task with commit hash.

---

## 📊 Token Usage Comparison

| Workflow | Tokens | Notes |
|----------|--------|-------|
| **Original (v1)** | 4,100 | Read TASK_HISTORY + WEEK1_TASKS |
| **Optimization #1** | 1,800 | Skip WEEK1_TASKS |
| **Optimization #2** | 600 | Parse `/gullystatus` + targeted read |
| **Improvement** | **85%** | **3,500 tokens saved per session** |

**Weekly Impact (20 sessions):**
- Old: 82,000 tokens
- New: 12,000 tokens
- **Saved: 70,000 tokens/week**

---

## 🎬 Example Session

```bash
# Session start
/clear
# Output: Context cleared

/gullystatus
# Output:
# 📍 Status: Week 1, Foundation Phase
# ✅ Last: Task 2.2 - Database Schema (commit: 96e3f88)
# ⏭️ Next: Task 3.1 - Auth Utilities & Middleware
# 💡 Notes: Docker + DB ready, 5 test users seeded

/gullycontinue
# Output:
# 📋 Next Task: Task 3.1 - Auth Utilities & Middleware
# Will implement:
# - Passport.js local strategy
# - JWT token generation/validation
# - Password hashing with bcrypt
# - Auth middleware for protected routes
# - TypeScript types for User/Auth
# Files to create: 5 files
# Estimated duration: 90 min
# Ready to proceed? (yes/no)

yes

# Claude starts implementing...
# ... work happens ...

# After completion
git add .
git commit -m "feat: implement authentication utilities and middleware"

# Update TASK_HISTORY.md manually or ask Claude
"Update TASK_HISTORY.md with Task 3.1 completion"

# Continue to next task
/gullycontinue
```

---

**Last Updated:** 2025-11-02
**See Also:** OPTIMIZATION_LOG.md for technical details
