# Gully Project - Full Context & Reference

**⚠️ REFERENCE ONLY - NOT ACTIVELY MAINTAINED**

**Purpose:** This file is kept for historical reference and offline viewing only.

**For active development:** Use individual context files via `/gullycontext` commands.

**Location of source files:** `.claude/context/{section}/{subsection}.md`

**How to load context:**
- `/gullycontext mvp/in-scope` - Load specific subsection (~50-200 lines)
- `/gullycontext arch` - Load all architecture files (~400 lines)
- See `/gullycontext` command documentation for full list

**Why separate files?**
- Token efficiency (load only what you need)
- Faster file reading
- Easier maintenance
- Granular context control

**Last synced:** Week 1 (this file may be outdated)

---

# [SECTION:ARCH] Architecture Details

## Modular Monolith Strategy

**Strategy:** Build as a **modular monolith** that can evolve into microservices when needed.

### Why Modular Monolith?
- ✅ Start fast with single deployment (monolith benefits)
- ✅ Clear service boundaries (microservices benefits)
- ✅ Easy local development, zero cloud costs
- ✅ Smooth migration path to microservices when scaling
- ✅ Each module is independently testable and maintainable
- ✅ Can extract services to containers later without rewrites

### The Best of Both Worlds
Each module (user, team, match, etc.) is:
- Structured like a microservice (own controllers, models, routes)
- Self-contained with clear interfaces
- But runs in the **same Node.js process** initially
- Can be extracted to separate Docker container when needed

### Detailed Structure
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

### Service Boundaries & Dependencies

#### User Service (Foundation)
- **Responsibility:** Authentication, user profiles, sports preferences
- **Endpoints:** `/api/auth/*`, `/api/users/*`
- **Dependencies:** None (foundational service)
- **Database Tables:** users, user_sports
- **Key Features:** Signup, login, JWT generation, profile management

#### Team Service
- **Responsibility:** Team management, invitations, roster
- **Endpoints:** `/api/teams/*`
- **Dependencies:** User Service (validates user IDs)
- **Database Tables:** teams, team_members
- **Key Features:** Create team, invite members, manage roster

#### Match Service
- **Responsibility:** Challenges, scheduling, results submission
- **Endpoints:** `/api/challenges/*`, `/api/matches/*`
- **Dependencies:** User Service, Team Service
- **Database Tables:** challenges, matches
- **Key Features:** Send challenge, accept/decline, schedule match, submit results

#### Stats Service
- **Responsibility:** Statistics, leaderboards, analytics
- **Endpoints:** `/api/stats/*`
- **Dependencies:** User Service, Match Service
- **Database Tables:** None (reads from matches, uses Redis for leaderboards)
- **Key Features:** Win/loss stats, match history, leaderboard rankings

### Migration Path to True Microservices

```
Phase 1: Modular Monolith (CURRENT - Week 1-12)
  ✓ Single Node.js process
  ✓ Shared database connection
  ✓ Single deployment
  ✓ Fast iteration
  ✓ Zero cloud costs

Phase 2: Containerized Services (POST-MVP)
  → Each service gets own Dockerfile
  → docker-compose orchestrates multiple containers
  → Still runs locally or on single server
  → Service-to-service HTTP calls
  → Shared database still acceptable

Phase 3: Cloud Microservices (POST-FUNDING)
  → Deploy to AWS ECS/Fargate or similar
  → Separate databases per service
  → API Gateway for routing
  → Message queues for async communication
  → Full distributed architecture
  → Service mesh (optional)
```

### Local-First Development
- All services run via **Docker Compose on MacBook**
- PostgreSQL + Redis in containers
- No cloud dependencies for MVP
- ngrok for demos when needed
- Free tier hosting (Render/Railway) for deployment

### Technology Stack Details

#### Backend
- **Runtime:** Node.js v20+ LTS
- **Framework:** Express.js v4.x
- **Language:** TypeScript v5.x
- **Database:** PostgreSQL 15+ via Docker
- **Cache:** Redis 7+ via Docker
- **ORM/Query Builder:** Knex.js or node-pg-migrate
- **Auth:** Passport.js + JWT
- **Validation:** Joi or Zod
- **Testing:** Jest + Supertest

#### Frontend (Week 3+)
- **Web:** Next.js 14+ (App Router)
- **Mobile:** React Native + Expo (later)
- **State Management:** React Query + Zustand
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form

#### Infrastructure
- **Development:** Docker Compose on MacBook
- **CI/CD:** GitHub Actions (free tier)
- **Hosting:** Render/Railway/Fly.io free tiers
- **Demo:** ngrok for local tunneling
- **Monitoring:** Simple logging (console + file)

