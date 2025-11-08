# OPUS Task Planning Brief - Phase 2 & 3

**Date Created:** 2025-11-07
**Purpose:** Comprehensive brief for OPUS to generate detailed task JSONs for Phase 2 (User Profiles) and Phase 3 (Team Management)

---

## 🎯 Mission

Generate detailed task JSON files for:
- **Phase 2:** User Profiles (5-7 tasks)
- **Phase 3:** Team Management (6-8 tasks)

Follow the EXACT format and detail level of existing example tasks.

---

## 📋 What You Need to Create

### Output Format

For each task, create a JSON file: `P{phase}-{code}-T{task}.json`

**Examples:**
- `P2-PROF-T1.json` - Phase 2, Profiles, Task 1
- `P2-PROF-T2.json` - Phase 2, Profiles, Task 2
- `P3-TEAM-T1.json` - Phase 3, Teams, Task 1

### Location
All files go in: `backend/.claude/tasks/`

---

## 📚 Required Reading (Load These Files First)

### 1. Task System Schema ⭐ CRITICAL
**File:** `docs/architecture/TASK_SYSTEM_DESIGN.md`
**What it contains:** Complete task object structure, interfaces, rules
**Why read it:** Defines the exact JSON schema you must follow

### 2. Example Tasks ⭐ CRITICAL (Format Templates ONLY)
**Files:**
- `backend/.claude/tasks/task-3-jwt-utils.json`
- `backend/.claude/tasks/task-4-auth-tests.json`

