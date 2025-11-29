# Workflows Directory

**Purpose**: Process workflow documentation for Gully project operations.

**Last Updated**: 2025-11-09

---

## Workflow Types in This Project

### 1. Execution Workflows (JSON)
**Location**: `/backend/.claude/workflows/*.json`
**Purpose**: Define HOW tasks execute (TDD, test-after, exploratory)
**Referenced by**: Task JSON `workflow.workflowRef` field

**Approved Workflows:**
- `tdd.json` - Test-Driven Development (test-first)
- `test-after.json` - Implementation-first workflow
- `exploratory.json` - Research and prototyping

**Schema**: See `/backend/.claude/WORKFLOW_SCHEMA.md`

---

### 2. Process Workflows (Markdown - This Directory)
**Location**: `/docs/workflows/*.md`
**Purpose**: Document project processes and procedures

**Current Process Workflows:**
- `TASK_GENERATION_WORKFLOW.md` - How to create new task JSONs using OPUS/Sonnet
- `README.md` - This file (workflow directory overview)

---

### 3. Session Workflows (Markdown)
**Location**: `/docs/WORKFLOW_GUIDE.md`
**Purpose**: Quick reference for session management commands

**Key Commands:**
- `/gullystatus` - Get 3-5 sentence project status
- `/gullycontinue` - Load next task details
- Task state management (pending, paused, completed)

---

## Quick Reference

### Check which workflow a task uses
```bash
jq '.workflow' tools/tracker/P3-TEAM-T1.json
```

### List all available execution workflows
```bash
ls -1 backend/.claude/workflows/*.json
```

### Validate workflow exists for task
```bash
task="P3-TEAM-T1"
ref=$(jq -r '.workflow.workflowRef' "tools/tracker/$task.json")
test -f "backend/.claude/$ref" && echo "✓ Valid" || echo "✗ Missing"
```

---

## Workflow Consolidation (2025-11-09)

**Problem Identified**: Conflicting/overlapping workflow documentation

**Solution Implemented**:
1. Created formal workflow object schema (`WORKFLOW_SCHEMA.md`)
2. Established 3 workflow types with clear boundaries
3. Created execution workflow JSONs (tdd, test-after, exploratory)
4. Updated TASK_GENERATION_WORKFLOW.md to reference new structure
5. All 12 Phase 2-3 tasks now reference valid `workflows/tdd.json`

**Directory Structure**:
```
/backend/.claude/workflows/     # Execution workflows (JSON)
/docs/workflows/                # Process workflows (Markdown)
/docs/WORKFLOW_GUIDE.md         # Session workflow reference
```

---

## See Also

- `/backend/.claude/WORKFLOW_SCHEMA.md` - Formal workflow object definition
- `/docs/architecture/TASK_SYSTEM_DESIGN.md` - Task system architecture
- `/docs/WORKFLOW_GUIDE.md` - Session management guide
