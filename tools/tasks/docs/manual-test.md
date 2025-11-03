# Phase 1 Manual Testing Guide

## Test 1: Verify File Structure

```bash
# Check that definitions exist
ls -la .claude/tasks/definitions/

# Check that state directory exists with .gitignore
ls -la .claude/tasks/state/

# Verify example task exists
cat .claude/tasks/definitions/task-3.json | jq '.'
```

## Test 2: Git Ignore Behavior

```bash
# Verify definitions are tracked
git check-ignore .claude/tasks/definitions/task-3.json
# Should exit with code 1 (NOT ignored)

# Verify state files are ignored
touch .claude/tasks/state/test-state.json
git check-ignore .claude/tasks/state/test-state.json
# Should exit with code 0 (IS ignored)

# Cleanup
rm .claude/tasks/state/test-state.json
```

## Test 3: TypeScript Compilation

```bash
cd /Users/sibikrishnan/Documents/Gully/backend

# Compile all task system files (no emit, just type check)
npx tsc --noEmit --skipLibCheck --esModuleInterop --moduleResolution node \
  --module commonjs --target es2020 \
  ../.claude/tasks/schema.ts \
  ../.claude/tasks/core.ts \
  ../.claude/tasks/git.ts \
  ../.claude/tasks/selection.ts
```

## Test 4: Load Task Definition  (Node REPL)

```bash
cd /Users/sibikrishnan/Documents/Gully
node
```

```javascript
const { loadTaskDefinition } = require('./.claude/tasks/core.ts');

// This won't work directly - TypeScript files need compilation
// Instead, let's test the JSON structure directly

const fs = require('fs');
const task3 = JSON.parse(fs.readFileSync('./.claude/tasks/definitions/task-3.json', 'utf-8'));

// Verify structure
console.log('Task ID:', task3.id);
console.log('Status:', task3.status);
console.log('Test cases:', task3.testSuite.testCases.length);
console.log('Git checkpoint:', task3.git.lastKnownGoodCommit || '(none)');

// Verify test case structure
const firstTest = task3.testSuite.testCases[0];
console.log('\nFirst test case:');
console.log('  ID:', firstTest.id);
console.log('  Priority:', firstTest.priority);
console.log('  Watch files:', firstTest.dependencies.watchFiles);
console.log('  Trustable:', firstTest.trustable);

// Exit
process.exit(0);
```

## Test 5: Verify Schema Integrity

Check that all required fields are present in task-3.json:

- ✅ id, version, content, activeForm
- ✅ description, status, workflowRef
- ✅ git.lastKnownGoodCommit, git.definitionPath
- ✅ testSuite.testCases[]
- ✅ testSuite.coverageRequirements
- ✅ testSuite.executionConfig

## Test 6: Git Context (Manual Verification)

```bash
cd /Users/sibikrishnan/Documents/Gully

# Get current branch
git rev-parse --abbrev-ref HEAD

# Get current commit
git rev-parse HEAD

# Get changed files since a commit (use any recent commit)
git diff --name-only HEAD~1 HEAD
```

## Expected Results

All tests should pass with:
- ✅ TypeScript compilation succeeds
- ✅ Definitions are Git-tracked
- ✅ State files are Git-ignored
- ✅ Task-3 JSON loads correctly
- ✅ All schema fields present
- ✅ Git commands work

## Issues Found

(Document any issues discovered during manual testing)
