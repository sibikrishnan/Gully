---
description: Load project context sections/subsections on-demand to save tokens
---

# Load Project Context

**Purpose:** Load specific context files only when needed for focused work.

---

## Usage

```
# Load full sections
/gullycontext mvp         - All MVP context
/gullycontext arch        - All architecture context
/gullycontext database    - All database context
/gullycontext commands    - All command references
/gullycontext workflow    - All workflow & practices

# Load specific subsections (more granular)
/gullycontext mvp/in-scope       - MVP features in-scope
/gullycontext mvp/out-of-scope   - Features deferred to v2+
/gullycontext mvp/timeline       - 12-week timeline
/gullycontext mvp/metrics        - Success metrics

/gullycontext arch/structure     - Folder structure & patterns
/gullycontext arch/services      - Service boundaries & dependencies
/gullycontext arch/migration     - Migration path (Phase 1-3)
/gullycontext arch/stack         - Tech stack details

/gullycontext database/tables    - PostgreSQL schemas
/gullycontext database/redis     - Redis data structures
/gullycontext database/indexes   - Database indexes

/gullycontext commands/docker    - Docker Compose commands
/gullycontext commands/database  - Database & migration commands
/gullycontext commands/dev       - Development commands
/gullycontext commands/git       - Git workflow

/gullycontext workflow/principles     - Development principles
/gullycontext workflow/antipatterns   - Anti-patterns to avoid
/gullycontext workflow/review         - Weekly review protocol
/gullycontext workflow/communication  - Claude-Human communication

# Legacy support
/gullycontext full        - Load FULL_CONTEXT.md (reference only)
```

---

## Instructions for Claude

### Parse the Command Argument

Extract section and subsection from command:
- Format: `/gullycontext {section}` or `/gullycontext {section}/{subsection}`
- Section: `mvp`, `arch`, `database`, `commands`, `workflow`, `full`
- Subsection: See list above

### File Path Mapping

```
/gullycontext mvp
  → Read all files in .claude/context/mvp/
  → in-scope.md, out-of-scope.md, timeline.md, metrics.md

/gullycontext mvp/in-scope
  → Read .claude/context/mvp/in-scope.md

/gullycontext arch
  → Read all files in .claude/context/arch/
  → structure.md, services.md, migration.md, stack.md

/gullycontext arch/services
  → Read .claude/context/arch/services.md

/gullycontext database
  → Read all files in .claude/context/database/
  → tables.md, redis.md, indexes.md

/gullycontext database/tables
  → Read .claude/context/database/tables.md

/gullycontext commands
  → Read all files in .claude/context/commands/
  → docker.md, database.md, dev.md, git.md

/gullycontext commands/docker
  → Read .claude/context/commands/docker.md

/gullycontext workflow
  → Read all files in .claude/context/workflow/
  → principles.md, antipatterns.md, review.md, communication.md

/gullycontext workflow/principles
  → Read .claude/context/workflow/principles.md

/gullycontext full
  → Read .claude/FULL_CONTEXT.md (reference only, not up-to-date)
```

### Implementation Logic

1. **Parse command:** Extract section and optional subsection
2. **Determine files to read:**
   - If subsection specified → read single file
   - If section only → read all files in that directory
3. **Read files** using Read tool
4. **Present summary** of loaded content
5. **Ask:** "What would you like to work on with this context?"

### Response Format

**For subsection loads:**
```
✅ Loaded {section}/{subsection} context

Key points:
- [Point 1]
- [Point 2]
- [Point 3]

What would you like to work on with this context?
```

**For full section loads:**
```
✅ Loaded {section} context (all subsections)

Loaded:
- {subsection1}
- {subsection2}
- {subsection3}

Key areas covered:
- [Area 1]
- [Area 2]

What would you like to work on with this context?
```

---

## Example Responses

### Example 1: /gullycontext mvp/in-scope

```
✅ Loaded mvp/in-scope context

Key points:
- 7 core features for MVP: auth, profiles, teams, challenges, matches, results, leaderboard
- All features must be working for Phase 1
- Focus on functional over fancy

What would you like to work on with this context?
```

