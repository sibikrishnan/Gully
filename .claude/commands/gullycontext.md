---
description: Load project context sections/subsections on-demand to save tokens
---

# Load Project Context

Load specific context files only when needed.

## Usage

```bash
# Full sections
/gullycontext mvp         # All MVP context
/gullycontext arch        # Architecture
/gullycontext database    # Database schemas
/gullycontext learnings   # Phase patterns
/gullycontext workflow    # Workflows & practices

# Specific subsections
/gullycontext mvp/in-scope
/gullycontext mvp/timeline
/gullycontext arch/services
/gullycontext arch/structure
/gullycontext database/tables
/gullycontext workflow/git-workflow
/gullycontext workflow/file-discovery
```

**Full mapping:** `docs/context/INDEX.md`
