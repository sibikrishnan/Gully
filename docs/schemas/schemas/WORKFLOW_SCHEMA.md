# Workflow Object Schema

**Purpose**: Define the formal structure for workflow templates referenced by task objects.

**Last Updated**: 2025-11-09

---

## Workflow Types in the System

### 1. **Execution Workflows** (Referenced by Task Objects)
- **Location**: `/backend/.claude/workflows/*.json`
- **Purpose**: Define HOW to execute a task (TDD, test-after, exploratory)
- **Referenced by**: Task JSON `workflow.workflowRef` field
- **Examples**: `tdd.json`, `test-after.json`, `exploratory.json`

### 2. **Process Workflows** (Documentation)
- **Location**: `/docs/workflows/*.md`
- **Purpose**: Define PROCESSES for project operations
- **Examples**:
  - `TASK_GENERATION_WORKFLOW.md` - How to create new task JSONs
  - `SESSION_WORKFLOW.md` - How to start/manage coding sessions

### 3. **Session Workflows** (User Guide)
- **Location**: `/docs/WORKFLOW_GUIDE.md`
- **Purpose**: Quick reference for session commands (`/gullystatus`, `/gullycontinue`)

---

## Execution Workflow Object Schema

### TypeScript Interface

```typescript
interface WorkflowTemplate {
  // Identity
  name: string;                 // "TDD", "test-after", "exploratory"
  version: string;              // "1.0"
  description: string;

  // Planning configuration
  subagent: {
    required: boolean;          // Must use Plan/Explore agent?
    type: 'Plan' | 'Explore' | null;
    thoroughness?: 'quick' | 'medium' | 'very thorough';
    description: string;
  };

  // Planning phases (only if subagent.required = true)
  planningPhases?: {
    phase1_gather: PlanningPhase;
    phase2_analyze: PlanningPhase;
    phase3_design: PlanningPhase;
    phase4_approve: PlanningPhase;
  };

  // Execution strategy
  execution: {
    strategy: 'TDD' | 'test-after' | 'test-alongside' | 'exploratory';
    testFirst: boolean;         // Write tests before implementation?
    iterative: boolean;         // Allow multiple iterations?
    maxAttempts: number;        // Max iterations before failure
    rollbackOnFailure: boolean; // Revert changes if tests fail?
  };

  // Enforcement rules
  enforcement: {
    mode: 'ERROR' | 'WARN' | 'SILENT';
    rules: {
      subagentRequired: boolean;    // Block if no planning?
      phaseSequence: boolean;       // Enforce phase order?
      approvalRequired: boolean;    // Require user approval?
      testFirst: boolean;           // Block code before tests?
      testsMustPass: boolean;       // Block commit if tests fail?
    };
  };
}

interface PlanningPhase {
  description: string;
  objectives: string[];
  requiredTools?: string[];     // ["Read", "Grep", "WebFetch"]
  outputFormat: string;
  deliverables?: string[];
  approvalRequired?: boolean;
}
```

### JSON Example (TDD Workflow)

```json
{
  "name": "TDD",
  "version": "1.0",
  "description": "Test-Driven Development workflow with required planning and test-first approach",

  "subagent": {
    "required": false,
    "type": null,
    "description": "Planning optional for TDD tasks with existing patterns"
  },

  "execution": {
    "strategy": "TDD",
    "testFirst": true,
    "iterative": true,
    "maxAttempts": 3,
    "rollbackOnFailure": false
  },

  "enforcement": {
    "mode": "ERROR",
    "rules": {
      "subagentRequired": false,
      "phaseSequence": false,
      "approvalRequired": false,
      "testFirst": true,
      "testsMustPass": true
    }
  }
}
```

---

## Task Object Workflow Reference

### Schema

```typescript
interface TaskWorkflowReference {
  type: string;                 // Human-readable type: "TDD", "test-after", "exploratory"
  workflowRef: string;          // Relative path: "workflows/tdd.json"
  planningRequired: boolean;    // Override workflow's subagent.required if needed
}
```

### Example (from task JSON)

```json
{
  "id": "P3-TEAM-T1",
  "workflow": {
    "type": "TDD",
    "workflowRef": "workflows/tdd.json",
    "planningRequired": false
  }
}
```

### Resolution Rules

1. **Path resolution**: `workflowRef` is relative to `/backend/.claude/`
   - `"workflows/tdd.json"` → `/backend/.claude/workflows/tdd.json`

2. **Override logic**: `planningRequired` in task overrides workflow's `subagent.required`
   - If task says `planningRequired: true` → Force planning even if workflow says optional
   - If task says `planningRequired: false` → Skip planning even if workflow requires it

3. **Validation**: Task executor MUST verify workflow file exists before starting task

---

## Approved Workflows

