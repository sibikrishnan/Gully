---
name: code-review
description: Automated code review using CodeRabbit CLI with issue fixing workflow. Run AFTER completing a task implementation and BEFORE creating PR. Systematically analyzes code, creates task list from findings, and fixes all critical/high issues.
---

# Code Review Skill

Automatically run CodeRabbit analysis, create task list from findings, and fix all critical/high issues before PR creation.

## Auto-Invocation Trigger

Invoke this skill when:
- Task implementation complete and tests passing
- Before creating pull request
- After refactoring or significant code changes
- Part of standard task completion workflow

## Workflow

### 1. Pre-Check

Verify:
- All tests passing (`npm test`)
- Code committed to feature branch
- On correct branch: `feature/P{Phase}-{Component}-T{Task}`

### 2. Run Analysis

```bash
# Analyze uncommitted changes
coderabbit --prompt-only --type uncommitted

# Or compare against develop
coderabbit --prompt-only --base develop
```

### 3. Parse by Severity

- 🔴 **CRITICAL**: Security, data loss, race conditions (MUST fix)
- 🟠 **HIGH**: Logic errors, broken functionality (MUST fix)
- 🟡 **MEDIUM**: Code quality, tech debt (Should fix)
- ⚪ **LOW**: Style, docs (Optional)

### 4. Create TodoWrite Tasks

Convert findings to prioritized task list (CRITICAL → HIGH → MEDIUM)

### 5. Fix Issues Systematically

For each task:
1. Mark as in_progress
2. Read affected files
3. Implement fix (root cause, not symptoms)
4. Run tests
5. Mark completed
6. Commit separately with message:
```
fix: [description]

[details]

Related: CodeRabbit-{SEVERITY}-{ID}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 6. Re-Review (If Critical/High Fixed)

```bash
coderabbit --prompt-only --type uncommitted
```

Verify no new issues introduced.

### 7. Report Summary

```
✅ Code Review Complete

🔍 Issues: Critical: 0 (2 fixed) | High: 0 (3 fixed) | Medium: 1 (deferred)
🛠️ Commits: 5 fixes pushed
📊 Tests: All passing (42/42)

Ready for PR creation
```

## Fix Quality

- Address root cause, add validation/null checks, follow project patterns
- Update tests if logic changes, one commit per fix
- If >15 issues: Fix CRITICAL/HIGH only, defer MEDIUM/LOW to tech debt PR
