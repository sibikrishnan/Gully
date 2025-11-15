- when suggesting to switch to new sessions, make sure to give the copy paste option of the next feasible thing they may build.

## Git Workflow (CRITICAL - ALWAYS FOLLOW)

**Reference**: See `GIT.md` for complete branching strategy

### Branch Naming Convention

- **Task branches**: `feature/P{Phase}-{Component}-T{Task}` (e.g., `feature/P2-PROF-T4`)
- **Phase branches** (optional): `feature/phase{N}` (e.g., `feature/phase2`)
- **NEVER** use old naming: `phase2-prof-t1`, `week1`, etc.

### At Start of Every Session

1. **Check current branch**: `git branch` and `git status`
2. **If starting new task**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/P{Phase}-{Component}-T{Task}
   git push -u origin feature/P{Phase}-{Component}-T{Task}
   ```
3. **NEVER work directly on master or develop**

### During Development

1. **Commit frequently** with meaningful messages using format:
   ```
   <type>: <subject>

   <body>

   Related: <task-id>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

2. **Push regularly**: `git push` (especially before long operations)

3. **Keep updated**: Merge from develop regularly to avoid conflicts

### When Task Complete

1. **Ensure all tests pass**: `npm test`
2. **Commit all work**: `git add . && git commit`
3. **Push to remote**: `git push`
4. **Create PR to phase branch (or develop if no phase branch)**:
   ```bash
   # PR to phase branch:
   gh pr create --base feature/phase2 --head feature/P{Phase}-{Component}-T{Task} \
     --title "feat: <description> (Task-ID)" \
     --body "..."

   # OR PR to develop (if no phase branch):
   gh pr create --base develop --head feature/P{Phase}-{Component}-T{Task} \
     --title "feat: <description> (Task-ID)" \
     --body "$(cat <<'EOF'
   ## Summary
   Brief description

   ## Changes
   - ✅ Change 1
   - ✅ Change 2

   ## Tests
   - ✅ All X tests passing

   ## Related
   - Task: P{Phase}-{Component}-T{Task}

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

### After PR Merged

1. **Switch to develop**: `git checkout develop && git pull origin develop`
2. **Delete old branch**: `git branch -d feature/P{Phase}-{Component}-T{Task}`
3. **Delete remote**: `git push origin --delete feature/P{Phase}-{Component}-T{Task}`

### Branch Hierarchy (IMPORTANT)

```
master (production, HIGHEST - never work here)
  └─→ develop (integration - never work here, only merge PRs)
       └─→ feature/phase2 (consolidation)
            └─→ feature/P2-PROF-T4 (YOUR WORK HERE)
```

**Workflow**:
1. Task branch → PR to phase branch
2. Phase branch → PR to develop
3. develop → PR to master (production release)

### Git Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Key Rules

- ✅ **ALWAYS** create feature branch from **develop**
- ✅ **ALWAYS** use proper branch naming: `feature/P{Phase}-{Component}-T{Task}`
- ✅ **ALWAYS** commit with conventional format
- ✅ **ALWAYS** create PR to phase branch (or develop) when task complete
- ❌ **NEVER** commit directly to master or develop
- ❌ **NEVER** force push to master or develop
- ❌ **NEVER** use old branch naming conventions (phase2-prof-t1, week1, etc.)