# Team Service Development Brief
## Claude Instance: A2

### Mission
Develop the Team Service microservice independently as part of the Gully sports platform.

### Service Responsibility
- Team creation and management
- Team member invitations and roster management
- Captain role management
- Team statistics aggregation
- Team search and discovery

### Interface Contract
**Provides:**
```typescript
// REST Endpoints
GET    /teams                    // List teams with filters
POST   /teams                    // Create new team
GET    /teams/:id               // Get team details
PUT    /teams/:id               // Update team info
DELETE /teams/:id               // Delete team
POST   /teams/:id/members       // Add team member
DELETE /teams/:id/members/:userId // Remove member
GET    /teams/:id/stats         // Get team statistics
POST   /teams/:id/invite        // Send invitation
PUT    /teams/:id/captain       // Transfer captaincy
```

**Events Emitted:**
```typescript
interface TeamEvents {
  TEAM_CREATED: { teamId: string, captainId: string, sport: string }
  TEAM_UPDATED: { teamId: string, changes: object }
  TEAM_DELETED: { teamId: string }
  MEMBER_ADDED: { teamId: string, userId: string, role: string }
  MEMBER_REMOVED: { teamId: string, userId: string }
  CAPTAIN_CHANGED: { teamId: string, oldCaptainId: string, newCaptainId: string }
  INVITATION_SENT: { teamId: string, invitedUserId: string }
}
```

**Consumes Events:**
```typescript
USER_DELETED: Remove user from all teams
USER_UPDATED: Update cached user info in team rosters
```

**Dependencies:**
- Database: PostgreSQL (teams, team_members tables)
- User Service: For user validation (via API)
- Message Queue: Event publishing/subscribing
- Cache: Redis for team data caching

### Development Constraints
- Cannot directly access user database tables
- Must validate user existence via User Service API
- Team operations must be atomic
- Implement optimistic locking for concurrent updates
- Maximum team size configurable per sport

### File Structure
```
services/team-service/
├── src/
│   ├── controllers/
│   │   ├── team.controller.ts
│   │   ├── member.controller.ts
│   │   └── invitation.controller.ts
│   ├── models/
│   │   ├── team.model.ts
│   │   └── teamMember.model.ts
│   ├── routes/
│   │   └── team.routes.ts
│   ├── services/
│   │   ├── team.service.ts
│   │   ├── member.service.ts
│   │   └── invitation.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── captain.middleware.ts
│   ├── validators/
│   │   └── team.validators.ts
│   ├── events/
│   │   ├── publisher.ts
│   │   └── subscriber.ts
│   └── app.ts
├── tests/
├── Dockerfile
├── package.json
└── README.md
```

### Acceptance Criteria
1. Team CRUD operations with proper authorization
2. Only captain can update team or remove members
3. Invitation system with expiry
4. Roster limits enforced by sport
5. Event publishing for all state changes
6. 95% unit test coverage
7. Integration tests for critical paths
8. Graceful handling of User Service unavailability

### Performance Requirements
- Team creation: < 200ms
- Member addition: < 150ms
- Team listing: < 300ms with pagination
- Support 1000 concurrent operations

### Session Time Allocation
- Initial setup and boilerplate: 20 minutes
- Core CRUD implementation: 30 minutes
- Member management: 20 minutes
- Event integration: 15 minutes
- Testing: 5 minutes