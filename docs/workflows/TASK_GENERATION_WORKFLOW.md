# Task Generation Workflow

**Purpose**: Efficiently generate comprehensive task JSONs using the right model for the job.

**Last Updated**: 2025-11-09
**Success Case**: Phase 2-3 generation (12 tasks, 65% token savings vs OPUS-only)

---

## Model Selection Matrix

| Task Type | Best Model | Why | Token Cost |
|-----------|------------|-----|------------|
| **Pattern-based generation** (multiple similar tasks) | **Sonnet 4.5** | Excellent at replicating structure, 1/5th cost of OPUS | ~5K/task |
| **Novel/complex reasoning** (new patterns, architecture decisions) | **OPUS 4.1** | Deep reasoning, handles ambiguity | ~15K/task |
| **Quick edits/updates** (modify existing tasks) | **Haiku 4.5** | Fastest, cheapest for simple changes | ~500/task |

**Rule of Thumb**: Use OPUS for first 1-2 tasks in a new phase, then switch to Sonnet for remaining tasks following the same pattern.

---

## Workflow Steps

### Phase 1: Preparation (Do Once Per Phase)

1. **Create condensed spec sheet**
   ```bash
   # Example: backend/.claude/SONNET_TASK_SPECS.md
   # Contains:
   # - 1 example task from OPUS (template)
   # - Minimal specs for remaining tasks (50-100 lines)
   # - Endpoint + HTTP method + 3-5 key requirements
   # - Workflow reference (workflows/tdd.json)
   ```

2. **Validate example task exists**
   ```bash
   ls backend/.claude/tasks/P*-T1.json  # First task in phase (OPUS-generated)
   ```

### Phase 2: Generation (Sonnet)

3. **Generate tasks sequentially** (not in parallel)
   ```
   Prompt: "Generate P3-TEAM-T2 using SONNET_TASK_SPECS.md and P3-TEAM-T1.json as template"

   Why sequential?
   - Allows approval of first Sonnet task before batch
   - Easier to spot pattern drift
   - Lower token cost than restarting entire batch
   ```

4. **Quick validation after each task**
   ```bash
   jq '.testSuite.testCases | length' backend/.claude/tasks/P3-TEAM-T2.json
   # Expect: 7-9 test cases
   ```

5. **Batch generate remaining tasks** (after first approval)
   ```
   Prompt: "Approved. Proceed with batch generation of remaining 5 tasks"

   Sonnet will:
   - Use same template
   - Generate 5 tasks in one session
   - Update index.json
   ```

### Phase 3: Validation

6. **Run batch validation**
   ```bash
   backend/.claude/VALIDATE_TASKS.sh "P3-TEAM-*"

   Checks:
   - JSON valid
   - 5+ test cases per task
   - Absolute file paths
   - Sport examples (pickleball, paddle)
   - Workflow reference exists (workflows/tdd.json)
   - Workflow file exists in backend/.claude/workflows/
   ```

7. **Spot-check quality**
   ```bash
   # Single command comparison
   jq -c '{file: input_filename | split("/")[-1], tests: .testSuite.testCases | length, author: .changelog[0].author}' \
     backend/.claude/tasks/P{2,3}-*-T{1,2}.json

   # Expect similar test counts between OPUS and Sonnet
   ```

---

## Token Optimization Strategies

### ✅ DO:
- **Use spec sheets** (50 lines) instead of full docs (500+ lines)
- **Generate sequentially** (approve first, then batch)
- **Reference by file path** instead of embedding content
- **Single validation commands** (avoid multiple jq calls)

### ❌ DON'T:
- Upload FEATURES.md, API_ENDPOINTS.md, DATABASE_SCHEMA.md to every generation
- Generate all tasks in parallel without template approval
- Read all generated files for validation (use jq batch queries)
- Use OPUS for pattern-matching tasks

---

## Example: Phase 3 Generation (Actual Results)

**Setup**:
- **OPUS**: Generated P3-TEAM-T1 (first task, 436 lines, 9 test cases)
- **Spec sheet**: 100 lines covering T2-T7 endpoints

**Execution**:
```
Session 1 (Sonnet):
1. Generate P3-TEAM-T2 for approval → 408 lines, 8 tests
2. User approves
3. Batch generate T3-T7 → 5 tasks in one response
4. Update index.json

Tokens used: ~35K (vs OPUS estimate: ~90K)
Savings: 65%
```

**Validation**:
```bash
backend/.claude/VALIDATE_TASKS.sh "P3-TEAM-*"

Output:
✓ P3-TEAM-T1.json | Tests:9 | Phase:3 | Author:opus
✓ P3-TEAM-T2.json | Tests:8 | Phase:3 | Author:sonnet
✓ P3-TEAM-T3.json | Tests:7 | Phase:3 | Author:sonnet
...
```

---

## Troubleshooting

### Issue: Sonnet tasks lack detail
**Fix**: Provide more specific spec sheet requirements. Include test count expectations.

### Issue: Sonnet drifts from template
**Fix**: Generate fewer tasks per batch (3-4 instead of 6+). Approve midway.

### Issue: OPUS hits token limit mid-generation
**Fix**: STOP. Switch to Sonnet using completed tasks as template. Don't wait 4 hours.

### Issue: Tasks missing sport examples
**Fix**: Add to spec sheet: "Test cases MUST include pickleball and paddle examples"

---

## Quick Reference Commands

```bash
# Validate all Phase 2 tasks
backend/.claude/VALIDATE_TASKS.sh "P2-*"

# Count total test cases across phase
jq -s '[.[] | .testSuite.testCases | length] | add' backend/.claude/tasks/P2-*.json

# Check file sizes
wc -l backend/.claude/tasks/P*.json | tail -1

# Find tasks by author
jq -r 'select(.changelog[0].author | contains("opus")) | .id' backend/.claude/tasks/*.json

# Verify absolute paths
jq -r '.context.relevantFiles[]' backend/.claude/tasks/P3-TEAM-T2.json | head -3

# Verify all workflow references are valid
for task in backend/.claude/tasks/P*.json; do
  ref=$(jq -r '.workflow.workflowRef' "$task")
  file="backend/.claude/$ref"
  [ -f "$file" ] && echo "✓ $(basename $task)" || echo "✗ $(basename $task) MISSING"
done
```

---

## Success Metrics

**Quality**: 7-9 test cases per task, 350-450 lines, comprehensive edge cases
**Efficiency**: Sonnet should match OPUS quality at 1/5th token cost
**Consistency**: All tasks follow same structure (workflow, metadata, coverage)

**Achieved (Phase 2-3)**:
- 12 tasks generated
- 4,714 total lines
- 65% token savings vs OPUS-only approach
- Quality maintained across OPUS → Sonnet transition
