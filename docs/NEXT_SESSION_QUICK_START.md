# 🚀 Next Session Quick Start Guide

**Last Updated:** 2025-11-07
**Current Status:** Phase 2 planning ready for OPUS

---

## ✅ What We Just Completed

1. ✅ **Migrated project from week-based to phase-based** (19 files updated, 5 commits)
2. ✅ **Restored task example files** (task-3 and task-4 from git history)
3. ✅ **Created comprehensive OPUS brief** (OPUS_BRIEF_PHASE2_3.md)

**Branch:** `week1` (rename to `feature/phase-planning` if needed)

---

## 🎯 Next Session Goal

**Invoke OPUS** to generate detailed task JSONs for:
- Phase 2: User Profiles (5-7 tasks)
- Phase 3: Team Management (6-8 tasks)

**Expected Output:** 11-15 JSON files in `backend/.claude/tasks/`

---

## 📝 How to Start Next Session

### Step 1: Read the Brief (1 min)
```bash
cat /Users/sibikrishnan/Documents/Gully/OPUS_BRIEF_PHASE2_3.md
```

Quick scan to refresh your memory on what OPUS needs to do.

### Step 2: Invoke OPUS (Copy-Paste This)

**Open a new Claude session (OPUS model preferred)**

```
I need you to create detailed task JSON files for Phase 2 (User Profiles) and
Phase 3 (Team Management) of the Gully sports platform MVP.

Please read and follow this comprehensive brief:
/Users/sibikrishnan/Documents/Gully/OPUS_BRIEF_PHASE2_3.md

The brief includes:
- All required reading (9 files to load)
- Example tasks to match format (task-3 and task-4)
- Detailed specifications for 11-15 tasks
- Quality checklist and success criteria

Take your time to:
1. Read all required files listed in the brief
2. Study example tasks for format/detail level
3. Create Phase 2 tasks (P2-PROF-T1 through P2-PROF-T7)
4. Create Phase 3 tasks (P3-TEAM-T1 through P3-TEAM-T9)
5. Update backend/.claude/tasks/index.json

Ask questions if anything is unclear before you start.
```

### Step 3: Review OPUS Output (30-45 min)

After OPUS generates tasks:
1. Verify file count (11-15 JSON files created)
2. Spot-check 2-3 tasks for detail level (should match task-3)
3. Check index.json is updated
4. Verify naming convention (P2-PROF-T1.json, P3-TEAM-T1.json)

### Step 4: Refine if Needed (15-30 min)

If tasks are:
- ✅ **Perfect:** Commit and proceed to Phase 2 execution
- ⚠️ **Good but needs tweaks:** Ask OPUS to adjust specific tasks
- ❌ **Too vague:** Point OPUS back to task-3 example for detail level

---

## 📚 Key Files for Reference

**OPUS Brief:**
`/Users/sibikrishnan/Documents/Gully/OPUS_BRIEF_PHASE2_3.md`

**Example Tasks (Format Templates):**
- `/Users/sibikrishnan/Documents/Gully/backend/.claude/tasks/task-3-jwt-utils.json`
- `/Users/sibikrishnan/Documents/Gully/backend/.claude/tasks/task-4-auth-tests.json`

**Current Status:**
- `/Users/sibikrishnan/Documents/Gully/STATUS.md`
- `/Users/sibikrishnan/Documents/Gully/.claude/context/mvp/timeline.md`

**Task Schema:**
- `/Users/sibikrishnan/Documents/Gully/docs/architecture/TASK_SYSTEM_DESIGN.md`

---

## 🔧 Git Commands (If Needed)

### Restore Task Examples (Already Done)
```bash
# Example of how we restored files
git show 308e44a:backend/.claude/tasks/task-3-jwt-utils.json > backend/.claude/tasks/task-3-jwt-utils.json
git show 308e44a:backend/.claude/tasks/task-4-auth-tests.json > backend/.claude/tasks/task-4-auth-tests.json
```

### Check Current Status
```bash
git status
git log --oneline -5
```

### After OPUS Creates Tasks
```bash
# Review what was created
ls -la backend/.claude/tasks/

# Check file count
ls backend/.claude/tasks/*.json | wc -l
# Should show ~13-17 files (2 examples + 11-15 new)

# Commit OPUS work
git add backend/.claude/tasks/
git commit -m "feat: add Phase 2-3 task definitions via OPUS

Generated 11-15 detailed task JSONs for User Profiles and Team Management.

Tasks created by: OPUS
Following brief: OPUS_BRIEF_PHASE2_3.md

Phase 2 (User Profiles): 5-7 tasks
Phase 3 (Team Management): 6-8 tasks"
```

---

## ⚠️ Common Issues & Solutions

### Issue: OPUS creates tasks too vague
**Solution:** Point to task-3 example:
```
The tasks are too high-level. Please review task-3-jwt-utils.json
which has 40 detailed test cases. Match that level of specificity.
```

### Issue: OPUS uses wrong ID format
**Solution:**
```
Please rename tasks to use format: P2-PROF-T1.json (not task-7.json)
Phase-Code-Task format as specified in the brief.
```

### Issue: OPUS doesn't embed test suites
**Solution:**
```
Each task must have an embedded testSuite field with 15-40 test cases.
See task-3-jwt-utils.json for the structure.
```

### Issue: Missing absolute paths
**Solution:**
```
All file paths must be absolute: /Users/sibikrishnan/Documents/Gully/...
Not relative paths like: ../backend/tests/...
```

---

## 📊 Expected Timeline

**OPUS task generation:** 20-30 minutes
**Your review:** 15-20 minutes
**Refinement (if needed):** 10-15 minutes
**Total:** ~45-60 minutes

---

## ✅ Success Checklist

After OPUS session, verify:
- [ ] 11-15 new JSON files in `backend/.claude/tasks/`
- [ ] Files named P2-PROF-T*.json and P3-TEAM-T*.json
- [ ] Each task has 15-40 test cases
- [ ] All paths are absolute (not relative)
- [ ] index.json updated with new tasks
- [ ] No syntax errors (valid JSON)
- [ ] Tasks reference Phase 2-3 work (not Auth/JWT)

---

## 🎓 What You Learned This Session

**Git expertise:**
- How to restore deleted files from git history (`git show <commit>:<path>`)
- Finding commits with specific files (`git log --follow`)

**Task planning:**
- Importance of example tasks as format templates
- Why deleting examples would hurt (no quality benchmark)
- Content bias vs. format guidance (examples don't bias content)

**OPUS briefing:**
- Comprehensive briefs lead to better output
- Include required reading, examples, quality criteria
- Specify exact deliverables and format

---

**Ready to proceed?** Just load this file in your next session and follow Step 2!

**Questions?** Review OPUS_BRIEF_PHASE2_3.md for full details.

---

**Created by:** Claude Sonnet 4.5 (Session: 2025-11-07)
**Token usage:** ~120k tokens (comprehensive planning session)
**Next step:** Invoke OPUS with the brief