[END SECTION:ARCH]

---

# [SECTION:MVP] MVP Scope & Timeline

## MVP Scope - Phase 1 ONLY

### ✅ IN SCOPE (Must Have)
1. **User Authentication**
   - Email/password signup
   - Login with JWT
   - Profile creation

2. **User Profiles**
   - Name, avatar, bio
   - Sports preferences (cricket/football)
   - Skill level selection

3. **Team Creation & Management**
   - Create team
   - Invite members via email
   - Accept/decline invitations
   - Manage roster (add/remove)

4. **Challenge System**
   - Send challenge (user-to-user or team-to-team)
   - Accept/decline challenge
   - Propose match date/time/location

5. **Match Scheduling**
   - Schedule confirmed match
   - Basic match details (date, time, location, sport)
   - Match status tracking

6. **Result Submission**
   - Submit match results
   - Simple verification (both teams confirm)
   - Win/loss/draw recording

7. **Basic Stats & Leaderboard**
   - Win/loss record
   - Match history
   - Simple leaderboard (by sport)

### ❌ OUT OF SCOPE (Defer to v2+)
- **Leagues & tournaments** - Too complex for MVP
- **Video highlights** - Storage costs and complexity
- **Marketplace** - Not core functionality
- **Social feed/following** - Nice-to-have
- **Push notifications** - Use email notifications instead
- **Advanced analytics** - Basic stats only
- **Payment processing** - Handle manually initially
- **Mobile apps** - Web-first for faster demos (no app store delays)
- **Live scoring** - Too complex, submit final results only
- **Chat/messaging** - Use email/external messaging
- **Referee management** - Manual for MVP

### Strategic Decisions
- **Single sport first:** Focus on Cricket OR Football (not both initially)
- **Web before mobile:** Faster demos, no app store approval delays
- **Manual admin:** Handle disputes/moderation manually
- **Email notifications only:** Avoid push notification infrastructure
- **Local storage:** Use filesystem before paid cloud storage
- **Simple UI:** Functional over fancy (Tailwind components)

## 12-Week MVP Timeline

### Weeks 1-2: Foundation ✅ CURRENT
**Goal:** Database, Docker, basic structure

**Week 1 Tasks:**
- Day 1: Modular monolith project structure
- Day 2: Docker Compose setup (PostgreSQL, Redis)
- Day 3: Database migrations framework
- Day 4: User & auth tables migration
- Day 5: Passport.js auth setup
- Day 6: Basic auth endpoints (signup/login)
- Day 7: Week review & token analysis

**Week 2 Tasks:**
- Day 8: User profile endpoints
- Day 9: User-sports relationship
- Day 10: JWT middleware
- Day 11: Auth testing
- Day 12: Team tables migration
- Day 13: Team service scaffolding
- Day 14: Week review

### Weeks 3-4: User & Team Features
**Goal:** Complete user/team management

- User profile CRUD endpoints
- Team creation endpoint
- Member invitation system
- Accept/decline invitations
- Team roster management
- Basic validation & error handling
- Unit tests for user/team services

### Weeks 5-6: Challenge System
**Goal:** Challenge flow working end-to-end

- Challenge creation flow
- Challenge accept/decline logic
- Match scheduling from challenge
- Challenge status tracking
- Notification system (email)
- Challenge history
- Integration tests

### Weeks 7-8: Match Management
**Goal:** Match lifecycle complete

- Match creation from challenge
- Result submission endpoints
- Verification workflow (both teams confirm)
- Match history view
- Match status updates
- Match cancellation
- Data validation & edge cases

### Weeks 9-10: Stats & Leaderboard
**Goal:** Stats calculation working

- Win/loss tracking per user
- Win/loss tracking per team
- Match history aggregation
- Leaderboard calculation (Redis sorted sets)
- Leaderboard API endpoints
- Stats caching strategy
- Performance testing

### Weeks 11-12: Launch Prep
**Goal:** Demo-ready deployment

- Bug fixes and polish
- Frontend basic UI (if not done)
- Deploy to Render/Railway
- Seed demo data
- Create demo accounts
- Investor demo script
- Documentation for handoff
- Week 12 final review

## Success Metrics (Week 12 Checkpoint)

### Technical Metrics
- ✅ Deployed on free hosting (Render/Railway)
- ✅ 5 core features working end-to-end
- ✅ Zero monthly costs
- ✅ <500ms API response times (P95)
- ✅ 80%+ test coverage on backend
- ✅ Mobile-responsive web app
- ✅ Zero critical security vulnerabilities

