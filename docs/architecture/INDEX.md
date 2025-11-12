# Architecture Documentation

**Complete index of system architecture documentation**

---

## 📚 Architecture Documents

### Overview & Core Architecture
**[OVERVIEW.md](OVERVIEW.md)** - System architecture overview

**Contents:**
- Modular monolith strategy
- Technology stack
- Service boundaries
- Database architecture
- Migration path to microservices
- Development workflow
- Success metrics

**When to use:** Need high-level understanding of system architecture

---

### Task System Design
**[TASK_SYSTEM_DESIGN.md](TASK_SYSTEM_DESIGN.md)** - Task tracking system design

**Contents:**
- Task state machine
- Task schema definition
- Workflow implementation
- CLI tool design

**When to use:** Working with task management system

**Related:**
- Implementation: `tools/tracker/`
- CLI Tool: `tools/tracker/`

---

### Context Optimization
**[CONTEXT_OPTIMIZATION_REPORT.md](CONTEXT_OPTIMIZATION_REPORT.md)** - Context optimization analysis

**Contents:**
- Token usage analysis
- Context loading strategies
- Optimization recommendations

**When to use:** Understanding Claude Code context optimization

---

## 🗂️ Active Development Context

**For active development, use `/gullycontext` commands instead of reading these docs:**

```bash
/gullycontext arch           # Architecture details (stack, services, structure, migration)
/gullycontext database       # Database schema (tables, indexes, Redis)
/gullycontext mvp            # MVP scope and timeline
/gullycontext workflow       # Development best practices
/gullycontext commands       # Command references
```

**Source Files:** `.claude/context/` directory

**Context Sections:**
- `arch/` - stack.md, services.md, structure.md, migration.md (4 files)
- `database/` - tables.md, indexes.md, redis.md (3 files)
- `mvp/` - in-scope.md, out-of-scope.md, timeline.md, metrics.md (4 files)
- `workflow/` - communication.md, review.md, principles.md, antipatterns.md (4 files)
- `commands/` - dev.md, docker.md, git.md, database.md (4 files)

---

## 📦 Related Documentation

### Service Implementation
- **Service Briefs:** `docs/service-briefs/` - Detailed implementation guides for each service
- **API Docs:** `docs/planning/API_ENDPOINTS.md` - Complete API reference
- **Database Schema:** `docs/planning/DATABASE_SCHEMA.md` - Detailed schema definitions

### Planning
- **Roadmap:** `docs/planning/ROADMAP.md` - 12-week development plan
- **Features:** `docs/planning/FEATURES.md` - Feature specifications

### Archives
- **FULL_CONTEXT.md:** `docs/archives/architecture/FULL_CONTEXT.md` - Historical reference (outdated, use `.claude/context/` instead)
- **ARCHITECTURE.md:** Deleted (replaced by OVERVIEW.md)

---

## 🎯 Decision Guide

**Which file should I read?**

| Question | File | Alternative |
|----------|------|-------------|
| What's the overall system architecture? | OVERVIEW.md | `/gullycontext arch` |
| How does the task system work? | TASK_SYSTEM_DESIGN.md | `tools/tracker/README.md` |
| How do I optimize context loading? | CONTEXT_OPTIMIZATION_REPORT.md | `.claude/OPTIMIZATION_LOG.md` |
| What's the database schema? | `../planning/DATABASE_SCHEMA.md` | `/gullycontext database` |
| How do services interact? | OVERVIEW.md (Service Boundaries) | `/gullycontext arch/services` |
| What's the tech stack? | OVERVIEW.md (Technology Stack) | `/gullycontext arch/stack` |

---

## 📊 Architecture Statistics

- **Active Architecture Docs:** 3 files
- **Context Sections:** 19 files in `.claude/context/`
- **Service Briefs:** 6 files in `docs/service-briefs/`
- **Planning Docs:** 5 files in `docs/planning/`

**Source of Truth:** `.claude/context/` directory (always up-to-date)

**Documentation Strategy:**
- **High-level overviews:** `docs/architecture/` (this directory)
- **Detailed context:** `.claude/context/` (load on-demand via `/gullycontext`)
- **Implementation details:** Service briefs, planning docs, source code

---

## 🔄 Documentation Workflow

**When architecture changes:**
1. Update source files in `.claude/context/[section]/`
2. Update OVERVIEW.md if high-level changes
3. Update service briefs if service boundaries change
4. Update planning docs if database or API changes
5. Archive outdated comprehensive docs

**Principle:** Single source of truth in `.claude/context/`, with lean overview docs pointing to it

---

**Last Updated:** 2025-11-06
**Status:** Refactoring complete (Phase 2)
**Purpose:** Navigate architecture documentation efficiently
