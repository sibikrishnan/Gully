# Git Branching Strategy & Workflow

**Version**: 1.0
**Last Updated**: 2025-11-15
**Status**: Active Standard

---

## Table of Contents

1. [Branch Hierarchy](#branch-hierarchy)
2. [Branch Naming Conventions](#branch-naming-conventions)
3. [Workflow Rules](#workflow-rules)
4. [Common Operations](#common-operations)
5. [PR Guidelines](#pr-guidelines)
6. [Branch Lifecycle](#branch-lifecycle)

---

## Branch Hierarchy

```
master (production-ready, always deployable - HIGHEST LEVEL, protected)
  │
  └─→ develop (integration branch, staging for production)
       │
       ├─→ feature/phase2 (consolidate Phase 2 tasks)
       │    ├─→ feature/P2-PROF-T4 (DELETE user cascade)
       │    ├─→ feature/P2-PROF-T5 (User profile fields)
       │    └─→ feature/P2-PROF-T6 (Profile image upload)
       │
       ├─→ feature/phase3 (consolidate Phase 3 tasks)
       │    └─→ feature/P3-XXX-T1
       │
       └─→ hotfix/critical-bug-name (emergency fixes)
```

### Branch Flow

1. **Task branches** (`feature/P2-PROF-T4`) → PR to → **Phase branch** (`feature/phase2`)
2. **Phase branch** (`feature/phase2`) → PR to → **develop**
3. **develop** → PR to → **master** (production release)

---

## Branch Naming Conventions

### Format Rules

| Branch Type | Format | Example | Purpose |
|-------------|--------|---------|---------|
| **Main** | `master` | `master` | Production-ready code |
| **Phase** | `feature/phase{N}` | `feature/phase2` | Consolidate phase work |
| **Task** | `feature/P{Phase}-{Component}-T{Task}` | `feature/P2-PROF-T4` | Individual task |
| **Hotfix** | `hotfix/{description}` | `hotfix/fix-auth-crash` | Emergency fixes |

### Component Codes

- **PROF** - User Profiles
- **AUTH** - Authentication
- **TEAM** - Teams & Challenges
- **MATCH** - Match Making
- **NOTIF** - Notifications
- **ADMIN** - Admin Dashboard

### Examples

✅ **Good**:
- `feature/phase2` - Phase consolidation branch
- `feature/P2-PROF-T4` - Task 4 in Phase 2, User Profiles
- `feature/P3-TEAM-T1` - Task 1 in Phase 3, Teams
- `hotfix/fix-jwt-validation` - Critical bug fix

❌ **Bad**:
- `phase2-prof-t1` - Missing `feature/` prefix
- `my-feature` - No phase/task tracking
- `temp-branch` - No context
- `fix-bug` - Too vague

---

## Workflow Rules

### 1. Master Branch Protection

- ✅ **ALWAYS** production-ready and deployable
- ✅ **ONLY** merge via reviewed Pull Requests
- ❌ **NEVER** commit directly to master
- ❌ **NEVER** force push to master
- ✅ **ALWAYS** ensure all tests pass before merge

### 2. Creating Feature Branches

**When starting a new task:**

```bash
# 1. Switch to develop and update
git checkout develop
git pull origin develop

# 2. Create task branch
git checkout -b feature/P2-PROF-T4

# 3. Push to remote and set upstream
git push -u origin feature/P2-PROF-T4
```

**Branch from:**
- ✅ **develop** - For all feature/task branches (default)
- ✅ **master** - For hotfix branches only
- ❌ **Never branch from another task branch**

### 3. Committing Work

**Commit frequently with meaningful messages:**

```bash
# Stage changes
git add <files>

# Commit with conventional format
git commit -m "feat: implement user profile deletion endpoint

- Add DELETE /api/users/:id route
- Implement authorization checks
- Add cascade deletion logic
- Write 8 integration tests

Related: P2-PROF-T4"
```

**Commit Message Format:**

```
<type>: <subject>

<body>

Related: <task-id>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

### 4. Keeping Branch Updated

```bash
# Update from develop regularly
git checkout develop
git pull origin develop
git checkout feature/P2-PROF-T4
git rebase develop

# Or merge if rebase causes issues
git merge develop
```

### 5. Creating Pull Requests

**When task is complete:**

```bash
# 1. Ensure all tests pass
npm test

# 2. Push latest changes
git push origin feature/P2-PROF-T4

# 3. Create PR to phase branch (or develop if no phase branch)
# PR to phase branch:
gh pr create --base feature/phase2 --head feature/P2-PROF-T4 \
  --title "feat: implement DELETE /api/users/:id endpoint (P2-PROF-T4)" \
  --body "$(cat <<'EOF'
## Summary
Implements DELETE /api/users/:id endpoint with complete cascade deletion logic.

## Changes
- ✅ DELETE route with auth middleware
- ✅ Authorization: users can only delete own account
- ✅ Cascade deletion (teams, challenges, stats)
- ✅ Session cleanup (tokens, cache, WebSocket)
- ✅ Soft delete with audit trail

## Tests
- ✅ 7 controller unit tests
- ✅ 8 route integration tests
- ✅ All 38 deletion-related tests passing

## Related
- Task: P2-PROF-T4
- Dependencies: P2-PROF-T3.1, P2-PROF-T3.2, P2-PROF-T3.3

## Review Checklist
- [ ] Code follows project style guidelines
- [ ] All tests passing
- [ ] No merge conflicts
- [ ] Documentation updated
- [ ] Ready for external AI review

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 6. After PR Merged

```bash
# 1. Switch to develop and update
git checkout develop
git pull origin develop

# 2. Delete local branch
git branch -d feature/P2-PROF-T4

# 3. Delete remote branch
git push origin --delete feature/P2-PROF-T4
```

### 7. Phase Branch to Develop (when phase complete)

```bash
# 1. Ensure all phase tests pass
npm test

# 2. Create PR: feature/phase2 → develop
gh pr create --base develop --head feature/phase2 \
  --title "feat: Phase 2 - User Profiles Complete" \
  --body "Consolidates all Phase 2 user profile tasks"

# 3. After merge, delete phase branch
git checkout develop
git pull origin develop
git branch -d feature/phase2
git push origin --delete feature/phase2
```

### 8. Develop to Master (production release)

```bash
# 1. Ensure develop is stable and all tests pass
npm test

# 2. Create PR: develop → master
gh pr create --base master --head develop \
  --title "release: Production deployment - Phase 2" \
  --body "Deploy Phase 2 features to production"

# 3. After merge and deployment, tag the release
git checkout master
git pull origin master
git tag -a v2.0.0 -m "Phase 2: User Profiles"
git push origin v2.0.0
```

---

## Common Operations

### Starting New Task

```bash
# Full workflow
git checkout develop
git pull origin develop
git checkout -b feature/P2-PROF-T5
git push -u origin feature/P2-PROF-T5
# ... do work ...
git add .
git commit -m "feat: implement feature"
git push
# PR to phase branch (or develop if no phase branch)
gh pr create --base feature/phase2 --head feature/P2-PROF-T5
```

### Fixing Merge Conflicts

```bash
# Update from develop
git checkout develop
git pull origin develop
git checkout feature/P2-PROF-T4
git merge develop

# Fix conflicts in editor
# Then:
git add <resolved-files>
git commit -m "merge: resolve conflicts with develop"
git push
```

### Checking Branch Status

```bash
# See all branches
git branch -a

# See branch relationships
git log --all --graph --oneline --decorate -20

# Check commits ahead/behind
git status
```

### Emergency Hotfix

```bash
# 1. Create hotfix from master (hotfixes go directly to production)
git checkout master
git pull origin master
git checkout -b hotfix/fix-critical-auth-bug

# 2. Fix and test
# ... make fixes ...
npm test

# 3. Commit and PR to master
git add .
git commit -m "fix: resolve critical auth vulnerability"
git push -u origin hotfix/fix-critical-auth-bug
gh pr create --base master --head hotfix/fix-critical-auth-bug

# 4. After merge to master, also merge to develop
git checkout develop
git pull origin develop
git merge master
git push origin develop

# 5. Delete hotfix branch
git branch -d hotfix/fix-critical-auth-bug
git push origin --delete hotfix/fix-critical-auth-bug
```

---

## PR Guidelines

### PR Title Format

```
<type>: <description> (Task-ID)

Examples:
- feat: implement DELETE /api/users/:id endpoint (P2-PROF-T4)
- fix: resolve JWT token expiration issue (P2-AUTH-T2)
- docs: add API documentation for user endpoints (P2-PROF-T6)
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- ✅ Change 1
- ✅ Change 2
- ✅ Change 3

## Tests
- ✅ Test suite 1 (X passing)
- ✅ Test suite 2 (Y passing)
- ✅ All tests passing (total count)

## Related
- Task: P2-PROF-TX
- Dependencies: (list any dependent tasks)

## Review Checklist
- [ ] Code follows project style guidelines
- [ ] All tests passing
- [ ] No merge conflicts
- [ ] Documentation updated
- [ ] Ready for external AI review

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Review Requirements

**Before requesting review:**
1. ✅ All tests passing locally
2. ✅ No merge conflicts with master
3. ✅ Code follows style guidelines
4. ✅ Documentation updated
5. ✅ Commit messages follow format

**Reviewers:**
1. External AI review (automated via GitHub Actions)
2. Peer review (at least 1 human approval)

---

## Branch Lifecycle

### 1. Creation
```bash
git checkout master
git pull origin master
git checkout -b feature/P2-PROF-T4
git push -u origin feature/P2-PROF-T4
```

### 2. Development
```bash
# Regular commits
git add .
git commit -m "feat: add feature X"
git push

# Keep updated from master
git fetch origin master
git merge origin/master
```

### 3. Pull Request
```bash
# Ensure tests pass
npm test

# Create PR
gh pr create --base master --head feature/P2-PROF-T4
```

### 4. Review & Merge
- External AI review
- Peer review
- Address feedback
- Merge via GitHub (squash or merge commit)

### 5. Cleanup
```bash
# After PR merged
git checkout master
git pull origin master
git branch -d feature/P2-PROF-T4
git push origin --delete feature/P2-PROF-T4
```

---

## Claude Session Instructions

### At Start of Session

1. Check current branch: `git branch`
2. If not on master, understand context
3. If starting new task, create feature branch from master
4. Never work directly on master

### During Session

1. Commit frequently with meaningful messages
2. Push to remote regularly
3. Keep track of task progress in todo list

### End of Session

1. Commit all work
2. Push to remote
3. Create PR if task complete
4. Update documentation

### Task Completion

1. ✅ All tests passing
2. ✅ Code committed and pushed
3. ✅ PR created with proper description
4. ✅ Ready for review
5. ✅ Update task tracker

---

## Quick Reference

| Action | Command |
|--------|---------|
| Create branch | `git checkout -b feature/P2-PROF-T4` |
| Push new branch | `git push -u origin feature/P2-PROF-T4` |
| Check status | `git status` |
| Commit | `git commit -m "type: message"` |
| Update from master | `git merge master` |
| Create PR | `gh pr create --base master` |
| Delete branch | `git branch -d feature/P2-PROF-T4` |

---

**Maintained by**: Development Team
**Questions**: See CLAUDE.md for Claude-specific git instructions
