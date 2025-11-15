# PROJECT STRUCTURE REFACTORING PLAN
**Gully - Sports Challenge Platform**

**Date:** 2025-11-06
**Branch:** week1 → week2 transition
**Goal:** Optimize folder structure for Claude Code efficiency, reduce context pollution, improve file discoverability

---

## EXECUTIVE SUMMARY

### Current State
- **Total Files:** 75+ markdown docs (~24,000 lines), 21 source files, 10 test files
- **Project Size:** 117 MB (mostly node_modules)
- **Organization:** Generally well-structured but with key inefficiencies

### Problems Identified
1. **Documentation Duplication** - 3 sets of duplicate files consuming unnecessary tokens
2. **Missing Navigation** - No index files in major directories (architecture/, parallel-development/)
3. **Oversized Files** - FULL_CONTEXT.md (1,074 lines) difficult to search/load
4. **Unclear Archival** - Historical files not clearly marked
5. **Undocumented Configuration** - .claude/settings.local.json lacks documentation

### Optimization Target
- **Token Savings:** ~30-40% reduction through deduplication and smart indexing
- **Discovery Time:** 50% faster file location through navigation indexes
- **Context Clarity:** Single source of truth for each topic

---

## PROPOSED FILE STRUCTURE

### Optimized Root Structure
```
/Users/sibikrishnan/Documents/Gully/
├── README.md                          # Enhanced with navigation links
├── INDEX.md                           # NEW: Master file navigator
├── STATUS.md                          # Current session status
├── TASK_HISTORY.md                    # Task completion log
│
├── .claude/                           # Claude Code automation
│   ├── .claude.md                     # Auto-loaded context
│   ├── settings.local.json            # Permissions
│   ├── OPTIMIZATION_LOG.md            # Token tracking (SINGLE SOURCE)
│   ├── commands/
│   │   ├── README.md                  # ENHANCED: Document settings.local.json
│   │   └── ... (custom commands)
│   └── context/
│       ├── INDEX.md                   # NEW: Context section navigator
│       ├── arch/                      # Architecture contexts
│       ├── commands/                  # Command references
│       ├── database/                  # Database docs
│       ├── mvp/                       # MVP scope
│       └── workflow/                  # Development workflow
│
├── docs/                              # Documentation hub
│   ├── INDEX.md                       # NEW: Documentation navigator
│   │
│   ├── architecture/                  # System architecture
│   │   ├── INDEX.md                   # NEW: Architecture navigator
│   │   ├── OVERVIEW.md                # NEW: Condensed from ARCHITECTURE.md
│   │   ├── SERVICES.md                # NEW: Split from FULL_CONTEXT.md
│   │   ├── DATABASE.md                # NEW: Split from FULL_CONTEXT.md
│   │   ├── TYPES.md                   # NEW: Split from FULL_CONTEXT.md
│   │   ├── TASK_SYSTEM_DESIGN.md      # Existing task system
│   │   └── CONTEXT_OPTIMIZATION_REPORT.md  # Analysis report
│   │
│   ├── parallel-development/          # Service briefs
│   │   ├── INDEX.md                   # NEW: Service briefs navigator
│   │   ├── UserService-Brief.md
│   │   ├── TeamService-Brief.md
│   │   ├── MatchService-Brief.md
│   │   ├── LeagueService-Brief.md
│   │   ├── TournamentService-Brief.md
│   │   └── StatsService-Brief.md
│   │
│   ├── weekly-reviews/                # Weekly retrospectives
│   │   ├── WEEK1_REVIEW.md            # Week 1 complete
│   │   └── WEEK2_PLAN.md              # NEW: Week 2 planning
│   │
│   ├── planning/                      # Project planning docs
│   │   ├── API_ENDPOINTS.md
│   │   ├── DATABASE_SCHEMA.md
│   │   ├── FEATURES.md
│   │   ├── ROADMAP.md
│   │   └── PROJECT_PLAN.md
│   │
│   ├── guides/                        # Development guides
│   │   ├── WORKFLOW_GUIDE.md
│   │   └── CLAUDE_SESSION_GUIDE.md    # MOVE from root
│   │
│   ├── archives/                      # Historical/deprecated
│   │   ├── INDEX.md                   # NEW: Archive navigator
│   │   ├── reviews/
│   │   │   └── Human-Claude-Gemini.md # MOVE from root
│   │   ├── tasks/
│   │   │   └── WEEK1_TASKS.md         # ARCHIVED: Completed
│   │   └── optimization/
│   │       └── OPTIMIZATION_LOG_v1.md # DELETE: Duplicate removed
│   │
│   └── tools/                         # Tool documentation
│       └── README.md                  # Task management tool
│
├── backend/                           # Backend service
│   ├── .claude/
│   │   └── tasks/
│   │       ├── README.md              # ENHANCED: Link to docs/architecture/TASK_SYSTEM_DESIGN.md
│   │       ├── index.json
│   │       ├── schema.ts
│   │       ├── state-machine.ts
│   │       └── ... (task definitions)
│   ├── src/                           # Source code (unchanged)
│   ├── tests/                         # Tests (unchanged)
│   └── ... (config files)
│
├── frontend/                          # Frontend placeholder
│   └── README.md                      # NEW: Explain placeholder status
│
├── infrastructure/                    # DevOps configs (unchanged)
│
└── tools/                             # Task management tools
    └── tasks/
        ├── README.md                  # ENHANCED: Link to task system design
        └── ... (source files)
```