### Learning Metrics
- ✅ Mastered Claude Code workflow
- ✅ Can debug AI code independently
- ✅ 20+ documented reusable patterns
- ✅ 50% token usage reduction from week 1
- ✅ Understanding of full-stack architecture
- ✅ Deployment & DevOps basics

### Product Metrics
- ✅ Full demo flow: signup → profile → team → challenge → match → results → leaderboard
- ✅ 10+ test users completed flows
- ✅ Feedback collected for v2
- ✅ Investor-ready demo (5-min pitch)
- ✅ Clear roadmap for next phase

[END SECTION:MVP]

---

# [SECTION:DATABASE] Database Schema Details

## PostgreSQL Tables

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_sports
```sql
CREATE TABLE user_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL, -- 'cricket', 'football', etc.
  skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, sport)
);
```

### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  captain_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sport VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### team_members
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'captain', 'member'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'pending'
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

### challenges
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_type VARCHAR(20) NOT NULL, -- 'user' or 'team'
  challenger_id UUID NOT NULL,
  challenged_type VARCHAR(20) NOT NULL, -- 'user' or 'team'
  challenged_id UUID NOT NULL,
  sport VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'cancelled'
  message TEXT,
  proposed_date TIMESTAMP,
  proposed_location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### matches
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  team1_type VARCHAR(20) NOT NULL, -- 'user' or 'team'
  team1_id UUID NOT NULL,
  team2_type VARCHAR(20) NOT NULL,
  team2_id UUID NOT NULL,
  sport VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  location TEXT,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  winner_type VARCHAR(20), -- 'user' or 'team'
  winner_id UUID,
  result_status VARCHAR(50), -- 'pending', 'confirmed', 'disputed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### notifications (Future)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'challenge', 'match', 'result', etc.
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### friendships (Future)
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

## Redis Data Structures

### Session Management
```
Key: session:{user_id}
Type: String (JSON)
TTL: 7 days
Value: { userId, email, exp, ... }
```

### User Cache
```
Key: user:{user_id}
Type: String (JSON)
TTL: 1 hour
Value: { id, email, full_name, avatar_url, ... }
```

### Team Cache
```
Key: team:{team_id}
Type: String (JSON)
TTL: 1 hour
Value: { id, name, captain_id, sport, ... }
```

### Leaderboard (by sport)
```
Key: leaderboard:{sport}
Type: Sorted Set
Score: win count or win percentage
Member: user_id or team_id
```

### Rate Limiting
```
Key: ratelimit:{user_id}:{endpoint}
Type: String (counter)
TTL: 1 minute
Value: request count
```

### Real-time Presence (Future)
```
Key: presence:{user_id}
Type: String
TTL: 5 minutes
Value: last_seen timestamp
```

## Database Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- User Sports
CREATE INDEX idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX idx_user_sports_sport ON user_sports(sport);

-- Teams
CREATE INDEX idx_teams_captain_id ON teams(captain_id);
CREATE INDEX idx_teams_sport ON teams(sport);

-- Team Members
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Challenges
CREATE INDEX idx_challenges_challenger ON challenges(challenger_type, challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_type, challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);

