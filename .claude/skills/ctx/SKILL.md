---
name: ctx
description: Load minimal relevant context when starting tasks by analyzing task tags, description, and parent ID. Intelligently selects database schemas, architecture patterns, and workflow guides at file or section level for maximum token efficiency. INVOKE BEFORE implementing features.
---

# Intelligent Context Loader

Loads minimal, task-relevant context from project documentation.

## When to Invoke This Skill

**MANDATORY - Invoke this skill using `Skill` tool when:**
- Starting a new task (after reading task JSON file)
- Implementing routes, controllers, repositories, or validation
- Working with database operations (queries, migrations, schemas)
- Writing tests (unit, integration, E2E)
- Making architecture decisions

## How It Works (Auto-Inference)

1. Read task JSON (tags, description, parent_id)
2. Read TASK_CONTEXT_MAP.md for tag/keyword mappings
3. Infer minimal context needed (file or section level)
4. Load only relevant content (target: <100 lines)
5. Report token efficiency

## Implementation Steps

1. **Read task context**: Extract tags, description, parent_id from task JSON
2. **Read mapping**: Load TASK_CONTEXT_MAP.md for inference rules
3. **Infer context needs**: Map task characteristics to context files/sections
4. **Determine granularity**: Section-level (<100 lines) or file-level
5. **Load context**: Use CONTEXT_MAP.md for file paths, Read tool to load
6. **Extract sections**: If section-level, extract specific markdown sections
7. **Return formatted**: Present loaded context with clear labels

## Output Format

```
✅ Auto-loaded context for {task-id}

📊 {file-name} (section: {section-name})
[content]

Token efficiency: X lines loaded vs Y lines full (Z% savings)
```

## Example: Routes Task

**Task**: P2-PROF-T4.3 (tags: routes, middleware, sports)

**Auto-inference**:
- routes → arch/structure.md#routes
- middleware → arch/structure.md#middleware
- sports → database/tables.md#user_sports-table

**Result**: Loads ~95 lines vs 850 lines (89% savings)

---

**Key**: Auto-invoked by Claude when starting tasks, not manual
**Replaces**: Manual grep/glob wildcard searches
