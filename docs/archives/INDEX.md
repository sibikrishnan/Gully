# Archived Documentation

**Historical documents - preserved for reference, not for active development**

⚠️ **These files are outdated and should not be used for current development decisions.**

---

## 📁 Archive Categories

### Completed Tasks
**[tasks/](tasks/)** - Completed task definitions

- **[WEEK1_TASKS.md](tasks/WEEK1_TASKS.md)** - Week 1 task definitions (⚠️ Archived 2025-11-03)
  - **Status:** ✅ All tasks completed
  - **Canonical Reference:** See `/docs/weekly-reviews/WEEK1_REVIEW.md` instead
  - **Content:** Original task definitions for Week 1 foundation work
  - **Lines:** 303 lines
  - **Purpose:** Historical reference only

---

### Historical Reviews
**[reviews/](reviews/)** - Past review sessions

- **[Human-Claude-Gemini.md](reviews/Human-Claude-Gemini.md)** - Token optimization discussion (⚠️ Archived 2025-11-06)
  - **Context:** Early discussion about token optimization and task history management
  - **Outcome:** Led to comprehensive refactoring
  - **Content:** Multi-AI review of token auditor strategy
  - **Lines:** 190 lines
  - **Purpose:** Historical reference showing evolution of optimization strategy

### Optimization Archives
**[optimization/](optimization/)** - Historical optimization documents

- **[CLAUDE_MD_OPTIMIZATION.md](optimization/CLAUDE_MD_OPTIMIZATION.md)** - Context optimization discussion (⚠️ Archived 2025-11-07)
  - **Content:** Early discussion about optimizing .claude.md
  - **Lines:** 234 lines
  - **Purpose:** Historical reference for optimization approach evolution

### Refactoring Archives
**[refactoring/](refactoring/)** - Refactoring plans and summaries

- **[REFACTORING_PLAN.md](refactoring/REFACTORING_PLAN.md)** - Structure refactoring plan (⚠️ Archived 2025-11-07)
  - **Content:** 5-phase refactoring plan for project structure
  - **Lines:** 634 lines
  - **Purpose:** Historical record of refactoring approach

- **[REFACTORING_SUMMARY.md](refactoring/REFACTORING_SUMMARY.md)** - Structure refactoring results (⚠️ Archived 2025-11-07)
  - **Content:** Complete summary of refactoring execution and results
  - **Lines:** 331 lines
  - **Purpose:** Historical record of refactoring outcomes

### Prompts Archive
**[prompts/](prompts/)** - Historical prompts and context files

- **[prompt01.md](prompts/prompt01.md)** - Early prompt experiments (⚠️ Archived 2025-11-07)
  - **Lines:** ~150 lines
  - **Purpose:** Historical reference for early prompt engineering

### Human Notes
**[human-read-only/](human-read-only/)** - Personal observations and notes

- **[observation.txt](human-read-only/observation.txt)** - Human observations (⚠️ Archived 2025-11-07)
  - **Content:** Personal notes on Claude behavior and best practices
  - **Lines:** 42 lines
  - **Purpose:** Personal reference for session management patterns

---

### Architecture Archives
**[architecture/](architecture/)** - Outdated architecture documentation

- **[FULL_CONTEXT.md](architecture/FULL_CONTEXT.md)** - Historical context reference (⚠️ Archived 2025-11-06)
  - **Status:** Reference only, not actively maintained
  - **Canonical Reference:** Use `.claude/context/` files via `/gullycontext` commands instead
  - **Content:** Comprehensive context from Week 1 (may be outdated)
  - **Lines:** 1,074 lines
  - **Sections:** Architecture, MVP, Database, Commands, Workflow
  - **Replacement:**
    - Architecture → `/docs/architecture/OVERVIEW.md` + `/gullycontext arch`
    - Database → `/gullycontext database`
    - Commands → `/gullycontext commands`
    - Workflow → `/gullycontext workflow`
    - MVP → `/gullycontext mvp`
  - **Purpose:** Historical snapshot of comprehensive documentation approach
  - **Why archived:** Content split into smaller, maintainable `.claude/context/` files for better token efficiency

---

## 🔍 Why Files Are Archived

### WEEK1_TASKS.md
- **Reason:** Week 1 complete, tasks no longer active
- **Better alternative:** `docs/weekly-reviews/WEEK1_REVIEW.md` has comprehensive retrospective
- **Token impact:** Eliminated duplicate content (~1,500 tokens saved)

### FULL_CONTEXT.md
- **Reason:** Too large (1,074 lines), hard to maintain, token-inefficient
- **Better alternative:** Modular `.claude/context/` files loaded on-demand via `/gullycontext`
- **Token impact:** Load only needed sections (~30-40% reduction vs loading full context)

