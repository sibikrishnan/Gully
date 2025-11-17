---
name: ctx
description: Load project context sections (database schema, architecture, MVP scope, workflow patterns) when implementing features, making architectural decisions, or answering questions about project structure and patterns
---

# Context Loader

Load on-demand context from project documentation to inform implementation decisions.

## When to Invoke

Invoke this skill when you need context about:
- **Database operations** → table schemas, indexes, Redis patterns, Knex usage
- **Architecture decisions** → service boundaries, tech stack, directory structure
- **Feature planning** → MVP scope, timeline, success metrics
- **Workflow questions** → development principles, antipatterns, communication standards
- **Planning reference** → database schema, API endpoints, roadmap
- **Historical patterns** → Phase 1 learnings and mistakes

## How It Works

1. Read CONTEXT_MAP.md for section-to-file mappings
2. Identify section needed (database, arch, mvp, workflow, planning, learnings)
3. Extract file paths for that section
4. Use Read tool to load each file with absolute path
5. Return combined context with clear section labels

## Available Sections

**database**: Table schemas, indexes, Redis caching, Knex patterns
**arch**: Service boundaries, tech stack, directory structure, migration path
**mvp**: Feature scope (in/out), timeline, success metrics
**workflow**: Development principles, antipatterns, communication, review standards
**planning**: Database schema, API endpoints, roadmap (detailed planning docs)
**learnings**: Phase 1 patterns, mistakes, and prevention strategies

## Implementation

**Step 1**: Read context map
Read /Users/sibikrishnan/Documents/Gully/CONTEXT_MAP.md

**Step 2**: Parse requested section
Identify section name (e.g., "database", "arch", "mvp")

**Step 3**: Extract file paths
Parse CONTEXT_MAP.md to find all files under requested section
Each line format: `filename: relative/path/to/file.md`

**Step 4**: Read files
For each file path, prepend repo root: /Users/sibikrishnan/Documents/Gully/
Use Read tool to load content

**Step 5**: Return combined context
Format output with clear section labels for each file loaded

## Example Usage

**Task**: Implement user sports preferences endpoint

**Action**: Invoke ctx skill → "need database context"

**Skill execution**:
1. Reads CONTEXT_MAP.md
2. Finds database section with 4 files
3. Reads tables.md, indexes.md, redis.md, knex-patterns.md
4. Returns combined database context

**Result**: Claude implements endpoint with correct schema knowledge, no guessing

---

**Token efficiency**: Only loads when invoked, not every session
**Replaces**: Manual grep/glob searches and `/gullycontext` commands Claude cannot invoke
