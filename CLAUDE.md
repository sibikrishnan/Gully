# Project Instructions - Gully Sports Platform

## Task Workflow (ALWAYS follow for every new task)

1. **State the Goal** - Confirm which task I'm starting
2. **State the Approach** - Briefly confirm the high-level method
3. **State the First Step** - Declare the immediate action

Then enter formal Plan Mode ONLY if task is ambiguous, involves architectural changes, or requires major choices not detailed in TASK_HISTORY.md.

## Git Best Practices

- Use `gh` CLI for all GitHub operations (issues, PRs, checks, releases)
- I am the git expert - proceed with git actions without asking
- Always create comprehensive commit messages with emoji + co-author

## Week 1 Learnings - Mistake Prevention

### ✅ Always Verify Immediately
- Run full test suite after changes (not just individual tests)
- Run `npm run build` before committing
- Check container logs after config changes

### ✅ Common Pitfalls to Avoid
1. **Config files**: Don't use empty strings for password fields (Redis, etc.)
2. **Tests**: Ensure proper cleanup between tests (use afterEach hooks)
3. **Types**: Use strict TypeScript, add proper type guards

### ✅ Proven Patterns
- TDD approach (write tests first)
- Small tasks (60-90 min chunks)
- Token optimization (use `/gullycontext` for granular loading)
- Immediate verification (never move to next task without verifying)

## Display Preferences

- Always display the to-do list for user visibility