---

## REFACTORING ACTIONS

### PHASE 1: Deduplication (High Priority)

#### Action 1.1: Consolidate Optimization Tracking
**Problem:** Two separate optimization logs may diverge

**Files Affected:**
- `/docs/OPTIMIZATION_LOG.md` (427 lines) - DELETE
- `/.claude/OPTIMIZATION_LOG.md` (current) - KEEP

**Actions:**
1. Review `/docs/OPTIMIZATION_LOG.md` for unique content
2. Merge any unique insights into `/.claude/OPTIMIZATION_LOG.md`
3. Delete `/docs/OPTIMIZATION_LOG.md`
4. Update any references in other docs

**Token Savings:** ~2,000 tokens

---

#### Action 1.2: Archive Duplicate WEEK1_TASKS
**Problem:** Two copies of WEEK1_TASKS documentation

**Files Affected:**
- `/docs/WEEK1_TASKS.md` (314 lines) - MOVE to archives/
- `/docs/archives/tasks/WEEK1_TASKS.md` (303 lines) - DELETE (older copy)
- `/docs/weekly-reviews/WEEK1_REVIEW.md` (827 lines) - KEEP (canonical Week 1 reference)

**Actions:**
1. Review both WEEK1_TASKS files for unique content
2. Ensure WEEK1_REVIEW.md has all relevant information
3. Move `/docs/WEEK1_TASKS.md` to `/docs/archives/tasks/WEEK1_TASKS.md`
4. Delete duplicate older copy
5. Add header to archived file: "⚠️ ARCHIVED - Week 1 Complete. See /docs/weekly-reviews/WEEK1_REVIEW.md"

**Token Savings:** ~1,500 tokens

---

#### Action 1.3: Consolidate Architecture Documentation
**Problem:** Three architecture files with overlapping content

**Files Affected:**
- `/docs/ARCHITECTURE.md` (231 lines) - CONDENSE → OVERVIEW.md
- `/docs/architecture/FULL_CONTEXT.md` (1,074 lines) - SPLIT → SERVICES.md, DATABASE.md, TYPES.md
- `/docs/architecture/CONTEXT_OPTIMIZATION_REPORT.md` (301 lines) - KEEP