---

## 📚 Active Documentation References

**Instead of archived files, use:**

### For Week 1 Information
- ✅ **Weekly Review:** `docs/weekly-reviews/WEEK1_REVIEW.md` - Comprehensive retrospective
- ✅ **Task History:** `TASK_HISTORY.md` - Task completion log

### For Architecture
- ✅ **Overview:** `docs/architecture/OVERVIEW.md` - High-level system architecture
- ✅ **Context Sections:** `.claude/context/` - Detailed, up-to-date context (load via `/gullycontext`)
- ✅ **Service Briefs:** `docs/parallel-development/` - Service implementation guides

### For Database
- ✅ **Schema:** `docs/planning/DATABASE_SCHEMA.md` - Complete schema reference
- ✅ **Context:** `/gullycontext database` - Tables, indexes, Redis details

### For Workflow
- ✅ **Workflow Guide:** `docs/WORKFLOW_GUIDE.md` - Development best practices
- ✅ **Context:** `/gullycontext workflow` - Detailed workflow patterns

---

## 🗂️ Archive Structure

```
archives/
├── INDEX.md (this file)           # Archive navigator
├── tasks/
│   └── WEEK1_TASKS.md             # Week 1 task definitions (archived 2025-11-03)
├── reviews/
│   └── Human-Claude-Gemini.md     # Multi-AI optimization review (archived 2025-11-06)
├── architecture/
│   └── FULL_CONTEXT.md            # Historical context reference (archived 2025-11-06)
├── optimization/
│   └── CLAUDE_MD_OPTIMIZATION.md  # Context optimization discussion (archived 2025-11-07)
├── refactoring/
│   ├── REFACTORING_PLAN.md        # Refactoring plan (archived 2025-11-07)
│   └── REFACTORING_SUMMARY.md     # Refactoring summary (archived 2025-11-07)
├── prompts/
│   └── prompt01.md                # Early prompts (archived 2025-11-07)
└── human-read-only/
    └── observation.txt            # Human observations (archived 2025-11-07)
```

---

## ⚠️ Important Notes

### Do NOT Use for:
- ❌ Active development decisions
- ❌ Current task planning
- ❌ Architecture reference
- ❌ Database schema reference

### OK to Use for:
- ✅ Historical context ("What did we do in Week 1?")
- ✅ Understanding past decisions ("Why did we structure it this way?")
- ✅ Comparing progress ("How much have we improved?")
- ✅ Audit trail ("What was the original plan?")

---

## 📊 Archive Statistics

| File | Lines | Archived Date | Reason | Replacement |
|------|-------|---------------|--------|-------------|
| WEEK1_TASKS.md | 303 | 2025-11-03 | Week 1 complete | docs/weekly-reviews/WEEK1_REVIEW.md |
| FULL_CONTEXT.md | 1,074 | 2025-11-06 | Too large, outdated | .claude/context/ + docs/architecture/OVERVIEW.md |
| Human-Claude-Gemini.md | 190 | 2025-11-06 | Historical review | Context now in OPTIMIZATION_LOG.md |
| CLAUDE_MD_OPTIMIZATION.md | 234 | 2025-11-07 | Historical optimization | .claude/OPTIMIZATION_LOG.md |
| REFACTORING_PLAN.md | 634 | 2025-11-07 | Refactoring complete | Refactoring done |
| REFACTORING_SUMMARY.md | 331 | 2025-11-07 | Refactoring complete | Changes integrated |
| prompt01.md | 150 | 2025-11-07 | Early experiment | Current prompts in .claude/ |
| observation.txt | 42 | 2025-11-07 | Personal notes | Knowledge captured in guides |
| **Total** | **2,958** | **-** | **-** | **-** |

**Token Savings:** ~6,500 tokens by eliminating duplicates and encouraging use of focused alternatives

---

## 🔄 Archival Process

**When to archive a file:**
1. Content is outdated or superseded by newer documentation
2. File is no longer relevant for active development
3. Better alternatives exist (more focused, up-to-date)
4. File is creating token waste through duplication

**How to archive:**
1. Move file to appropriate `docs/archives/` subdirectory
2. Add archive warning header to file
3. Update this INDEX.md with entry
4. Add references to better alternatives
5. Update any documentation that referenced the archived file
6. Commit with clear message explaining archival reason

**Archive header template:**
```markdown
⚠️ **ARCHIVED - [Date]**

**For [topic], see:** [Link to better alternative]

This file is preserved for historical reference but should not be used for active development.
```

---

**Last Updated:** 2025-11-07
**Total Archived Files:** 8 files (2,958 lines)
**Token Savings:** ~7,000+ tokens by archiving refactoring artifacts
**Purpose:** Preserve history while maintaining clean active documentation
