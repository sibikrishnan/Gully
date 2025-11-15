# Task Directory Structure

**Version**: 3.0 (Hierarchical)
**Last Updated**: 2025-11-12
**Status**: ✅ Active

---

## 📁 Directory Structure Convention

Tasks are organized hierarchically with parent tasks as directories containing subtasks:

```
tasks/
├── index.json                          # Task registry (paths to all tasks)
├── {TASK_ID}/                          # Parent task directory
│   ├── task.json                       # Parent task definition
│   ├── {TASK_ID}.1.json               # Subtask 1
│   ├── {TASK_ID}.2.json               # Subtask 2
│   └── {TASK_ID}.{N}.json             # Subtask N
├── archive/                            # Archived/deprecated tasks
├── tests/                              # Test suite definitions (separated)
└── migration-backup-YYYYMMDD_HHMMSS/  # Migration backups (delete after verification)
```

---

## 🎯 Naming Conventions

### Parent Task Directory
- **Format**: `{PHASE}-{SERVICE}-T{NUMBER}/`
- **Examples**:
  - `P2-PROF-T1/` - Phase 2, Profile service, Task 1
  - `P3-TEAM-T5/` - Phase 3, Team service, Task 5

### Parent Task File
- **Format**: `{TASK_ID}/task.json`
- **Purpose**: Contains parent task definition, overview, and references to subtasks
- **Examples**:
  - `P2-PROF-T1/task.json`
  - `P3-TEAM-T1/task.json`

### Subtask Files
- **Format**: `{PARENT_ID}/{PARENT_ID}.{SUBTASK_NUM}.json` or `{PARENT_ID}/{PARENT_ID}.{SUBTASK_NUM}-{descriptor}.json`
- **Examples**:
  - `P2-PROF-T1/P2-PROF-T1.1.json` (Subtask 1 of P2-PROF-T1)
  - `P2-PROF-T1/P2-PROF-T1.2.json` (Subtask 2 of P2-PROF-T1)
  - `P2-PROF-T2/P2-PROF-T2.1-repo.json` (Subtask with descriptor)
  - `P2-PROF-T2/P2-PROF-T2.2-controller.json`

### Standalone Tasks (No Subtasks)
- **Format**: `{TASK_ID}/task.json`
- **Example**: `P2-PROF-T3/task.json` (single task, no subtasks)

---

## 📝 Real Examples from Project

### ✅ Correct Structure

**Task with Subtasks:**
```
P2-PROF-T1/                              # GET /api/users/:id
├── task.json                            # Parent task (if exists)
├── P2-PROF-T1.1.json                   # Subtask: Repository layer
└── P2-PROF-T1.2.json                   # Subtask: Controller + Route

P2-PROF-T2/                              # PATCH /api/users/:id
├── task.json                            # Parent task (if exists)
├── P2-PROF-T2.1-repo.json              # Subtask: Repository
├── P2-PROF-T2.2-controller.json        # Subtask: Controller
└── P2-PROF-T2.3-route.json             # Subtask: Route
```

**Standalone Task (No Subtasks):**
```
P2-PROF-T3/                              # DELETE /api/users/:id
└── task.json                            # Single task file

P3-TEAM-T1/                              # POST /api/teams
└── task.json                            # Single task file
```

### ❌ Old Incorrect Structure (Deprecated)
```
# DO NOT USE - Flat structure (before migration)
tasks/
├── P2-PROF-T1.1.json                   # ❌ Flat, no parent directory
├── P2-PROF-T1.2.json
├── P2-PROF-T2.1-repo.json
└── P2-PROF-T3.json
```

---

## 🔧 For PM Agents & Task Generators

### When Creating New Tasks

1. **Determine if task needs subtasks:**
   - Complex tasks with multiple layers (repo, controller, route) → Use subtasks
   - Simple single-responsibility tasks → Standalone

2. **Create parent directory:**
   ```bash
   mkdir -p tasks/{TASK_ID}/
   ```

3. **Create parent task file (if applicable):**
   ```bash
   # For tasks with subtasks
   tasks/{TASK_ID}/task.json
   ```

4. **Create subtask files:**
   ```bash
   # Pattern: {PARENT_ID}/{PARENT_ID}.{NUM}.json
   tasks/P2-PROF-T1/P2-PROF-T1.1.json
   tasks/P2-PROF-T1/P2-PROF-T1.2.json
   ```

5. **Update index.json:**
   - Add parent task with `hasSubtasks: true`
   - List subtask paths in `subtasks` array

