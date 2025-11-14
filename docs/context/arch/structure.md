# Architecture Structure

**Purpose:** Modular monolith folder structure and organization.

---

## Modular Monolith Strategy

**Key Principle:** Structured like microservices, runs as single Node.js process.

### Why Modular Monolith?
- ✅ Start fast with single deployment (monolith benefits)
- ✅ Clear service boundaries (microservices benefits)
- ✅ Easy local development, zero cloud costs
- ✅ Smooth migration path to microservices when scaling
- ✅ Each module is independently testable and maintainable
- ✅ Can extract services to containers later without rewrites

---

## Directory Structure

```
backend/
  ├── src/
  │   ├── services/           # Structured like microservices
  │   │   ├── user-service/
  │   │   │   ├── controllers/
  │   │   │   ├── models/
  │   │   │   ├── routes/
  │   │   │   ├── services/
  │   │   │   ├── validators/
  │   │   │   └── index.ts    # Service entry point
  │   │   ├── team-service/
  │   │   │   ├── controllers/
  │   │   │   ├── models/
  │   │   │   ├── routes/
  │   │   │   └── index.ts
  │   │   ├── match-service/
  │   │   │   └── ... (same structure)
  │   │   └── stats-service/
  │   │       └── ... (same structure)
  │   ├── shared/             # Shared utilities
  │   │   ├── database/       # DB connection & migrations
  │   │   ├── middleware/     # Auth, validation, error handling
  │   │   ├── types/          # TypeScript interfaces
  │   │   ├── utils/          # Helper functions
  │   │   └── config/         # Environment config
  │   ├── api-gateway/        # Optional: route aggregation
  │   │   └── routes.ts       # Maps routes to services
  │   └── app.ts              # Main application entry
  ├── tests/
  │   ├── unit/
  │   └── integration/
  ├── docker-compose.yml      # Local PostgreSQL, Redis
  ├── Dockerfile              # Single container (for now)
  ├── package.json
  └── tsconfig.json
```

---

## Service Module Pattern

Each service follows this structure:

```
service-name/
  ├── controllers/       # HTTP request handlers
  ├── models/           # Data models (DB queries)
  ├── routes/           # Express routes
  ├── services/         # Business logic
  ├── validators/       # Input validation schemas
  └── index.ts          # Service entry (exports routes)
```

---

## Import Conventions

```typescript
// Absolute imports for shared modules
import { db } from '@shared/database';
import { authMiddleware } from '@shared/middleware';
import { UserType } from '@shared/types';

// Relative imports within same service
import { UserController } from './controllers/user.controller';
import { UserModel } from './models/user.model';
```

---

## File Naming Conventions

- Controllers: `*.controller.ts` (e.g., `auth.controller.ts`)
- Routes: `*.routes.ts` (e.g., `user.routes.ts`)
- Models: `*.model.ts` (e.g., `user.model.ts`)
- Services: `*.service.ts` (e.g., `auth.service.ts`)
- Validators: `*.validator.ts` (e.g., `user.validator.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Utilities: `*.util.ts`
- Types: `*.types.ts` or `*.interface.ts`

---

**Key Benefit:** Easy extraction to separate services when needed. Just move folder to its own repo!
