# Technology Stack Details

**Purpose:** Complete tech stack with versions and rationale.

---

## Backend

### Runtime & Framework
- **Node.js:** v20+ LTS (latest stable)
- **Express.js:** v4.x (battle-tested, simple)
- **TypeScript:** v5.x (type safety, better DX)

### Database
- **PostgreSQL:** 15+ via Docker
  - Why: Mature, reliable, free, ACID guarantees
  - Alternatives rejected: MySQL (less features), MongoDB (not needed)
- **Redis:** 7+ via Docker
  - Why: Session management, caching, leaderboards
  - Alternatives rejected: Memcached (less features)

### ORM / Query Builder
- **Knex.js** or **node-pg-migrate**
  - Why: Simple migrations, raw SQL when needed
  - Alternatives rejected: Prisma (too opinionated), TypeORM (heavy)

### Authentication
- **Passport.js:** Local strategy
- **JWT:** jsonwebtoken package
- **bcrypt:** Password hashing
  - Why: Free, self-hosted, full control
  - Alternatives rejected: Auth0 (costs money), Firebase (vendor lock-in)

### Validation
- **Joi** or **Zod**
  - Why: Schema validation, TypeScript support
  - Alternatives rejected: express-validator (less powerful)

### Testing
- **Jest:** Unit & integration tests
- **Supertest:** HTTP endpoint testing
  - Why: Standard, great ecosystem
  - Alternatives rejected: Mocha/Chai (more config)

---

## Frontend (Future Phases)

### Web
- **Next.js:** 14+ (App Router)
  - Why: React framework, SSR, fast demos
  - Alternatives rejected: Create React App (deprecated), Vite (less integrated)

### Mobile (Later)
- **React Native:** Latest stable
- **Expo:** Managed workflow
  - Why: Fast iteration, no Xcode/Android Studio needed initially
  - Alternatives rejected: Flutter (different language), native (too slow)

### State Management
- **React Query** (TanStack Query)
  - Why: Server state management, caching
- **Zustand**
  - Why: Simple client state, lightweight
  - Alternatives rejected: Redux (too complex), Context (performance)

### Styling
- **Tailwind CSS:** v3+
  - Why: Utility-first, fast prototyping, small bundle
  - Alternatives rejected: Bootstrap (too opinionated), styled-components (runtime cost)

### Forms
- **React Hook Form**
  - Why: Performant, minimal re-renders
  - Alternatives rejected: Formik (heavier)

---

## Infrastructure

### Development
- **Docker Compose:** Local services
- **MacBook:** Primary development machine
  - Why: Zero cloud costs, fast iteration

### CI/CD
- **GitHub Actions:** Free tier
  - Why: Integrated with GitHub, free for public repos
  - Alternatives rejected: CircleCI/Travis (costs)

### Hosting (Deployment)
- **Render** or **Railway** or **Fly.io:** Free tiers
  - Why: Zero cost, easy deployment, generous free limits
  - Alternatives rejected: Heroku (removed free tier), AWS (complex, costs)

### Demo
- **ngrok:** Local tunneling for demos
  - Why: Free, temporary URL sharing
  - Alternatives rejected: localtunnel (less stable)

### Monitoring (MVP)
- **Simple logging:** console + file
- **Later:** Sentry (free tier for errors)
  - Why: Start simple, add complexity when needed
  - Alternatives rejected: Datadog/New Relic (expensive)

---

## ❌ FORBIDDEN Until Funded

### Paid Services
- AWS services beyond free tier
- Auth0, Firebase Auth (paid tiers)
- Stripe, SendGrid, Twilio, Mux
- Any monthly subscription services

### Complex Infrastructure
- Kubernetes (too complex for 0 users)
- Message queues (not needed yet)
- Service mesh (premature)
- Advanced monitoring (start simple)

---

## Local-First Development

**All services run via Docker Compose:**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
```

**No cloud dependencies for MVP:**
- PostgreSQL → Docker container (local)
- Redis → Docker container (local)
- File storage → Local filesystem
- Secrets → .env file (local)

**Benefits:**
- Zero costs
- Fast iteration (no network latency)
- Works offline
- Easy to reset/test

---

## Version Strategy

- **LTS versions:** Use Long-Term Support versions for Node.js, PostgreSQL
- **Latest stable:** Use latest stable for libraries (Tailwind, React, etc.)
- **Lock versions:** package-lock.json for reproducible builds
- **Update cadence:** Monthly check for security updates, quarterly for features

---

**Principle:** Boring technology, proven tools, zero costs until validated.
