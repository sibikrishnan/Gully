# Gully Project Structure

**Architecture:** Modular Monolith (Hybrid Approach)
**Last Updated:** Week 1, Day 1

## Overview
This project follows a **modular monolith** architecture where each service is structured like a microservice but runs in a single Node.js process. This enables fast development while maintaining a clear migration path to distributed microservices when needed.

---

## Directory Structure

```
gully/
├── .claude/                        # Claude Code configuration
│   ├── .claude.md                  # Project context (auto-loaded)
│   └── settings.local.json         # Permissions & settings
│
├── backend/                        # Main application
│   ├── src/
│   │   ├── services/               # Service modules (microservice-like)
│   │   │   ├── user-service/
│   │   │   │   ├── controllers/    # Request handlers
│   │   │   │   ├── models/         # Data models (TypeORM/Sequelize)
│   │   │   │   ├── routes/         # Express routes
│   │   │   │   ├── services/       # Business logic
│   │   │   │   ├── validators/     # Input validation schemas
│   │   │   │   └── index.ts        # Service entry point
│   │   │   │
│   │   │   ├── team-service/
│   │   │   │   └── ... (same structure)
│   │   │   │
│   │   │   ├── match-service/
│   │   │   │   └── ... (same structure)
│   │   │   │
│   │   │   └── stats-service/
│   │   │       └── ... (same structure)
│   │   │
│   │   ├── shared/                 # Shared utilities
│   │   │   ├── database/           # DB connection, migrations
│   │   │   ├── middleware/         # Auth, error handling, logging
│   │   │   ├── types/              # TypeScript interfaces
│   │   │   ├── utils/              # Helper functions
│   │   │   └── config/             # Environment configuration
│   │   │
│   │   ├── api-gateway/            # Route aggregation (optional)
│   │   │   └── routes.ts           # Maps /api/users → user-service
│   │   │
│   │   └── app.ts                  # Main application entry
│   │
│   ├── tests/
│   │   ├── unit/                   # Unit tests per service
│   │   └── integration/            # Integration tests
│   │
│   ├── docker-compose.yml          # Local PostgreSQL, Redis
│   ├── Dockerfile                  # Single container (Phase 1)
│   ├── package.json                # Dependencies
│   ├── tsconfig.json               # TypeScript config
│   └── .env.example                # Environment variables template
│
├── frontend/                       # Web/Mobile app
│   └── (To be created in Week 2-3)
│
├── infrastructure/                 # DevOps configs
│   ├── docker/                     # Future: individual service Dockerfiles
│   ├── terraform/                  # Future: cloud infrastructure
│   └── kubernetes/                 # Future: K8s manifests
│
├── docs/                           # Project documentation
│   ├── PROJECT_PLAN.md             # High-level vision
│   ├── ROADMAP.md                  # Development timeline
│   ├── FEATURES.md                 # Feature specifications
│   ├── ARCHITECTURE.md             # Technical architecture
│   ├── DATABASE_SCHEMA.md          # Database design
│   ├── API_ENDPOINTS.md            # API documentation
│   ├── parallel-development/       # Microservices briefs
│   │   └── briefs/
│   │       ├── UserService-Brief.md
│   │       ├── TeamService-Brief.md
│   │       ├── MatchService-Brief.md
│   │       ├── LeagueService-Brief.md
│   │       ├── TournamentService-Brief.md
│   │       └── StatsService-Brief.md
│   └── prompt/                     # AI prompts & context
│
├── README.md                       # Project overview
└── PROJECT_STRUCTURE.md            # This file

```

---

## Service Boundaries

### User Service
**Responsibility:** Authentication, user profiles, sports preferences
**Endpoints:** `/api/auth/*`, `/api/users/*`
**Dependencies:** None (foundational service)

### Team Service
**Responsibility:** Team management, invitations, roster
**Endpoints:** `/api/teams/*`
**Dependencies:** User Service (validates user IDs)

### Match Service
**Responsibility:** Challenges, scheduling, results
**Endpoints:** `/api/challenges/*`, `/api/matches/*`
**Dependencies:** User Service, Team Service

### Stats Service
**Responsibility:** Statistics, leaderboards, analytics
**Endpoints:** `/api/stats/*`
**Dependencies:** User Service, Match Service

---

## How It Works (Phase 1: Modular Monolith)

