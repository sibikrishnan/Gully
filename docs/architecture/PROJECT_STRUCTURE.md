# Gully Project Structure

**Architecture:** Modular Monolith (Hybrid Approach)

---

## Quick Reference

This file provides a high-level overview. For detailed, up-to-date information, see:

### Architecture Details
- **Complete Architecture:** `.claude/context/arch/structure.md`
- **Service Boundaries:** `.claude/context/arch/services.md`
- **Technology Stack:** `.claude/context/arch/stack.md`
- **Migration Strategy:** `.claude/context/arch/migration-strategy.md`

### Navigation
- **Master Index:** `INDEX.md` (find any file in 1-2 clicks)
- **Architecture Docs:** `docs/architecture/INDEX.md`
- **Development Workflow:** `docs/WORKFLOW_GUIDE.md`

### Planning
- **Database Schema:** `docs/planning/DATABASE_SCHEMA.md`
- **API Endpoints:** `docs/planning/API_ENDPOINTS.md`
- **Project Roadmap:** `docs/planning/ROADMAP.md`

---

## High-Level Structure

```
gully/
├── backend/                    # Modular monolith application
│   ├── src/
│   │   ├── services/           # Service modules (user, team, match, stats)
│   │   ├── shared/             # Shared utilities (database, middleware, types)
│   │   └── app.ts              # Main application entry
│   └── tests/                  # Test suite (121 tests, 90%+ coverage)
│
├── frontend/                   # Next.js frontend (Week 3+)
│
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture documentation
│   ├── planning/               # Planning docs (schema, API, roadmap)
│   ├── parallel-development/   # Service development briefs
│   ├── guides/                 # Workflow and session guides
│   └── weekly-reviews/         # Weekly retrospectives
│
├── .claude/                    # Claude Code configuration
│   ├── context/                # Context sections (load on-demand)
│   └── commands/               # Custom commands
│
└── tools/                      # Development tools
```

---

## Service Boundaries

### User Service
- **Responsibility:** Authentication, user profiles, sports preferences
- **Endpoints:** `/api/auth/*`, `/api/users/*`
- **Status:** ✅ Complete (Week 1)

### Team Service
- **Responsibility:** Team management, invitations, roster
- **Endpoints:** `/api/teams/*`
- **Status:** ⏳ In Progress (Week 2)

### Match Service
- **Responsibility:** Challenges, scheduling, results
- **Endpoints:** `/api/challenges/*`, `/api/matches/*`
- **Status:** 📅 Planned (Weeks 5-6)

### Stats Service
- **Responsibility:** Statistics, leaderboards, analytics
- **Endpoints:** `/api/stats/*`
- **Status:** 📅 Planned (Weeks 9-10)

---

## Development Approach

### Phase 1: Modular Monolith (Current)
- ✅ All services in one Node.js process
- ✅ Shared database connection
- ✅ Single Dockerfile
- ✅ Fast local development

### Phase 2: Containerized Services (Future)
- Individual service containers
- Docker Compose orchestration
- Separate database per service

### Phase 3: Cloud Microservices (Post-Funding)
- AWS ECS/Fargate deployment
- API Gateway
- Message queues
- Service mesh (optional)

---

## Key Conventions

### File Naming
- Controllers: `*.controller.ts`
- Routes: `*.routes.ts`
- Models: `*.model.ts`
- Services: `*.service.ts`
- Validators: `*.validator.ts`

### API Routes
- User Service: `/api/auth/*`, `/api/users/*`
- Team Service: `/api/teams/*`
- Match Service: `/api/challenges/*`, `/api/matches/*`
- Stats Service: `/api/stats/*`, `/api/leaderboard/*`

---

## Getting Started

**For detailed development instructions, see:**
- `README.md` - Project overview and setup
- `docs/WORKFLOW_GUIDE.md` - Development workflow
- `docs/guides/CLAUDE_SESSION_GUIDE.md` - Claude Code best practices

**For architecture deep-dive:**
- Use `/gullycontext arch` to load architecture context
- See `.claude/context/arch/` for all architecture documentation

---

**Last Updated:** 2025-11-07 (Week 2)
**Status:** Active development
**Next Review:** Week 2 completion
