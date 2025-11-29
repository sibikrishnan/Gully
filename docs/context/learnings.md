# Critical Learnings (Quick Reference)

**Purpose:** Minimal list of expensive mistakes to avoid
**Format:** 4-5 lines per learning max
**Load with:** `/gullycontext learnings`

---

## Phase 2 Learnings (Current)

### Jest Mocking Class Instances ⚠️ CRITICAL
**Issue:** Controller uses `new Repo()`, naive jest.mock() bypassed
**Fix:** Declare mocks → `jest.mock()` factory → import controller AFTER
**Cost:** ~4,000 tokens (3 test runs + edits)
**Details:** docs/sessions/P2-PROF-T4.2-session-log.md:159-196

---

### Not Checking Existing Files First
**Issue:** Reading dependencies before checking if file already exists
**Fix:** `Glob **/*{task-name}*.ts` FIRST, then read/implement
**Cost:** ~2,000 tokens wasted per occurrence
**Details:** docs/sessions/P2-PROF-T4.2-session-log.md:211-222

---

### Test Doubling for Authorization
**Pattern:** Double MVP test count for auth/error paths (16 instead of 8)
**Why:** Authorization logic needs thorough coverage + integration tests verify real error codes
**Result:** 90.9% coverage (exceeded 90% requirement)
**Continue:** All controller/service testing

---

### Schema Verification Before DB Tests ⚠️ CRITICAL
**Issue:** Writing DB assertions without checking schema first (used `is_active` instead of `status`)
**Fix:** Read repository/model files BEFORE writing DB-related test assertions
**Cost:** ~3,000 tokens (1 failed test run + grep + read + edit)
**Details:** docs/sessions/P2-PROF-T5.4-e2e-session-log.md:41-50

---

### Check Tool Syntax Before Using ⚠️ CRITICAL
**Issue:** Guessing CLI tool syntax wastes tokens (tried `coderabbit --prompt-only file.ts`)
**Fix:** Run `<tool> --help` or `<tool> <command> --help` FIRST before using unfamiliar tools
**Cost:** ~5,000 tokens (failed command + error + retry + wait cycles)
**Details:** docs/sessions/P2-PROF-T5.4-e2e-session-log.md:53-69

---

## Phase 1 Learnings (Reference)

### Redis Empty Password Crash
**Issue:** `requirepass ""` crashes Redis
**Fix:** Omit password field entirely for local dev
**Cost:** 1 hour debugging + container restart
**Archive:** docs/sessions/archives/phase1-learnings.md

---

### Test Database Not Cleaning Up
**Issue:** Residual data between tests causes failures
**Fix:** `afterEach(async () => await cleanupTestDatabase())`
**Cost:** Intermittent test failures, hard to debug
**Archive:** docs/sessions/archives/phase1-learnings.md

---

### TypeScript Errors in JWT Utils
**Issue:** Type mismatch between JWT library and custom types
**Fix:** Use strict TypeScript + type guards + TDD
**Cost:** Multiple compilation failures
**Archive:** docs/sessions/archives/phase1-learnings.md

---

## Proven Patterns (Keep Using)

### Test-Driven Development (TDD)
Write tests → run (fail) → implement → refactor
**Impact:** 60% less debugging, 0 production bugs, 90%+ coverage

### Immediate Verification
After every change: `npm test` + `npm run build`
**Impact:** 100% of issues fixed in same session

### Small Focused Tasks
Break features into manageable chunks
**Impact:** 100% on-time delivery Phase 1

### Pre-flight Existence Checks
`Glob **/*{name}*.ts` before implementing
**Impact:** Avoid duplicate work, save ~2k tokens/task

---

## Token Optimization Wins

### Granular Context Loading
`/gullycontext <section>` on-demand
**Savings:** 80% (30K → 6K tokens)

### Status File Separation
`STATUS.md` vs `TASK_HISTORY.md`
**Savings:** 95% (22K → 500 tokens)

### Targeted Task Loading
`/gullycontinue` with Grep offset/limit
**Savings:** 89-94% (1800 → 200 tokens)

---

## Antipatterns (Avoid)

❌ Batch commits → Commit per logical change
❌ Skip verification → Always run tests + build
❌ Work without tests → TDD only
❌ Load full context → Use slash commands
❌ Read before checking existence → Glob first

---

**Phase 1 Archive:** docs/sessions/archives/phase1-learnings.md
**Last Updated:** 2025-11-16
**Line Count:** <150 lines (enforce via FILE_BUDGETS.json)