**Actions:**
1. Create `/docs/architecture/OVERVIEW.md` (condensed from ARCHITECTURE.md)
2. Split FULL_CONTEXT.md into:
   - `SERVICES.md` (~350 lines) - Service architecture
   - `DATABASE.md` (~350 lines) - Database schema & migrations
   - `TYPES.md` (~350 lines) - TypeScript types & interfaces
3. Delete original `/docs/ARCHITECTURE.md` and `/docs/architecture/FULL_CONTEXT.md`
4. Create `/docs/architecture/INDEX.md` linking all architecture files

**Token Savings:** ~3,000 tokens (through targeted loading vs loading FULL_CONTEXT)

---

### PHASE 2: Navigation & Discoverability (High Priority)

#### Action 2.1: Create Master INDEX.md
**Purpose:** Single entry point for Claude Code to find any file quickly

**File:** `/INDEX.md` (NEW)

**Structure:**
```markdown
# Gully Project Navigator
**Quick reference for Claude Code file discovery**

## 📋 Current Status & Planning
- [STATUS.md](STATUS.md) - Current session status
- [TASK_HISTORY.md](TASK_HISTORY.md) - Completed tasks
- [docs/weekly-reviews/WEEK1_REVIEW.md](docs/weekly-reviews/WEEK1_REVIEW.md) - Week 1 completion
- [docs/weekly-reviews/WEEK2_PLAN.md](docs/weekly-reviews/WEEK2_PLAN.md) - Week 2 planning

## 🏗️ Architecture & Design
- [docs/architecture/INDEX.md](docs/architecture/INDEX.md) - All architecture docs
  - OVERVIEW.md - System architecture overview
  - SERVICES.md - Service-oriented design
  - DATABASE.md - Database schema & migrations
  - TYPES.md - TypeScript interfaces
  - TASK_SYSTEM_DESIGN.md - Task tracking system

## 🔧 Development Guides
- [docs/guides/WORKFLOW_GUIDE.md](docs/guides/WORKFLOW_GUIDE.md) - Development workflow
- [docs/guides/CLAUDE_SESSION_GUIDE.md](docs/guides/CLAUDE_SESSION_GUIDE.md) - Session protocols
- [.claude/commands/README.md](.claude/commands/README.md) - Custom commands & settings

## 📦 Service Briefs (Parallel Development)
- [docs/parallel-development/INDEX.md](docs/parallel-development/INDEX.md) - All service briefs
  - UserService, TeamService, MatchService, etc.

## 📝 Planning Documents
- [docs/planning/API_ENDPOINTS.md](docs/planning/API_ENDPOINTS.md)
- [docs/planning/DATABASE_SCHEMA.md](docs/planning/DATABASE_SCHEMA.md)
- [docs/planning/FEATURES.md](docs/planning/FEATURES.md)
- [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md)

## 💻 Source Code
- [backend/src/](backend/src/) - Backend services
- [backend/tests/](backend/tests/) - Test suite
- [tools/tasks/](tools/tasks/) - Task management tools

## 🗂️ Archives
- [docs/archives/INDEX.md](docs/archives/INDEX.md) - Historical documents

## ⚙️ Claude Code Configuration
- [.claude/.claude.md](.claude/.claude.md) - Auto-loaded context
- [.claude/context/INDEX.md](.claude/context/INDEX.md) - Context sections
- [.claude/OPTIMIZATION_LOG.md](.claude/OPTIMIZATION_LOG.md) - Token tracking
```

**Benefits:**
- Claude Code can find any file in 1-2 steps
- Clear categorization reduces search time
- Single source of truth for file locations

---

#### Action 2.2: Create Section-Specific Indexes

**Files to Create:**