### Single Process Architecture
```javascript
// backend/src/app.ts
import express from 'express';
import userService from './services/user-service';
import teamService from './services/team-service';
import matchService from './services/match-service';
import statsService from './services/stats-service';

const app = express();

// All services run in same process
app.use('/api/auth', userService.routes.auth);
app.use('/api/users', userService.routes.users);
app.use('/api/teams', teamService.routes);
app.use('/api/matches', matchService.routes);
app.use('/api/stats', statsService.routes);

app.listen(3000);
```

### Shared Database Connection
```javascript
// backend/src/shared/database/connection.ts
import { Pool } from 'pg';

// All services share same DB connection
export const db = new Pool({
  host: 'localhost',
  database: 'gully_dev',
  port: 5432
});
```

---

## Migration Path to Microservices

### Phase 1: Modular Monolith (Current)
- ✅ All services in one process
- ✅ Shared database connection
- ✅ Local development only
- ✅ Single Dockerfile

### Phase 2: Containerized Services (Future)
Each service gets own Dockerfile:
```yaml
# docker-compose.yml
services:
  user-service:
    build: ./backend/services/user-service
    ports: ["3001:3000"]

  team-service:
    build: ./backend/services/team-service
    ports: ["3002:3000"]

  match-service:
    build: ./backend/services/match-service
    ports: ["3003:3000"]
```

### Phase 3: Cloud Microservices (Post-Funding)
- Deploy to AWS ECS/Fargate
- Separate databases per service
- API Gateway (AWS API Gateway or Kong)
- Message queue (SQS, RabbitMQ)
- Service mesh (optional)

---

## Development Workflow

### 1. Working on User Service
```bash
cd backend
npm run dev  # Starts all services

# Edit files in:
# backend/src/services/user-service/controllers/auth.controller.ts
# backend/src/services/user-service/routes/auth.routes.ts

# Tests
npm run test:unit -- user-service
npm run test:integration -- user-service
```

### 2. Adding New Service
```bash
mkdir -p backend/src/services/new-service/{controllers,models,routes,services,validators}

# Copy structure from existing service
# Update app.ts to import new service routes
```

### 3. Shared Utilities
```bash
# Edit shared code:
backend/src/shared/middleware/auth.middleware.ts
backend/src/shared/utils/jwt.utils.ts

# Imported by all services
```

---

## Benefits of This Approach

### ✅ Start Fast (Monolith Benefits)
- Single `npm start` command
- Easy debugging (one process)
- Shared code (no duplication)
- Fast iteration

### ✅ Scale Later (Microservices Benefits)
- Clear service boundaries
- Independent testing per service
- Easy extraction to containers
- Migration path to cloud

### ✅ Learn Both Paradigms
- Understand monolith simplicity
- Practice microservice patterns
- Gradual complexity increase

---

## Key Conventions

### File Naming
- Controllers: `*.controller.ts` (e.g., `auth.controller.ts`)
- Routes: `*.routes.ts` (e.g., `user.routes.ts`)
- Models: `*.model.ts` (e.g., `user.model.ts`)
- Services: `*.service.ts` (e.g., `auth.service.ts`)
- Validators: `*.validator.ts` (e.g., `user.validator.ts`)

### Import Paths
```typescript
// Use absolute imports from shared
import { db } from '@shared/database';
import { authMiddleware } from '@shared/middleware';
import { UserType } from '@shared/types';

// Relative imports within service
import { UserController } from './controllers/user.controller';
import { UserModel } from './models/user.model';
```

### API Routes
- User Service: `/api/auth/*`, `/api/users/*`
- Team Service: `/api/teams/*`
- Match Service: `/api/challenges/*`, `/api/matches/*`
- Stats Service: `/api/stats/*`, `/api/leaderboard/*`

---

## Next Steps

See `.claude/.claude.md` for Week 1 detailed plan:
1. ✅ **Day 1:** Create project structure (DONE)
2. **Day 2:** Database setup (PostgreSQL via Docker)
3. **Day 3:** Auth foundation (Passport.js)
4. **Day 4:** User service implementation
5. **Day 5:** Team service scaffold
6. **Day 6:** Docker Compose setup
7. **Day 7:** Testing framework + Weekly review

---

**Last Updated:** Week 1, Day 1
**Next Update:** After Day 7 review
