# Gully Project Structure - Canonical Reference

**Purpose**: Single source of truth for project directory structure
**Audience**: All Claude Code sessions, developers, documentation
**Last Updated**: 2025-11-11 (Post big-bang refactor)
**Status**: ✅ Official - All documentation must reference this structure

---

## 📁 Root Directory Structure

```
/Users/sibikrishnan/Documents/Gully/
├── services/                    # ⭐ All service implementations
│   └── backend/                 # Backend service (Node.js/Express/PostgreSQL)
├── infrastructure/              # Infrastructure setup & deployment
├── docs/                        # ⭐ All project documentation
├── tools/                       # Development tools & utilities
│   └── tracker/                 # ⭐ Project tracking system (NEW)
├── .claude/                     # Claude Code configuration
└── PROJECT_STRUCTURE.md         # This file - canonical reference
```

---

## 🎯 Key Directories (Always Use These Paths)

### **Services**
```
services/backend/                # ✅ CORRECT PATH
├── src/                         # Source code
│   ├── services/                # Service modules (user, team, match, stats)
│   ├── shared/                  # Shared utilities
│   ├── app.ts                   # Express app
│   └── server.ts                # Server entry
├── tests/                       # Test suites
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   ├── e2e/                     # End-to-end tests
│   └── helpers/                 # Test utilities
├── .claude/workflows/           # Development workflows (TDD, exploratory, etc.)
├── docker-compose.yml           # Infrastructure (PostgreSQL, Redis)
└── package.json                 # Dependencies

❌ DEPRECATED: /backend/ (old path - DO NOT USE)
```

### **Documentation**
```
docs/                            # ✅ All documentation lives here
├── README.md                    # Project overview
├── INDEX.md                     # Master documentation navigator
├── WORKFLOW_GUIDE.md            # Development workflow
├── architecture/                # Architecture documentation
│   ├── INDEX.md                 # Architecture navigator
│   ├── OVERVIEW.md              # System overview
│   ├── PROJECT_STRUCTURE.md     # Detailed structure (duplicate - see note)
│   └── CONTEXT_OPTIMIZATION_REPORT.md
├── service-briefs/              # ✅ Service development briefs
│   ├── INDEX.md                 # Service navigator
│   └── briefs/                  # Individual service briefs
│       ├── UserService-Brief.md
│       ├── TeamService-Brief.md
│       ├── MatchService-Brief.md
│       ├── StatsService-Brief.md
│       ├── LeagueService-Brief.md
│       └── TournamentService-Brief.md
├── planning/                    # Planning & requirements
│   ├── API_ENDPOINTS.md
│   ├── DATABASE_SCHEMA.md
│   ├── FEATURES.md
│   ├── ROADMAP.md
│   ├── PROJECT_PLAN.md
│   ├── RefinedIDEA.md
│   └── FUTURE_FEATURES.md
├── guides/                      # How-to guides
│   ├── CLAUDE_SESSION_GUIDE.md
│   └── WEEKLY_REVIEW_CHECKLIST.md
├── workflows/                   # Workflow documentation
│   ├── README.md
│   └── TASK_GENERATION_WORKFLOW.md
├── weekly-reviews/              # Weekly retrospectives
│   └── WEEK1_REVIEW.md
├── reviews/                     # Code reviews
│   └── trio-review-1.md
└── archives/                    # Historical/deprecated docs
    ├── INDEX.md                 # Archive navigator
    ├── tasks/                   # Old task definitions
    ├── reviews/                 # Old reviews
    ├── architecture/            # Old architecture docs
    ├── refactoring/             # Refactoring history
    ├── optimization/            # Optimization history
    └── prompts/                 # Old prompts

❌ DEPRECATED: docs/parallel-development/ (renamed to service-briefs/)
```

### **Tools & Tracking**
```
tools/tracker/                   # ✅ CORRECT - Project tracking system
├── data/                        # Tracking data (JSON)
│   ├── tasks/                   # ✅ Task definitions (HIERARCHICAL STRUCTURE v3.0)
│   │   ├── index.json           # Task registry with paths
│   │   ├── README.md            # Task structure documentation
│   │   ├── {TASK_ID}/           # Parent task directory
│   │   │   ├── task.json        # Parent task definition
│   │   │   ├── {TASK_ID}.1.json # Subtask 1
│   │   │   └── {TASK_ID}.2.json # Subtask 2
│   │   ├── archive/             # Archived tasks
│   │   └── tests/               # Test suite definitions (separated)
│   ├── PROJECT_STATUS.json      # Project state (phases, tasks)
│   ├── TASK_HISTORY.json        # Task execution history
│   └── BUG_TRACKER.json         # Bug tracking
├── schemas/                     # JSON schemas for validation
├── dashboard/                   # Browser dashboard
│   └── index.html
├── .claude/                     # Tracker-specific Claude config
├── launch-dashboard.sh          # Dashboard launcher
├── VALIDATE_TASKS.sh            # Task validation script
├── README.md                    # Tracker documentation
├── IMPLEMENTATION_SUMMARY.md    # Implementation details
└── PM_AGENT_INTEGRATION.md      # PM agent integration guide

❌ DEPRECATED: tools/tasks/ (replaced by tools/tracker/)
❌ DEPRECATED: backend/.claude/tasks/ (migrated to tools/tracker/)
❌ DEPRECATED: Flat task structure (v2.0) - Use hierarchical structure (v3.0)
```