### 1. TDD (Test-Driven Development)
- **File**: `workflows/tdd.json`
- **Strategy**: Write tests first, then implement to pass tests
- **Planning**: Optional (not required for established patterns)
- **Enforcement**: ERROR mode - blocks code before tests
- **Use case**: New features following established patterns (Profile, Team endpoints)

### 2. Test-After
- **File**: `workflows/test-after.json`
- **Strategy**: Implement feature, then write tests
- **Planning**: Quick thoroughness
- **Enforcement**: WARN mode - reminds but doesn't block
- **Use case**: Bug fixes, minor changes, urgent patches

### 3. Exploratory
- **File**: `workflows/exploratory.json`
- **Strategy**: Research-focused, tests optional
- **Planning**: Very thorough (required)
- **Enforcement**: SILENT mode - no blocking
- **Use case**: Spike work, prototyping, learning new libraries

---

## Directory Structure

```
/backend/.claude/
├── workflows/                  # Execution workflow templates
│   ├── tdd.json               # TDD workflow (approved)
│   ├── test-after.json        # Test-after workflow (approved)
│   └── exploratory.json       # Exploratory workflow (approved)
├── tasks/                      # Task definitions
│   ├── index.json
│   ├── P2-PROF-T1.json        # References workflows/tdd.json
│   └── ...
└── WORKFLOW_SCHEMA.md          # This file

/docs/
├── workflows/                  # Process workflow documentation
│   └── TASK_GENERATION_WORKFLOW.md
└── WORKFLOW_GUIDE.md           # Session workflow guide
```

---

## Workflow Lifecycle

### 1. Creation (One-time)
```bash
# Create workflow JSON
cat > backend/.claude/workflows/tdd.json << 'EOF'
{
  "name": "TDD",
  "version": "1.0",
  ...
}
EOF
```

### 2. Task References Workflow
```json
{
  "id": "P3-TEAM-T1",
  "workflow": {
    "type": "TDD",
    "workflowRef": "workflows/tdd.json",
    "planningRequired": false
  }
}
```

### 3. Task Execution Loads Workflow
```typescript
// Pseudo-code
const task = loadTask('P3-TEAM-T1');
const workflow = loadWorkflow(task.workflow.workflowRef);

// Apply enforcement
if (workflow.enforcement.rules.testFirst) {
  // Block implementation until tests written
}
```

### 4. Workflow Updates (Versioning)
- **Minor changes**: Update in place (typo fix, description clarification)
- **Major changes**: Create new version (`tdd-v2.json`), update task references
- **Deprecation**: Mark old workflow as deprecated, provide migration path

---

## Validation Rules

### Workflow JSON Validation
- ✅ MUST have `name`, `version`, `description`
- ✅ MUST have valid `execution.strategy` enum value
- ✅ MUST have `enforcement.mode` and `enforcement.rules`
- ✅ IF `subagent.required=true`, MUST define `planningPhases`
- ✅ IF `strategy=TDD`, `execution.testFirst` MUST be `true`

### Task Reference Validation
- ✅ `workflowRef` file MUST exist in `/backend/.claude/workflows/`
- ✅ `type` MUST match workflow's `name` field
- ✅ `planningRequired` MUST be boolean

---

## Quick Reference

### Check workflow structure
```bash
jq '.workflow' backend/.claude/tasks/P3-TEAM-T1.json
```

### Validate workflow file exists
```bash
test -f backend/.claude/workflows/tdd.json && echo "✓ Exists" || echo "✗ Missing"
```

### List all workflow references
```bash
jq -r '.workflow.workflowRef' backend/.claude/tasks/*.json | sort -u
```

### Validate all tasks have valid workflow refs
```bash
for task in backend/.claude/tasks/P*.json; do
  ref=$(jq -r '.workflow.workflowRef' "$task")
  file="backend/.claude/$ref"
  if [ -f "$file" ]; then
    echo "✓ $(basename $task) → $ref"
  else
    echo "✗ $(basename $task) → $ref (MISSING)"
  fi
done
```

---

## Summary

**Three Workflow Types:**
1. **Execution Workflows** (JSON) - Define HOW tasks execute (`/backend/.claude/workflows/*.json`)
2. **Process Workflows** (Markdown) - Document project processes (`/docs/workflows/*.md`)
3. **Session Workflows** (Markdown) - User guide for commands (`/docs/WORKFLOW_GUIDE.md`)

**Workflow Object Structure:**
- `name`, `version`, `description` - Identity
- `subagent` - Planning configuration
- `execution` - Strategy and behavior
- `enforcement` - Rules and blocking

**Task Reference:**
- `type` - Human-readable workflow type
- `workflowRef` - Relative path to workflow JSON
- `planningRequired` - Override flag
