# Service Boundaries & Dependencies

**Purpose:** Detailed description of each service module and their relationships.

---

## User Service (Foundation)

**Responsibility:** Authentication, user profiles, sports preferences

**Endpoints:**
- `/api/auth/*` - Signup, login, logout
- `/api/users/*` - Profile CRUD

**Dependencies:** None (foundational service)

**Database Tables:**
- `users` - User accounts, profiles, authentication
- `user_sports` - User sport preferences and skill levels

**Key Features:**
- Email/password signup
- Login with JWT
- Profile management (name, avatar, bio)
- Sports preference selection
- Skill level tracking

**Notes:** Must be implemented first as other services depend on it.

---

## Team Service

**Responsibility:** Team management, invitations, roster

**Endpoints:**
- `/api/teams/*` - Team CRUD, member management

**Dependencies:**
- User Service (validates user IDs, checks user existence)

**Database Tables:**
- `teams` - Team information and metadata
- `team_members` - Team membership and roles

**Key Features:**
- Create team
- Invite members via email/user ID
- Accept/decline team invitations
- Manage roster (add/remove members)
- Captain assignment
- Team profiles (avatar, bio, sport)

**Notes:** Depends on User Service for member validation.

---

## Match Service

**Responsibility:** Challenges, scheduling, results submission

**Endpoints:**
- `/api/challenges/*` - Challenge creation, accept/decline
- `/api/matches/*` - Match scheduling, results

**Dependencies:**
- User Service (validates individual challengers)
- Team Service (validates team challengers)

**Database Tables:**
- `challenges` - Challenge requests between users/teams
- `matches` - Scheduled and completed matches

**Key Features:**
- Send challenge (user-to-user or team-to-team)
- Accept/decline challenge
- Propose match date/time/location
- Schedule confirmed match
- Submit match results
- Result verification (both teams confirm)
- Match cancellation

**Notes:** Most complex service due to dual entity types (users and teams).

---

## Stats Service

**Responsibility:** Statistics, leaderboards, analytics

**Endpoints:**
- `/api/stats/*` - User/team stats, leaderboards

**Dependencies:**
- User Service (fetch user details)
- Match Service (read match results)

**Database Tables:**
- None (reads from matches, aggregates in-memory/Redis)

**Key Features:**
- Win/loss record per user
- Win/loss record per team
- Match history
- Leaderboard rankings (by sport)
- Win percentage calculations
- Streak tracking

**Notes:** Read-only service, uses Redis for leaderboard caching.

---

## Service Dependency Graph

```
User Service (foundation)
    ↓
Team Service (depends on User)
    ↓
Match Service (depends on User + Team)
    ↓
Stats Service (depends on User + Match)
```

**Implementation Order:** User → Team → Match → Stats

---

## Communication Pattern

**Current (Modular Monolith):**
- Direct function calls within same process
- Shared database connection
- No network overhead

**Future (Microservices):**
- HTTP REST calls between services
- Service discovery
- Circuit breakers
- Message queues for async operations

---

**Principle:** Clear boundaries now enable easy migration later.
