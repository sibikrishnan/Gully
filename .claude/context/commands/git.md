# Git Commands

**Purpose:** Version control workflow for the project.

---

## Daily Workflow

```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Stage changes
git add .
git add <file>
git add -p  # Interactive staging

# Commit changes
git commit -m "feat: description"
git commit -m "fix: bug description"
git commit -m "docs: update README"

# Push to remote
git push origin <branch>

# Pull latest changes
git pull origin <branch>
git pull --rebase origin <branch>  # Rebase instead of merge
```

---

## Branching

```bash
# Create new branch
git checkout -b feature/new-feature
git checkout -b fix/bug-name

# Switch branches
git checkout <branch>
git switch <branch>  # Newer syntax

# List branches
git branch
git branch -a  # Include remote branches

# Delete branch
git branch -d <branch>  # Safe delete
git branch -D <branch>  # Force delete

# Rename branch
git branch -m <old-name> <new-name>

# Track remote branch
git checkout -b <branch> origin/<branch>
```

---

## Commit Messages

### Convention (Conventional Commits)

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Build process, dependencies

### Examples

```bash
git commit -m "feat: add user authentication endpoints"
git commit -m "fix: resolve database connection timeout"
git commit -m "docs: update API endpoint documentation"
git commit -m "refactor: simplify user service logic"
git commit -m "test: add unit tests for team service"
git commit -m "chore: update dependencies"
```

---

## Viewing History

```bash
# View commit history
git log
git log --oneline
git log --graph --oneline --all

# View specific file history
git log <file>
git log -p <file>  # Show diffs

# View commits by author
git log --author="Your Name"

# View commits in date range
git log --since="2 weeks ago"
git log --after="2024-01-01" --before="2024-01-31"

# Search commits
git log --grep="keyword"

# Show specific commit
git show <commit-hash>
```

---

## Undoing Changes

### Unstaged Changes

```bash
# Discard changes in working directory
git checkout -- <file>
git restore <file>  # Newer syntax

# Discard all changes
git checkout -- .
git restore .
```

### Staged Changes

```bash
# Unstage file (keep changes)
git reset HEAD <file>
git restore --staged <file>  # Newer syntax

# Unstage all
git reset HEAD
```

### Commits

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit
git commit --amend -m "new message"
git commit --amend --no-edit  # Keep message

# Revert commit (create new commit)
git revert <commit-hash>
```

---

## Stashing

```bash
# Stash uncommitted changes
git stash
git stash save "work in progress"

# List stashes
git stash list

# Apply stash (keep in list)
git stash apply
git stash apply stash@{0}

# Apply and remove stash
git stash pop

# View stash contents
git stash show
git stash show -p

# Drop stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

---

## Remote Operations

```bash
# View remotes
git remote -v

# Add remote
git remote add origin <url>

# Change remote URL
git remote set-url origin <new-url>

# Fetch from remote
git fetch origin
git fetch --all

# Sync with remote
git fetch origin
git reset --hard origin/<branch>  # DANGER: Discard local changes

# View remote branches
git branch -r
git ls-remote origin
```

---

## Tagging

```bash
# Create tag
git tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"

# List tags
git tag
git tag -l "v1.*"

# Push tags
git push origin v1.0.0
git push origin --tags  # Push all tags

# Delete tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0  # Delete remote tag

# Checkout tag
git checkout v1.0.0
```

---

## Merging & Rebasing

### Merging

```bash
# Merge branch into current branch
git merge <branch>

# Merge with no fast-forward
git merge --no-ff <branch>

# Abort merge
git merge --abort
```

### Rebasing

```bash
# Rebase current branch onto another
git rebase <branch>

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3

# Continue rebase after resolving conflicts
git rebase --continue

# Skip commit during rebase
git rebase --skip

# Abort rebase
git rebase --abort
```

---

## Conflict Resolution

```bash
# View conflicts
git status
git diff

# After resolving conflicts in files
git add <resolved-file>
git commit  # For merge
git rebase --continue  # For rebase

# Use theirs/ours strategy
git checkout --theirs <file>
git checkout --ours <file>

# Abort merge/rebase
git merge --abort
git rebase --abort
```

---

## Useful Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  st = status
  co = checkout
  br = branch
  cm = commit -m
  ca = commit -am
  last = log -1 HEAD
  unstage = reset HEAD --
  discard = checkout --
  amend = commit --amend --no-edit
  undo = reset --soft HEAD~1
  graph = log --graph --oneline --all --decorate
  history = log --pretty=format:"%h %ad | %s%d [%an]" --graph --date=short
```

Usage:
```bash
git st
git co feature/new-branch
git cm "feat: add feature"
git last
git graph
```

---

## Week 1 Workflow

### Current Branch

```bash
# Check current branch
git branch
# Should show: * week1
```

### Typical Session

```bash
# 1. Start of day
git status
git pull origin week1

# 2. Work on tasks
# ... make changes ...

# 3. Commit regularly
git add .
git commit -m "feat: implement user signup endpoint"

# 4. End of day
git push origin week1

# 5. End of week (merge to master)
git checkout master
git pull origin master
git merge week1
git push origin master
git tag -a v0.1.0 -m "Week 1 complete"
git push origin v0.1.0
```

---

## Troubleshooting

### Merge Conflicts

```bash
# See conflicted files
git status

# View conflict
cat <file>
# Look for <<<<<<< HEAD markers

# After resolving
git add <file>
git commit
```

### Detached HEAD

```bash
# Create branch from detached HEAD
git checkout -b temp-branch

# Or discard detached HEAD changes
git checkout master
```

### Pushed Wrong Commit

```bash
# If no one else pulled yet
git push --force origin <branch>  # DANGER!

# Better: create revert commit
git revert <commit-hash>
git push origin <branch>
```

---

**Important:** Never force-push to main/master or shared branches!
