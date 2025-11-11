# RefinedIDEA Schema

**Version:** 1.0
**Purpose:** Standardized structure for Refinement Agent output. Transforms raw IDEA into comprehensive product specification that enables Architect Agent to create TECH_SPEC.
**Format:** Markdown (structured sections + unstructured notes)
**Size Target:** 500-1500 lines

---

## Document Structure

### Required Sections

#### 1. PROJECT OVERVIEW
- **Project Name:** Clear, memorable name
- **Tagline:** One-sentence description
- **Vision Statement:** 2-3 paragraphs describing what this project is and why it matters
- **Target Users:** Who will use this? (personas, demographics, user segments)
- **Core Value Proposition:** What problem does this solve? Why would users choose this?

#### 2. CORE FEATURES (Prioritized)
List features in priority order (P0 = must-have MVP, P1 = important, P2 = nice-to-have)

For each feature:
- **Feature Name**
- **Priority:** P0 / P1 / P2
- **Description:** What it does (2-3 sentences)
- **User Value:** Why users need this
- **Acceptance Criteria:** How do we know it's done?

Example:
```markdown
### User Authentication (P0)
**Description:** Users can register, log in, and manage their accounts with email/password authentication.

**User Value:** Secure access to personalized features, profile data, and match history.

**Acceptance Criteria:**
- Users can register with email, password, name, location
- Users can log in and receive secure session token
- Users can log out
- Passwords are securely hashed
- Invalid credentials show clear error messages
```

#### 3. USER WORKFLOWS
Describe key user journeys from start to finish.

Example:
```markdown
### Workflow: Create and Accept a Challenge
1. User A browses available teams/players
2. User A sends challenge request (sport: pickleball, date: Saturday, venue: Central Park)
3. User B receives notification
4. User B views challenge details
5. User B accepts challenge
6. Match is scheduled in both users' calendars
7. Post-match: both users enter results
8. Both users verify results
9. Stats and rankings are updated
```

#### 4. NON-FUNCTIONAL REQUIREMENTS

##### 4.1 Performance
- Expected concurrent users (e.g., "100+ for MVP, 10K+ at scale")
- Response time expectations (e.g., "<100ms for CRUD, <500ms for complex queries")
- Data volume projections (e.g., "10K users, 100K matches/year")

##### 4.2 Security & Privacy
- Authentication requirements (e.g., "JWT with 7-day expiration")
- Sensitive data handling (e.g., "email/phone hidden from other users")
- Privacy requirements (e.g., "GDPR-compliant data export/deletion")
- Regulatory compliance (if any)

##### 4.3 Scalability
- Growth projections (e.g., "10K users in year 1, 100K in year 2")
- Geographic distribution (e.g., "US-only for MVP, global expansion planned")
- Scaling triggers (e.g., "migrate to microservices at 100K+ users")

##### 4.4 Reliability
- Uptime expectations (e.g., "99.5% uptime target")
- Data backup requirements (e.g., "daily backups, 24-hour recovery time")
- Critical failure scenarios (e.g., "payment failures must be retryable")

#### 5. CONSTRAINTS

##### 5.1 Budget Constraints
- Infrastructure budget (e.g., "$500/month", "free tier only", "unlimited")
- Third-party service costs (e.g., "minimize external API costs")
- Development budget (if relevant)

##### 5.2 Timeline Constraints
- Target launch date or duration (e.g., "12-week MVP", "Q2 2025 launch")
- Phased rollout plan (if applicable)
- Hard deadlines or soft targets

##### 5.3 Team Constraints
- Team size and composition (e.g., "solo developer", "2 full-stack + 1 designer")
- Available time (e.g., "90 minutes/day", "full-time team")
- Skill level (e.g., "learning project", "experienced team")

##### 5.4 Technical Constraints
- Required technologies or platforms (e.g., "must use company AWS account")
- Technology restrictions (e.g., "no external dependencies", "must support IE11")
- Integration requirements (e.g., "must integrate with existing LDAP")
- Deployment constraints (e.g., "on-premise only", "serverless preferred")

#### 6. SUCCESS METRICS
How do we measure success? Define metrics for:

##### 6.1 Technical Metrics
- Test coverage target (e.g., "90%+ coverage")
- Performance benchmarks (e.g., "<100ms API response time")
- Code quality standards (e.g., "zero TypeScript errors", "no critical security vulnerabilities")

##### 6.2 Product Metrics
- User engagement (e.g., "50% weekly active users")
- Feature adoption (e.g., "80% of users create at least one challenge")
- Retention (e.g., "60% retention at 30 days")

##### 6.3 Business Metrics (if applicable)
- Revenue targets
- User growth rate
- Customer satisfaction (NPS, CSAT)

---

### Optional Sections

#### 7. USER STORIES (Optional, but recommended)
Detailed user stories in "As a [user], I want [feature], so that [benefit]" format.

Example:
```markdown
**As a** pickleball player
**I want** to challenge nearby teams to matches
**So that** I can play more games and improve my skills

**Acceptance Criteria:**
- I can search for teams by location and sport
- I can send a challenge request with date/time/venue
- I receive notification when challenge is accepted/declined
```

#### 8. EDGE CASES & NON-GOALS (Optional)
What scenarios must be handled? What is explicitly OUT of scope?

##### Edge Cases to Handle:
- User deletes account → soft delete, preserve match history
- Match result dispute → require both teams to confirm
- Duplicate registrations → prevent same email twice
- Concurrent updates → handle optimistic locking

##### Non-Goals (Out of Scope):
- Video streaming (only upload/storage)
- Live chat (async messaging only)
- Payment processing (Phase 1-3)
- AI-powered matchmaking (future feature)