### Path Resolution

**Reading tasks:**
```javascript
// Parent task
const parentPath = `tools/tracker/data/tasks/${taskId}/task.json`;

// Subtasks
const subtaskPath = `tools/tracker/data/tasks/${parentId}/${subtaskId}.json`;

// From index.json
const task = index.tasks.find(t => t.id === taskId);
const taskPath = `tools/tracker/data/tasks/${task.file}`;
```

**Creating tasks:**
```javascript
// Always create directory first
fs.mkdirSync(`tasks/${taskId}`, { recursive: true });

// Write task file
if (hasSubtasks) {
  // Write parent if needed
  fs.writeFileSync(`tasks/${taskId}/task.json`, parentData);

  // Write subtasks
  subtasks.forEach((subtask, i) => {
    fs.writeFileSync(`tasks/${taskId}/${taskId}.${i+1}.json`, subtask);
  });
} else {
  // Standalone task
  fs.writeFileSync(`tasks/${taskId}/task.json`, taskData);
}
```

---

## 📊 index.json Structure

```json
{
  "version": "3.0",
  "structureVersion": "hierarchical",
  "pathConvention": {
    "parentTask": "{TASK_ID}/task.json",
    "subtask": "{PARENT_ID}/{SUBTASK_ID}.json"
  },
  "tasks": [
    {
      "id": "P2-PROF-T1",
      "file": "P2-PROF-T1/task.json",
      "hasSubtasks": true,
      "subtasks": [
        "P2-PROF-T1/P2-PROF-T1.1.json",
        "P2-PROF-T1/P2-PROF-T1.2.json"
      ]
    },
    {
      "id": "P2-PROF-T3",
      "file": "P2-PROF-T3/task.json",
      "hasSubtasks": false
    }
  ]
}
```

---

## 🔄 Migration Notes

### What Changed (v2.0 → v3.0)
- **Before**: Flat file structure with all tasks in root directory
- **After**: Hierarchical structure with parent directories

### Migration Process
1. Run `migrate-to-hierarchy.sh` to reorganize existing files
2. Backup created automatically: `migration-backup-YYYYMMDD_HHMMSS/`
3. index.json updated with new paths
4. All agent instructions updated

### Backward Compatibility
- Old flat paths in documentation are deprecated
- All agents must use new hierarchical paths
- Migration backup can be deleted after verification

---

## ⚠️ Important Rules

1. **ALWAYS create parent directory first**
   - Even for standalone tasks: `{TASK_ID}/task.json`

2. **Parent task file is optional**
   - Required if task has true parent-child relationship
   - Optional for organizational subtasks

3. **Subtask naming must include parent ID**
   - ✅ `P2-PROF-T1/P2-PROF-T1.1.json`
   - ❌ `P2-PROF-T1/T1.1.json` (missing parent ID)

4. **Update index.json whenever creating tasks**
   - Add to `tasks` array
   - Set `hasSubtasks` flag correctly
   - List all subtask paths if applicable

5. **Use descriptors for clarity**
   - ✅ `P2-PROF-T2.1-repo.json` (clear purpose)
   - ✅ `P2-PROF-T2.1.json` (acceptable)
   - Descriptors help identify subtask purpose

---

## 🧪 Testing & Validation

### Verify Structure
```bash
# Check directory structure
ls -la tasks/P2-PROF-T1/

# Validate JSON
jq '.' tasks/P2-PROF-T1/task.json

# Verify index.json paths exist
jq -r '.tasks[].file' tasks/index.json | while read file; do
  [ -f "tasks/$file" ] && echo "✓ $file" || echo "✗ $file MISSING"
done
```

### Common Issues
1. **Missing parent directory**: Create with `mkdir -p tasks/{TASK_ID}/`
2. **Wrong subtask path in index.json**: Must include parent directory
3. **Orphaned subtasks**: Subtasks without parent task entry in index.json

---

## 📚 Related Documentation

- `/Users/sibikrishnan/Documents/Gully/PROJECT_STRUCTURE.md` - Project-wide structure
- `/Users/sibikrishnan/Documents/Gully/tools/tracker/PM_AGENT_INTEGRATION.md` - PM agent workflow
- `.claude/commands/generate-tasks.md` - Task generation agent instructions

---

**Maintained By**: PM agents, task-generation-agent, and Claude Code sessions
**Review Frequency**: When adding new phases or changing task structure
**Status**: ✅ Active & Enforced