### Example 2: /gullycontext arch/services

```
✅ Loaded arch/services context

Key points:
- 4 services: User (foundation), Team, Match, Stats
- Clear dependency hierarchy: User → Team → Match → Stats
- Implement in this order for MVP
- Direct function calls in monolith (no HTTP yet)

What would you like to work on with this context?
```

### Example 3: /gullycontext database/tables

```
✅ Loaded database/tables context

Key points:
- 6 core tables: users, user_sports, teams, team_members, challenges, matches
- All use UUID primary keys
- Polymorphic relationships for challenges/matches (support users OR teams)
- Indexes on all foreign keys

What would you like to work on with this context?
```

### Example 4: /gullycontext commands/docker

```
✅ Loaded commands/docker context

Key points:
- Start: `docker compose up -d`
- Logs: `docker compose logs -f`
- Stop: `docker compose stop` (preserves data)
- Reset: `docker compose down -v` (deletes data)

What would you like to work on with this context?
```

### Example 5: /gullycontext workflow

```
✅ Loaded workflow context (all subsections)

Loaded:
- principles.md
- antipatterns.md
- review.md
- communication.md

Key areas covered:
- 6 development principles (local-first, modular monolith, pragmatic MVP, etc.)
- Anti-patterns to avoid (premature microservices, paid services, over-engineering)
- Weekly review protocol (token analysis, progress assessment, learning docs)
- Communication guidelines (ask questions, confirm requirements, request context)

What would you like to work on with this context?
```

### Example 6: /gullycontext (no argument)

```
Please specify which context to load:

**Sections:**
- `/gullycontext mvp` - MVP scope & timeline (4 subsections)
- `/gullycontext arch` - Architecture details (4 subsections)
- `/gullycontext database` - Database schema (3 subsections)
- `/gullycontext commands` - Development commands (4 subsections)
- `/gullycontext workflow` - Workflow & practices (4 subsections)

**Subsections (examples):**
- `/gullycontext mvp/in-scope` - Core MVP features
- `/gullycontext arch/services` - Service boundaries
- `/gullycontext database/tables` - PostgreSQL schemas
- `/gullycontext commands/docker` - Docker commands
- `/gullycontext workflow/principles` - Dev principles

**Tip:** Use subsections for maximum token efficiency!
```

---

## When to Load Which Context

### Working on User Authentication
```
/gullycontext mvp/in-scope (feature #1)
/gullycontext arch/services (User Service details)
/gullycontext database/tables (users, user_sports)
```

### Working on Team Features
```
/gullycontext mvp/in-scope (feature #3)
/gullycontext arch/services (Team Service + dependencies)
/gullycontext database/tables (teams, team_members)
```

### Database Schema Changes
```
/gullycontext database/tables
/gullycontext commands/database (migration commands)
```

### Docker Issues
```
/gullycontext commands/docker
```

### Architecture Decisions
```
/gullycontext arch/structure
/gullycontext workflow/antipatterns
```

### Weekly Planning
```
/gullycontext mvp/timeline
/gullycontext workflow/review
```

### Understanding Project Constraints
```
/gullycontext mvp/out-of-scope
/gullycontext workflow/principles
/gullycontext arch/stack
```

---

## Benefits

- **Token Efficient:** Load only what you need (~50-200 lines vs 1000+)
- **Focused Work:** Get exact context for specific task
- **Better Communication:** Claude knows what info is available
- **Scalable:** Easy to add new subsections as project grows
- **Faster:** Reading single file vs parsing large file

---

## Claude's Proactive Context Loading

When Claude needs context, it should tell you:

**Examples:**
```
"I need service boundary details.
Please run: /gullycontext arch/services"

"I need database schema for users table.
Please run: /gullycontext database/tables"

"I need to understand MVP scope.
Please run: /gullycontext mvp/in-scope"

"I need Docker commands reference.
Please run: /gullycontext commands/docker"
```

---

**Remember:** More granular context = fewer tokens = more efficient sessions!