#### 9. INTEGRATION REQUIREMENTS (Optional)
External systems and services needed.

Example:
```markdown
### Required Integrations
- **Push Notifications:** Firebase Cloud Messaging (FCM) for iOS/Android
- **Email:** SendGrid or Mailgun for transactional emails
- **Media Storage:** AWS S3 or Cloudinary for images/videos

### Optional Integrations (Future)
- **Maps:** Google Maps API for venue location
- **Payments:** Stripe for premium features
- **Analytics:** Mixpanel or Amplitude
```

#### 10. REFERENCES & INSPIRATION (Optional)
Links to similar products, design inspiration, technical references.

Example:
```markdown
- **Similar Products:** Meetup (event organization), Strava (sports tracking), Challenger (tennis app)
- **Design Inspiration:** Dribbble shots, competitor apps
- **Technical References:** Existing codebase at github.com/user/project
```

---

### Unstructured Section

#### 11. UNSTRUCTURED NOTES
**Purpose:** Capture brainstorming, open questions, design discussions, and context that doesn't fit structured sections above.

**Format:** Freeform markdown. Can include:
- Raw notes from ideation sessions
- Open questions that need answering
- Design trade-offs and decisions
- Risks and concerns
- Brainstorming ideas
- Links to documents, conversations, research
- Historical context
- Anything else that provides valuable context to Architect Agent

**Example:**
```markdown
## Unstructured Notes

### Open Questions
- Should we support team-less (individual) challenges, or teams-only?
- How do we handle match result disputes if teams disagree?
- Should stats be real-time or batch-calculated?

### Design Decisions Made
- Decided on JWT over session-based auth because: mobile-friendly, stateless, easier to scale
- Chose PostgreSQL over MongoDB because: relational model fits team/match data well, complex queries needed for rankings
- Soft delete pattern instead of hard delete to preserve match history integrity

### Risks & Concerns
- Video storage could get expensive → need usage limits or compression
- Match result disputes need clear business rules
- Leaderboard queries might be slow → consider Redis sorted sets

### Brainstorming (Not Committed)
- Idea: AI-powered opponent recommendations based on skill level
- Idea: Integration with wearables (Apple Watch, Fitbit) for stats
- Idea: Video analysis features (pose detection, shot tracking)

### Context from Original Idea
This project started as a learning exercise for AI-assisted parallel development. The developer wants to master:
- Claude Code workflows
- Parallel agent coordination
- TDD methodology
- Microservices patterns

The sports platform is the vehicle for learning these skills. Feature completeness is secondary to architectural learning.

### References
- Original prompt: /docs/archives/prompts/prompt01.md
- Existing codebase: github.com/user/gully (has some foundation work done)
- Competitor analysis: analyzed Meetup, Challenger, PickleheadZ apps
```

---

## Schema Validation Rules

### Required Sections (Must Have)
1. PROJECT OVERVIEW (all subsections)
2. CORE FEATURES (at least 3 P0 features)
3. USER WORKFLOWS (at least 2 workflows)
4. NON-FUNCTIONAL REQUIREMENTS (at least Performance, Security, Scalability)
5. CONSTRAINTS (at least Budget, Timeline, Team)
6. SUCCESS METRICS (at least Technical and Product metrics)

### Optional Sections (Can Be Empty)
7. USER STORIES
8. EDGE CASES & NON-GOALS
9. INTEGRATION REQUIREMENTS
10. REFERENCES & INSPIRATION

### Unstructured Section (Always Present)
11. UNSTRUCTURED NOTES (can be minimal, but section must exist)

---

## Quality Gates for RefinedIDEA

Before passing to Architect Agent, RefinedIDEA must satisfy:

✅ **Completeness Check:**
- All required sections are present and non-empty
- Core features clearly prioritized (P0/P1/P2)
- At least 2 detailed user workflows documented
- Non-functional requirements specified for performance, security, scalability
- All constraints documented (budget, timeline, team, technical)

✅ **Clarity Check:**
- Vision statement is clear and concise (not vague)
- Features have measurable acceptance criteria
- User workflows are step-by-step (not hand-wavy)
- Success metrics are quantifiable (not subjective)

✅ **Architect-Ready Check:**
- Enough technical context for architecture decisions (scale, performance, integrations)
- Constraints are specific enough to guide technology choices
- Non-goals are explicit to prevent over-engineering
- Unstructured notes provide valuable context

✅ **Length Check:**
- Document is 500-1500 lines (comprehensive but not bloated)
- If under 500 lines: likely missing important details
- If over 1500 lines: likely too verbose or duplicative

---

## Usage Instructions

### For Refinement Agent:
1. Receive raw IDEA (freeform text, conversation, prompt)
2. Extract key information through questioning and analysis
3. Fill out all required sections with specific, actionable content
4. Use optional sections when information is available
5. Capture everything else in unstructured notes
6. Run quality gates before outputting RefinedIDEA
7. Pass RefinedIDEA.md to Architect Agent

### For Architect Agent:
1. Read entire RefinedIDEA.md document
2. Focus on: Core Features, Non-Functional Requirements, Constraints, User Workflows
3. Pay special attention to unstructured notes for context and trade-offs
4. Use this information to create TECH_SPEC
5. Ask clarifying questions if critical information is missing

---

## Example File Structure

```
docs/planning/
  ├── RefinedIDEA.md          # This document (output of Refinement Agent)
  ├── TECH_SPEC.json          # Output of Architect Agent (input: RefinedIDEA.md)
  └── PROJECT_PLAN.json       # Output of PM Agent (input: TECH_SPEC.json)
```

---

**Last Updated:** 2025-11-09
**Status:** Schema v1.0 - Ready for use
**Next Step:** Create example RefinedIDEA.md for Gully project
