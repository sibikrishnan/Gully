---
name: generate-tasks
description: Interactive task generation with human-in-the-loop feedback. Generate comprehensive task objects with separated test suites. Supports generating all tasks for a phase or a single task. Quality-focused with user review at each step.
---

You are in **Interactive Task Generation Mode**. Generate high-quality task objects with separated test suites, getting user feedback throughout the process.

## Command Usage

```
/generate-tasks <target>

Examples:
  /generate-tasks P2           # Generate all Phase 2 tasks (User Profiles)
  /generate-tasks P3           # Generate all Phase 3 tasks (Teams)
  /generate-tasks P2-PROF-T6   # Generate single task P2-PROF-T6
```

## Input Analysis

Parse the target parameter:
- **Phase format** (P2, P3, P4): Generate all tasks for that phase
- **Task ID format** (P2-PROF-T6): Generate single specific task
- **Invalid format**: Show usage help and available options

## Pre-Flight Checks

**Step 1: Validate Target**

1. Read `backend/.claude/schemas/PROJECT_PLAN_EXAMPLE_GULLY.json`
2. Check if target phase/task exists
3. If not found: List available phases and tasks, ask user to clarify

**Step 2: Check for Existing Tasks**

```bash
# For phase target
ls backend/.claude/tasks/P{phase}-*.json

# For single task
ls backend/.claude/tasks/{task-id}.json
```

If exists, ask user:
```
⚠️  Tasks already exist for {target}

Options:
1. Archive existing and regenerate (moves to backend/.claude/tasks/archive/{timestamp}/)
2. Update existing tasks (increment version, add to changelog)
3. Cancel operation

Your choice (1/2/3)?
```

## Interactive Generation Workflow

### Phase 1: Task Discovery

1. Read PROJECT_PLAN for target phase/task
2. Show user the task skeleton(s) to be generated
3. Ask for confirmation:

```
📋 Found {count} task(s) to generate for {target}:

1. P2-PROF-T1: GET /api/users/:id - User profile retrieval
2. P2-PROF-T2: PATCH /api/users/:id - Profile updates
...

Workflow: TDD (test-first)
Est. time per task: 90-120 min
Test cases per task: 20-25

Proceed with generation? (yes/no)
```

### Phase 2: Generate First Task

Generate task object + test suite for the FIRST task:

1. Create task object following `TASK_OBJECT_SCHEMA.json`
2. Create test suite following `TEST_SUITE_SCHEMA.json`
3. Show user a summary:

```
✅ Generated: P2-PROF-T1

Task Object (backend/.claude/tasks/P2-PROF-T1.json):
- Content: "Implement GET /api/users/:id endpoint..."
- Workflow: workflows/tdd.json
- Test Suite: tests/P2-PROF-T1-tests.json
- Dependencies: []
- Tags: user-service, GET, profiles

Test Suite (backend/.claude/tasks/tests/P2-PROF-T1-tests.json):
- Total test cases: 22
- Unit: 7 (32%)
- Integration: 9 (41%)
- E2E: 4 (18%)
- Regression: 2 (9%)
- Security tests: Yes (IDOR, JWT expiry, SQL injection)

Quality Checks:
✅ All scenarios are concrete (not placeholders)
✅ File watch lists included for selective testing
✅ Security tests included
✅ Test file paths are absolute

Review this task? (yes - show details / no - continue / edit - make changes)
```

### Phase 3: User Review

If user chooses "yes - show details":
- Show first 3 test cases in full
- Show security test in full
- Ask: "Satisfied with quality? (yes/continue/edit)"

If user chooses "edit":
- Ask: "What would you like to change?"
- Apply changes
- Re-show summary
- Re-ask for approval

### Phase 4: Iterate Through Remaining Tasks

Repeat Phase 2 & 3 for each remaining task in the target.

After each task, ask:
```
Continue to next task (P2-PROF-T2)? (yes/skip/stop)
- yes: Generate next task
- skip: Skip this task, move to next
- stop: Stop generation, write what we have so far
```

### Phase 5: Write Files & Summary

Once all tasks approved:

1. Write all task JSON files
2. Write all test suite JSON files
3. Update `backend/.claude/tasks/index.json`
4. Provide final summary:

```
✅ Task Generation Complete

📁 Files Created:
Tasks: {count} files in backend/.claude/tasks/
Tests: {count} files in backend/.claude/tasks/tests/

📊 Statistics:
- Total tasks: {count}
- Total test cases: {count}
- Avg tests/task: {number}
- Test distribution: {breakdown}

✅ Next Steps:
1. Review files: backend/.claude/tasks/P{phase}-*.json
2. Validate: backend/.claude/VALIDATE_TASKS.sh P{phase}
3. Start implementation: Pick a task and follow TDD workflow
```

## Test Case Generation Standards

Follow the SAME quality rules as the autonomous agent:

### Test Distribution (20-25 tests per task)
- Unit: 30% (6-8 tests)
- Integration: 40% (8-10 tests)
- Edge cases: 20% (4-5 tests)
- E2E + Security: 10% (2-3 tests)

### Security Tests (MANDATORY)
Every task MUST include at least 1 security test covering:
- **IDOR**: Accessing other user's resources (user A accesses user B's data)
- **SQL Injection**: Malicious input in parameters
- **XSS**: Script injection in text fields
- **Auth bypass**: Missing/invalid/expired tokens

### Concrete Scenarios (NO PLACEHOLDERS)
✅ Good: "Valid JWT with user_id=123 returns 200 with profile including name, email, sports array"
❌ Bad: "Test successful profile retrieval"

### File Watch Lists
Every test MUST include:
```json
"skipConditions": {
  "ifTrusted": false,
  "unlessFileChanged": [
    "/absolute/path/to/controller.ts",
    "/absolute/path/to/middleware.ts"
  ]
}
```

## Reference Files

Study these for quality standards:
- `backend/.claude/tasks/P2-PROF-T1.json` - Example task (note: embedded format, generate separated)
- `backend/.claude/schemas/TASK_SYSTEM_DESIGN.md` - Architecture
- `backend/.claude/schemas/TASK_OBJECT_SCHEMA.json` - Task structure
- `backend/.claude/schemas/TEST_SUITE_SCHEMA.json` - Test structure

## Workflow Assignment Logic

```
if (task.type === 'new_feature' && task.hasClearPattern) {
  workflow = 'workflows/tdd.json'  // Test-first for CRUD
} else if (task.type === 'bug_fix') {
  workflow = 'workflows/test-after.json'  // Fix then test
} else if (task.type === 'research') {
  workflow = 'workflows/exploratory.json'  // Explore and learn
}
```

## Error Handling

- **Invalid target format**: Show usage help
- **Target not found**: List available phases/tasks
- **Existing files conflict**: Ask user for resolution
- **JSON validation fails**: Fix and retry
- **User cancels**: Stop gracefully, don't write partial files

## Interactive vs Autonomous Agent

**Use `/generate-tasks` (this command) when:**
- Generating tasks for the first time
- Quality review is critical
- Want to customize test cases
- Learning the task generation process

**Use task-generation-agent when:**
- Regenerating entire phase quickly
- Already know the quality is good
- Fire-and-forget operation
- Batch generation for multiple phases

## Key Differences

| Feature | /generate-tasks (Interactive) | task-generation-agent (Autonomous) |
|---------|-------------------------------|-------------------------------------|
| Human review | After each task | None (fire-and-forget) |
| Editing | Yes, at each step | No |
| Speed | Slower (interactive) | Faster (batch) |
| Quality control | High (manual review) | Automated |
| Use case | First-time, learning | Regeneration, batch |
