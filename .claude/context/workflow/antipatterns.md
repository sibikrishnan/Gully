# Anti-Patterns to AVOID

**Purpose:** Common mistakes to actively avoid during development.

---

## 🚫 Premature Microservices

**Wrong:** Building 6 separate services for 0 users with complex orchestration

**Right:** Modular monolith with clear service boundaries

**Why it's bad:**
- Adds network latency unnecessarily
- Harder to debug across services
- Requires orchestration complexity
- Costs more to deploy/host
- Slows down development velocity

**How to avoid:**
- Use modular monolith pattern
- Keep services in single process
- Extract to containers only when needed (Phase 2)
- Wait until 1000+ users before microservices

**Red flags:**
- "Let's dockerize each service separately"
- "We need a message queue for this"
- "Let's add service discovery"
- "We should use Kubernetes"

---

## 🚫 Complex Infrastructure

**Wrong:** Kubernetes, message queues, event buses, service mesh for MVP

**Right:** Docker Compose locally, simple hosting for demo

**Why it's bad:**
- Massive learning curve
- Operational overhead
- Costs money (managed services)
- Overkill for 0-1000 users
- Slows iteration speed

**How to avoid:**
- Docker Compose for local dev
- Single server deployment initially
- Free tier hosting (Render/Railway)
- Add complexity only when needed

**Red flags:**
- "Let's setup Kubernetes cluster"
- "We need a message queue"
- "Let's use a service mesh"
- "We should add an API gateway"

---

## 🚫 Paid Services Too Early

**Wrong:** Monthly costs before validation and users

**Right:** Free tiers, self-hosted solutions, manual processes

**Why it's bad:**
- Burns cash with no revenue
- Accumulates to $100s/month quickly
- Creates pressure to scale prematurely
- Vendor lock-in before validation

**How to avoid:**
- Question every paid service suggestion
- Research free alternatives
- Use self-hosted solutions
- Manual processes acceptable
- Defer payments until post-funding

**Common traps:**
- Auth0 → Use Passport.js + JWT (free)
- SendGrid → Use manual emails or free SMTP
- Stripe → Manual payment initially
- Firebase → Use PostgreSQL (self-hosted)
- AWS beyond free tier → Use free hosting

**Decision checklist:**
```
Before paying for ANY service:
[ ] Is there a free alternative?
[ ] Can we build it ourselves?
[ ] Can we do it manually?
[ ] Do we need it for MVP?
[ ] Can we defer to v2?
```

---

## 🚫 Over-Documentation

**Wrong:** Perfect docs instead of working code

**Right:** Code comments + basic README, ship first

**Why it's bad:**
- Time spent not building features
- Documentation gets stale quickly
- Users can't use docs without product
- Premature optimization of process

**How to avoid:**
- Focus on working code first
- Inline comments for complex logic
- Basic README with setup instructions
- API docs can wait until endpoints stable
- Document after shipping, not before

**Balance:**
- ✅ README with setup instructions
- ✅ Inline code comments for complex logic
- ✅ Database schema documentation
- ❌ Full API documentation before endpoints exist
- ❌ Architecture docs before architecture is proven
- ❌ User guides before users exist

---

## 🚫 Building for Scale

**Wrong:** Optimizing for 1M users when you have 0 users

**Right:** Build for 100 users, refactor when proven

**Why it's bad:**
- Wastes time on non-problems
- Adds unnecessary complexity
- Delays shipping to real users
- Premature optimization

**How to avoid:**
- Build simplest solution first
- Optimize when metrics show need
- "Will this work for 100 users?" → Yes → Ship it
- Handle scale problems when they exist

**Examples:**
- ❌ "We need sharding for the database"
- ❌ "Let's add caching everywhere"
- ❌ "We need a CDN for assets"
- ❌ "Let's optimize this N+1 query" (on 10 records)
- ✅ "This endpoint is slow with 1000 records" → Optimize
- ✅ "Redis caching for leaderboard" → Yes, frequently accessed

**Rule:** Optimize for developer velocity until you have users demanding performance.

---

## 🚫 Parallel Claude Sessions Too Early

**Wrong:** Managing multiple AI contexts before mastering one

**Right:** Master single workflow in weeks 1-4 first

**Why it's bad:**
- Context switching overhead
- Harder to track progress
- Token usage multiplies
- More opportunities for errors
- Cognitive overload

**How to avoid:**
- Focus on one feature at a time
- Complete current task before starting new
- Use sequential workflow
- Add parallel sessions only when needed (Week 8+)

**When parallel is OK:**
- Week 8+: One for backend, one for frontend
- Code review: One writes, another reviews
- Separate concerns: Different services/features

---

## 🚫 Gold-Plating Features

**Wrong:** Perfect UI, animations, edge cases for MVP

**Right:** Functional > fancy, handle edge cases manually

**Why it's bad:**
- Delays shipping to users
- Users might not care about polish
- Feature might not be needed at all
- Wastes limited time (90 min/day)

**How to avoid:**
- Build minimum viable version
- Ship and get feedback
- Polish after validation
- "Is this needed for demo?" → No → Skip

**Examples:**
- ❌ Animated loading spinners
- ❌ Custom 404 pages with illustrations
- ❌ Toast notifications with 5 variants
- ❌ Handling every edge case programmatically
- ✅ Basic loading indicator
- ✅ Simple error messages
- ✅ Handle common edge cases manually

---

## 🚫 Following AI Blindly

**Wrong:** Accepting AI suggestions without verification

**Right:** Review, test, question, verify everything

**Why it's bad:**
- AI can hallucinate solutions
- AI doesn't know your constraints
- AI might use deprecated patterns
- AI can suggest overly complex code

**How to avoid:**
- Read every line of generated code
- Test immediately after generation
- Question complexity
- Ask "is there a simpler way?"
- Verify packages are maintained
- Check if costs money

**Verification checklist:**
```
Before accepting AI code:
[ ] Have I read the code?
[ ] Do I understand what it does?
[ ] Is it unnecessarily complex?
[ ] Does it introduce dependencies?
[ ] Does anything cost money?
[ ] Can I test it immediately?
[ ] Is there a simpler approach?
```

---

## Red Flag Phrases

When you hear these, pause and reconsider:

- "Let's add a microservice for..."
- "We need Kubernetes"
- "Let's use [paid service]"
- "This needs perfect error handling"
- "Let's build a framework for..."
- "We should abstract this further"
- "Let's make it production-ready"
- "We need 99.99% uptime"
- "Let's add monitoring before we have users"
- "This needs to scale to millions"

---

**Remember:** The goal is shipping a working MVP, not building perfect infrastructure. Avoid these anti-patterns to stay focused and efficient.
