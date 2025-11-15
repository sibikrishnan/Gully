# Structured Task Management

This directory contains structured task definitions for automated workflow enforcement.

## File Structure

```
.claude/tasks/
├── schema.ts              # TypeScript interfaces for task objects
├── index.json             # Task registry (index of all tasks)
├── task-{id}-{name}.json  # Individual task definitions
└── README.md              # This file
```

## Task Object Schema

Each task is defined as a JSON file following the TypeScript schema in `schema.ts`. Key components:

### 1. **TaskTestSuite**
- Multiple test cases (unit, integration, e2e, regression, performance)
- Coverage requirements
- Success criteria (all tests pass, no errors, build succeeds)
- Execution configuration

### 2. **TaskWorkflow**
- **Subagent configuration**: Which subagent to use (Plan/Explore)
- **4-phase planning process**:
  - Phase 1: Gather (collect info, types, versions, patterns)
  - Phase 2: Analyze (root cause analysis, constraints)
  - Phase 3: Design (solution design, test strategy)
  - Phase 4: Approve (user approval before coding)
- **Execution strategy**: TDD, test-after, iterative
- **Enforcement rules**: ERROR/WARN mode for workflow violations

### 3. **TaskPlanningResult**
- Output from Plan subagent execution
- Results from all 4 phases
- Approved plan and user feedback
- Updated after running Plan mode

### 4. **Context**
- Relevant files (avoid re-reading)
- Key findings from planning
- Previous failed attempts with reasons

## Workflow

### Initial Task Definition
1. Define task in JSON with complete test suite and workflow
2. Set `workflow.subagent.required: true`
3. Set `workflow.enforcement.mode: "ERROR"` (or "WARN")
4. Save to `task-{id}-{name}.json`
5. Add to `index.json` registry

### Task Execution (Automated)
1. **Enforcement Check**: Verify `subagent.required` is satisfied
2. **Run Plan Subagent**: Execute 4-phase planning process
3. **Update Task Object**: Add `planningResult` with all phase outputs
4. **Update Test Suite**: Add/modify test cases based on planning findings
5. **Get User Approval**: Present plan for approval (if required)
6. **Execute Implementation**: Only after approval
7. **Track Progress**: Update status, attempts, context

### After Planning Updates
Planning often reveals new test cases or edge cases. Update the task JSON:
- Add new test cases to `testSuite.testCases[]`
- Update test counts
- Add new edge cases discovered
- Increment `version` and add changelog entry
- Update `planningResult` object

## Integration with TASK_HISTORY.md

The structured JSON files are the **source of truth** for automation. `TASK_HISTORY.md` provides human-readable narrative:

### Auto-Generated Sections (from JSON)
- Task status, priority, dependencies
- Test case counts and coverage
- Planning phase summaries

### Human-Authored Sections
- Context and background
- Key decisions and rationale
- Trade-offs and learnings
- Important discussions

## Usage Examples

### Loading a Task
```typescript
import task3 from './task-3-jwt-utils.json';
console.log(task3.workflow.subagent.required); // true
console.log(task3.testSuite.testCases.length); // 2
```

### Checking Enforcement
```typescript
if (task.workflow.enforcement.mode === 'ERROR' &&
    task.workflow.enforcement.rules.subagentRequired &&
    !task.planningResult) {
  throw new Error('Plan subagent must be run before implementation');
}
```

### Updating After Planning
```typescript
// Plan subagent discovers 5 new edge cases
task3.testSuite.testCases[0].coverage.edgeCases.push(
  "Token with null bytes",
  "Token exceeding max length",
  "Token with unicode in secret",
  "Concurrent token generation",
  "Clock skew scenarios"
);

task3.testSuite.testCases[0].testFile.testCount = 45; // was 40

task3.version = "1.1";
task3.changelog.push({
  version: "1.1",
  timestamp: new Date().toISOString(),
  change: "Added 5 new edge cases discovered during Phase 1 planning",
  author: "claude-plan-agent"
});

// Save updated JSON
```

## Enforcement Modes

### ERROR Mode (Default)
- Throws error if workflow rules violated
- Blocks execution until satisfied
- Use for critical tasks requiring strict workflow

### WARN Mode
- Logs warning if workflow rules violated
- Allows execution to continue
- Use for flexible tasks or during development

### SILENT Mode
- No enforcement, tracking only
- Use for informational tasks

Switch modes by changing `workflow.enforcement.mode` in task JSON.

## Pros and Cons

### Structured JSON
✅ Type safe, programmatic access, automation
✅ Easy to query, filter, validate
✅ Supports dynamic updates
❌ Less human-readable
❌ Requires tooling for manual editing

### Markdown (TASK_HISTORY.md)
✅ Human-readable, git-friendly
✅ Great for narrative and context
✅ Easy to edit manually
❌ Hard to parse programmatically
❌ No validation or automation

**Best Practice**: Use both! Structured JSON for automation, markdown for human narrative.