-- Matches
CREATE INDEX idx_matches_team1 ON matches(team1_type, team1_id);
CREATE INDEX idx_matches_team2 ON matches(team2_type, team2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
```

[END SECTION:DATABASE]

---

# [SECTION:COMMANDS] Development Commands Reference

## Docker Compose Commands

### Starting Services
```bash
# Start all services in background
docker compose up -d

# Start with logs visible
docker compose up

# Start specific service
docker compose up -d postgres
docker compose up -d redis
```

### Checking Status
```bash
# Check running containers
docker compose ps

# View all containers (including stopped)
docker compose ps -a

# Check resource usage
docker stats
```

### Viewing Logs
```bash
# View logs for all services
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs -f postgres
docker compose logs -f redis

# Last 50 lines
docker compose logs --tail=50
```

### Stopping Services
```bash
# Stop services (data persists)
docker compose stop

# Stop specific service
docker compose stop postgres

# Stop and remove containers (data persists in volumes)
docker compose down

# Stop and remove including volumes (DANGER: data loss)
docker compose down -v
```

### Restarting Services
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart postgres
```

## Database Commands

### Migrations
```bash
# Run all pending migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback --all

# Create new migration
npm run migrate:create <migration_name>

# Check migration status
npm run migrate:status
```

### Seeding
```bash
# Run all seed files
npm run seed:run

# Run specific seed file
npm run seed:run --specific=01_users.js
```

### Direct PostgreSQL Access
```bash
# Connect to database
psql -h localhost -p 5432 -U gully_user -d gully_dev
# Password: gully_password

# Run SQL file
psql -h localhost -U gully_user -d gully_dev -f script.sql

# Dump database
pg_dump -h localhost -U gully_user gully_dev > backup.sql

# Restore database
psql -h localhost -U gully_user -d gully_dev < backup.sql
```

### Common SQL Queries
```sql
-- List all tables
\dt

-- Describe table structure
\d users

-- View table data
SELECT * FROM users LIMIT 10;

-- Check migration status
SELECT * FROM knex_migrations;

-- Count records
SELECT COUNT(*) FROM users;

-- Exit psql
\q
```

### Redis Commands
```bash
# Connect to Redis CLI
redis-cli -h localhost -p 6379

# Check connection
PING

# View all keys
KEYS *

# Get specific key
GET session:abc123

# Delete key
DEL session:abc123

# Flush all data (DANGER)
FLUSHALL

# Exit redis-cli
exit
```

## Development Commands

### Installation
```bash
# Install all dependencies
npm install

# Install specific package
npm install <package-name>

# Install dev dependency
npm install -D <package-name>

# Clean install (removes node_modules first)
rm -rf node_modules package-lock.json
npm install
```

### Running Application
```bash
# Start development server (with hot reload)
npm run dev

# Start production build
npm start

# Build TypeScript
npm run build

# Watch mode for TypeScript
npm run build:watch
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- user.test.ts

# Run tests with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Debugging
```bash
# Start with Node debugger
npm run debug

# Start with inspect mode
node --inspect dist/app.js
```

## Git Commands (Quick Reference)

### Common Workflow
```bash
# Check status
git status

# Stage changes
git add .
git add <file>

# Commit changes
git commit -m "feat: description"

# Push to remote
git push origin <branch>

# Pull latest changes
git pull origin <branch>

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout <branch>

# View commit history
git log --oneline
```

### Useful Git Aliases
```bash
# Add to ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  cm = commit -m
  last = log -1 HEAD
```

[END SECTION:COMMANDS]

---

# [SECTION:WORKFLOW] Development Workflow & Best Practices

## Development Principles

### 1. Local-First Development
- All development runs on MacBook
- No cloud dependencies for MVP
- Docker Compose for all services
- ngrok only when demos needed
- Free tier hosting only for deployment

### 2. Modular Monolith Strategy
- Single codebase with modular folders
- Clear service boundaries
- Easier debugging than microservices
- Lower operational overhead
- Refactor to microservices when needed

### 3. Pragmatic MVP Approach
- Ship working features > perfect architecture
- Manual processes acceptable initially
- Technical debt OK if it delivers value
- Focus on core functionality only
- Defer nice-to-haves to v2

### 4. Avoid AI Hallucinations
- **Verify every AI suggestion** before accepting
- **Test immediately** after code generation
- **Question unnecessary complexity**
- **Trust but verify always**
- Use the Decision Framework checklist

### 5. Cost Consciousness
- Challenge any tool/service that costs money
- Use free tiers and open source alternatives
- Delay paid services until revenue/funding
- Manual processes before automation costs
- Self-host before managed services

### 6. Learning Focus
- Understand code, don't just copy
- Document patterns for reuse
- Build mental models
- Prioritize knowledge over speed
- 90 min/day sustainable pace

## Anti-Patterns to ACTIVELY AVOID

### 🚫 Premature Microservices
- **Wrong:** 6 separate services for 0 users, complex orchestration
- **Right:** Modular monolith with clear service boundaries

### 🚫 Complex Infrastructure
- **Wrong:** Kubernetes, message queues, event buses for MVP
- **Right:** Docker Compose locally, simple hosting for demo

### 🚫 Paid Services Too Early
- **Wrong:** Monthly costs before validation and users
- **Right:** Free tiers, self-hosted solutions, manual processes

### 🚫 Over-Documentation
- **Wrong:** Perfect docs instead of working code
- **Right:** Code comments + basic README, ship first

### 🚫 Building for Scale
- **Wrong:** Optimizing for 1M users when you have 0 users
- **Right:** Build for 100 users, refactor when proven

### 🚫 Parallel Claude Sessions Too Early
- **Wrong:** Managing multiple contexts before mastering one
- **Right:** Master single workflow in weeks 1-4 first

### 🚫 Gold-Plating Features
- **Wrong:** Perfect UI, animations, edge cases for MVP
- **Right:** Functional > fancy, handle edge cases manually

## Weekly Review Protocol

Run every Sunday or end-of-week (90 minutes):

### 1. Token Consumption Analysis
- [ ] Track total tokens used this week
- [ ] Identify wasteful prompts or hallucination loops
- [ ] Optimize context usage (remove unnecessary files)
- [ ] Refine prompting strategy for next week
- [ ] Document what caused high token usage

### 2. Progress Assessment
- [ ] Features completed vs planned
- [ ] Blockers identified and documented
- [ ] Velocity check: on track for 12-week MVP?
- [ ] Adjust next week's scope if needed
- [ ] Update timeline if necessary

### 3. Learning Documentation
- [ ] Document what worked (successful Claude patterns)
- [ ] Document what failed (hallucinations, bugs)
- [ ] Log reusable patterns/prompts
- [ ] Context management lessons learned
- [ ] Add to personal knowledge base

### 4. Hallucination Prevention
- [ ] Review incorrect AI suggestions from the week
- [ ] Update verification checklist
- [ ] Flag complexity red flags encountered
- [ ] Strengthen "question everything" discipline
- [ ] Document how to spot hallucinations

### 5. Cost Tracking
- [ ] Confirm zero-spend maintained
- [ ] Check free tier usage vs limits
- [ ] Flag any payment-required suggestions
- [ ] Document workarounds for paid services
- [ ] Plan for approaching free tier limits

### 6. Context Management
- [ ] Remove stale files from Claude context
- [ ] Archive completed feature branches
- [ ] Clean up TODO lists
- [ ] Verify .claude.md is current
- [ ] Update FULL_CONTEXT.md if needed

### 7. Code Quality Check
- [ ] Review test coverage
- [ ] Check for security vulnerabilities
- [ ] Review error handling
- [ ] Check for code duplication
- [ ] Verify coding standards compliance

## Claude Code Interaction Guidelines

### When Claude Suggests Something, User Should Ask:
1. **Does this cost money?** → Challenge if yes
2. **Is this over-engineered?** → Simplify for MVP
3. **Can we test this immediately?** → Verify before proceeding
4. **Do we need this for v1?** → Defer if not core
5. **Is there a simpler approach?** → Always seek simplicity

### Optimal Prompting Strategy
- **Be specific:** "Create user login endpoint" not "setup auth"
- **Set constraints:** "Using Passport.js, no paid services"
- **Request testing:** "Include test cases for this function"
- **Limit scope:** "Just the signup route, not the whole auth system"
- **Verify understanding:** "Confirm this uses PostgreSQL, not cloud DB"

### Context Management Best Practices
- **Include only relevant files** in Claude's context
- **Archive completed work** to reduce token usage
- **Use focused sessions:** One feature at a time
- **Clear TODO lists** after completion
- **Load context on-demand** using `/gullycontext` commands

### Communication Protocol
- **Ask questions frequently** - Don't assume, verify
- **Confirm requirements** before complex implementations
- **Request specific context** - Use `/gullycontext` commands
- **Summarize understanding** before starting work
- **Flag uncertainties immediately** - Don't proceed with assumptions

## File Organization & Naming Conventions

### File Naming
- Controllers: `*.controller.ts` (e.g., `auth.controller.ts`)
- Routes: `*.routes.ts` (e.g., `user.routes.ts`)
- Models: `*.model.ts` (e.g., `user.model.ts`)
- Services: `*.service.ts` (e.g., `auth.service.ts`)
- Validators: `*.validator.ts` (e.g., `user.validator.ts`)
- Tests: `*.test.ts` or `*.spec.ts`
- Utilities: `*.util.ts`
- Types: `*.types.ts` or `*.interface.ts`

### Import Conventions
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
6. Add to migration if database changes needed

### When Debugging
- Check Docker container logs: `docker compose logs -f`
- Verify database connection: `psql -h localhost -U gully_user -d gully_dev`
- Check Redis: `redis-cli -h localhost -p 6379 PING`
- Review environment variables in `backend/.env`
- Check migration status: `npm run migrate:status`
- Run tests: `npm test`
- Check TypeScript errors: `npm run type-check`

### Quality Gates
- All code must pass linting
- Unit tests required for new features
- Maximum diff size: 200 lines per commit
- No implementation without plan approval
- Test before committing

## Key Mantras (Repeat Often)

1. **"Zero cost until validated"** - No paid services without users
2. **"Modular monolith, always"** - Service structure, single process
3. **"Ship, then polish"** - Working beats perfect
4. **"Verify everything"** - Trust but test AI code
5. **"Learn by building"** - Understanding over speed
6. **"Local-first forever"** - MacBook is the datacenter
7. **"Communicate constantly"** - Questions > Assumptions

[END SECTION:WORKFLOW]

---

**Last Updated:** Week 1
**Next Review:** End of Week 1 (Day 7)

**Usage:** Load specific sections using `/gullycontext [section]` commands.
