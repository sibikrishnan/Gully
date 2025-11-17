# Next Session: P2-PROF-T4.3 - User Sports Routes & E2E Tests

## Quick Start
```bash
/gullycontinue P2-PROF-T4.3
```

---

## Context from Previous Session (P2-PROF-T4.2)

### ✅ What's Complete
- **P2-PROF-T4.1**: Repository + Validation Schemas (10 tests passing)
- **P2-PROF-T4.2**: Controllers + Authorization (16 tests passing, 90.9% coverage)
  - `addUserSport()`: POST handler with auth checks
  - `removeUserSport()`: DELETE handler with auth checks
  - Both enforce users can only manage own sports (403 for others)

### 📋 Next Task: P2-PROF-T4.3
**Goal**: Wire up routes for POST/DELETE /api/users/:id/sports with middleware chain and E2E tests

**Estimated**: 30-40 min, ~25K-30K tokens, 4 MVP tests

---

## CRITICAL Learnings to Apply

### 🚨 1. Check for Existing Files FIRST
**Before reading dependencies or writing code:**
```bash
# Check if routes already exist
Glob **/*sports*.route*.ts
Glob **/*sports*.routes.ts
```

**Why**: P2-PROF-T4.2 controller already existed but we wasted 7K tokens reading dependencies first.

### 🚨 2. Jest Mocking Pattern (If Needed)
**If you need to mock in tests, use this EXACT pattern:**

```typescript
// 1. Declare mock functions FIRST (before jest.mock)
const mockFunction = jest.fn();

// 2. Mock with factory pattern
jest.mock('../../path/to/module', () => ({
  ClassName: jest.fn().mockImplementation(() => ({
    methodName: mockFunction
  }))
}));

// 3. Import module-under-test AFTER mocks
import { functionUnderTest } from '../../path/to/module';

// 4. Use mockFunction directly in tests
mockFunction.mockResolvedValue({ ... });
```

**What NOT to do**:
❌ Import module before jest.mock()
❌ Try to assign mocks to instances after creation
❌ Import classes just for type hints when mocking

**Token Cost**: Doing this wrong = 4K-6K tokens debugging. Do it right from start.

### 🚨 3. Read Existing Examples Before Writing
**For P2-PROF-T4.3, read these files to understand patterns:**

1. **Route patterns**:
   - Read `src/services/user-service/routes/user.routes.ts` (or similar)
   - Look for: Router setup, middleware chain, route definitions, exports

2. **E2E test patterns**:
   - Read `tests/e2e/*.test.ts` or `tests/integration/*route*.test.ts`
   - Look for: Test server setup, authentication flow, full request/response cycle

3. **Middleware patterns**:
   - Read `src/services/user-service/middleware/*.ts`
   - Look for: Auth middleware, validation middleware, error handling

**Why**: Copying existing patterns saves 3K-5K tokens vs guessing.

---

## Implementation Checklist for P2-PROF-T4.3

### Phase 1: Discovery (Budget: 5K tokens)
- [ ] Check if `user-sports.routes.ts` already exists
- [ ] Read existing route file for pattern (`user.routes.ts` or similar)
- [ ] Read existing E2E/integration test for routes
- [ ] Identify middleware needed (auth, validation)

### Phase 2: Route Implementation (Budget: 8K tokens)
- [ ] Create `src/services/user-service/routes/user-sports.routes.ts`
- [ ] Wire POST /api/users/:id/sports → addUserSport controller
- [ ] Wire DELETE /api/users/:id/sports/:sport → removeUserSport controller
- [ ] Apply middleware chain:
  - Authentication middleware (verify JWT)
  - Validation middleware (Zod schemas from T4.1)
  - Error handling middleware
- [ ] Export router

