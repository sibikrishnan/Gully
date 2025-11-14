# Claude Code Context Sections

**On-demand context loading for token efficiency**

Use `/gullycontext [section]` to load specific sections only when needed.

---

## 🎯 Purpose

**Token Optimization Strategy:**
- Load only the context you need for current task
- Behavioral rules consolidated in `.claude/.claude.md` (loaded automatically)
- Reference docs loaded on-demand only
- **Achievement:** 61.6% token reduction (4,871 → 1,871 lines at startup)

**Usage:**
```bash
/gullycontext arch           # Load all architecture files
/gullycontext arch/stack     # Load specific file
/gullycontext database       # Load all database files
/gullycontext mvp/in-scope   # Load MVP scope only
```

---

## 📦 Context Loading Strategy

### ✅ **Loaded by Default** (1,841 lines)
These sections are available as reference docs, load when needed:
- **arch/** (558 lines) - Architecture, services, stack
- **database/** (721 lines) - Schema, indexes, Redis
- **mvp/** (256 lines) - Scope, timeline, metrics
- **INDEX.md** (306 lines) - This navigation file

### 📦 **On-Demand Only** (3,030 lines - NOT loaded by default)
Load these **only when specifically needed** for your current task:
- **commands/** (1,519 lines) - Git, Docker, Database, Dev commands
- **workflow/** (1,140 lines) - Detailed communication, review, principles
- **learnings.md** (371 lines) - Phase 1 patterns and mistakes

**Rationale:**
- Sonnet 4.5 has strong built-in knowledge of git, docker, npm, TypeScript
- Behavioral rules now consolidated in `.claude/.claude.md` (30 lines vs 1,140 lines)
- Commands/workflow available when needed via `/gullycontext`

---

## 📁 Available Context Sections

### Architecture (arch/)
**Load with:** `/gullycontext arch`

**Files:**
- **[stack.md](arch/stack.md)** (162 lines) - Technology stack
  - Backend: Node.js, Express, TypeScript, PostgreSQL, Redis
  - Frontend: Next.js (planned)
  - Infrastructure: Docker, Jest

- **[services.md](arch/services.md)** (144 lines) - Service-oriented architecture
  - Service boundaries (User, Team, Match, Stats)
  - Dependencies between services
  - API endpoint patterns

- **[structure.md](arch/structure.md)** (107 lines) - Directory structure
  - Folder organization
  - File naming conventions
  - Module separation

- **[migration.md](arch/migration.md)** (145 lines) - Monolith to microservices migration path
  - Phase 1: Service separation
  - Phase 2: Database separation
  - Phase 3: Independent deployment

**When to load:**
- Need to understand overall system architecture
- Implementing a new service
- Planning service extraction
- Understanding tech stack decisions

**Total:** 558 lines across 4 files

---

### Commands (commands/) 📦 **ON-DEMAND ONLY**
**Load with:** `/gullycontext commands/[git|docker|database|dev]`

**Files:**
- **[dev.md](commands/dev.md)** (340 lines) - Development commands
  - npm scripts
  - Server management
  - Testing commands

- **[docker.md](commands/docker.md)** (305 lines) - Docker workflows
  - docker-compose commands
  - Container management
  - Service debugging

- **[git.md](commands/git.md)** (422 lines) - Git workflows
  - Branching strategy
  - Commit conventions
  - PR workflow

- **[database.md](commands/database.md)** (452 lines) - Database operations
  - Migration commands
  - Seed data
  - Database debugging

**When to load:**
- **Only when performing specific operations** (migrations, git workflows, container debugging)
- Sonnet 4.5 has built-in knowledge of these tools
- Load specific file (e.g., `/gullycontext commands/git`) not entire section

**Total:** 1,519 lines across 4 files | **Status:** Not loaded by default

---

### Database (database/)
**Load with:** `/gullycontext database`

**Files:**
- **[tables.md](database/tables.md)** (215 lines) - Table schemas
  - users, user_sports
  - teams, team_members
  - challenges, matches
  - Column definitions, constraints

- **[indexes.md](database/indexes.md)** (250 lines) - Database indexes
  - Performance-critical indexes
  - Composite indexes
  - Index strategy

- **[redis.md](database/redis.md)** (256 lines) - Redis caching strategy
  - Session management
  - User cache
  - Leaderboards
  - Rate limiting

**When to load:**
- Implementing database queries
- Creating migrations
- Optimizing database performance
- Understanding caching strategy

**Total:** 721 lines across 3 files

---

### MVP (mvp/)
**Load with:** `/gullycontext mvp`

**Files:**
- **[in-scope.md](mvp/in-scope.md)** (45 lines) - MVP features
  - 7 core features (1:1 mapped to phases)
  - Core user flows
  - Essential functionality

- **[out-of-scope.md](mvp/out-of-scope.md)** (53 lines) - Future features
  - Deferred to v2+
  - Nice-to-have features
  - Post-MVP enhancements

- **[timeline.md](mvp/timeline.md)** (106 lines) - Development phases
  - 7-phase development plan
  - Phase-by-phase breakdown
  - Feature-driven milestones

- **[metrics.md](mvp/metrics.md)** (53 lines) - Success metrics
  - Technical metrics (coverage, performance)
  - Learning metrics
  - Product metrics

**When to load:**
- Planning features
- Deciding what to build
- Checking project timeline
- Measuring success

**Total:** 248 lines across 4 files

---

### Workflow (workflow/) 📦 **ON-DEMAND ONLY**
**Load with:** `/gullycontext workflow/[communication|review|principles|antipatterns]`

**Files:**
- **[communication.md](workflow/communication.md)** (395 lines) - Communication protocols
  - How Claude communicates
  - Session start protocols
  - Error handling

- **[review.md](workflow/review.md)** (298 lines) - Code review standards
  - Review criteria
  - Quality checklist
  - Approval process

- **[principles.md](workflow/principles.md)** (183 lines) - Development principles
  - Code quality standards
  - Testing approach
  - Documentation standards

- **[antipatterns.md](workflow/antipatterns.md)** (264 lines) - Common mistakes to avoid
  - Code antipatterns
  - Architecture pitfalls
  - Testing mistakes

**When to load:**
- **Deep dive into process details** (rare)
- Core behavioral rules now in `.claude/.claude.md` (30 lines)
- Load specific file only when needed for detailed reference

**Total:** 1,140 lines across 4 files | **Status:** Not loaded by default

---

### Learnings (learnings.md) 📦 **ON-DEMAND ONLY**
**Load with:** `/gullycontext learnings`

**File:**
- **[learnings.md](learnings.md)** (371 lines) - Phase 1 learnings & patterns
  - Mistakes encountered and prevention strategies
  - Proven patterns from Phase 1
  - Redis config issues
  - Test isolation patterns
  - TypeScript type guard examples

**When to load:**
- Debugging issues similar to Phase 1 problems
- Reviewing historical patterns
- Understanding past architectural decisions
- Rarely needed for current work

**Total:** 371 lines | **Status:** Not loaded by default

---

## 📊 Context Statistics & Token Optimization

### Before Optimization (Historical)
| Section | Files | Lines | Status |
|---------|-------|-------|--------|
| Architecture | 4 | 558 | ✅ Reference (available) |
| Database | 3 | 721 | ✅ Reference (available) |
| MVP | 4 | 256 | ✅ Reference (available) |
| INDEX.md | 1 | 306 | ✅ Reference (available) |
| **Commands** | 4 | 1,519 | 📦 On-demand only |
| **Workflow** | 4 | 1,140 | 📦 On-demand only |
| **Learnings** | 1 | 371 | 📦 On-demand only |
| **Previous Total** | **21** | **4,871** | **Old baseline** |

### After Optimization (Current)
| Category | Lines | Notes |
|----------|-------|-------|
| **Default Load** | **1,871** | Reference docs available when needed |
| **On-Demand Library** | **3,030** | Load via `/gullycontext` when needed |
| **Token Reduction** | **-61.6%** | 3,000 lines saved at startup |

**Behavioral Rules:** Consolidated from 1,140 lines (workflow/*) → 30 lines in `.claude/.claude.md`

---

## 🎯 Recommended Loading Strategy

### Implementing a new service:
```bash
/gullycontext arch/services    # Service boundaries
/gullycontext database/tables  # Schema patterns
```
**Token cost:** ~359 lines (reference docs already available)

### Database migration work:
```bash
/gullycontext database/tables    # Table schemas
/gullycontext commands/database  # Migration commands (on-demand)
```
**Token cost:** ~667 lines (load commands only when needed)

### Planning features:
```bash
/gullycontext mvp/in-scope     # MVP scope
/gullycontext arch/services    # Service architecture
```
**Token cost:** ~189 lines

### Code review or process deep-dive:
```bash
/gullycontext workflow/review       # Detailed review standards (rare)
/gullycontext workflow/antipatterns # Detailed antipatterns (rare)
```
**Note:** Core quality rules now in `.claude/.claude.md` (loaded by default)

---

## 🔄 Maintenance

### Keeping Context Up-to-Date

**Source of Truth:** `.claude/context/` files are the canonical reference

**Update Process:**
1. Update relevant context file(s) when making architectural changes
2. Keep files focused and concise (aim for 100-400 lines each)
3. Archive outdated comprehensive docs (like FULL_CONTEXT.md)
4. Document updates in OPTIMIZATION_LOG.md

**Quality Standards:**
- Each file should be self-contained
- Cross-reference related files sparingly
- Use clear section headings
- Include examples where helpful

---

## 📚 Related Documentation

### High-Level Overviews
- **[docs/architecture/OVERVIEW.md](../../docs/architecture/OVERVIEW.md)** - System architecture overview
- **[docs/INDEX.md](../../docs/INDEX.md)** - Documentation hub
- **[INDEX.md](../INDEX.md)** - Master project navigator (root level)

### Detailed References
- **[docs/planning/API_ENDPOINTS.md](../../docs/planning/API_ENDPOINTS.md)** - Complete API documentation
- **[docs/planning/DATABASE_SCHEMA.md](../../docs/planning/DATABASE_SCHEMA.md)** - Detailed schema definitions
- **[docs/planning/ROADMAP.md](../../docs/planning/ROADMAP.md)** - 12-week development plan

### Archived
- **[docs/archives/architecture/FULL_CONTEXT.md](../../docs/archives/architecture/FULL_CONTEXT.md)** - Historical reference (outdated)

---

## 💡 Optimization Tips

**Best Practices:**
1. **Load minimally:** Only load sections you need for current task
2. **Load specific files:** Use `section/file` syntax for single files
3. **Avoid full loads:** Don't load all sections unless truly needed
4. **Use alternatives:** Check if docs/architecture/OVERVIEW.md has what you need first
5. **Track usage:** Monitor with `/gullymetrics` to validate efficiency

**Anti-Patterns:**
- ❌ Loading all sections at session start
- ❌ Re-loading context you already have in conversation
- ❌ Loading context "just in case"
- ❌ Using comprehensive docs instead of targeted context

**Good Patterns:**
- ✅ Load context only when needed for current task
- ✅ Use conversation memory before re-reading files
- ✅ Load specific files, not entire sections
- ✅ Combine with docs/architecture/OVERVIEW.md for quick reference

---

**Last Updated:** 2025-11-12 (Token Optimization: 61.6% reduction achieved)
**Default Load:** 1,871 lines (reference docs available as needed)
**On-Demand Library:** 3,030 lines (commands/*, workflow/*, learnings.md)
**Purpose:** Peak token efficiency through behavioral consolidation + on-demand reference loading