**How to use them:**
- ✅ **COPY their format** (JSON structure, test detail level, description style)
- ✅ **COPY their depth** (40+ test cases, specific paths, edge cases)
- ❌ **DO NOT copy content** (these are Phase 1 Auth tasks - you're doing Phase 2-3)
- ❌ **DO NOT create JWT/Auth tasks** (already done in Phase 1)

**What to replicate:**
- Embedded test suites with 20-40 test cases per task
- Absolute file paths (e.g., `/Users/sibikrishnan/Documents/Gully/backend/...`)
- Detailed descriptions (2-3 sentences minimum)
- Test cases categorized: unit, integration, regression
- Coverage section with targetFunctions, scenarios, edgeCases
- Success criteria clearly defined
- Workflow reference: `"workflowRef": "workflows/tdd.json"`

### 3. Feature Specifications
**File:** `docs/planning/FEATURES.md`
**What it contains:** Detailed feature requirements for all MVP features
**Focus on:**
- Section 1: User Management (for Phase 2)
- Section 2: Team Management (for Phase 3)

### 4. API Endpoints
**File:** `docs/planning/API_ENDPOINTS.md`
**What it contains:** Complete API contract specifications
**Focus on:**
- `/users/*` endpoints (Phase 2)
- `/teams/*` endpoints (Phase 3)

### 5. Database Schema
**File:** `docs/planning/DATABASE_SCHEMA.md`
**What it contains:** PostgreSQL table definitions
**Focus on:**
- `users` table
- `user_sports` table
- `teams` table
- `team_members` table

### 6. Service Brief
**File:** `docs/parallel-development/briefs/UserService-Brief.md`
**What it contains:** User Service architecture, responsibilities, file structure
**Why read it:** Understand the service module context

### 7. Phase Context
**File:** `.claude/context/mvp/timeline.md`
**What it contains:** Phase breakdown with planned tasks
**Why read it:** See high-level task bullets for each phase

### 8. Existing Code Patterns (Phase 1 Complete)
**Location:** `backend/src/services/user-service/`
**Folders to review:**
- `controllers/` - Controller patterns
- `routes/` - Route structure
- `validators/` - Zod validation patterns
- `services/` - Service layer patterns

**Why review:** Match the coding style, patterns, and structure already established in Phase 1

---

## 🎯 Phase 2: User Profiles - Tasks to Create

### Scope
Implement user profile CRUD operations and sports preferences.

### Tasks Needed (5-7 tasks)

**Suggested breakdown:**

1. **P2-PROF-T1:** GET /api/users/:id endpoint
   - Retrieve user profile with all fields
   - Include user_sports data (JOIN)
   - Zod validation for UUID
   - Auth middleware (must be authenticated)
   - Tests: 15-20 cases (unit + integration)

2. **P2-PROF-T2:** PATCH /api/users/:id endpoint
   - Partial profile updates
   - Zod schema for updateable fields
   - Authorization check (own profile only)
   - Tests: 20-25 cases (valid updates, invalid fields, unauthorized)

3. **P2-PROF-T3:** DELETE /api/users/:id endpoint (soft delete)
   - Soft delete (set is_active=false)
   - Authorization check
   - Cascade considerations (teams, matches)
   - Tests: 10-15 cases

4. **P2-PROF-T4:** Sport Preferences - POST/DELETE /api/users/:id/sports
   - Add sport preference with skill level
   - Remove sport preference
   - Manage user_sports table
   - Tests: 15-20 cases (unique constraint, validation)

5. **P2-PROF-T5:** GET /api/users/search endpoint
   - Search by username, full_name
   - Pagination support (limit, offset)
   - Filter by sport, location, skill level
   - Tests: 20-25 cases (search accuracy, pagination, filters)

**Optional (if time permits):**
6. **P2-PROF-T6:** Profile validation & error handling
7. **P2-PROF-T7:** Integration test suite for full profile flow

---

## 🎯 Phase 3: Team Management - Tasks to Create

### Scope
Implement team creation, roster management, and member invitations.

### Tasks Needed (6-8 tasks)

**Suggested breakdown:**

1. **P3-TEAM-T1:** POST /api/teams endpoint
   - Create team with captain assignment
   - Zod validation for team data
   - Auto-add creator as captain in team_members
   - Tests: 15-20 cases

2. **P3-TEAM-T2:** GET /api/teams/:id endpoint
   - Retrieve team details
   - Include members list (JOIN with users)
   - Include captain info
   - Tests: 10-15 cases

3. **P3-TEAM-T3:** PATCH /api/teams/:id endpoint
   - Update team details (name, description, logo)
   - Authorization check (captain only)
   - Tests: 15-20 cases (valid updates, unauthorized)

4. **P3-TEAM-T4:** DELETE /api/teams/:id endpoint (soft delete)
   - Soft delete team
   - Authorization check (captain only)
   - Cascade to team_members
   - Tests: 10-15 cases

5. **P3-TEAM-T5:** POST /api/teams/:id/members endpoint
   - Add member to team
   - Invitation flow (if needed)
   - Roster limit checks
   - Tests: 15-20 cases (duplicates, limits, validation)

6. **P3-TEAM-T6:** DELETE /api/teams/:id/members/:userId endpoint
   - Remove member from team
   - Authorization check (captain or self)
   - Cannot remove captain (must transfer first)
   - Tests: 15-20 cases

7. **P3-TEAM-T7:** GET /api/teams endpoint (list/search)
   - Search/filter teams
   - Pagination support
   - Filter by sport, location, public/private
   - Tests: 20-25 cases

**Optional:**
8. **P3-TEAM-T8:** Transfer captaincy feature
9. **P3-TEAM-T9:** Integration test suite for full team flow

---

## ✅ Task JSON Requirements (Match Examples!)

### Mandatory Fields

```json
{
  "id": "P2-PROF-T1",
  "version": "1.0",
  "changelog": [
    {
      "version": "1.0",
      "timestamp": "2025-11-07T19:00:00Z",
      "change": "Initial task definition",
      "author": "claude-opus-4"
    }
  ],
  "content": "Implement GET /api/users/:id endpoint",
  "activeForm": "Implementing GET /api/users/:id endpoint",
  "description": "Create controller, route, validation, and comprehensive tests for user profile retrieval. Includes user_sports JOIN and authentication middleware.",
  "status": "pending",
  "dependencies": [],
  "testSuite": {
    "testCases": [
      {
        "id": "profile-get.unit",
        "category": "unit",
        "description": "Unit tests for profile retrieval with valid/invalid user IDs",
        "required": true,
        "priority": "critical",
        "testFile": {
          "path": "/Users/sibikrishnan/Documents/Gully/backend/tests/unit/user-profile.test.ts",
          "status": "not_created",
          "testCount": 15,
          "estimatedDuration": "30 seconds"
        },
        "coverage": {
          "targetFunctions": [
            "getUserProfile",
            "validateUserId",
            "joinUserSports"
          ],
          "scenarios": [
            "Valid user ID returns full profile",
            "Invalid UUID format returns 400",
            "Non-existent user returns 404",
            "Includes user_sports array",
            "Excludes password_hash from response"
          ],
          "edgeCases": [
            "User with no sports",
            "Soft-deleted user returns 404",
            "Malformed UUID handling"
          ]
        },
        "trust": false,
        "skipConditions": {
          "ifTrusted": false,
          "unlessFileChanged": [
            "backend/src/services/user-service/controllers/user.controller.ts"
          ]
        }
      }
      // Add 15-40 more test cases like this!
    ],
    "coverageRequirements": {
      "enabled": true,
      "minimumPercentage": 90,
      "criticalFiles": [
        "backend/src/services/user-service/controllers/user.controller.ts"
      ]
    },
    "successCriteria": {
      "allTestsMustPass": true,
      "noTypeScriptErrors": true,
      "buildMustSucceed": true
    }
  },
  "workflow": {
    "type": "TDD",
    "workflowRef": "workflows/tdd.json",
    "planningRequired": false
  },
  "metadata": {
    "phase": 2,
    "feature": "User Profiles",
    "estimatedDuration": "90-120 min",
    "tags": ["user-service", "profiles", "crud", "GET"]
  }
}
```

---

## 🚫 Critical DON'Ts

1. ❌ **DO NOT create Auth/JWT tasks** (Phase 1 already complete)
2. ❌ **DO NOT use relative paths** (use absolute: `/Users/sibikrishnan/Documents/Gully/...`)
3. ❌ **DO NOT create vague tasks** ("Build profile system" is too broad)
4. ❌ **DO NOT skip test suites** (every task needs 15-40 test cases)
5. ❌ **DO NOT use numeric IDs** (use P2-PROF-T1, not "task-7")
6. ❌ **DO NOT reference Phase 1 Auth work** (it's complete, focus on Phase 2-3)

---

## ✅ Critical DOs

1. ✅ **Match example task detail level** (task-3 has 40 test cases - aim for similar)
2. ✅ **Use absolute file paths** throughout
3. ✅ **Include edge cases** in test coverage (null, undefined, malformed data)
4. ✅ **Reference existing code patterns** from `backend/src/services/user-service/`
5. ✅ **Follow Phase 1 conventions:**
   - Controller pattern (request, response, next)
   - Zod validation schemas
   - Auth middleware usage
   - Error handling format
   - Test structure (setup, test, teardown)
6. ✅ **Use TDD workflow** for all tasks (`"workflowRef": "workflows/tdd.json"`)
7. ✅ **Set status to "pending"** for all new tasks

---

## 📝 Deliverables

### Expected Output

**Phase 2 Tasks:** 5-7 JSON files
- `P2-PROF-T1.json` through `P2-PROF-T7.json`

**Phase 3 Tasks:** 6-8 JSON files
- `P3-TEAM-T1.json` through `P3-TEAM-T9.json`

**Total:** 11-15 detailed task JSON files

### Update index.json

After creating all tasks, update `backend/.claude/tasks/index.json`:

```json
{
  "version": "2.0",
  "lastUpdated": "2025-11-07T19:00:00Z",
  "description": "Task registry for Phase 2 and 3 development",
  "tasks": [
    {
      "id": "3",
      "file": "task-3-jwt-utils.json",
      "status": "completed",
      "priority": "critical",
      "title": "JWT Utils Implementation and Testing"
    },
    {
      "id": "4",
      "file": "task-4-auth-tests.json",
      "status": "completed",
      "priority": "critical",
      "title": "Auth Middleware and Passport Integration Tests"
    },
    {
      "id": "P2-PROF-T1",
      "file": "P2-PROF-T1.json",
      "status": "pending",
      "priority": "critical",
      "title": "GET /api/users/:id endpoint"
    },
    ... (add all new tasks)
  ]
}
```

---

## 🔍 Quality Checklist

Before submitting tasks, verify each task has:

- [ ] Proper ID format (P{phase}-{code}-T{task})
- [ ] Detailed description (2-3 sentences minimum)
- [ ] 15-40 test cases in testSuite
- [ ] Absolute file paths (not relative)
- [ ] Coverage section (targetFunctions, scenarios, edgeCases)
- [ ] Success criteria defined
- [ ] Workflow reference (workflows/tdd.json)
- [ ] Metadata (phase, feature, estimatedDuration, tags)
- [ ] Status = "pending"
- [ ] Dependencies array (empty [] if none)
- [ ] Changelog entry

---

## 🎯 Success Criteria

**You've succeeded when:**
1. ✅ All 11-15 task JSON files created
2. ✅ Each task matches detail level of task-3-jwt-utils.json
3. ✅ index.json updated with all new tasks
4. ✅ All tasks reference Phase 2-3 work (NOT Phase 1 Auth)
5. ✅ Test suites are comprehensive (15-40 cases each)
6. ✅ Files use consistent naming (P2-PROF-T1.json format)
7. ✅ No TypeScript/JSON syntax errors

---

## 📞 How to Invoke This Brief

**In your next session with OPUS:**

```
I need you to create detailed task JSON files for Phase 2 (User Profiles) and
Phase 3 (Team Management) of our MVP.

Please read and follow this comprehensive brief:
/Users/sibikrishnan/Documents/Gully/OPUS_BRIEF_PHASE2_3.md

Take your time to:
1. Read all required files (listed in the brief)
2. Study the example tasks (task-3 and task-4) for format
3. Create 11-15 detailed task JSONs following the exact format
4. Update index.json when done

Ask me questions if anything is unclear before you start.
```

---

**Created by:** Claude Sonnet 4.5
**Session:** 2025-11-07 Phase Migration Discussion
**Next Step:** Use this brief with OPUS in a fresh session to generate Phase 2-3 tasks
