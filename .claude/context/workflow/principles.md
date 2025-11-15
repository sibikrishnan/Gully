# Development Principles

**Purpose:** Core development philosophies guiding this project.

---

## 1. Local-First Development

**What it means:**
- All development runs on MacBook
- No cloud dependencies for MVP
- Docker Compose for all services
- ngrok only when demos needed
- Free tier hosting only for deployment

**Why:**
- Zero costs during development
- Fast iteration (no network latency)
- Works offline
- Easy to reset/test
- Full control over environment

**Practice:**
- PostgreSQL → Docker container (local)
- Redis → Docker container (local)
- File storage → Local filesystem
- Secrets → .env file (local)
- Testing → Local environment

---

## 2. Modular Monolith Strategy

**What it means:**
- Single codebase with modular folders
- Clear service boundaries
- Easier debugging than microservices
- Lower operational overhead
- Refactor to microservices when needed

**Why:**
- Perfect for solo developer
- Fast iteration and deployment
- No network overhead between services
- Simple debugging (single process)
- Easy migration path later

**Practice:**
- Organize code by service modules
- Keep clear boundaries between services
- Use dependency injection for flexibility
- Document service interfaces
- Think microservices, deploy monolith

---

## 3. Pragmatic MVP Approach

**What it means:**
- Ship working features > perfect architecture
- Manual processes acceptable initially
- Technical debt OK if it delivers value
- Focus on core functionality only
- Defer nice-to-haves to v2

**Why:**
- Feature-driven development
- Need to validate product-market fit
- Perfect is enemy of done
- Learn from users, not assumptions
- Funding/resources limited

**Practice:**
- Build minimum feature set
- Handle edge cases manually
- Simple UI over fancy animations
- Email notifications before push
- Manual admin processes initially

---

## 4. Avoid AI Hallucinations

**What it means:**
- **Verify every AI suggestion** before accepting
- **Test immediately** after code generation
- **Question unnecessary complexity**
- **stick to session goal**
- **Trust but verify always**
- Use the Decision Framework checklist

**Why:**
- AI can suggest overly complex solutions
- AI may not understand project constraints
- AI might use deprecated patterns
- AI doesn't know your $0 budget constraint
- Token costs add up fast

**Practice:**
- Read AI-generated code carefully
- Test before committing
- Challenge suggestions that seem complex
- Ask "is there a simpler way?"
- Verify dependencies are free/necessary
- Check if suggested packages still maintained

---

## 5. Cost Consciousness

**What it means:**
- Challenge any tool/service that costs money
- Use free tiers and open source alternatives
- Delay paid services until revenue/funding
- Manual processes before automation costs
- Self-host before managed services

**Why:**
- $0 budget until validation
- Paid services add up quickly
- Free tiers often sufficient for MVP
- Avoid vendor lock-in early
- Prove value before spending

**Practice:**
- Question every "use X service" suggestion
- Research free alternatives
- Use Docker for local services
- Manual admin processes OK
- Defer payments until post-funding

**Decision Tree:**
```
Suggested Tool/Service
  ├─ Costs money?
  │   ├─ Yes → Find free alternative
  │   └─ No → Proceed
  └─ Free tier sufficient?
      ├─ Yes → Use free tier
      └─ No → Reconsider or defer feature
```

---

## 6. Learning Focus

**What it means:**
- Understand code, don't just copy
- Document patterns for reuse
- Build mental models
- Prioritize knowledge over speed
- Sustainable, focused development pace

**Why:**
- Solo developer needs to maintain code
- Understanding prevents future bugs
- Patterns can be reused across features
- Rushing leads to technical debt
- Learning compounds over 12 weeks

**Practice:**
- Read generated code before accepting
- Ask "why" not just "how"
- Document learnings in README/notes
- Take time to understand new concepts
- Review code after 24 hours
- Track reusable patterns

---

## Key Mantras

1. **"Zero cost until validated"** - No paid services without users
2. **"Modular monolith, always"** - Service structure, single process
3. **"Ship, then polish"** - Working beats perfect
4. **"Verify everything"** - Trust but test AI code
5. **"Learn by building"** - Understanding over speed
6. **"Local-first forever"** - MacBook is the datacenter
7. **"Communicate constantly"** - Questions > Assumptions

---

**Remember:** These principles exist to keep the project focused, efficient, and cost-effective while learning Claude Code mastery.
