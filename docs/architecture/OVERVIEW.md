# Architecture Overview

**Gully - Sports Challenge Platform**

This document provides a high-level overview of the system architecture. For detailed context, use the `/gullycontext` command to load specific sections on-demand.

---

## Quick Reference

### Active Development Context
For active development, load context sections using:
- `/gullycontext arch` - Architecture details (stack, services, structure, migration)
- `/gullycontext database` - Database schema (tables, indexes, Redis)
- `/gullycontext mvp` - MVP scope and timeline
- `/gullycontext workflow` - Development best practices
- `/gullycontext commands` - Development commands reference

**Source Files:** `.claude/context/` directory contains all up-to-date context sections.

### Architecture Documentation
- **[TASK_SYSTEM_DESIGN.md](TASK_SYSTEM_DESIGN.md)** - Task tracking system design
- **[CONTEXT_OPTIMIZATION_REPORT.md](CONTEXT_OPTIMIZATION_REPORT.md)** - Context optimization analysis
- **[INDEX.md](INDEX.md)** - Complete architecture docs navigator

### Archived
- **[FULL_CONTEXT.md](../archives/architecture/FULL_CONTEXT.md)** - Historical reference (outdated, use `.claude/context/` instead)

---

## System Architecture

### Strategy: Modular Monolith

**Core Principle:** Build as a modular monolith that can evolve into microservices when needed.

**Benefits:**
- ✅ Start fast with single deployment (monolith benefits)
- ✅ Clear service boundaries (microservices benefits)
- ✅ Easy local development, zero cloud costs
- ✅ Smooth migration path to microservices when scaling
- ✅ Each module is independently testable and maintainable

**Structure:**
```
services/backend/
  ├── src/
  │   ├── services/           # Service modules (user, team, match, stats)
  │   │   ├── user-service/   # Authentication & profiles
  │   │   ├── team-service/   # Team management
  │   │   ├── match-service/  # Match tracking (planned)
  │   │   └── stats-service/  # Statistics (planned)
  │   ├── shared/             # Shared utilities
  │   │   ├── database/       # PostgreSQL + migrations
  │   │   ├── middleware/     # Auth, validation, logging
  │   │   ├── types/          # TypeScript interfaces
  │   │   └── utils/          # Helper functions
  │   └── api-gateway/        # Future: route aggregation
  └── tests/                  # Unit + integration tests
```

---

## Technology Stack

### Backend (Current)
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Testing:** Jest
- **Authentication:** Passport.js + JWT

### Infrastructure (Local)
- **Containerization:** Docker + Docker Compose
- **Database Tools:** Knex.js (migrations, query builder)
- **Process Manager:** PM2 (production)

### Frontend (Week 3+)
- **Framework:** Next.js 14+ (planned)
- **Language:** TypeScript

For complete stack details: `/gullycontext arch/stack`

---

## Service Boundaries

### Week 1 Status: Foundation Complete

**✅ User Service** (Implemented)
- Responsibility: Authentication, user profiles, sports preferences
- Endpoints: `/api/auth/*`, `/api/users/*`
- Database Tables: `users`, `user_sports`
- Status: Production-ready with 90%+ test coverage

**⏳ Team Service** (Week 2)
- Responsibility: Team management, invitations, roster
- Endpoints: `/api/teams/*`
- Dependencies: User Service
- Database Tables: `teams`, `team_members`

**⏳ Match Service** (Weeks 5-6)
- Responsibility: Match tracking, score reporting
- Endpoints: `/api/matches/*`
- Dependencies: User Service, Team Service
- Database Tables: `matches`, `match_participants`

**⏳ Stats Service** (Weeks 9-10)
- Responsibility: Statistics aggregation, leaderboards
- Endpoints: `/api/stats/*`
- Dependencies: All services
- Database Tables: Aggregates from other tables + Redis

For complete service architecture: `/gullycontext arch/services`

---

## Database Architecture

### PostgreSQL Tables
- **users** - User accounts and authentication
- **user_sports** - Sports preferences (supports multiple sports per user)
- **teams** - Team information
- **team_members** - Team roster with roles
- **challenges** - Challenge definitions
- **matches** - Match results and tracking

### Redis Data Structures
- **Session Management** - JWT session storage
- **User Cache** - Frequently accessed user data
- **Leaderboards** - Sport-specific rankings (sorted sets)
- **Rate Limiting** - API rate limit tracking

For complete schema: `/gullycontext database`

---

## Migration Path to Microservices

### Current State: Modular Monolith
All services run in single Node.js process with shared database connection.

### Future: Service Extraction
When needed (100K+ users, service-specific scaling requirements):

**Phase 1: Service Separation**
- Extract each service to own Docker container
- Maintain shared PostgreSQL database
- Add API Gateway (Kong/Traefik)

**Phase 2: Database Separation**
- Split database by service boundaries
- Implement event-driven communication (RabbitMQ/Kafka)
- Add distributed tracing (OpenTelemetry)

**Phase 3: Independent Deployment**
- CI/CD per service
- Service mesh (Istio/Linkerd)
- Independent scaling policies

For complete migration plan: `/gullycontext arch/migration`

---

## Development Workflow

### Local Development
1. Start services: `docker-compose up -d`
2. Run migrations: `npm run migrate:latest`
3. Start dev server: `npm run dev`
4. Run tests: `npm test`

### Testing Strategy
- **Unit Tests:** Individual functions and utilities
- **Integration Tests:** API endpoints with test database
- **Coverage Target:** 90%+ for production code
- **TDD Approach:** Write tests first, then implementation

### Git Workflow
- **Main Branch:** `master` (production-ready)
- **Feature Branches:** `week1`, `week2`, etc. (weekly development)
- **Commit Style:** Conventional Commits format
- **Auto-Commit:** Enabled for completed todo items

For complete workflow: `/gullycontext workflow`

---

## Success Metrics (Week 12 MVP Goal)

### Technical
- ✅ 90%+ test coverage
- ✅ <100ms API response times
- ✅ Zero authentication vulnerabilities
- ✅ Fully documented API endpoints

### Product
- 🎯 Support 3 sports minimum (basketball, soccer, cricket)
- 🎯 10+ concurrent users without performance degradation
- 🎯 Complete user → team → challenge → match workflow

For complete metrics: `/gullycontext mvp/metrics`

---

## Documentation Structure

### Active Development
Use `.claude/context/` files (always up-to-date):
- `arch/` - Architecture patterns
- `database/` - Schema and data structures
- `mvp/` - Scope and timeline
- `workflow/` - Development best practices
- `commands/` - Command references

### Planning & API Reference
Use `docs/planning/`:
- `API_ENDPOINTS.md` - Complete API documentation
- `DATABASE_SCHEMA.md` - Detailed schema definitions
- `FEATURES.md` - Feature specifications
- `ROADMAP.md` - Development roadmap

### Service Implementation
Use `docs/service-briefs/`:
- Service briefs for each microservice (User, Team, Match, etc.)
- Implementation guides for Week 2+

---

## Quick Links

**Need to...**
- Understand the overall architecture? → You're reading it!
- Load specific context for development? → `/gullycontext [section]`
- See API endpoints? → `docs/planning/API_ENDPOINTS.md`
- Check database schema? → `docs/planning/DATABASE_SCHEMA.md`
- Review task system design? → `docs/architecture/TASK_SYSTEM_DESIGN.md`
- Navigate all architecture docs? → `docs/architecture/INDEX.md` (will be created)

---

**Last Updated:** 2025-11-06 (Structure Refactoring)
**Status:** Week 1 Complete, Week 2 Starting
**Branch:** `refactor/structure`
