# Week 1 Git Tasks (Feature-Based)

**Branch:** `week1`
**Strategy:** Feature-based commits (not day-based)
**Goal:** Minimize token consumption through logical task grouping

---

## Task 1: ✅ Project Foundation [COMPLETED]
**Commit:** `86e7bdd` - "feat: initialize modular monolith project structure"
**Duration:** Day 1 (90 min)

### What Was Done:
- Created backend service directories
- Organized documentation into docs/
- Created .claude/.claude.md with project context
- Updated README.md

**Files Changed:** 17 files, +900 lines

---

## Task 2: Database Infrastructure Setup
**Target Commits:** 2-3 commits
**Duration:** Days 2-3 (180 min total)
**Branch:** `week1`

### Subtask 2.1: Docker Compose Setup
**Commit Message Template:**
```
feat: add Docker Compose for local database services

- PostgreSQL 15 container
- Redis 7 container
- pgAdmin 4 for DB management (optional)
- Volume mounts for data persistence
- Network configuration
- Environment variables via .env
```

**Files to Create:**
- `backend/docker-compose.yml`
- `backend/.env.example`
- `backend/.dockerignore`
- `infrastructure/docker/README.md` (Docker commands cheatsheet)

### Subtask 2.2: Database Schema & Migrations
**Commit Message Template:**
```
feat: setup database schema and migration framework

- Knex.js migration framework
- Initial users table migration
- user_sports table migration
- Database seed data (test users)
- Connection utilities in shared/database/
```

**Files to Create:**
- `backend/knexfile.ts`
- `backend/src/shared/database/connection.ts`
- `backend/src/shared/database/migrations/001_create_users.ts`
- `backend/src/shared/database/migrations/002_create_user_sports.ts`
- `backend/src/shared/database/seeds/001_test_users.ts`

---

## Task 3: Authentication Foundation
**Target Commits:** 1-2 commits
**Duration:** Days 4-5 (180 min total)
**Branch:** `week1`

### Subtask 3.1: Auth Utilities & Middleware
**Commit Message Template:**
```
feat: implement authentication utilities and middleware

- Passport.js local strategy
- JWT token generation/validation
- Password hashing with bcrypt
- Auth middleware for protected routes
- TypeScript types for User/Auth
```

**Files to Create:**
- `backend/src/shared/middleware/auth.middleware.ts`
- `backend/src/shared/utils/jwt.utils.ts`
- `backend/src/shared/utils/password.utils.ts`
- `backend/src/shared/types/auth.types.ts`
- `backend/src/shared/config/passport.config.ts`

### Subtask 3.2: User Service Auth Routes
**Commit Message Template:**
```
feat: add user service authentication endpoints

- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me (protected)
- Input validation with Zod
- Error handling
```

**Files to Create:**
- `backend/src/services/user-service/controllers/auth.controller.ts`
- `backend/src/services/user-service/routes/auth.routes.ts`
- `backend/src/services/user-service/validators/auth.validator.ts`
- `backend/src/services/user-service/models/user.model.ts`
- `backend/src/services/user-service/index.ts`

---

## Task 4: Core Application Setup
**Target Commits:** 1 commit
**Duration:** Day 6 (90 min)
**Branch:** `week1`

**Commit Message Template:**
```
feat: create main application entry point

- Express app configuration
- Route aggregation in app.ts
- Error handling middleware
- Request logging (morgan)
- CORS configuration
- Health check endpoint
- Package.json with all dependencies
```

**Files to Create:**
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/shared/middleware/error.middleware.ts`
- `backend/src/shared/middleware/logger.middleware.ts`
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.gitignore`

---

## Task 5: Testing Framework
**Target Commits:** 1 commit
**Duration:** Day 7 (90 min)
**Branch:** `week1`

