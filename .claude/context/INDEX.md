# Claude Code Context Sections

**On-demand context loading for token efficiency**

Use `/gullycontext [section]` to load specific sections only when needed.

---

## 🎯 Purpose

**Token Optimization Strategy:**
- Load only the context you need for current task
- Avoid loading large comprehensive files
- Target: 30-40% token reduction vs loading full context

**Usage:**
```bash
/gullycontext arch           # Load all architecture files
/gullycontext arch/stack     # Load specific file
/gullycontext database       # Load all database files
/gullycontext mvp/in-scope   # Load MVP scope only
```

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

### Commands (commands/)
**Load with:** `/gullycontext commands`

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
- Need specific command reference
- Setting up local environment
- Debugging infrastructure issues
- Running migrations or seeds

**Total:** 1,519 lines across 4 files

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
- **[in-scope.md](mvp/in-scope.md)** (45 lines) - MVP features (MODIFIED)
  - Must-have features for Week 12
  - Core user flows
  - Essential functionality

- **[out-of-scope.md](mvp/out-of-scope.md)** (53 lines) - Future features
  - Deferred to v2+
  - Nice-to-have features
  - Post-MVP enhancements

- **[timeline.md](mvp/timeline.md)** (97 lines) - Project timeline
  - 12-week development plan
  - Week-by-week breakdown
  - Milestone targets

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

### Workflow (workflow/)
**Load with:** `/gullycontext workflow`

**Files:**
- **[communication.md](workflow/communication.md)** (395 lines) - Communication protocols
  - How Claude communicates
  - Session start protocols
  - Error handling

- **[review.md](workflow/review.md)** (298 lines) - Code review standards
  - Review criteria
  - Quality checklist
  - Approval process

- **[principles.md](workflow/principles.md)** (182 lines) - Development principles
  - Code quality standards
  - Testing approach
  - Documentation standards

- **[antipatterns.md](workflow/antipatterns.md)** (264 lines) - Common mistakes to avoid
  - Code antipatterns
  - Architecture pitfalls
  - Testing mistakes

**When to load:**
- Starting new development session
- Reviewing code
- Understanding quality standards
- Avoiding common mistakes

**Total:** 1,139 lines across 4 files

---

## 📊 Context Statistics

| Section | Files | Total Lines | Typical Use |
|---------|-------|-------------|-------------|
| Architecture | 4 | 558 | Service implementation |
| Commands | 4 | 1,519 | Environment setup |
| Database | 3 | 721 | Database work |
| MVP | 4 | 248 | Feature planning |
| Workflow | 4 | 1,139 | Code quality |
| **Total** | **19** | **4,185** | **All contexts** |

---

## 🎯 Loading Strategy

### Task-Based Loading

**Implementing a new service:**
```bash
/gullycontext arch/services    # Service boundaries
/gullycontext database         # Schema patterns
/gullycontext workflow/review  # Quality standards
```
**Token cost:** ~1,500 lines vs 4,185 lines (64% reduction)

**Database migration work:**
```bash
/gullycontext database/tables  # Table schemas
/gullycontext commands/database # Migration commands
```
**Token cost:** ~667 lines vs 4,185 lines (84% reduction)

**Planning features:**
```bash
/gullycontext mvp              # Scope and timeline
/gullycontext arch/services    # Service architecture
```
**Token cost:** ~806 lines vs 4,185 lines (81% reduction)

**Code review:**
```bash
/gullycontext workflow/review     # Review standards
/gullycontext workflow/antipatterns # Common mistakes
```
**Token cost:** ~562 lines vs 4,185 lines (87% reduction)

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

**Last Updated:** 2025-11-06
**Total Context Lines:** 4,185 lines across 19 files
**Purpose:** Token-efficient context loading for Claude Code
**Optimization:** 30-85% token reduction through targeted loading
