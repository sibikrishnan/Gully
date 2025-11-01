# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gully** is a sports challenge platform MVP for connecting athletes and teams for casual and competitive matches. Built as a zero-cost MVP using a modular monolith architecture that can evolve into microservices.

**Timeline:** 12 weeks (90 min/day) | **Budget:** $0 MVP | **Current Status:** Week 1 Foundation Phase

## Critical Constraints

- **Solo developer** with MacBook + Claude Pro plan
- **Zero cloud budget** until validation/funding
- **90 minutes daily** development time
- **Local-first development** - all services run via Docker Compose on MacBook
- **Modular monolith** architecture (NOT distributed microservices yet)

## Architecture

### Modular Monolith Strategy
The project is structured like microservices but runs as a single Node.js process. Each service module has clear boundaries and can be extracted to separate containers later.

```
backend/src/
├── services/           # Service modules (microservice-like structure)
│   ├── user-service/   # Auth, profiles
│   ├── team-service/   # Team management
│   ├── match-service/  # Challenges, matches
│   └── stats-service/  # Statistics, leaderboard
├── shared/             # Shared utilities
│   ├── database/       # DB connection, migrations
│   ├── middleware/     # Auth, validation, error handling
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helper functions
│   └── config/         # Environment configuration
└── app.ts              # Main entry point (imports all services)
```

**Key Principle:** Structured like microservices, runs as monolith. Easy migration to containers later.

## Tech Stack

### Backend
- **Runtime:** Node.js + Express (TypeScript)
- **Database:** PostgreSQL via Docker Compose (local)
- **Cache:** Redis via Docker Compose (local)
- **Auth:** Passport.js + JWT (self-hosted)

### Frontend (Week 3+)
- **Web:** Next.js (demo-first, no app store delays)
- **Mobile:** React Native + Expo (later)

### Infrastructure
- **Development:** Docker Compose on MacBook
- **Hosting:** Render/Railway free tiers (when ready)
- **Demo:** ngrok for local tunneling

### Forbidden Until Funded
- AWS services beyond free tier
- Auth0, Firebase Auth (paid tiers)
- Stripe, SendGrid, Twilio, Mux
- Any monthly subscription services
- Kubernetes, complex orchestration

## Development Commands

### Docker Services
```bash
# Start PostgreSQL and Redis
cd backend
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f

# Stop services (data persists)
docker compose stop

# Stop and remove containers
docker compose down
```

### Database
```bash
# Run migrations (when implemented)
npm run migrate:latest

# Rollback migrations
npm run migrate:rollback

# Seed test data
npm run seed:run

# Direct PostgreSQL access
psql -h localhost -U gully_user -d gully_dev
# Password: gully_password
```

### Development
```bash
# Install dependencies
cd backend
npm install

# Start development server (when implemented)
npm run dev

# Run tests
npm test
npm run test:unit
npm run test:integration

# Type checking
npm run type-check

# Linting
npm run lint
```

## Service Boundaries

### User Service
- **Responsibility:** Authentication, user profiles, sports preferences
- **Endpoints:** `/api/auth/*`, `/api/users/*`
- **Dependencies:** None (foundational service)

### Team Service
- **Responsibility:** Team management, invitations, roster
- **Endpoints:** `/api/teams/*`
- **Dependencies:** User Service (validates user IDs)

### Match Service
- **Responsibility:** Challenges, scheduling, results submission
- **Endpoints:** `/api/challenges/*`, `/api/matches/*`
- **Dependencies:** User Service, Team Service

### Stats Service
- **Responsibility:** Statistics, leaderboards, analytics
- **Endpoints:** `/api/stats/*`
- **Dependencies:** User Service, Match Service

## Database Schema

### PostgreSQL Tables
- **users** - User accounts, profiles, authentication
- **user_sports** - User sport preferences and skill levels
- **teams** - Team information and metadata
- **team_members** - Team membership and roles
- **challenges** - Challenge requests between users/teams
- **matches** - Scheduled and completed matches
- **leagues** - League/season management (future)
- **tournaments** - Tournament brackets (future)
- **notifications** - User notifications
- **friendships** - User connections

### Redis Usage
- Session management (`session:{user_id}`)
- Caching user/team objects (TTL: 1 hour)
- Leaderboards (sorted sets)
- Rate limiting counters
- Real-time presence tracking

See `docs/DATABASE_SCHEMA.md` for complete schema details.

## MVP Scope - Phase 1 Only

### In Scope (Must Have)
1. User auth (email/password signup/login)
2. User profiles (name, avatar, bio, sports)
3. Team creation & member management
4. Challenge system (send/accept/decline)
5. Match scheduling & result submission
6. Basic stats (win/loss, match history)
7. Simple leaderboard

### Out of Scope (Defer to v2+)
- Leagues & tournaments (skip for MVP)
- Video highlights (too complex)
- Marketplace (not core)
- Social feed/following (nice-to-have)
- Push notifications (use email instead)
- Advanced analytics (basic stats only)
- Payment processing (manual initially)
- Mobile apps (web first for faster demos)

