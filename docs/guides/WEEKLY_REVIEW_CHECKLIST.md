# Weekly Review Checklist

**Purpose:** Ensure project structure, documentation, and token efficiency are maintained

**When to use:** End of each week before moving to next week

---

## ✅ 1. File Structure Integrity

### INDEX Files Current?
- [ ] `INDEX.md` (root) - Updated with new major files
- [ ] `docs/INDEX.md` - New docs referenced
- [ ] `docs/architecture/INDEX.md` - Architecture changes documented
- [ ] `docs/service-briefs/INDEX.md` - New service briefs added
- [ ] `.claude/context/INDEX.md` - Context sections updated

**Action if not current:** Update relevant INDEX files before closing week

---

## ✅ 2. File Discovery Performance

### Test File Discovery Speed
Run these queries and count tool calls:

**Test 1: Find database schema**
- [ ] Query: "Where is the database schema documented?"
- [ ] Expected: 1-2 tool calls via INDEX.md
- [ ] Actual: _____ tool calls

**Test 2: Find service implementation**
- [ ] Query: "Show me the UserService brief"
- [ ] Expected: 2-3 tool calls via INDEX.md → service-briefs/INDEX.md
- [ ] Actual: _____ tool calls

**Test 3: Load architecture context**
- [ ] Query: "Load architecture details"
- [ ] Expected: Use `/gullycontext arch` directly
- [ ] Actual: Method used: __________

**Action if >2 tool calls:** Claude may not be following FILE DISCOVERY PROTOCOL - review `.claude/.claude.md`

---

## ✅ 3. Token Optimization Audit

### Check File Sizes (Target: <100 lines for frequently-read files)

**Active Files:**
- [ ] `STATUS.md` - Lines: _____ (Target: <50)
- [ ] `TASK_HISTORY.md` - Lines: _____ (Target: <100)
- [ ] `.claude/.claude.md` - Lines: _____ (Target: <300)
- [ ] Weekly review file - Lines: _____ (Target: <1000)

**Context Sections:**
- [ ] `.claude/context/mvp/in-scope.md` - Lines: _____ (Target: <100)
- [ ] `.claude/context/arch/services.md` - Lines: _____ (Target: <200)
- [ ] Other context files - Largest: _____ lines

**Action if oversized:**
- TASK_HISTORY.md >100 lines → Archive completed tasks
- STATUS.md >50 lines → Remove old status, keep current only
- Context files >300 lines → Split into smaller focused files

---

## ✅ 4. Duplication Check

### Scan for Duplicate Content
- [ ] No duplicate task definitions across files
- [ ] No duplicate architecture explanations
- [ ] No duplicate API documentation
- [ ] No overlapping content in INDEX files

**Method:** Search for key phrases across files
- Example: "modular monolith" should be in architecture docs only, not repeated everywhere

**Action if duplicates found:** Consolidate to single source of truth, update cross-references

---

## ✅ 5. Archive Maintenance

### Completed Content Archived?
- [ ] Last week's tasks moved to `docs/archives/tasks/WEEK[N]_TASKS.md`
- [ ] Last week's review in `docs/weekly-reviews/WEEK[N]_REVIEW.md`
- [ ] No active references to archived files in current docs
- [ ] Archive warnings in place on archived files

**Archive Warning Template:**
```markdown
⚠️ **ARCHIVED - Week [N] Complete ([Date])**

**For Week [N] information, see:** `/docs/weekly-reviews/WEEK[N]_REVIEW.md`

This file is preserved for historical reference but should not be used for active development.
```

---

## ✅ 6. Navigation Links Validation

### Cross-References Working?
Spot check 5 random links in documentation:

1. Link from INDEX.md → _____ - [ ] Works
2. Link from docs/INDEX.md → _____ - [ ] Works
3. Link from architecture/INDEX.md → _____ - [ ] Works
4. Link from service-briefs/INDEX.md → _____ - [ ] Works
5. Link from .claude/context/INDEX.md → _____ - [ ] Works

**Action if broken links:** Fix immediately, broken links defeat INDEX purpose

---

## ✅ 7. Context Loading Efficiency

### `/gullycontext` Usage Review
Review last week's sessions:

