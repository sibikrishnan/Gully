# Gully Project Navigator

**Quick reference for Claude Code file discovery**

**Purpose:** Single entry point to find any file quickly, optimized for Claude Code efficiency.

---

## 📋 Current Status & Planning

**Right Now:**
- **[STATUS.md](STATUS.md)** - Current session status (what's happening now)
- **[TASK_HISTORY.md](TASK_HISTORY.md)** - Completed tasks and upcoming work

**🆕 Project Tracking System:**
- **[tracker/data/PROJECT_STATUS.json](../tracker/data/PROJECT_STATUS.json)** - Structured project state (phases, tasks, progress)
- **[tracker/data/TASK_HISTORY.json](../tracker/data/TASK_HISTORY.json)** - Task execution history with metrics
- **[tracker/data/BUG_TRACKER.json](../tracker/data/BUG_TRACKER.json)** - Bug tracking and resolution log
- **[tracker/README.md](../tracker/README.md)** - Tracking system usage guide
- **Dashboard:** Run `cd tracker && ./launch-dashboard.sh` then visit http://localhost:8080/dashboard/

**Weekly Reviews:**
- **[WEEK1_REVIEW.md](docs/weekly-reviews/WEEK1_REVIEW.md)** - Week 1 completion retrospective (✅ Complete)
- **Week 2 Planning** - Coming soon

**Refactoring:**
- **[REFACTORING_PLAN.md](REFACTORING_PLAN.md)** - Current structure refactoring plan (in progress)

---

## 🏗️ Architecture & Design

**Main Entry Point:**
- **[docs/architecture/INDEX.md](docs/architecture/INDEX.md)** - Complete architecture documentation navigator

**Key Architecture Docs:**
- **[OVERVIEW.md](docs/architecture/OVERVIEW.md)** - System architecture overview
- **[TASK_SYSTEM_DESIGN.md](docs/architecture/TASK_SYSTEM_DESIGN.md)** - Task tracking system design
- **[CONTEXT_OPTIMIZATION_REPORT.md](docs/architecture/CONTEXT_OPTIMIZATION_REPORT.md)** - Context optimization analysis

**Active Development Context:**
Use `/gullycontext [section]` to load specific sections on-demand:
- `/gullycontext arch` - Architecture details (stack, services, structure, migration)
- `/gullycontext database` - Database schema (tables, indexes, Redis)
- `/gullycontext mvp` - MVP scope and timeline
- `/gullycontext workflow` - Development best practices
- `/gullycontext commands` - Command references

**Source:** `.claude/context/` directory (always up-to-date)

---

## 🔧 Development Guides

**Workflow & Communication:**
- **[WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md)** - Development workflow and best practices
- **[CLAUDE_SESSION_GUIDE.md](CLAUDE_SESSION_GUIDE.md)** - Claude Code session protocols

**Claude Code Configuration:**
- **[.claude/commands/README.md](.claude/commands/README.md)** - Custom commands and settings documentation
- **[.claude/.claude.md](.claude/.claude.md)** - Auto-loaded project context
- **[.claude/context/INDEX.md](.claude/context/INDEX.md)** - Context sections navigator

**Commands Reference:**
- `/gullycontext` - Load context sections on-demand
- `/gullystatus` - Quick status check
- `/gullycontinue` - Resume work on next task
- `/gullypause` - Pause current task
- `/gullymetrics` - Token usage metrics
- `/cleanup` - Clean up test artifacts (Playwright screenshots, servers)

---

## 📦 Service Briefs (Parallel Development)

**Navigator:**
- **[docs/parallel-development/INDEX.md](docs/parallel-development/INDEX.md)** - All service development briefs

**Available Services:**
1. **UserService-Brief.md** (279 lines) - User authentication & profiles ✅ Week 1
2. **TeamService-Brief.md** (114 lines) - Team management ⏳ Week 2
3. **MatchService-Brief.md** (140 lines) - Match tracking (Weeks 5-6)
4. **LeagueService-Brief.md** (155 lines) - League operations (future)
5. **TournamentService-Brief.md** (182 lines) - Tournament system (future)
6. **StatsService-Brief.md** (207 lines) - Statistics aggregation (Weeks 9-10)

---

## 📝 Planning Documents

**Main Planning Hub:**
- **[docs/planning/](docs/planning/)** - All planning documentation

**Key Planning Docs:**
- **[API_ENDPOINTS.md](docs/planning/API_ENDPOINTS.md)** - Complete API documentation
- **[DATABASE_SCHEMA.md](docs/planning/DATABASE_SCHEMA.md)** - Detailed database schema
- **[FEATURES.md](docs/planning/FEATURES.md)** - Feature specifications
- **[ROADMAP.md](docs/planning/ROADMAP.md)** - 12-week development roadmap
- **[PROJECT_PLAN.md](docs/planning/PROJECT_PLAN.md)** - Project planning overview

---

## 💻 Source Code

**Backend:**
- **[backend/src/](backend/src/)** - Backend services source code
  - `services/` - Service modules (user, team, match, stats)
  - `shared/` - Shared utilities (database, middleware, types, utils)
  - `app.ts` - Main application entry point

**Tests:**
- **[backend/tests/](backend/tests/)** - Test suite
  - `unit/` - Unit tests (JWT utils, password utils)
  - `integration/` - Integration tests (auth routes, middleware)
  - **Status:** 121 tests passing, 90%+ coverage

**Tools:**
- **[tools/tasks/](tools/tasks/)** - Task management CLI tools
  - `src/` - TypeScript source files
  - `definitions/` - Task definition files

**Frontend:**
- **[frontend/](frontend/)** - Next.js frontend (Week 3+, currently placeholder)

---

## 🗂️ Archives

**Archive Navigator:**
- **[docs/archives/INDEX.md](docs/archives/INDEX.md)** - Historical documents index

**Archived Content:**
- **[Completed Tasks](docs/archives/tasks/)** - Week 1 task definitions (historical)
- **[Historical Reviews](docs/archives/reviews/)** - Past review sessions
- **[Architecture Archives](docs/archives/architecture/)** - Outdated architecture docs

**Note:** Archived files are preserved for reference but not for active development.

---

## ⚙️ Claude Code Configuration

**Main Configuration:**
- **[.claude/.claude.md](.claude/.claude.md)** - Auto-loaded project context (293 lines)
- **[.claude/settings.local.json](.claude/settings.local.json)** - Permissions and settings

**Context Sections:**
- **[.claude/context/INDEX.md](.claude/context/INDEX.md)** - Context sections navigator
- `.claude/context/arch/` - Architecture contexts (4 files)
- `.claude/context/commands/` - Command references (4 files)
- `.claude/context/database/` - Database documentation (3 files)
- `.claude/context/mvp/` - MVP scope (4 files)
- `.claude/context/workflow/` - Development workflow (4 files)

**Custom Commands:**
- `/gullycontext` - Load context sections on-demand
- `/gullystatus` - Quick status check
- `/gullycontinue` - Resume work
- `/gullypause` - Pause with state save
- `/gullymetrics` - Token usage metrics
- `/gullyverify` - Verification checks

**Optimization:**
- **[.claude/OPTIMIZATION_LOG.md](.claude/OPTIMIZATION_LOG.md)** - Token usage tracking

**Task System:**
- **[backend/.claude/tasks/](backend/.claude/tasks/)** - Task state machine and definitions
  - `schema.ts` - Task schema definition
  - `state-machine.ts` - Task state machine
  - `index.json` - Task index
  - Task definition files (JSON)

---

## 🚀 Quick Start

### For Claude Code

**Starting a Session:**
```bash
/clear              # Clear context
/gullystatus        # Check current status
/gullycontinue      # Load next task
```

**Loading Context:**
```bash
/gullycontext arch        # Architecture details
/gullycontext database    # Database schema
/gullycontext mvp         # MVP scope
/gullycontext workflow    # Best practices
```

**Finding Files:**
- **Need architecture info?** → See [Architecture & Design](#-architecture--design) section above
- **Need API docs?** → `docs/planning/API_ENDPOINTS.md`
- **Need database schema?** → `docs/planning/DATABASE_SCHEMA.md`
- **Need to understand a service?** → `docs/parallel-development/[Service]-Brief.md`
- **Need context files?** → `.claude/context/[section]/`

### For Development

**Local Setup:**
```bash
docker-compose up -d           # Start PostgreSQL + Redis
npm install                    # Install dependencies
npm run migrate:latest         # Run migrations
npm run dev                    # Start dev server
npm test                       # Run tests
```

**Common Commands:**
```bash
npm run migrate:make [name]    # Create migration
npm run migrate:rollback       # Rollback migration
npm run test:coverage          # Coverage report
```

---

## 📊 Project Statistics

**Current Status (Week 1 Complete):**
- **Total Markdown Files:** 75+ files (~24,000 lines before refactoring)
- **Source Code Files:** 21 TypeScript files
- **Test Files:** 10 files (121 tests, 90%+ coverage)
- **Configuration Files:** 15+ files
- **Branch:** `refactor/structure` (refactoring in progress)

**Optimization Progress:**
- ✅ Deduplication complete (Phase 1)
- 🎯 Navigation indexes (Phase 2 - current)
- ⏳ File reorganization (Phase 3)
- ⏳ Cross-reference updates (Phase 4)
- ⏳ Testing & validation (Phase 5)

**Target Improvements:**
- 30-40% token reduction through deduplication
- 50% faster file discovery (1-2 vs 3-5 tool calls)
- Zero duplicate files
- Clear navigation hierarchy

---

## 🔍 Search by Topic

**Authentication:**
- Source: `backend/src/services/user-service/`
- Tests: `backend/tests/integration/auth.routes.test.ts`
- Brief: `docs/parallel-development/UserService-Brief.md`
- Context: `/gullycontext arch/services`

**Database:**
- Schema: `docs/planning/DATABASE_SCHEMA.md`
- Migrations: `backend/src/shared/database/migrations/`
- Context: `/gullycontext database`

**Testing:**
- Tests: `backend/tests/`
- Setup: `backend/tests/setup.ts`
- Helpers: `backend/tests/helpers/`

**Task System:**
- Design: `docs/architecture/TASK_SYSTEM_DESIGN.md`
- Implementation: `backend/.claude/tasks/`
- CLI Tool: `tools/tasks/`

**Workflows:**
- Dev Workflow: `docs/WORKFLOW_GUIDE.md`
- Claude Sessions: `CLAUDE_SESSION_GUIDE.md`
- Git: `/gullycontext commands/git`

---

## 📚 Documentation Structure

```
/
├── INDEX.md (this file)          # Master navigator
├── README.md                      # Project overview
├── STATUS.md                      # Current status
├── TASK_HISTORY.md                # Task tracking
├── REFACTORING_PLAN.md            # Structure refactoring plan
│
├── docs/
│   ├── INDEX.md                   # Documentation hub
│   ├── architecture/              # Architecture docs
│   │   ├── INDEX.md               # Architecture navigator
│   │   ├── OVERVIEW.md            # System overview
│   │   ├── TASK_SYSTEM_DESIGN.md  # Task system
│   │   └── CONTEXT_OPTIMIZATION_REPORT.md
│   ├── parallel-development/      # Service briefs
│   │   ├── INDEX.md               # Service navigator
│   │   └── [Service]-Brief.md     # 6 service briefs
│   ├── weekly-reviews/            # Weekly retrospectives
│   │   └── WEEK1_REVIEW.md
│   ├── planning/                  # Planning docs
│   │   ├── API_ENDPOINTS.md
│   │   ├── DATABASE_SCHEMA.md
│   │   ├── FEATURES.md
│   │   ├── ROADMAP.md
│   │   └── PROJECT_PLAN.md
│   ├── archives/                  # Historical docs
│   │   ├── INDEX.md               # Archive navigator
│   │   ├── tasks/
│   │   ├── reviews/
│   │   └── architecture/
│   └── WORKFLOW_GUIDE.md
│
├── .claude/
│   ├── .claude.md                 # Auto-loaded context
│   ├── OPTIMIZATION_LOG.md        # Token tracking
│   ├── context/                   # Context sections (28 files)
│   │   ├── INDEX.md               # Context navigator
│   │   ├── arch/
│   │   ├── commands/
│   │   ├── database/
│   │   ├── mvp/
│   │   └── workflow/
│   └── commands/                  # Custom commands (7 files)
│
├── backend/
│   ├── src/                       # Source code
│   ├── tests/                     # Test suite
│   └── .claude/tasks/             # Task system
│
├── tracker/                       # 🆕 Project tracking system
│   ├── data/                      # Tracking data (JSON)
│   │   ├── PROJECT_STATUS.json
│   │   ├── TASK_HISTORY.json
│   │   └── BUG_TRACKER.json
│   ├── schemas/                   # JSON schemas
│   ├── dashboard/                 # Browser dashboard
│   │   └── index.html
│   ├── launch-dashboard.sh        # Dashboard launcher
│   └── README.md
│
└── tools/tasks/                   # Task management CLI
```

---

**Last Updated:** 2025-11-11
**Purpose:** Optimize Claude Code file discovery and reduce token usage
**Status:** Tracking system integrated (Phase 2/5 complete)
