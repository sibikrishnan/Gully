# Custom Claude Code Commands

These slash commands help maintain context and smooth session-to-session continuation.

## Context Loading Strategy

**Lean Auto-Load:** `.claude/.claude.md` (~250 lines) loads automatically with essential context.

**On-Demand Context:** Use `/gullycontext {section}/{subsection}` for maximum token efficiency.

**Context Structure:**
```
.claude/context/
├── mvp/          (4 files)
├── arch/         (4 files)
├── database/     (3 files)
├── commands/     (4 files)
└── workflow/     (4 files)
```

## Available Commands

### `/gullycontext {section}/{subsection}`
Load specific context files on-demand - saves 95% tokens vs full file!

**Full Sections (load all files):**
```
/gullycontext mvp         - All MVP context
/gullycontext arch        - All architecture
/gullycontext database    - All database schema
/gullycontext commands    - All commands
/gullycontext workflow    - All workflow
```

**Subsections (most efficient):**
```
# MVP (4 subsections)
/gullycontext mvp/in-scope       - Core 7 features
/gullycontext mvp/out-of-scope   - Deferred features
/gullycontext mvp/timeline       - 12-week breakdown
/gullycontext mvp/metrics        - Success metrics

# Architecture (4 subsections)
/gullycontext arch/structure     - Folder structure
/gullycontext arch/services      - Service boundaries
/gullycontext arch/migration     - Phase 1-3 path
/gullycontext arch/stack         - Tech stack

# Database (3 subsections)
/gullycontext database/tables    - PostgreSQL schemas
/gullycontext database/redis     - Redis structures
/gullycontext database/indexes   - Index strategy

# Commands (4 subsections)
/gullycontext commands/docker    - Docker Compose
/gullycontext commands/database  - Migrations, seeds
/gullycontext commands/dev       - npm scripts
/gullycontext commands/git       - Git workflow

# Workflow (4 subsections)
/gullycontext workflow/principles     - 6 dev principles
/gullycontext workflow/antipatterns   - What to avoid
/gullycontext workflow/review         - Weekly protocol
/gullycontext workflow/communication  - Claude-Human guidelines
```

**When to use:**
- User authentication work → `/gullycontext mvp/in-scope` + `/gullycontext arch/services` + `/gullycontext database/tables`
- Docker issues → `/gullycontext commands/docker`
- Architecture decisions → `/gullycontext arch/structure` + `/gullycontext workflow/antipatterns`
- Weekly planning → `/gullycontext mvp/timeline` + `/gullycontext workflow/review`

**Token Savings:**
- Subsection: ~50-200 lines (efficient!)
- Full section: ~400 lines
- FULL_CONTEXT.md: ~1000+ lines (avoid)

---

### `/gullystatus`
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

### `/gullycontinue`
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

### `/gullyverify`
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

**Note:** This is a manual step - human must type `/gullyverify` in Claude Code.

---

## Typical Session Flow

```bash
# 1. Human starts Docker (manual)
cd backend && docker compose up -d

# 2. Human types in Claude Code
/gullystatus

# 3. If everything looks good
/gullyverify

# 4. When ready to work
/gullycontinue

# 5. After task completion
/gullyverify  # (optional - confirm everything still works)
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