### Phase 3: E2E Tests (Budget: 10K tokens)
- [ ] Create `tests/e2e/user-sports-flow.test.ts` (or integration if E2E doesn't exist)
- [ ] Test 1: Authenticated user adds sport to own profile → 201
- [ ] Test 2: Authenticated user removes sport from own profile → 204
- [ ] Test 3: User tries to add sport to another user → 403
- [ ] Test 4: Full flow - add pickleball → remove pickleball → verify cleanup
- [ ] Optional: Invalid payload → 400, duplicate sport → 409

### Phase 4: Integration (Budget: 5K tokens)
- [ ] Register routes in main app (if needed)
- [ ] Run all tests (npm test -- user-sports)
- [ ] Verify coverage (should maintain 90%+)
- [ ] Update TASK_TRACKER.csv → mark P2-PROF-T4.3 as completed

### Phase 5: Finalization (Budget: 2K tokens)
- [ ] Update test count in tracker
- [ ] Git commit with descriptive message
- [ ] Mark P2-PROF-T4 as FULLY COMPLETE (all 3 subtasks done)

---

## Expected Files to Create

1. **Route file**:
   - Path: `src/services/user-service/routes/user-sports.routes.ts`
   - Size: ~80-120 lines
   - Content: Router setup, POST/DELETE routes, middleware chain

2. **E2E/Integration test**:
   - Path: `tests/e2e/user-sports-flow.test.ts` OR `tests/integration/user-sports-routes.test.ts`
   - Size: ~150-200 lines
   - Content: 4+ tests with full HTTP request/response cycle

3. **Test manifest** (maybe):
   - Path: `tools/tracker/data/tasks/P2-PROF-T4/tests/P2-PROF-T4.3-routes-tests.json`
   - Size: ~100 lines
   - Content: Test suite metadata

---

## Token Budget

- **Available**: 112,728 tokens
- **Estimated for T4.3**: 25,000-30,000 tokens
- **Remaining after**: ~82K-87K tokens
- **Next options**:
  - P2-PROF-T5 (User Search - monolithic, needs breakdown)
  - Use `/breakdown-task P2-PROF-T5` to split into subtasks
  - Continue with Phase 2 tasks

---

## Quick Reference: Controllers from T4.2

Both controllers are ready to use:

**addUserSport** (`user-sports.controller.ts:26-72`):
- Authorization: req.user.id === userId (403 if not)
- Validation: Uses addSportSchema from T4.1
- Returns: 201 with sport object
- Errors: 400 validation, 403 forbidden, 404 user not found, 409 duplicate

**removeUserSport** (`user-sports.controller.ts:82-120`):
- Authorization: req.user.id === userId (403 if not)
- URL-decodes sport name
- Returns: 204 No Content
- Errors: 403 forbidden, 404 user/sport not found

---

## Success Criteria for P2-PROF-T4.3

✅ Routes registered and accessible via HTTP
✅ Middleware chain working (auth, validation, error handling)
✅ 4+ E2E tests passing (full request/response cycle)
✅ All tests passing (unit + integration + E2E = 20+ total for P2-PROF-T4)
✅ 90%+ coverage maintained
✅ Task tracker updated
✅ Clean git commit

---

## After P2-PROF-T4.3 is Complete

### Immediate Next Steps:
1. **Celebrate**: P2-PROF-T4 is FULLY COMPLETE (3 subtasks done)!
2. **Push to remote**: `git push origin feature/phase2`
3. **Consider PR**: Create PR for P2-PROF-T4 to phase2 or develop branch

### Then Choose:
- **Option A**: Continue with **P2-PROF-T5** (User Search endpoint)
  - This is monolithic (no subtasks yet)
  - **Use `/breakdown-task P2-PROF-T5`** to split into 3-4 subtasks first
  - Then tackle subtasks one by one

- **Option B**: Switch to **Phase 3** (Team Management)
  - But P3 is blocked until P2 is complete
  - Better to finish P2-PROF-T5 first

---

## Git Strategy Reminder

**Current branch**: `feature/phase2`
**Commits since last push**: 7 commits

**Before starting P2-PROF-T4.3**:
```bash
git status  # Check for uncommitted changes
git log --oneline -5  # Verify recent commits
```

**After P2-PROF-T4.3**:
```bash
git add -A
git commit -m "feat: implement P2-PROF-T4.3 - user sports routes & E2E tests"
git push origin feature/phase2  # Push all 8 commits
```

---

## Key Commands

```bash
# Start task
/gullycontinue P2-PROF-T4.3

# Check for existing files
Glob **/*sports*.route*.ts

# Read examples
Read src/services/user-service/routes/user.routes.ts
Read tests/e2e/*.test.ts

# Run tests
npm test -- user-sports

# Coverage check
npm test -- --coverage --collectCoverageFrom='src/services/user-service/routes/user-sports.routes.ts'

# After complete
git add -A && git commit && git push
```

---

**Ready to build P2-PROF-T4.3! 🚀**
