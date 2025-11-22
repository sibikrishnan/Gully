# Gully - Master Project Navigator

**Pure navigation assistant for Claude Code - Fast file discovery**

---

## 🎯 Current Work

### Task Tracking System (Source of Truth)
- **Task Registry:** [tools/tracker/data/tasks/index.json](tools/tracker/data/tasks/index.json)
- **Task Directories:** [tools/tracker/data/tasks/](tools/tracker/data/tasks/)
- **Task README:** [tools/tracker/data/tasks/README.md](tools/tracker/data/tasks/README.md)
- **Dashboard:** Run `cd tools/tracker && ./launch-dashboard.sh` → http://localhost:3000

### Backend Code
- **User Service:** [services/backend/src/services/user-service/](services/backend/src/services/user-service/)
- **Team Service:** [services/backend/src/services/team-service/](services/backend/src/services/team-service/)
- **Match Service:** [services/backend/src/services/match-service/](services/backend/src/services/match-service/)
- **Stats Service:** [services/backend/src/services/stats-service/](services/backend/src/services/stats-service/)
- **Shared Code:** [services/backend/src/shared/](services/backend/src/shared/)

### Testing
- **Unit Tests:** [services/backend/tests/unit/](services/backend/tests/unit/)
- **Integration Tests:** [services/backend/tests/integration/](services/backend/tests/integration/)
- **E2E Tests:** [services/backend/tests/e2e/](services/backend/tests/e2e/)

---

## 📚 Documentation

### Main Documentation Hub
- **Docs Index:** [docs/INDEX.md](docs/INDEX.md)
- **README:** [docs/README.md](docs/README.md)

### Architecture
- **Architecture Index:** [docs/architecture/INDEX.md](docs/architecture/INDEX.md)
- **Overview:** [docs/architecture/OVERVIEW.md](docs/architecture/OVERVIEW.md)
- **Task System Design:** [docs/architecture/TASK_SYSTEM_DESIGN.md](docs/architecture/TASK_SYSTEM_DESIGN.md)

### Planning
- **Database Schema:** [docs/planning/DATABASE_SCHEMA.md](docs/planning/DATABASE_SCHEMA.md)
- **API Endpoints:** [docs/planning/API_ENDPOINTS.md](docs/planning/API_ENDPOINTS.md)
- **Roadmap:** [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md)
- **Test Strategy:** [docs/planning/TEST_STRATEGY.md](docs/planning/TEST_STRATEGY.md)

### Service Briefs
- **User Service:** [docs/service-briefs/UserService-Brief.md](docs/service-briefs/UserService-Brief.md)
- **Team Service:** [docs/service-briefs/TeamService-Brief.md](docs/service-briefs/TeamService-Brief.md)
- **Match Service:** [docs/service-briefs/MatchService-Brief.md](docs/service-briefs/MatchService-Brief.md)
- **Stats Service:** [docs/service-briefs/StatsService-Brief.md](docs/service-briefs/StatsService-Brief.md)

### Workflows
- **Workflow Guide:** [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md)
- **TDD Workflow:** [docs/workflows/tdd.json](docs/workflows/tdd.json)
- **Weekly Reviews:** [docs/weekly-reviews/](docs/weekly-reviews/)

---

## 🔧 Configuration

### Claude Code Setup
- **Claude Config:** [.claude/.claude.md](.claude/.claude.md)
- **Context Map:** [CONTEXT_MAP.md](CONTEXT_MAP.md) (on-demand context loading via ctx skill)
- **Context Sections:** [docs/context/](docs/context/) (database, arch, mvp, workflow)
- **Agents:** [.claude/agents/](.claude/agents/)
- **Commands:** [.claude/commands/](.claude/commands/)
- **Hooks:** [.claude/hooks/](.claude/hooks/)
- **Skills:** [.claude/skills/](.claude/skills/)

### Project Config
- **Package.json:** [services/backend/package.json](services/backend/package.json)
- **TypeScript Config:** [services/backend/tsconfig.json](services/backend/tsconfig.json)
- **Jest Config:** [services/backend/jest.config.ts](services/backend/jest.config.ts)
- **ESLint Config:** [services/backend/.eslintrc.json](services/backend/.eslintrc.json)

### Infrastructure
- **Docker Compose:** [services/backend/docker-compose.yml](services/backend/docker-compose.yml)
- **Migrations:** [services/backend/src/shared/database/migrations/](services/backend/src/shared/database/migrations/)

---

## 📖 Database

### Schema Files
- **Migrations Directory:** [services/backend/src/shared/database/migrations/](services/backend/src/shared/database/migrations/)
- **Users Table:** [services/backend/src/shared/database/migrations/20251101000001_create_users.ts](services/backend/src/shared/database/migrations/20251101000001_create_users.ts)
- **User Sports:** [services/backend/src/shared/database/migrations/20251101000002_create_user_sports.ts](services/backend/src/shared/database/migrations/20251101000002_create_user_sports.ts)
- **Teams Table:** [services/backend/src/shared/database/migrations/20251101000003_create_teams.ts](services/backend/src/shared/database/migrations/20251101000003_create_teams.ts)

### Database Utils
- **Database Client:** [services/backend/src/shared/database/index.ts](services/backend/src/shared/database/index.ts)
- **Knex Config:** [services/backend/src/shared/database/knexfile.ts](services/backend/src/shared/database/knexfile.ts)

### Database Context Docs
- **Tables Schema:** [docs/context/database/tables.md](docs/context/database/tables.md)
- **Indexes:** [docs/context/database/indexes.md](docs/context/database/indexes.md)
- **Redis Patterns:** [docs/context/database/redis.md](docs/context/database/redis.md)
- **Knex Patterns:** [docs/context/database/knex-patterns.md](docs/context/database/knex-patterns.md)

---

## 🗂️ Archives

### Archived Documentation
- **Archives Index:** [docs/archives/INDEX.md](docs/archives/INDEX.md)
- **Architecture Archives:** [docs/archives/architecture/](docs/archives/architecture/)
- **Optimization Logs:** [docs/archives/optimization/](docs/archives/optimization/)
- **Refactoring Docs:** [docs/archives/refactoring/](docs/archives/refactoring/)
- **Task Archives:** [docs/archives/tasks/](docs/archives/tasks/)

### Session Logs
- **Session Directory:** [docs/sessions/](docs/sessions/)
- **P2-PROF-T4.1 Log:** [docs/sessions/P2-PROF-T4.1-session-log.md](docs/sessions/P2-PROF-T4.1-session-log.md)
- **P2-PROF-T4.2 Log:** [docs/sessions/P2-PROF-T4.2-session-log.md](docs/sessions/P2-PROF-T4.2-session-log.md)

---

## 🚀 Quick Commands

### Development
```bash
cd services/backend && npm run dev          # Start dev server
cd services/backend && npm test              # Run all tests
cd services/backend && npm run build         # Build TypeScript
cd services/backend && npm run lint          # Run ESLint
```

### Docker
```bash
cd services/backend && docker compose up -d  # Start containers
cd services/backend && docker compose down   # Stop containers
cd services/backend && docker compose logs   # View logs
```

### Database
```bash
cd services/backend && npm run migrate       # Run migrations
cd services/backend && npm run migrate:rollback  # Rollback
cd services/backend && npm run seed          # Seed data
```

### Task Dashboard
```bash
cd tools/tracker && ./launch-dashboard.sh  # Launch dashboard
```

---

**Purpose:** Fast file discovery for Claude Code
**Last Updated:** 2025-11-12
**Maintenance:** Update when project structure changes
