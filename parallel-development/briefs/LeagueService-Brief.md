# League Service Development Brief
## Claude Instance: C1

### Mission
Develop the League Service microservice managing league creation, team registration, fixtures, and standings calculation.

### Service Responsibility
- League creation and configuration
- Team registration and management
- Fixture generation and scheduling
- Standings calculation and updates
- Season management

### Interface Contract
**Provides:**
```typescript
// REST Endpoints
GET    /leagues                    // List leagues
POST   /leagues                    // Create league
GET    /leagues/:id               // Get league details
PUT    /leagues/:id               // Update league settings
DELETE /leagues/:id               // Cancel league
POST   /leagues/:id/register      // Register team
DELETE /leagues/:id/teams/:teamId // Remove team
GET    /leagues/:id/standings     // Get current standings
GET    /leagues/:id/fixtures      // Get fixtures
POST   /leagues/:id/fixtures/generate // Generate fixtures
GET    /leagues/:id/stats        // League statistics
PUT    /leagues/:id/complete      // End season
```

**Events Emitted:**
```typescript
interface LeagueEvents {
  LEAGUE_CREATED: { leagueId: string, sport: string, startDate: Date }
  TEAM_REGISTERED: { leagueId: string, teamId: string }
  FIXTURES_GENERATED: { leagueId: string, matchCount: number }
  LEAGUE_MATCH_SCHEDULED: { leagueId: string, matchId: string, homeTeam: string, awayTeam: string }
  STANDINGS_UPDATED: { leagueId: string, standings: object[] }
  SEASON_COMPLETED: { leagueId: string, winner: string, finalStandings: object[] }
}
```

**Consumes Events:**
```typescript
MATCH_COMPLETED: Update league standings if league match
TEAM_DELETED: Remove team from active leagues
MATCH_DISPUTED: Freeze standings pending resolution
```

**Dependencies:**
- Database: PostgreSQL (leagues, league_teams tables)
- Team Service: Validate team existence
- Match Service: Create league matches
- Message Queue: Event publishing/subscribing
- Redis: Cache standings

### Development Constraints
- Fixture generation must avoid conflicts
- Standings calculation must be deterministic
- Support multiple point systems (configurable)
- Handle mid-season team withdrawals
- Implement round-robin algorithm
- Cache standings for performance

### File Structure
```
services/league-service/
├── src/
│   ├── controllers/
│   │   ├── league.controller.ts
│   │   ├── registration.controller.ts
│   │   ├── fixture.controller.ts
│   │   └── standings.controller.ts
│   ├── models/
│   │   ├── league.model.ts
│   │   ├── leagueTeam.model.ts
│   │   └── fixture.model.ts
│   ├── services/
│   │   ├── league.service.ts
│   │   ├── fixture.service.ts
│   │   ├── standings.service.ts
│   │   └── season.service.ts
│   ├── algorithms/
│   │   ├── roundRobin.ts
│   │   ├── scheduling.ts
│   │   └── tiebreaker.ts
│   ├── validators/
│   │   └── league.validators.ts
│   └── app.ts
├── tests/
├── Dockerfile
└── package.json
```

### Fixture Generation Algorithm
```typescript
interface FixtureConfig {
  type: 'single' | 'double' // Single or home/away
  startDate: Date
  endDate: Date
  matchesPerWeek: number
  avoidDates: Date[] // Holidays, etc.
}

// Must generate balanced schedule
// Each team plays equal home/away matches
// No team plays twice in same gameweek
```

### Standings Calculation
```typescript
interface StandingsEntry {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string // Last 5 matches (W/D/L)
  position: number
}

// Tiebreaker rules (configurable):
// 1. Points
// 2. Goal difference
// 3. Goals scored
// 4. Head-to-head record
// 5. Alphabetical (last resort)
```

### Acceptance Criteria
1. League CRUD with validation
2. Team registration with limits
3. Automatic fixture generation
4. Real-time standings updates
5. Support for multiple seasons
6. Configurable point systems
7. Historical data preservation
8. 85% test coverage

### Performance Requirements
- Standings calculation: < 100ms for 20 teams
- Fixture generation: < 500ms for full season
- Standings retrieval: < 50ms (cached)
- Support 100 concurrent leagues

### Session Time Allocation
- League management: 20 minutes
- Fixture generation algorithm: 30 minutes
- Standings calculation: 25 minutes
- Event integration: 10 minutes
- Testing: 5 minutes