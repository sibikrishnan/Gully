# Match Service Development Brief
## Claude Instance: B1

### Mission
Develop the Match Service microservice handling all match-related operations including challenges, scheduling, and result management.

### Service Responsibility
- Challenge creation and management
- Match scheduling and coordination
- Result submission and verification
- Match status tracking
- Dispute resolution workflow

### Interface Contract
**Provides:**
```typescript
// REST Endpoints
GET    /challenges                 // List challenges (sent/received)
POST   /challenges                 // Create new challenge
GET    /challenges/:id            // Get challenge details
PUT    /challenges/:id/accept     // Accept challenge
PUT    /challenges/:id/decline    // Decline challenge
DELETE /challenges/:id            // Cancel challenge

GET    /matches                   // List matches
GET    /matches/:id              // Get match details
POST   /matches/:id/result       // Submit match result
PUT    /matches/:id/verify       // Verify result
POST   /matches/:id/dispute      // Raise dispute
GET    /matches/:id/timeline     // Get match events timeline
```

**Events Emitted:**
```typescript
interface MatchEvents {
  CHALLENGE_CREATED: { challengeId: string, challengerId: string, challengedId: string }
  CHALLENGE_ACCEPTED: { challengeId: string, matchId: string }
  CHALLENGE_DECLINED: { challengeId: string, reason?: string }
  MATCH_SCHEDULED: { matchId: string, datetime: Date, teams: string[] }
  RESULT_SUBMITTED: { matchId: string, submittedBy: string, score: object }
  RESULT_VERIFIED: { matchId: string, winner: string }
  MATCH_DISPUTED: { matchId: string, disputeReason: string }
  MATCH_COMPLETED: { matchId: string, finalScore: object }
}
```

**Consumes Events:**
```typescript
TEAM_DELETED: Cancel pending challenges for team
USER_DELETED: Cancel pending challenges for user
LEAGUE_MATCH_SCHEDULED: Create match from league fixture
TOURNAMENT_MATCH_SCHEDULED: Create match from tournament bracket
```

**Dependencies:**
- Database: PostgreSQL (challenges, matches tables)
- User Service: Validate user participants
- Team Service: Validate team participants
- Notification Service: Send match notifications
- Message Queue: Event publishing/subscribing

### Development Constraints
- Atomic state transitions for matches
- Both parties must verify results
- Implement time-based auto-cancellation
- Support both user vs user and team vs team matches
- Maintain audit trail for all state changes

### File Structure
```
services/match-service/
├── src/
│   ├── controllers/
│   │   ├── challenge.controller.ts
│   │   ├── match.controller.ts
│   │   └── result.controller.ts
│   ├── models/
│   │   ├── challenge.model.ts
│   │   ├── match.model.ts
│   │   └── matchResult.model.ts
│   ├── services/
│   │   ├── challenge.service.ts
│   │   ├── match.service.ts
│   │   ├── verification.service.ts
│   │   └── dispute.service.ts
│   ├── state-machines/
│   │   ├── challenge.state.ts
│   │   └── match.state.ts
│   ├── validators/
│   │   └── match.validators.ts
│   └── app.ts
├── tests/
├── Dockerfile
└── package.json
```

### State Management
```typescript
// Challenge States
enum ChallengeState {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// Match States
enum MatchState {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  RESULT_PENDING = 'result_pending',
  VERIFICATION_PENDING = 'verification_pending',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled'
}
```

### Acceptance Criteria
1. Challenge workflow with all state transitions
2. Double verification for match results
3. Automatic expiry for unaccepted challenges (48 hours)
4. Dispute escalation mechanism
5. Support for rescheduling
6. Notification triggers for all major events
7. Comprehensive audit logging
8. 90% test coverage

### Performance Requirements
- Challenge creation: < 150ms
- Result submission: < 200ms
- Match listing: < 250ms with pagination
- Support 5000 concurrent matches

### Session Time Allocation
- State machine setup: 25 minutes
- Challenge management: 25 minutes
- Match operations: 25 minutes
- Result verification: 10 minutes
- Testing: 5 minutes