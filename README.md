# Gully - Sports Challenge Platform

**Status:** Week 2 (Team Features)
**Architecture:** Modular Monolith → Microservices
**Budget:** Zero-cost MVP

---

## Overview

Gully is a sports challenge platform MVP connecting athletes and teams for casual and competitive matches. Built by a solo developer mastering Claude Code, with zero cloud costs during development.

**Goal:** Build demo-ready app for investors/users in 12 weeks (90 min/day)

---

## Quick Start

### First Time Setup
```bash
# Clone the repository
git clone https://github.com/sibikrishnan/Gully.git
cd Gully

# Start with the master navigator
cat INDEX.md

# For Claude Code users
cat .claude/.claude.md  # Auto-loaded project context

# Start local services
cd backend
docker-compose up -d
npm install
npm run migrate:latest
npm run dev
```

### For Claude Code Users
This project is optimized for Claude Code development with comprehensive navigation:

**Master Navigator:** **[INDEX.md](INDEX.md)** - Quick reference for finding any file

**Custom Commands:**
- `/gullystatus` - Check current project status
- `/gullycontinue` - Resume work on next task
- `/gullycontext [section]` - Load context on-demand
- See **[.claude/commands/README.md](.claude/commands/README.md)** for all commands

**Documentation Hub:** **[docs/INDEX.md](docs/INDEX.md)**

---

## Documentation

### Quick Navigation
**Start here:** **[INDEX.md](INDEX.md)** - Master file navigator for entire project

### Key Documentation
**Architecture:**
- **[docs/architecture/OVERVIEW.md](docs/architecture/OVERVIEW.md)** - System architecture overview
- **[docs/architecture/INDEX.md](docs/architecture/INDEX.md)** - Complete architecture docs navigator

**Planning:**
- **[docs/planning/PROJECT_PLAN.md](docs/planning/PROJECT_PLAN.md)** - Vision and phases
- **[docs/planning/ROADMAP.md](docs/planning/ROADMAP.md)** - 12-week development timeline
- **[docs/planning/FEATURES.md](docs/planning/FEATURES.md)** - Feature specifications
- **[docs/planning/DATABASE_SCHEMA.md](docs/planning/DATABASE_SCHEMA.md)** - Database design
- **[docs/planning/API_ENDPOINTS.md](docs/planning/API_ENDPOINTS.md)** - API documentation

**Service Development:**
- **[docs/parallel-development/INDEX.md](docs/parallel-development/INDEX.md)** - All service briefs
  - UserService-Brief.md (✅ Week 1 - Complete)
  - TeamService-Brief.md (⏳ Week 2 - Current)
  - MatchService-Brief.md, LeagueService-Brief.md, TournamentService-Brief.md, StatsService-Brief.md (Future)

**Weekly Reviews:**
- **[docs/weekly-reviews/WEEK1_REVIEW.md](docs/weekly-reviews/WEEK1_REVIEW.md)** - Week 1 retrospective

**Workflow:**
- **[docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md)** - Development best practices
- **[docs/guides/CLAUDE_SESSION_GUIDE.md](docs/guides/CLAUDE_SESSION_GUIDE.md)** - Claude Code session protocols

---

## Tech Stack (Zero-Cost MVP)

### Backend
- **Runtime:** Node.js + Express (TypeScript)
- **Architecture:** Modular Monolith (evolves to microservices)
- **Database:** PostgreSQL (Docker Compose locally)
- **Cache:** Redis (Docker Compose locally)
- **Auth:** Passport.js + JWT (self-hosted)

### Frontend (Week 3+)
- **Web:** Next.js (demo-first, no app store delays)
- **Mobile:** React Native + Expo (later)

### Infrastructure
- **Development:** Docker Compose on MacBook
- **Hosting:** Render/Railway free tiers (when ready)
- **Demo:** ngrok for local tunneling

### What We're NOT Using (Until Funded)
- ❌ AWS services (beyond free tier)
- ❌ Auth0, Firebase Auth (paid tiers)
- ❌ Stripe, SendGrid, Twilio, Mux
- ❌ Kubernetes, complex orchestration