1. `/docs/INDEX.md`
```markdown
# Documentation Hub

## Architecture
See [architecture/INDEX.md](architecture/INDEX.md)

## Service Briefs
See [parallel-development/INDEX.md](parallel-development/INDEX.md)

## Weekly Reviews
- [WEEK1_REVIEW.md](weekly-reviews/WEEK1_REVIEW.md)
- [WEEK2_PLAN.md](weekly-reviews/WEEK2_PLAN.md)

## Planning
- [API_ENDPOINTS.md](planning/API_ENDPOINTS.md)
- [DATABASE_SCHEMA.md](planning/DATABASE_SCHEMA.md)
- [FEATURES.md](planning/FEATURES.md)
- [ROADMAP.md](planning/ROADMAP.md)

## Guides
- [WORKFLOW_GUIDE.md](guides/WORKFLOW_GUIDE.md)
- [CLAUDE_SESSION_GUIDE.md](guides/CLAUDE_SESSION_GUIDE.md)

## Archives
See [archives/INDEX.md](archives/INDEX.md)
```

2. `/docs/architecture/INDEX.md`
```markdown
# Architecture Documentation

## Quick Links
- **[OVERVIEW.md](OVERVIEW.md)** - System architecture overview (condensed)
- **[SERVICES.md](SERVICES.md)** - Service-oriented architecture details
- **[DATABASE.md](DATABASE.md)** - Database schema, migrations, indexes
- **[TYPES.md](TYPES.md)** - TypeScript type definitions
- **[TASK_SYSTEM_DESIGN.md](TASK_SYSTEM_DESIGN.md)** - Task tracking system design
- **[CONTEXT_OPTIMIZATION_REPORT.md](CONTEXT_OPTIMIZATION_REPORT.md)** - Context analysis

## When to Use Each File
- **Need high-level architecture?** → OVERVIEW.md
- **Understanding services?** → SERVICES.md
- **Database questions?** → DATABASE.md
- **Type definitions?** → TYPES.md
- **Task system?** → TASK_SYSTEM_DESIGN.md
```

3. `/docs/parallel-development/INDEX.md`
```markdown
# Service Development Briefs

## Available Services
1. **[UserService-Brief.md](UserService-Brief.md)** (279 lines) - User auth & profiles
2. **[TeamService-Brief.md](TeamService-Brief.md)** (114 lines) - Team management
3. **[MatchService-Brief.md](MatchService-Brief.md)** (140 lines) - Match tracking
4. **[LeagueService-Brief.md](LeagueService-Brief.md)** (155 lines) - League operations
5. **[TournamentService-Brief.md](TournamentService-Brief.md)** (182 lines) - Tournament system
6. **[StatsService-Brief.md](StatsService-Brief.md)** (207 lines) - Statistics aggregation

## Development Order (Week 2+)
Week 2: TeamService, MatchService
Week 3: LeagueService, StatsService
Week 4: TournamentService

## Usage
Each brief contains:
- Service responsibilities
- API endpoints
- Database schema
- Implementation notes
```

4. `/docs/archives/INDEX.md`
```markdown
# Archived Documentation
**Historical documents - not for active development**

## Completed Phases
- [tasks/WEEK1_TASKS.md](tasks/WEEK1_TASKS.md) - Week 1 task definitions (⚠️ See /docs/weekly-reviews/WEEK1_REVIEW.md instead)

## Historical Reviews
- [reviews/Human-Claude-Gemini.md](reviews/Human-Claude-Gemini.md) - Multi-AI review framework (completed)

## Note
These files are preserved for historical reference but should not be used for active development decisions.
```

