# Service Development Briefs

**Complete index of service implementation guides**

---

## 📋 Available Services

### 1. User Service ✅ **COMPLETE**
**[UserService-Brief.md](UserService-Brief.md)** (279 lines)

**Responsibility:** User authentication, profiles, and sports preferences

**Status:** ✅ Implemented in Week 1
- Production-ready with 90%+ test coverage
- JWT authentication working
- 121 passing tests

**Endpoints:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/users/:id` - Update user profile

**Database Tables:**
- `users` - User accounts and authentication
- `user_sports` - Sports preferences (many-to-many)

---

### 2. Team Service ⏳ **NEXT - WEEK 2**
**[TeamService-Brief.md](TeamService-Brief.md)** (114 lines)

**Responsibility:** Team management, invitations, and roster

**Status:** ⏳ Planned for Week 2

**Endpoints:**
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/:id/invite` - Invite member
- `PUT /api/teams/:id/members/:userId/role` - Update member role

**Database Tables:**
- `teams` - Team information
- `team_members` - Team roster with roles

**Dependencies:** User Service (validates user IDs)

---

### 3. Match Service **WEEKS 5-6**
**[MatchService-Brief.md](MatchService-Brief.md)** (140 lines)

**Responsibility:** Match tracking and score reporting

**Status:** Planned for Weeks 5-6

**Endpoints:**
- `POST /api/matches` - Create match
- `PUT /api/matches/:id/score` - Report score
- `GET /api/matches/:id` - Get match details
- `GET /api/matches` - List matches

**Database Tables:**
- `matches` - Match results and tracking
- `match_participants` - Match participants (users or teams)

**Dependencies:** User Service, Team Service

---

### 4. League Service **FUTURE**
**[LeagueService-Brief.md](LeagueService-Brief.md)** (155 lines)

**Responsibility:** League operations and standings

**Status:** Future feature (post-MVP)

**Endpoints:**
- `POST /api/leagues` - Create league
- `GET /api/leagues/:id/standings` - Get standings
- `POST /api/leagues/:id/teams` - Add team to league

**Database Tables:**
- `leagues` - League information
- `league_teams` - Teams in leagues
- `league_standings` - Current standings

**Dependencies:** Team Service, Match Service

---

### 5. Tournament Service **FUTURE**
**[TournamentService-Brief.md](TournamentService-Brief.md)** (182 lines)

**Responsibility:** Tournament system and bracket management

**Status:** Future feature (post-MVP)

**Endpoints:**
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:id/bracket` - Get bracket
- `POST /api/tournaments/:id/advance` - Advance bracket

**Database Tables:**
- `tournaments` - Tournament information
- `tournament_rounds` - Tournament bracket rounds
- `tournament_matches` - Tournament matches

**Dependencies:** Team Service, Match Service

---

### 6. Stats Service **WEEKS 9-10**
**[StatsService-Brief.md](StatsService-Brief.md)** (207 lines)

**Responsibility:** Statistics aggregation and leaderboards

**Status:** Planned for Weeks 9-10

**Endpoints:**
- `GET /api/stats/user/:id` - User statistics
- `GET /api/stats/team/:id` - Team statistics
- `GET /api/stats/leaderboard/:sport` - Sport leaderboard

**Database:** Aggregates from other services + Redis caching

**Dependencies:** All services (reads match data, user data, team data)

---

## 📅 Development Order

### Week 1: Foundation ✅ **COMPLETE**
- ✅ User Service (authentication & profiles)
- ✅ Database setup (PostgreSQL + Redis)
- ✅ Testing infrastructure
- ✅ Docker Compose environment

### Week 2: Team Features ⏳ **CURRENT**
- ⏳ Team Service (team management)
- ⏳ Team invitation system
- ⏳ Team roster management

### Weeks 3-4: Frontend & User Experience
- Frontend foundation (Next.js)
- User registration/login UI
- Team management UI

### Weeks 5-6: Challenge System
- Match Service (challenge creation)
- Match tracking
- Score reporting

### Weeks 7-8: Match Management
- Match history
- Match details
- Match validation

### Weeks 9-10: Stats & Leaderboard
- Stats Service (aggregation)
- Leaderboards by sport
- User/team statistics

### Weeks 11-12: Launch Prep
- Polish & bug fixes
- Performance optimization
- Final testing

---

## 📖 Service Brief Structure

Each service brief contains:

1. **Service Overview**
   - Responsibility
   - Dependencies
   - Database tables

2. **API Endpoints**
   - Endpoint definitions
   - Request/response schemas
   - Validation rules

3. **Database Schema**
   - Table structures
   - Relationships
   - Indexes

4. **Implementation Notes**
   - Key considerations
   - Edge cases
   - Testing strategy

5. **Integration Points**
   - How to integrate with other services
   - Shared utilities to use
   - Common patterns

---

## 🔗 Related Documentation

### Architecture
- **[Architecture Overview](../architecture/OVERVIEW.md)** - System architecture
- **[Service Architecture](../../.claude/context/arch/services.md)** - Service boundaries (load via `/gullycontext arch/services`)

### Database
- **[Database Schema](../planning/DATABASE_SCHEMA.md)** - Complete schema reference
- **[Database Context](../../.claude/context/database/)** - Tables, indexes, Redis (load via `/gullycontext database`)

### Planning
- **[API Endpoints](../planning/API_ENDPOINTS.md)** - Complete API documentation
- **[Roadmap](../planning/ROADMAP.md)** - 12-week development plan
- **[Features](../planning/FEATURES.md)** - Feature specifications

---

## 🎯 Usage Guide

**When implementing a service:**

1. **Read the service brief** - Understand responsibilities and endpoints
2. **Check dependencies** - Ensure dependent services are ready
3. **Review database schema** - Plan table creation and migrations
4. **Load context** - Use `/gullycontext` for detailed architecture
5. **Follow patterns** - Use existing User Service as reference
6. **Write tests first** - TDD approach with 90%+ coverage target

**Example workflow for Team Service (Week 2):**
```bash
# 1. Read the brief
Read docs/service-briefs/briefs/TeamService-Brief.md

# 2. Load relevant context
/gullycontext arch/services      # Service patterns
/gullycontext database/tables    # Database schema patterns

# 3. Create migrations
npm run migrate:make create_teams_table
npm run migrate:make create_team_members_table

# 4. Implement with TDD
# - Write test for endpoint
# - Implement endpoint
# - Run tests
# - Repeat

# 5. Verify
npm test                         # All tests pass
npm run migrate:status           # Migrations applied
```

---

## 📊 Service Statistics

| Service | Lines | Status | Week | Tests | Endpoints |
|---------|-------|--------|------|-------|-----------|
| UserService | 279 | ✅ Complete | 1 | 121 | 4 |
| TeamService | 114 | ⏳ Next | 2 | 0 | 4 |
| MatchService | 140 | Planned | 5-6 | 0 | 4 |
| LeagueService | 155 | Future | Post-MVP | 0 | 3 |
| TournamentService | 182 | Future | Post-MVP | 0 | 3 |
| StatsService | 207 | Planned | 9-10 | 0 | 3 |
| **Total** | **1,077** | **1/6** | **-** | **121** | **21** |

---

**Last Updated:** 2025-11-06
**Current Focus:** Team Service (Week 2)
**Purpose:** Guide parallel service development with clear boundaries