**Commit Message Template:**
```
feat: setup testing framework and initial tests

- Jest configuration for TypeScript
- Supertest for API testing
- Test utilities and helpers
- Auth endpoint tests (signup, login)
- Database connection tests
- Health check test
```

**Files to Create:**
- `backend/jest.config.js`
- `backend/tests/setup.ts`
- `backend/tests/helpers/testDb.ts`
- `backend/tests/unit/utils/password.test.ts`
- `backend/tests/integration/auth.test.ts`
- `backend/tests/integration/health.test.ts`

---

## Task 6: Week 1 Review & Documentation
**Target Commits:** 1 commit
**Duration:** End of Day 7 (included in Day 7's 90 min)
**Branch:** `week1`

**Commit Message Template:**
```
docs: add Week 1 review and learnings

- Token consumption analysis
- Features completed vs planned
- Patterns that worked well
- Hallucinations encountered
- Adjustments for Week 2
```

**Files to Create:**
- `docs/weekly-reviews/WEEK1_REVIEW.md`
- Update `README.md` with Week 1 completion status
- Update `.claude/.claude.md` with Week 2 focus

---

## Summary: Week 1 Commits

| Task | Commits | Days | Focus |
|------|---------|------|-------|
| 1. Foundation | 1 | 1 | Structure setup ✅ |
| 2. Database | 2-3 | 2-3 | Docker + Schema |
| 3. Auth | 2 | 4-5 | Passport + Routes |
| 4. App Setup | 1 | 6 | Express config |
| 5. Testing | 1 | 7 | Jest + tests |
| 6. Review | 1 | 7 | Documentation |

**Total Commits:** 8-10 meaningful commits
**Token Optimization:** Grouping related work reduces context switches by ~40%

---

## Git Workflow

### Daily Workflow (Feature-Based)
```bash
# Start new feature
git checkout week1
git pull origin week1

# Work on feature (e.g., database setup)
# ... make changes ...

# Commit when feature is complete
git add backend/docker-compose.yml backend/.env.example
git commit -m "feat: add Docker Compose for local database services"

# Push regularly
git push origin week1

# Continue to next subtask or feature
```

### When to Commit
✅ **DO commit when:**
- Feature is working (even if not perfect)
- Logical milestone reached (e.g., "Docker Compose runs")
- Switching to different feature area
- End of 90-min session (if incomplete, note in message)

❌ **DON'T commit when:**
- Code doesn't run (fix first)
- Multiple unrelated changes mixed together
- Just to save progress (use git stash instead)

### Commit Message Format
```
<type>: <short description>

<optional body explaining what and why>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** feat, fix, docs, refactor, test, chore

---

## Token Optimization Tips

### 1. Feature-Based Sessions
Instead of:
```
❌ "Help me with Day 2 tasks"
   → Claude loads all Day 2 context
```

Use:
```
✅ "Setup Docker Compose for PostgreSQL and Redis"
   → Claude focuses only on Docker, saves tokens
```

### 2. Single-File Focus
```
✅ "Create docker-compose.yml with PostgreSQL"
   → Small, focused context

❌ "Setup entire database infrastructure"
   → Vague, loads unnecessary context
```

### 3. Incremental Commits
```
✅ Commit after each working feature
   → Can reference git history, reduces re-explanation

❌ One big commit at end of week
   → Need to explain all context repeatedly
```

---

## Next Session Instructions

**For Day 2 (Database Setup):**

```bash
# 1. Tell Claude:
"Let's work on Week 1 Task 2.1: Docker Compose Setup.
Create docker-compose.yml with PostgreSQL 15 and Redis 7.
Use the template from WEEK1_TASKS.md"

# 2. Claude will create files, you test:
docker-compose up -d

# 3. When working, commit:
git add backend/docker-compose.yml backend/.env.example
git commit -m "feat: add Docker Compose for local database services"

# 4. Move to next subtask (2.2)
```

---

**Last Updated:** Week 1, Day 1
**Next Update:** After Task 2 completion