---

## Current Architecture

### Modular Monolith Structure
```
backend/
├── src/
│   ├── services/              # Service modules
│   │   ├── user-service/      # Auth, profiles
│   │   ├── team-service/      # Team management
│   │   ├── match-service/     # Challenges, matches
│   │   └── stats-service/     # Statistics, leaderboard
│   ├── shared/                # Shared utilities
│   │   ├── database/          # DB connection
│   │   ├── middleware/        # Auth, logging, errors
│   │   └── types/             # TypeScript interfaces
│   └── app.ts                 # Main entry point
├── tests/
├── docker-compose.yml         # Local services
└── package.json

frontend/                      # (Week 3+)
docs/                          # All documentation
infrastructure/                # Docker, Terraform (future)
```

**Key Principle:** Structured like microservices, runs as monolith. Easy migration to containers later.

---

## MVP Scope (12 Weeks)

### ✅ Phase 1 Features (In Scope)
1. User authentication (email/password)
2. User profiles (name, avatar, sports)
3. Team creation & management
4. Challenge system (send/accept/decline)
5. Match scheduling & results
6. Basic stats & leaderboard

### ❌ Deferred to v2
- Leagues & tournaments
- Video highlights
- Marketplace
- Social feed
- Push notifications
- Mobile apps (web first)

---

## Development Timeline

### Week 1: Foundation ✅ Completed
- ✅ Project structure created
- ✅ Database setup (PostgreSQL + Redis)
- ✅ Auth foundation (Passport.js + JWT)
- ✅ User service authentication endpoints
- ✅ Comprehensive testing infrastructure (121 tests, 90%+ coverage)
- ✅ Core application with graceful shutdown

**Review:** See [Week 1 Review](docs/weekly-reviews/WEEK1_REVIEW.md) for detailed analysis

### Weeks 2-4: Core Services
- User profiles CRUD
- Team management
- Challenge flow

### Weeks 5-8: Match System
- Match scheduling
- Results submission
- Basic statistics

### Weeks 9-12: Polish & Launch
- UI refinement
- Testing
- Deploy to free hosting
- Demo preparation

---

## Development Principles

1. **Local-First:** Everything runs on MacBook (no cloud costs)
2. **Modular Monolith:** Service structure, single process
3. **Ship Then Polish:** Working features > perfect architecture
4. **Verify Everything:** Test all AI-generated code immediately
5. **Zero Cost:** Challenge anything requiring payment

---

## Getting Started (Week 1)

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git
- Claude Code (Pro plan)

### Setup Steps
```bash
# 1. Review project context
cat .claude/.claude.md

# 2. Review project structure
cat PROJECT_STRUCTURE.md

# 3. See week 1 detailed plan
# Check .claude/.claude.md "Week 1 Detailed Plan" section

# 4. Start Day 2 tasks (database setup)
cd backend
# Follow Day 2 instructions in .claude/.claude.md
```

---

## Weekly Review Protocol

Every Sunday, review:
1. **Token Consumption** - Optimize Claude usage
2. **Progress** - Features completed vs planned
3. **Learning** - Document patterns, avoid hallucinations
4. **Cost** - Verify zero-spend maintained
5. **Context** - Clean up stale files

See `.claude/.claude.md` for detailed checklist.

---

## Project Status

- **Current Week:** Week 2 (Core Services - User Profiles)
- **Week 1 Status:** ✅ Completed (121 tests passing, 90%+ coverage)
- **Branch:** `week1`
- **Last Updated:** November 3, 2025
- **Next Milestone:** Week 2 - User Profile CRUD Operations

---

## Resources

- **Repository:** https://github.com/sibikrishnan/Gully
- **Claude Code Docs:** https://docs.claude.com/en/docs/claude-code
- **Project Context:** `.claude/.claude.md`

---

**Built with Claude Code** | **Learning by Building** | **Zero-Cost MVP**
