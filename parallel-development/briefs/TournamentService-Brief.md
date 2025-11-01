# Tournament Service Development Brief
## Claude Instance: C2

### Mission
Develop the Tournament Service microservice handling tournament brackets, progression, and various tournament formats.

### Service Responsibility
- Tournament creation with multiple formats
- Bracket generation and seeding
- Match progression and elimination
- Tournament state management
- Winner determination

### Interface Contract
**Provides:**
```typescript
// REST Endpoints
GET    /tournaments                      // List tournaments
POST   /tournaments                      // Create tournament
GET    /tournaments/:id                 // Get tournament details
PUT    /tournaments/:id                 // Update settings
POST   /tournaments/:id/register        // Register participant
GET    /tournaments/:id/bracket         // Get current bracket
POST   /tournaments/:id/bracket/generate // Generate bracket
PUT    /tournaments/:id/matches/:matchId // Update match result
GET    /tournaments/:id/standings       // Get current standings (round-robin)
PUT    /tournaments/:id/advance         // Advance to next round
PUT    /tournaments/:id/complete        // Complete tournament
```

**Events Emitted:**
```typescript
interface TournamentEvents {
  TOURNAMENT_CREATED: { tournamentId: string, format: string, maxParticipants: number }
  PARTICIPANT_REGISTERED: { tournamentId: string, participantId: string, seed?: number }
  BRACKET_GENERATED: { tournamentId: string, rounds: number, matches: object[] }
  TOURNAMENT_MATCH_SCHEDULED: { tournamentId: string, matchId: string, round: number }
  PARTICIPANT_ADVANCED: { tournamentId: string, participantId: string, nextRound: number }
  PARTICIPANT_ELIMINATED: { tournamentId: string, participantId: string, finalPosition: number }
  TOURNAMENT_COMPLETED: { tournamentId: string, winner: string, finalStandings: object[] }
}
```

**Consumes Events:**
```typescript
MATCH_COMPLETED: Progress tournament bracket if tournament match
TEAM_DELETED: Handle participant withdrawal
USER_DELETED: Handle participant withdrawal
```

**Dependencies:**
- Database: PostgreSQL (tournaments, tournament_participants tables)
- MongoDB: Store bracket structure (flexible schema)
- Match Service: Create tournament matches
- Team/User Service: Validate participants
- Message Queue: Event publishing/subscribing

### Development Constraints
- Support multiple tournament formats
- Maintain bracket integrity
- Handle byes for uneven participants
- Support reseeding between rounds
- Preserve bracket history
- Handle participant withdrawals gracefully

### File Structure
```
services/tournament-service/
├── src/
│   ├── controllers/
│   │   ├── tournament.controller.ts
│   │   ├── registration.controller.ts
│   │   ├── bracket.controller.ts
│   │   └── progression.controller.ts
│   ├── models/
│   │   ├── tournament.model.ts
│   │   ├── participant.model.ts
│   │   └── bracket.model.ts
│   ├── services/
│   │   ├── tournament.service.ts
│   │   ├── bracket.service.ts
│   │   ├── seeding.service.ts
│   │   └── progression.service.ts
│   ├── formats/
│   │   ├── singleElimination.ts
│   │   ├── doubleElimination.ts
│   │   ├── roundRobin.ts
│   │   ├── swiss.ts
│   │   └── formatInterface.ts
│   ├── validators/
│   │   └── tournament.validators.ts
│   └── app.ts
├── tests/
├── Dockerfile
└── package.json
```

### Tournament Formats
```typescript
interface TournamentFormat {
  generateBracket(participants: Participant[]): Bracket
  progressRound(bracket: Bracket, matchResults: MatchResult[]): Bracket
  determineStandings(bracket: Bracket): Standing[]
  isComplete(bracket: Bracket): boolean
}

// Single Elimination
class SingleElimination implements TournamentFormat {
  // Powers of 2, byes for higher seeds
  // Winner advances, loser eliminated
}

// Double Elimination
class DoubleElimination implements TournamentFormat {
  // Winners bracket + Losers bracket
  // Two losses to be eliminated
  // Grand finals from both brackets
}

// Round Robin
class RoundRobin implements TournamentFormat {
  // Everyone plays everyone
  // Points-based standings
}

// Swiss System
class SwissSystem implements TournamentFormat {
  // Paired by similar records
  // Fixed number of rounds
  // No eliminations
}
```

### Bracket Structure (MongoDB)
```javascript
{
  tournamentId: "uuid",
  format: "single_elimination",
  rounds: [
    {
      roundNumber: 1,
      matches: [
        {
          matchId: "uuid",
          position: 1,
          participant1: { id: "uuid", seed: 1 },
          participant2: { id: "uuid", seed: 16 },
          winner: null,
          status: "pending"
        }
      ]
    }
  ],
  metadata: {
    totalRounds: 4,
    currentRound: 1,
    participantsRemaining: 16
  }
}
```

### Acceptance Criteria
1. All four tournament formats functional
2. Proper seeding and bye handling
3. Bracket visualization data structure
4. Automatic progression on match completion
5. Withdrawal handling without bracket corruption
6. Position tracking for all participants
7. Historical bracket preservation
8. 85% test coverage

### Performance Requirements
- Bracket generation: < 200ms for 64 participants
- Match progression: < 150ms
- Bracket retrieval: < 100ms
- Support 50 concurrent tournaments

### Session Time Allocation
- Tournament setup: 15 minutes
- Format implementations: 35 minutes
- Bracket generation: 20 minutes
- Progression logic: 15 minutes
- Testing: 5 minutes