## Development Principles

### 1. Local-First Development
All development runs on MacBook. No cloud dependencies for MVP. Docker Compose for all services.

### 2. Monolith Strategy
Single codebase with modular folders. Easier debugging. Lower overhead. Refactor to microservices later when needed.

### 3. Pragmatic MVP
Ship working features > perfect architecture. Manual processes OK. Technical debt acceptable if it delivers value.

### 4. Avoid Hallucinations
- Verify every AI suggestion before accepting
- Test immediately after code generation
- Question unnecessary complexity
- Trust but verify always

### 5. Cost Consciousness
Challenge any tool/service that costs money. Use free tiers and open source. Delay paid services until revenue/funding.

## Anti-Patterns to Avoid

### Premature Microservices
- **Wrong:** 6 separate services for 0 users
- **Right:** Modular monolith with clear service boundaries

### Complex Infrastructure
- **Wrong:** Kubernetes, message queues, event buses for MVP
- **Right:** Docker Compose locally, simple hosting for demo

### Paid Services Too Early
- **Wrong:** Monthly costs before validation
- **Right:** Free tiers, self-hosted, manual processes

### Building for Scale
- **Wrong:** Optimizing for 1M users at 0 users
- **Right:** Build for 100 users, refactor when proven

### Over-Engineering
- **Wrong:** Perfect abstraction layers, complex patterns
- **Right:** Simple, working code that solves the problem

## File Naming Conventions

- Controllers: `*.controller.ts` (e.g., `auth.controller.ts`)
- Routes: `*.routes.ts` (e.g., `user.routes.ts`)
- Models: `*.model.ts` (e.g., `user.model.ts`)
- Services: `*.service.ts` (e.g., `auth.service.ts`)
- Validators: `*.validator.ts` (e.g., `user.validator.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

## Import Conventions

```typescript
// Use absolute imports for shared modules
import { db } from '@shared/database';
import { authMiddleware } from '@shared/middleware';
import { UserType } from '@shared/types';

// Use relative imports within same service
import { UserController } from './controllers/user.controller';
import { UserModel } from './models/user.model';
```

## When Working on This Project

### Before Suggesting Solutions
1. **Does this cost money?** → Challenge if yes, suggest free alternatives
2. **Is this over-engineered?** → Simplify for MVP, defer complexity
3. **Can we test this immediately?** → Ensure code is testable
4. **Do we need this for v1?** → Defer if not core functionality
5. **Is there a simpler approach?** → Always seek simplicity

### When Adding Features
1. Identify which service module it belongs to
2. Add routes, controllers, models within that service folder
3. Use shared utilities from `backend/src/shared/`
4. Write tests in `backend/tests/`
5. Update API documentation if adding endpoints

### When Debugging
- Check Docker container logs: `docker compose logs -f`
- Verify database connection: `psql -h localhost -U gully_user -d gully_dev`
- Check Redis: `redis-cli -h localhost -p 6379 PING`
- Review environment variables in `backend/.env`

## Migration Path

### Phase 1: Modular Monolith (Current)
- All services in one Node.js process
- Shared database connection
- Single deployment
- Fast iteration

### Phase 2: Containerized Services (Future)
- Each service gets own Dockerfile
- docker-compose orchestrates multiple containers
- Still runs locally or on single server
- Service-to-service HTTP calls

### Phase 3: Cloud Microservices (Post-Funding)
- Deploy to AWS ECS/Fargate
- Separate databases per service
- API Gateway, message queues
- Full distributed architecture

## Key Documentation

- **README.md** - Project overview and quick start
- **PROJECT_STRUCTURE.md** - Detailed directory structure
- **docs/ARCHITECTURE.md** - Technical architecture details
- **docs/DATABASE_SCHEMA.md** - Complete database schema
- **docs/API_ENDPOINTS.md** - API documentation
- **docs/WEEK1_TASKS.md** - Week 1 implementation tasks
- **infrastructure/SETUP.md** - Infrastructure setup guide
- **.claude/.claude.md** - Detailed project context (auto-loaded)

## Success Metrics (Week 12 Checkpoint)

### Technical
- Deployed on free hosting (Render/Railway)
- 5 core features working end-to-end
- Zero monthly costs
- <500ms API response times
- Mobile-responsive web app

### Learning
- Mastered Claude Code workflow
- Can debug AI code independently
- 20+ documented reusable patterns
- 50% token usage reduction from week 1

### Product
- Full demo flow: signup → challenge → match → results
- 10+ test users completed flows
- Feedback collected for v2
- Investor-ready demo

## Key Mantras

1. **"Zero cost until validated"** - No paid services without users
2. **"Modular monolith, always"** - Service structure, single process
3. **"Ship, then polish"** - Working beats perfect
4. **"Verify everything"** - Trust but test AI code
5. **"Learn by building"** - Understanding over speed
6. **"Local-first forever"** - MacBook is the datacenter

---

**Last Updated:** Week 1, Day 1
**Next Review:** End of Week 1 (Day 7)