### **Infrastructure**
```
infrastructure/                  # ✅ Infrastructure & setup
├── SETUP.md                     # Infrastructure setup guide
├── START_DOCKER.md              # Quick Docker start guide
└── verify-setup.sh              # Setup verification script
```

### **Claude Code Configuration**
```
.claude/                         # Claude Code configuration
├── .claude.md                   # Auto-loaded project context
├── settings.local.json          # Permissions & settings
├── OPTIMIZATION_LOG.md          # Token usage tracking
├── context/                     # Context sections (on-demand loading)
│   ├── INDEX.md                 # Context navigator
│   ├── arch/                    # Architecture contexts
│   ├── commands/                # Command references
│   ├── database/                # Database documentation
│   ├── mvp/                     # MVP scope
│   └── workflow/                # Development workflow
├── commands/                    # Custom slash commands
│   ├── gullycontext.md
│   ├── gullystatus.md
│   ├── gullycontinue.md
│   ├── cleanup.md
│   └── generate-tasks.md
└── schemas/                     # JSON schemas (project-wide)
    ├── task.schema.json
    └── project-status.schema.json
```

---

## 🔄 Migration Notes (Big-Bang Refactor)

### **What Changed**
| Old Path | New Path | Reason |
|----------|----------|--------|
| `/backend/` | `/services/backend/` | Multi-service architecture support |
| `/docs/parallel-development/` | `/docs/service-briefs/` | Clearer naming |
| `/tools/tasks/` | `/tools/tracker/` | Expanded to full project tracking |
| `/backend/.claude/tasks/` | `/tools/tracker/data/` | Centralized task management |
| `/backend/.claude/schemas/` | `/.claude/schemas/` | Project-wide schemas |

### **Why This Structure**
1. **`/services/`** - Prepares for frontend, mobile apps, microservices
2. **`/tools/tracker/`** - Unified project tracking (tasks, bugs, status)
3. **`/docs/service-briefs/`** - Clear, self-documenting name
4. **`/.claude/schemas/`** - Schemas are project-wide, not backend-specific

---

## 📝 Path Reference Rules

### **✅ Always Use These Paths**
```bash
# Services
services/backend/src/
services/backend/tests/
services/backend/.claude/workflows/

# Documentation
docs/service-briefs/
docs/architecture/
docs/planning/

# Tracking
tools/tracker/
tools/tracker/data/

# Configuration
.claude/
.claude/schemas/
```

### **❌ Never Use These Paths**
```bash
# DEPRECATED - Do not use in any new documentation or code
backend/                         # Use: services/backend/
docs/parallel-development/       # Use: docs/service-briefs/
tools/tasks/                     # Use: tools/tracker/
backend/.claude/tasks/           # Use: tools/tracker/data/
backend/.claude/schemas/         # Use: .claude/schemas/
```

---

## 🎓 For Claude Code Sessions

### **Before Starting Work**
1. Read this file to understand current structure
2. Use `/gullycontext arch/structure` for detailed context
3. Check `docs/INDEX.md` for documentation navigation

### **When Writing Documentation**
1. Always reference paths from this file
2. Use relative paths from project root when possible
3. Update this file if structure changes (with user approval)

### **When Writing Code**
1. Follow import paths that match this structure
2. Place new services under `services/`
3. Place new docs under appropriate `docs/` subdirectory

### **When Creating Tasks**
1. Use `tools/tracker/` for all task management
2. Reference service briefs from `docs/service-briefs/`
3. Store task data in `tools/tracker/data/`

---

## 📊 Directory Ownership

| Directory | Owner/Purpose | Can Modify |
|-----------|---------------|------------|
| `services/backend/src/` | Backend implementation | Yes (active development) |
| `services/backend/tests/` | Test suites | Yes (active development) |
| `docs/` | Documentation | Yes (keep updated) |
| `docs/archives/` | Historical records | No (read-only) |
| `tools/tracker/` | Project tracking | Yes (tracked data) |
| `infrastructure/` | Setup scripts | Rarely (stable) |
| `.claude/` | Claude Code config | Yes (as needed) |

---

## 🔍 Quick Lookup

**Need to find...**
- **Service code?** → `services/backend/src/services/[service-name]/`
- **Tests?** → `services/backend/tests/`
- **Service brief?** → `docs/service-briefs/briefs/[Service]-Brief.md`
- **API docs?** → `docs/planning/API_ENDPOINTS.md`
- **Database schema?** → `docs/planning/DATABASE_SCHEMA.md`
- **Task data?** → `tools/tracker/data/`
- **Workflows?** → `services/backend/.claude/workflows/`
- **Context?** → `.claude/context/`

---

## ⚠️ Important Notes

1. **This is the canonical reference** - All other documentation must align with this
2. **Update this first** - If structure changes, update this file before other docs
3. **Git branch strategy** - Each phase gets its own branch, merge to `master` after PR approval
4. **No duplicate docs** - One source of truth per topic
5. **Archives are read-only** - Historical docs in `docs/archives/` are not updated

---

## 🚀 Next Steps After Reading This

1. Review `docs/INDEX.md` for documentation navigation
2. Read `docs/WORKFLOW_GUIDE.md` for development process
3. Check `tools/tracker/README.md` for tracking system usage
4. Use `/gullycontext` commands to load relevant context

---

**Maintained By**: All Claude Code sessions
**Review Frequency**: After any structural changes
**Last Refactor**: 2025-11-11 (Big-bang directory restructure)
**Status**: ✅ Active & Official
