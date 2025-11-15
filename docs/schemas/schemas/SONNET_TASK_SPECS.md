# Sonnet Task Generation Specs

**Template**: Use P2-PROF-T1.json as gold standard structure

**Remaining Tasks**: 6 tasks (P2-PROF-T6, T7 optional)

---

## P2-PROF-T2: PATCH /api/users/:id

**Endpoint**: `PATCH /api/users/:id`
**Description**: Update user profile with partial updates, authorization check (own profile only), Zod schema for updateable fields
**Key Requirements**:
- Zod schema for updateable fields (username, full_name, location, bio, avatar_url)
- Authorization: req.user.id === params.id
- Partial updates only (not full replacement)
- Exclude password_hash, email, is_active from updates
- Return updated user object with sports

**Test Focus**: 20-25 test cases
- Valid partial updates (name, bio, location)
- Invalid field attempts (password_hash, email, is_active)
- Unauthorized update attempts (different user)
- Validation errors (username format, bio length)
- Update user with pickleball/paddle sports preserved

**File Paths**:
- Controller: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/controllers/user.controller.ts`
- Routes: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/routes/user.routes.ts`
- Schema: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/schemas/user.schema.ts`
- Tests: `/Users/sibikrishnan/Documents/Gully/backend/tests/{unit,integration,e2e}/user-profile-*.test.ts`

---

## P2-PROF-T3: DELETE /api/users/:id (Soft Delete)

**Endpoint**: `DELETE /api/users/:id`
**Description**: Soft delete user (set is_active=false), authorization check, cascade considerations
**Key Requirements**:
- Soft delete: UPDATE users SET is_active=false, deleted_at=NOW()
- Authorization: req.user.id === params.id OR admin role
- Cascade: handle team_members, matches (future consideration)
- Prevent double-deletion (already inactive)
- Return 204 No Content on success

**Test Focus**: 15-20 test cases
- Successful soft delete (user becomes inactive)
- Unauthorized delete attempt
- Delete already-deleted user (idempotent)
- Verify user_sports preserved (for potential reactivation)
- Verify deleted user returns 404 on GET

**File Paths**: (same as T2)

---

## P2-PROF-T4: POST/DELETE /api/users/:id/sports

**Endpoint**: `POST /api/users/:id/sports` and `DELETE /api/users/:id/sports/:sportName`
**Description**: Manage user sports preferences with skill levels
**Key Requirements**:
- POST: Add sport preference (sport_name, skill_level, years_experience, preferred_position)
- DELETE: Remove sport preference
- Unique constraint: (user_id, sport_name)
- Authorization: own profile only
- Validate sport_name enum (pickleball, paddle, tennis, etc.)
- Validate skill_level enum (beginner, intermediate, advanced, expert)

**Test Focus**: 20-25 test cases
- Add pickleball with skill level
- Add paddle with years_experience
- Prevent duplicate sport additions
- Remove sport successfully
- Invalid sport_name handling
- Invalid skill_level handling
- Add multiple sports (pickleball + paddle)

**File Paths**:
- Controller: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/controllers/user-sports.controller.ts`
- Routes: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/routes/user.routes.ts`
- Schema: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/schemas/user-sports.schema.ts`

---

## P2-PROF-T5: GET /api/users/search

**Endpoint**: `GET /api/users/search?q=&sport=&location=&skill_level=&limit=&offset=`
**Description**: Search users with filters, pagination support
**Key Requirements**:
- Query param: q (searches username, full_name)
- Filter: sport (exact match on user_sports)
- Filter: location (partial match)
- Filter: skill_level (on user_sports)
- Pagination: limit (default 20, max 100), offset
- Return: array of users with sports, total count
- Exclude: password_hash, email, phone from results

**Test Focus**: 20-25 test cases
- Search by username substring
- Search by full_name substring
- Filter by pickleball sport
- Filter by paddle sport
- Filter by location (partial match)
- Combined filters (sport + location)
- Pagination (limit, offset)
- Empty results handling
- Case-insensitive search