5. `/.claude/context/INDEX.md`
```markdown
# Claude Code Context Sections

## Available Context Sections
Use `/gullycontext` command to load specific sections on-demand.

### Architecture (arch/)
- `arch/stack.md` - Technology stack
- `arch/services.md` - Service architecture
- `arch/structure.md` - Directory structure
- `arch/migration.md` - Monolith to microservices path

### Commands (commands/)
- `commands/dev.md` - Development commands
- `commands/docker.md` - Docker workflows
- `commands/git.md` - Git workflows
- `commands/database.md` - Database operations

### Database (database/)
- `database/tables.md` - Table schemas
- `database/indexes.md` - Database indexes
- `database/redis.md` - Redis caching strategy

### MVP (mvp/)
- `mvp/in-scope.md` - MVP features (45 lines)
- `mvp/out-of-scope.md` - Future features
- `mvp/timeline.md` - Project timeline
- `mvp/metrics.md` - Success metrics
- `mvp/learnings.md` - Week 1 patterns & lessons

### Workflow (workflow/)
- `workflow/communication.md` - Communication protocols
- `workflow/review.md` - Code review standards
- `workflow/principles.md` - Development principles
- `workflow/antipatterns.md` - Common mistakes to avoid

## Token Optimization
Load only the sections you need for current task using:
`/gullycontext [section-name]`
```

---

### PHASE 3: File Reorganization (Medium Priority)

#### Action 3.1: Split FULL_CONTEXT.md

**Current:** `/docs/architecture/FULL_CONTEXT.md` (1,074 lines)

**Split Into:**
1. `SERVICES.md` (~350 lines)
   - Service architecture overview
   - User service implementation
   - Future service designs
   - API gateway planning

2. `DATABASE.md` (~350 lines)
   - Database schema definitions
   - Migration strategies
   - Index optimization
   - PostgreSQL + Redis setup

3. `TYPES.md` (~350 lines)
   - TypeScript interface definitions
   - Type safety patterns
   - Shared type utilities
   - Request/response types

**Benefits:**
- Load only relevant section (33% vs 100% of tokens)
- Faster searching within focused files
- Clearer file purposes

---

#### Action 3.2: Move Files to Appropriate Locations

**Moves:**
1. `/CLAUDE_SESSION_GUIDE.md` → `/docs/guides/CLAUDE_SESSION_GUIDE.md`
2. `/Human-Claude-Gemini.md` → `/docs/archives/reviews/Human-Claude-Gemini.md`
3. Create `/frontend/README.md` explaining placeholder status

**Updates Required:**
- Update `.claude/.claude.md` if it references moved files
- Update any cross-references in other documentation
- Update `/gullycontext` command if needed

---

#### Action 3.3: Enhance Configuration Documentation

**File:** `/.claude/commands/README.md`

**Add Section:**
```markdown
## Configuration: settings.local.json

The `.claude/settings.local.json` file controls Claude Code permissions and behavior.

### Available Settings
```json
{
  "permissions": {
    "bash": ["git*", "npm*", "docker*"],
    "read": ["**/*"],
    "write": ["backend/src/**/*"],
    "edit": ["**/*.ts", "**/*.md"]
  },
  "hooks": {
    "pre_tool": null,
    "post_tool": null
  }
}
```

### Permission Types
- **bash**: Allowed bash commands (glob patterns)
- **read**: Files Claude can read without permission
- **write**: Files Claude can create/overwrite
- **edit**: Files Claude can edit

### Current Permissions
See `settings.local.json` for active configuration.
```

---

### PHASE 4: Cross-Reference Updates (Medium Priority)

#### Action 4.1: Update All Documentation Links

**Files to Update:**
- `README.md` - Add link to INDEX.md
- `.claude/.claude.md` - Update moved file references
- All architecture docs - Update internal links
- Service briefs - Link to architecture/INDEX.md

**Validation:**
Run link checker to ensure no broken references

---

#### Action 4.2: Update Task System Documentation

**Files:**
- `/backend/.claude/tasks/README.md` - Add link to docs/architecture/TASK_SYSTEM_DESIGN.md
- `/tools/tasks/README.md` - Add link to task system design
- `/docs/architecture/TASK_SYSTEM_DESIGN.md` - Add links to implementation

**Create Cross-Reference Flow:**
```
Task System Design ← → Backend Implementation ← → Tools CLI
      (docs/)              (backend/.claude/)        (tools/)
```