- [ ] Used `/gullycontext [section]` for targeted loading?
- [ ] Avoided loading full FULL_CONTEXT.md?
- [ ] Loaded only needed sections for each task?
- [ ] Average context size per task: _____ lines (Target: <1500)

**Token Savings Calculation:**
- Full context (old approach): 4,185 lines
- Average targeted loading: _____ lines
- Reduction: _____ % (Target: >60%)

**Action if low efficiency:** Review session transcripts, identify where full loading happened, update protocols

---

## ✅ 8. New Files Documentation

### Files Created This Week
List all new documentation files:

1. _______________
2. _______________
3. _______________

**For each file, confirm:**
- [ ] Referenced in appropriate INDEX file
- [ ] Has clear purpose/header
- [ ] No duplication with existing docs
- [ ] Follows token optimization guidelines (<300 lines)

---

## ✅ 9. Claude Behavior Check

### FILE DISCOVERY PROTOCOL Followed?
Review session transcripts for:

- [ ] Claude checked INDEX.md before searching for files
- [ ] Claude used section indexes (docs/INDEX.md, architecture/INDEX.md, etc.)
- [ ] Claude avoided Glob/Grep without INDEX check first
- [ ] Claude used `/gullycontext` for context loading (not reading full files)

**Red Flags (immediate correction needed):**
- ❌ Multiple Glob calls to find known files
- ❌ Reading archived files (FULL_CONTEXT.md, old WEEK_TASKS.md)
- ❌ Loading entire context sections when only partial needed
- ❌ Not referencing INDEX files in file discovery

**Action if violations found:** Re-emphasize FILE DISCOVERY PROTOCOL in `.claude/.claude.md`

---

## ✅ 10. Commit Message Quality

### Git History Clean?
Review last week's commits:

- [ ] Commit messages follow conventional commits format
- [ ] Each commit has clear scope (feat, fix, refactor, docs)
- [ ] No "WIP" or unclear commit messages
- [ ] Commits are atomic (one logical change per commit)

**Sample 5 random commits:**
1. _____ - [ ] Good quality
2. _____ - [ ] Good quality
3. _____ - [ ] Good quality
4. _____ - [ ] Good quality
5. _____ - [ ] Good quality

---

## 📊 Weekly Metrics Summary

### Token Efficiency
- **Average session tokens:** _____ / 200,000 (_____ %)
- **Sessions hitting 50% budget:** _____ (Target: 0)
- **Token savings vs. no optimization:** _____ tokens/week
- **Estimated total savings (Week 1-N):** _____ tokens

### File Discovery Speed
- **Average tool calls to find files:** _____ (Target: 1-2)
- **Files found via INDEX navigation:** _____ % (Target: >90%)
- **Direct Glob/Grep usage:** _____ times (Target: <5/week)

### Structure Health
- **Duplicate files:** _____ (Target: 0)
- **Broken links:** _____ (Target: 0)
- **Oversized files (>300 lines):** _____ (Target: 0 for active files)
- **Outdated INDEX references:** _____ (Target: 0)

---

## 🎯 Action Items for Next Week

Based on checklist, prioritize:

**High Priority (fix immediately):**
1. _____
2. _____

**Medium Priority (fix this week):**
1. _____
2. _____

**Low Priority (monitor):**
1. _____
2. _____

---

## 📝 Notes & Observations

**What worked well this week:**
-
-
-

**What needs improvement:**
-
-
-

**New patterns discovered:**
-
-
-

**Recommendations for .claude/.claude.md updates:**
-
-
-

---

## ✅ Final Validation

Before closing week:

- [ ] All checklist items reviewed
- [ ] All red flags addressed
- [ ] Action items documented
- [ ] Metrics recorded in OPTIMIZATION_LOG.md
- [ ] Week review document created (docs/weekly-reviews/WEEK[N]_REVIEW.md)
- [ ] INDEX files updated if needed
- [ ] Ready to start next week

---

**Completed by:** [User/Claude]
**Date:** [YYYY-MM-DD]
**Week:** [Week N]
**Status:** ✅ Complete / ⚠️ Issues found (see action items)

---

**Last Updated:** 2025-11-06
**Purpose:** Maintain INDEX-based navigation and token optimization
**Frequency:** End of every week
