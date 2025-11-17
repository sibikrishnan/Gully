---
name: code-review
description: Automated code review using CodeRabbit CLI with issue fixing workflow. Run AFTER completing a task implementation and BEFORE creating PR. Systematically analyzes code, creates task list from findings, and fixes all critical/high issues.
---

# Code Review Skill

**Purpose:** Run CodeRabbit analysis, create task list from findings, and systematically fix all critical/high issues.

**When to use:** After task implementation, before PR creation (part of task completion flow)

---

## Workflow

### 1. Pre-Review Checklist

Verify:
- All tests passing (`npm test`)
- Code committed to current task branch
- Currently on `feature/P{Phase}-{Component}-T{Task}` branch

### 2. Run CodeRabbit Analysis

```bash
# For uncommitted changes (most common)
coderabbit --prompt-only --type uncommitted

# For comparing against develop branch
coderabbit --prompt-only --base develop

# For background execution on large changesets
coderabbit --prompt-only --type uncommitted &
CODERABBIT_PID=$!
```

**Flags explained:**
- `--prompt-only`: Token-efficient AI-optimized output
- `--type uncommitted`: Review uncommitted changes only
- `--base develop`: Compare against develop branch

### 3. Parse CodeRabbit Output

Extract issues by severity:
- 🔴 **CRITICAL**: Security vulnerabilities, data loss risks, race conditions, injection attacks
- 🟠 **HIGH**: Logic errors, memory leaks, performance bottlenecks, broken functionality
- 🟡 **MEDIUM**: Code quality issues, maintainability concerns, tech debt
- ⚪ **LOW**: Style preferences, documentation suggestions, minor improvements

### 4. Create Fix Task List

Convert findings to TodoWrite tasks in priority order (CRITICAL → HIGH → MEDIUM):

**Example task list:**
1. [CRITICAL] Fix SQL injection in user.repository.ts:42
2. [HIGH] Fix race condition in auth.service.ts:127
3. [HIGH] Add null check in sports.controller.ts:89
4. [MEDIUM] Refactor duplicate logic in sports.controller.ts:120-145
5. [MEDIUM] Add error handling for edge case in validation.ts:67

**Rules:**
- All CRITICAL issues MUST be fixed
- All HIGH issues MUST be fixed
- MEDIUM issues should be fixed if time permits, otherwise create tech debt issue
- LOW issues can be safely ignored or deferred

### 5. Systematic Fix Implementation

For each task (CRITICAL → HIGH → MEDIUM):

1. **Mark as in_progress** using TodoWrite
2. **Read affected file(s)** to understand context
3. **Implement fix** following best practices:
   - Fix the root cause, not just symptoms
   - Add defensive programming (null checks, input validation)
   - Follow existing code patterns and conventions
   - Add/update tests if logic changes
4. **Run tests** to verify fix doesn't break functionality:
   ```bash
   npm test
   ```
5. **Mark as completed** using TodoWrite
6. **Commit fix separately** with descriptive message:
   ```bash
   git add .
   git commit -m "fix: resolve SQL injection vulnerability in user queries

   - Add parameterized queries in user.repository.ts:42
   - Validate user input before database operations
   - Add tests for injection prevention

   Related: CodeRabbit-CRITICAL-001

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

### 6. Re-Review (If Critical/High Fixed)

After fixing CRITICAL or HIGH issues, re-run CodeRabbit to ensure:
- No new issues introduced by fixes
- All critical/high issues resolved
- Code quality maintained or improved

```bash
# Re-run analysis
coderabbit --prompt-only --type uncommitted
```

### 7. Report Summary

Generate final report with structure:

```
✅ Code Review Complete

🔍 CodeRabbit Analysis:
   - Critical: 0 (2 fixed)
   - High: 0 (3 fixed)
   - Medium: 1 (deferred to tech debt)
   - Low: 5 (style - ignored)

🛠️ Fixes Committed:
   - Fix SQL injection in user queries (commit: abc123)
   - Fix race condition in auth service (commit: def456)
   - Add input validation for sports endpoints (commit: ghi789)
   - Add null checks in controller methods (commit: jkl012)

📊 Test Results:
   - All tests passing (42/42)
   - Coverage maintained: 87%
   - No regressions detected

✅ Ready for PR creation
```

---

## Integration with Task Workflow

**Standard Task Completion Flow:**

1. **Implement feature** → Run tests → Commit implementation
2. **Run skill: code-review** ← NEW STEP (THIS SKILL)
3. **Fix all critical/high issues** → Commit fixes
4. **Create PR** → Claude review → Human approval → Merge

---

## Best Practices

### Code Fix Quality

- **Root cause fixes**: Address underlying issues, not symptoms
- **Defensive programming**: Add validation, null checks, error handling
- **Test coverage**: Add tests for bug fixes and edge cases
- **Documentation**: Update comments/docs if behavior changes
- **Consistency**: Follow project coding standards and patterns

### Issue Prioritization

- **CRITICAL = Showstopper**: Must fix immediately (security, data loss)
- **HIGH = Blocker**: Must fix before merge (broken functionality)
- **MEDIUM = Improvement**: Should fix if time permits
- **LOW = Nice-to-have**: Can safely defer or ignore

### Commit Strategy

- **Separate commits**: One commit per logical fix
- **Clear messages**: Describe what was fixed and why
- **Reference issues**: Link to CodeRabbit finding ID
- **Test verification**: Confirm tests pass before committing

### Performance Optimization

For large changesets (>500 lines):
- Run CodeRabbit in background
- Process fixes in batches (all CRITICAL, then all HIGH)
- Consider breaking into smaller PRs if >10 issues found

---

## Troubleshooting

### CodeRabbit Not Found

If `coderabbit: command not found`:
```bash
# Authenticate first
coderabbit auth

# Verify installation
which coderabbit
```

### Too Many Issues

If CodeRabbit finds >15 issues:
- Fix CRITICAL and HIGH immediately
- Create separate tech debt PR for MEDIUM/LOW
- Consider refactoring in separate task

### Test Failures After Fixes

If tests fail after implementing fixes:
- Review the fix logic
- Check for unintended side effects
- Verify test assumptions are still valid
- May need to update tests if behavior intentionally changed

### Merge Conflicts

If fixes conflict with develop branch:
- Merge develop into feature branch first
- Re-run CodeRabbit after merge
- Fix any new issues introduced by merge

---

## Output Format

After completion, provide structured summary for user visibility:

```markdown
## Code Review Summary

**Branch**: feature/P2-PROF-T4
**Commit**: abc1234

### Issues Found
- 🔴 Critical: 2
- 🟠 High: 3
- 🟡 Medium: 4
- ⚪ Low: 5

### Issues Fixed
✅ All critical issues resolved (2/2)
✅ All high issues resolved (3/3)
✅ Selected medium issues (2/4) - remaining tracked in tech debt
⏭️ Low issues deferred (0/5)

### Commits
- `abc123` - Fix SQL injection in user queries
- `def456` - Fix race condition in auth service
- `ghi789` - Add input validation for sports endpoints
- `jkl012` - Refactor duplicate validation logic

### Test Status
✅ All tests passing (42/42)
✅ Coverage: 87% (maintained)
✅ No regressions detected

**Status**: Ready for PR creation
```

---

## Notes

- This skill should be invoked automatically by Claude after task implementation
- All CRITICAL and HIGH issues must be resolved before PR creation
- MEDIUM and LOW issues can be deferred based on time constraints
- Each fix should be tested individually before moving to next issue
- Keep commits atomic and well-documented for easier code review