---

### PHASE 5: Testing & Validation (High Priority)

#### Action 5.1: Test Claude Code File Discovery

**Test Cases:**
1. Ask Claude: "Where is the database schema documented?"
   - Expected: Finds `/docs/architecture/DATABASE.md` via INDEX.md

2. Ask Claude: "Show me the UserService brief"
   - Expected: Finds via `/docs/parallel-development/INDEX.md`

3. Ask Claude: "What's the current project status?"
   - Expected: Finds `STATUS.md` via `/INDEX.md`

4. Ask Claude: "Load architecture context"
   - Expected: Uses `/gullycontext` and finds context sections via `.claude/context/INDEX.md`

**Success Criteria:**
- Claude finds correct file in ≤2 tool calls
- No confusion between duplicates
- Clear navigation path

---

#### Action 5.2: Measure Token Savings

**Metrics to Track:**
- Average tokens per context load (before vs after)
- Number of files loaded per typical task
- Time to find specific files

**Target:**
- 30-40% reduction in loaded tokens
- 50% faster file discovery

---

## IMPLEMENTATION TIMELINE

### Phase 1: Deduplication (Day 1 - 2 hours)
- [ ] Action 1.1: Consolidate optimization logs
- [ ] Action 1.2: Archive WEEK1_TASKS
- [ ] Action 1.3: Split FULL_CONTEXT.md

### Phase 2: Navigation (Day 1 - 1.5 hours)
- [ ] Action 2.1: Create master INDEX.md
- [ ] Action 2.2: Create section indexes (5 files)

### Phase 3: Reorganization (Day 2 - 1 hour)
- [ ] Action 3.1: Already done in Phase 1
- [ ] Action 3.2: Move files to new locations
- [ ] Action 3.3: Document settings.local.json

### Phase 4: Cross-References (Day 2 - 1 hour)
- [ ] Action 4.1: Update all documentation links
- [ ] Action 4.2: Update task system references

### Phase 5: Testing (Day 2 - 1 hour)
- [ ] Action 5.1: Test file discovery
- [ ] Action 5.2: Measure token savings

**Total Estimated Time:** 6.5 hours across 2 days

---

## SUCCESS METRICS

### Before Refactoring
- Documentation files: 75+
- Average context load: ~5,000 tokens
- File discovery: 3-5 tool calls
- Duplicate files: 6 instances

### After Refactoring (Target)
- Documentation files: 75+ (better organized)
- Average context load: ~3,000 tokens (40% reduction)
- File discovery: 1-2 tool calls (50% faster)
- Duplicate files: 0

### Qualitative Improvements
- ✅ Single source of truth for each topic
- ✅ Clear navigation hierarchy
- ✅ Historical files clearly marked
- ✅ Configuration documented
- ✅ Reduced cognitive load

---

## RISK MITIGATION

### Backup Strategy
1. Create refactoring branch: `git checkout -b refactor/structure`
2. Commit after each phase
3. Can rollback if issues found

### Link Validation
- Run markdown link checker after Phase 4
- Test all cross-references manually

### Communication
- Update team about new structure
- Document changes in commit messages

---

## NEXT STEPS

### Immediate (After Approval)
1. Create refactoring branch
2. Begin Phase 1: Deduplication

### Post-Refactoring
1. Update .claude/.claude.md with new structure
2. Test /gullycontext command
3. Measure token usage improvements
4. Document learnings in OPTIMIZATION_LOG.md

### Future Enhancements (Week 2+)
- Automated link validation in CI/CD
- Documentation linting (max file size, required indexes)
- Auto-generated navigation from directory structure

---

## APPROVAL REQUIRED

**User Decision Points:**
1. ✅ Approve overall structure changes?
2. ✅ Proceed with deduplication (deleting files)?
3. ✅ Create new index files as proposed?
4. ✅ Move files to new locations?

**Ready to proceed when approved.**