**File Paths**:
- Controller: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/controllers/user-search.controller.ts`
- Routes: `/Users/sibikrishnan/Documents/Gully/backend/src/services/user-service/routes/user.routes.ts`

---

## P3-TEAM-T2: GET /api/teams/:id

**Endpoint**: `GET /api/teams/:id`
**Description**: Retrieve team details with members list, captain info
**Key Requirements**:
- Join teams with team_members and users
- Include captain details (is_captain=true)
- Include all members array with roles
- Validate team UUID
- Return 404 for soft-deleted teams
- Auth required

**Test Focus**: 15-20 test cases
- Retrieve team with captain + members
- Team with single member (captain only)
- Team with pickleball sport
- Team with paddle sport
- Non-existent team returns 404
- Soft-deleted team returns 404
- Valid UUID format check

**File Paths**:
- Controller: `/Users/sibikrishnan/Documents/Gully/backend/src/services/team-service/controllers/team.controller.ts`
- Routes: `/Users/sibikrishnan/Documents/Gully/backend/src/services/team-service/routes/team.routes.ts`
- Repository: `/Users/sibikrishnan/Documents/Gully/backend/src/services/team-service/repositories/team.repository.ts`

---

## P3-TEAM-T3: PATCH /api/teams/:id

**Endpoint**: `PATCH /api/teams/:id`
**Description**: Update team details (captain only), partial updates
**Key Requirements**:
- Authorization: req.user.id === team.captain_id
- Updateable fields: team_name, description, logo_url, is_public, max_members
- Validate team_name uniqueness (within sport)
- Return updated team with members

**Test Focus**: 15-20 test cases
- Captain updates team name successfully
- Non-captain attempt fails (403)
- Update description only
- Update logo_url only
- Validate team_name uniqueness
- Invalid field attempts
- Partial update handling

**File Paths**: (same as T2)

---

## P3-TEAM-T4: DELETE /api/teams/:id (Soft Delete)

**Endpoint**: `DELETE /api/teams/:id`
**Description**: Soft delete team (captain only), cascade to team_members
**Key Requirements**:
- Authorization: captain only
- Soft delete: UPDATE teams SET is_active=false, deleted_at=NOW()
- Soft delete team_members: UPDATE team_members SET left_at=NOW()
- Return 204 No Content
- Idempotent (already deleted OK)

**Test Focus**: 12-15 test cases
- Captain deletes team successfully
- Non-captain fails (403)
- Verify team_members soft deleted
- Double-delete handling
- Deleted team returns 404 on GET

**File Paths**: (same as T2)

---

## P3-TEAM-T5: POST /api/teams/:id/members

**Endpoint**: `POST /api/teams/:id/members`
**Description**: Add member to team (captain or invitation flow)
**Key Requirements**:
- Authorization: captain or invited user
- Check max_members limit
- Prevent duplicate members
- Role: 'member' (not captain)
- Return updated team with members

**Test Focus**: 15-20 test cases
- Captain adds member successfully
- Max members limit enforced
- Duplicate member prevented
- User already in team fails
- Non-captain attempt fails

**File Paths**:
- Controller: `/Users/sibikrishnan/Documents/Gully/backend/src/services/team-service/controllers/team-members.controller.ts`
- Routes: `/Users/sibikrishnan/Documents/Gully/backend/src/services/team-service/routes/team.routes.ts`

---

## P3-TEAM-T6: DELETE /api/teams/:id/members/:userId

**Endpoint**: `DELETE /api/teams/:id/members/:userId`
**Description**: Remove member from team (captain or self)
**Key Requirements**:
- Authorization: captain OR userId === req.user.id
- Cannot remove captain (must transfer first)
- Soft delete: UPDATE team_members SET left_at=NOW()
- Return 204 No Content

**Test Focus**: 15-20 test cases
- Captain removes member
- Member removes self
- Cannot remove captain
- Non-authorized attempt fails
- Member not in team fails

**File Paths**: (same as T5)

---

## P3-TEAM-T7: GET /api/teams (Search/List)

**Endpoint**: `GET /api/teams?sport=&location=&is_public=&limit=&offset=`
**Description**: Search/list teams with filters, pagination
**Key Requirements**:
- Filter: sport (exact match)
- Filter: location (partial match)
- Filter: is_public (boolean)
- Pagination: limit, offset
- Return: teams array with member counts
- Exclude: soft-deleted teams

**Test Focus**: 20-25 test cases
- List all public teams
- Filter by pickleball sport
- Filter by paddle sport
- Filter by location
- Combined filters
- Pagination handling
- Empty results

**File Paths**: (same as T2)

---

## Generation Rules

1. **Match P2-PROF-T1.json structure exactly**
2. **Test case count**: 15-25 per task (match OPUS detail level)
3. **Categories**: unit, integration, e2e, regression, performance (optional)
4. **Priority levels**: critical (auth, core), high (validation), medium (edge cases), low (performance)
5. **Sport examples**: Always include pickleball and paddle in test scenarios
6. **File paths**: Use absolute paths starting with `/Users/sibikrishnan/Documents/Gully/`
7. **Status**: All tasks = "pending"
8. **Version**: "1.0" with changelog timestamp
9. **Workflow**: `"workflowRef": "workflows/tdd.json"`
10. **Dependencies**: Empty array `[]` unless specific dependency exists
