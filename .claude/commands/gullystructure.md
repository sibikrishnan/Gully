# /gullystructure - File Structure Reminder

**Purpose:** Remind Claude about INDEX-based file discovery system

---

## 📂 File Discovery System

### PRIMARY RULE
**ALWAYS check INDEX files before searching for files**

### Navigation Hierarchy

```
INDEX.md (root)                    ← START HERE for ANY file
├── docs/INDEX.md                  ← Documentation hub
│   ├── architecture/INDEX.md      ← Architecture docs
│   ├── parallel-development/INDEX.md  ← Service briefs
│   └── archives/INDEX.md          ← Historical files
└── .claude/context/INDEX.md       ← Context sections
```

### Quick File Locations

**Documentation:**
- Architecture → `docs/architecture/OVERVIEW.md`
- Database schema → `docs/planning/DATABASE_SCHEMA.md`
- API endpoints → `docs/planning/API_ENDPOINTS.md`
- Service briefs → `docs/parallel-development/INDEX.md`

**Status:**
- Current status → `STATUS.md`
- Task tracking → `TASK_HISTORY.md`
- Weekly reviews → `docs/weekly-reviews/`

**Context (on-demand):**
- Use `/gullycontext [section]` for targeted loading
- See `.claude/context/INDEX.md` for available sections

**Source Code:**
- Backend → `backend/src/services/[service]/`
- Tests → `backend/tests/`

---

## ✅ Correct Discovery Pattern

1. Read INDEX.md (root)
2. Find relevant section
3. Navigate to specific file
4. **Result:** 1-2 tool calls

## ❌ Forbidden Patterns

- ❌ Glob without checking INDEX first
- ❌ Grep to find files without INDEX check
- ❌ Reading multiple potential files
- ❌ Loading archived/outdated comprehensive docs

---

## 📊 Performance Target

**Goal:** Find any file in 1-2 tool calls
**Track:** Use `/gullymetrics` to measure efficiency

---

**Remember:** The INDEX system saves 30-40% tokens and 50% discovery time!
