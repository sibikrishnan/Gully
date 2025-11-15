# RefinedIDEA: Gully - Sports Challenge Platform

**Version:** 1.0
**Status:** APPROVED
**Created:** 2025-11-09
**Source:** Transformed from docs/archives/prompts/prompt01.md

---

## 1. PROJECT OVERVIEW

### Project Name
**Gully** - Grassroots Sports Challenge Platform

### Tagline
Connect, compete, and track your performance across grassroots sports with local teams and players.

### Vision Statement
Gully is a mobile-first platform that connects grassroots sports enthusiasts for casual and competitive matches across multiple sports (pickleball, paddle tennis, basketball, soccer, cricket). The platform solves the coordination problem in grassroots sports by enabling players and teams to discover opponents, issue challenges, schedule matches, verify results, and track performance through leaderboards and statistics.

Unlike professional sports platforms focused on elite athletes, Gully targets everyday players who want organized competition without the overhead of traditional league management. The platform democratizes competitive sports by making it easy to find games, track progress, and build local sports communities.

Gully bridges the gap between pickup games (unorganized, no tracking) and formal leagues (high overhead, rigid schedules) by providing just enough structure to enable competitive play while maintaining the casual, accessible nature of grassroots sports.

### Target Users

**Primary Personas:**

1. **Recreational Athletes (Age 25-45)**
   - Play sports 2-4 times per week
   - Want competitive matches without league commitment
   - Seek skill-appropriate opponents
   - Value performance tracking and improvement

2. **Team Captains / Organizers**
   - Coordinate small teams (4-10 players)
   - Struggle with finding opponents and scheduling
   - Want to track team performance and member stats
   - Need simple tools for roster management

3. **Sports Enthusiasts (College Students, Young Professionals)**
   - New to an area, looking to join sports communities
   - Want to discover local players and teams
   - Interested in multiple sports
   - Seek social connection through sports

**Geographic Focus:** Initially US-based, with potential for global expansion.

**Demographics:**
- Age: 18-55 (primary: 25-45)
- Urban and suburban areas
- All skill levels (beginner to advanced)
- Mobile-first users

### Core Value Proposition

**For Players:**
- Find skill-appropriate opponents and teams in your area
- Challenge players/teams and schedule matches easily
- Track your performance, stats, and ranking across sports
- Build your sports profile and community

**For Teams:**
- Discover and challenge other teams
- Manage rosters and coordinate members
- Track team performance and member contributions
- Establish team reputation through verified results

**Why Gully vs Alternatives:**
- **vs Pickup Apps:** Adds structure, tracking, and verified results
- **vs Traditional Leagues:** More flexible, less overhead, year-round availability
- **vs Social Sports Apps:** Focus on competition and performance tracking, not just socializing
- **vs Professional Platforms:** Designed for grassroots players, not elite athletes

---

## 2. CORE FEATURES (Prioritized)

### Feature 1: User Authentication & Profiles (P0)
**Priority:** P0 (Must-have MVP)

**Description:** Users can register with email/password, create detailed profiles including sports preferences, skill levels, location, and bio. Secure authentication with JWT enables personalized features and match history.

**User Value:**
- Secure access to personalized match history and stats
- Profile showcases sports experience and skill level
- Enables matchmaking with appropriate opponents
- Builds credibility through verified profile

**Acceptance Criteria:**
- Users can register with email, password, name, location
- Users can log in and receive secure JWT session token
- Users can update profile (bio, avatar, location)
- Users can add/remove sports preferences with skill levels (beginner, intermediate, advanced, expert)
- Users can specify years of experience and preferred positions per sport
- Passwords are securely hashed with bcrypt
- JWT tokens expire after 7 days with refresh token support
- Invalid credentials show clear error messages
- Email verification (optional for MVP, required for production)

---

### Feature 2: Team Creation & Management (P0)
**Priority:** P0 (Must-have MVP)

**Description:** Users can create teams for specific sports, invite members via email or username search, manage rosters, and assign captain roles. Teams serve as the foundation for team-based challenges and competitions.

**User Value:**
- Coordinate regular groups of players easily
- Build team identity with name, logo, and description
- Track team performance across matches
- Manage membership changes (additions, removals)

**Acceptance Criteria:**
- Users can create a team with name, sport, description, logo
- Team creator is automatically assigned as captain
- Captain can invite members by email or username
- Invited users receive notifications and can accept/decline
- Captain can add/remove members from roster
- Captain can transfer captain role to another member
- Teams can be soft-deleted (preserves match history)
- Teams are unique per sport (same name allowed for different sports)
- Maximum team size enforced (configurable per sport)
- Team members can view roster and team details

---

### Feature 3: Challenge System (P0)
**Priority:** P0 (Must-have MVP)

**Description:** Players and teams can issue challenges to opponents, propose match details (date, time, venue, sport), and accept/decline challenge requests. The challenge system is the core mechanism for initiating matches.

**User Value:**
- Initiate matches with desired opponents easily
- Negotiate match details collaboratively
- Clear visibility into pending and accepted challenges
- Reduces coordination overhead (no back-and-forth texting)

**Acceptance Criteria:**
- Users can send challenge to another user (1v1) or team (team vs team)
- Challenge includes: sport, proposed date/time, venue/location, optional message
- Challenged party receives notification
- Challenged party can accept, decline, or counter-propose alternative details
- Accepted challenges automatically create scheduled match
- Declined challenges notify challenger with optional reason
- Users can view sent challenges, received challenges, and challenge history
- Challenges expire after 7 days if no response
- Users can cancel pending challenges before acceptance

---

### Feature 4: Match Scheduling & Tracking (P0)
**Priority:** P0 (Must-have MVP)

**Description:** Accepted challenges become scheduled matches with confirmed date, time, venue, and participants. Matches track status (scheduled, in-progress, completed, disputed) and serve as the basis for result submission.

**User Value:**
- Clear calendar view of upcoming matches
- Automatic match creation from accepted challenges
- Centralized match details (who, what, when, where)
- Match history for reference and nostalgia

**Acceptance Criteria:**
- Accepted challenges automatically create matches
- Match includes: sport, date/time, venue, participants (users or teams)
- Match status: scheduled, in-progress, completed, disputed, cancelled
- Users receive reminders 24 hours and 1 hour before match
- Users can view upcoming matches in chronological order
- Users can view past matches with results
- Users can cancel matches (both parties must agree or auto-cancel if 72h notice)
- Match details are visible to all participants
- Supports both individual (1v1) and team matches

---

### Feature 5: Result Submission & Verification (P0)
**Priority:** P0 (Must-have MVP)

**Description:** After match completion, participants submit results (score, winner, optional notes). Both parties must verify results to prevent disputes. Verified results update stats and leaderboards.

**User Value:**
- Official record of match outcomes
- Prevents result manipulation (requires mutual verification)
- Automatic stats and ranking updates
- Dispute resolution process for disagreements

**Acceptance Criteria:**
- Participants can submit results after match date/time passes
- Result includes: score (format depends on sport), winner/loser/draw, optional match notes
- Both parties must confirm results for verification
- If results conflict, match enters "disputed" status
- Disputed matches require resolution (admin intervention or re-submission)
- Verified results are immutable (cannot be changed)
- Unverified results auto-expire after 7 days
- Users receive notifications when opponent submits results
- Verified results immediately update user/team stats
- Optional: Photo/video evidence upload for result verification

---

### Feature 6: Statistics & Performance Tracking (P1)
**Priority:** P1 (Important, post-MVP)

**Description:** Aggregate user and team performance data across matches to calculate win/loss records, win rate, match history, performance trends, and sport-specific stats. Stats are private by default with option to make public.

**User Value:**
- Track improvement over time
- Identify strengths and weaknesses
- Set performance goals
- Share achievements with community

**Acceptance Criteria:**
- Users have stats dashboard showing: total matches, wins, losses, draws, win rate, per sport
- Teams have stats dashboard showing: total matches, wins, losses, win rate, per sport
- Match history shows chronological list of completed matches with results
- Stats calculated separately per sport
- Performance trends show win rate over time (weekly, monthly, all-time)
- Stats are private by default, users can opt-in to public visibility
- Sport-specific stats (e.g., average score, points scored, sets won for pickleball)
- Filtering by date range, opponent, sport

---

### Feature 7: Leaderboards & Rankings (P1)
**Priority:** P1 (Important, post-MVP)

**Description:** Sport-specific leaderboards rank players and teams based on verified match results. Rankings use ELO-style algorithm accounting for opponent strength. Leaderboards can be filtered by location, skill level, and time period.

**User Value:**
- Competitive motivation and goal-setting
- Discover top players/teams in your area
- Measure progress against community
- Bragging rights and recognition

**Acceptance Criteria:**
- Leaderboards exist per sport (pickleball, paddle, basketball, etc.)
- Separate leaderboards for individuals and teams
- Rankings use ELO-style algorithm (wins against strong opponents worth more)
- Leaderboards filterable by: location (city, state), skill level, time period (weekly, monthly, all-time)
- Users can view their current rank and percentile
- Leaderboards show: rank, user/team name, rating, wins, losses, win rate
- Leaderboards updated in real-time after result verification
- Minimum match threshold to appear on leaderboard (e.g., 5 verified matches)
- Leaderboard positions are public (but stats remain private unless opted in)

---

### Feature 8: Notifications & Alerts (P1)
**Priority:** P1 (Important, post-MVP)

**Description:** Push notifications and in-app alerts for key events: challenge received, challenge accepted/declined, match reminders, result submission, new team invitation, ranking changes. Users can customize notification preferences.

**User Value:**
- Stay informed of match activity
- Never miss a scheduled match
- Respond to challenges promptly
- Engage with platform regularly

**Acceptance Criteria:**
- Push notifications for: challenge received, challenge accepted/declined, match starting soon (1 hour), opponent submitted result, team invitation
- In-app notification center shows all notifications chronologically
- Notifications marked as read/unread
- Users can customize notification preferences (push vs in-app vs email)
- Notifications include actionable links (e.g., "Accept Challenge" button)
- Notification delivery via Firebase Cloud Messaging (FCM) for mobile
- Email notifications as fallback for critical events
- Badge counts on app icon for unread notifications

---

### Feature 9: League & Tournament Support (P2)
**Priority:** P2 (Nice-to-have, future)

**Description:** Users and teams can create or join organized leagues with scheduled seasons, automatic match scheduling, standings, and playoffs. Tournament support includes bracket generation, seeding, and progression tracking.

**User Value:**
- Structured competition for serious players
- Automatic scheduling reduces coordination overhead
- Clear season structure with playoffs
- Tournament play for special events

**Acceptance Criteria:**
- League creators can define: sport, schedule (weekly/biweekly), season length, max teams
- Teams can apply to join leagues (approval by league admin)
- League auto-generates match schedule for round-robin or divisional play
- League standings calculated automatically from match results
- Playoffs automatically seeded based on regular season standings
- Tournament support for single/double elimination brackets
- Tournament bracket visualization
- Champions and runner-ups recognized on platform

---

### Feature 10: Social Features & Chat (P2)
**Priority:** P2 (Nice-to-have, future)

**Description:** In-app messaging between users and teams, match discussion threads, photo/video sharing from matches, social feed showing recent activity from followed users/teams.

**User Value:**
- Coordinate match details easily
- Build community and friendships
- Share memorable moments
- Stay engaged with sports community

**Acceptance Criteria:**
- Direct messaging between users
- Team group chat for team members
- Match-specific discussion threads
- Photo/video upload and sharing
- Social feed showing: match results, photos, achievements from followed users/teams
- Follow/unfollow users and teams
- Like and comment on posts
- Privacy controls for posts and profile visibility

---

## 3. USER WORKFLOWS

### Workflow 1: New User Registration and Profile Setup
1. User opens Gully app (mobile or web)
2. User taps "Sign Up"
3. User enters email, password, name, location
4. System validates email format and password strength
5. System creates account and sends verification email (optional for MVP)
6. User logs in automatically and sees profile setup wizard
7. User adds profile photo/avatar
8. User adds bio (optional)
9. User selects sports they play (pickleball, paddle, basketball, etc.)
10. For each sport, user selects skill level (beginner, intermediate, advanced, expert)
11. User optionally adds years of experience and preferred position
12. User completes profile setup
13. System shows dashboard with "Find Opponents" and "Create Team" prompts

---

### Workflow 2: Create Team and Invite Members
1. User navigates to "Teams" section
2. User taps "Create Team"
3. User enters team name, selects sport, adds description (optional)
4. User uploads team logo (optional)
5. System creates team and assigns user as captain
6. User taps "Invite Members"
7. User searches for members by username or email
8. User selects members and sends invitations
9. Invited users receive push notification and in-app alert
10. Invited users tap notification and see team invitation details
11. Invited users accept or decline invitation
12. Accepted members are added to team roster
13. Captain sees updated roster with all members
14. Team is now ready to challenge other teams

---

### Workflow 3: Issue Challenge and Schedule Match
1. User browses "Find Opponents" section (filtered by sport and location)
2. User finds opponent (individual or team) with similar skill level
3. User taps "Challenge"
4. User fills out challenge form: sport, proposed date/time, venue, optional message
5. System validates challenge details
6. System sends challenge to opponent
7. Opponent receives push notification
8. Opponent opens challenge and reviews details
9. Opponent accepts challenge (or counter-proposes alternative details)
10. System creates scheduled match with confirmed details
11. Both parties receive match confirmation notification
12. Match appears in both users' "Upcoming Matches" calendar
13. Both users receive reminders 24 hours and 1 hour before match
14. Users play match at scheduled time/venue

---

### Workflow 4: Submit and Verify Match Results
1. Match date/time passes
2. User A navigates to "Recent Matches"
3. User A taps on completed match
4. User A taps "Submit Result"
5. User A enters score (e.g., "21-15, 21-18" for pickleball)
6. User A selects winner (self, opponent, or draw)
7. User A optionally adds match notes or uploads photos
8. System saves User A's result submission
9. User B receives notification: "Opponent submitted result"
10. User B opens match and reviews submitted result
11. User B verifies result (agrees) or disputes (disagrees)
12. If verified: System marks match as "Completed" and updates stats/rankings
13. If disputed: System marks match as "Disputed" and notifies both parties
14. Verified results immediately reflect in user stats and leaderboards
15. Both users see updated win/loss records

---

### Workflow 5: Browse Leaderboard and Track Performance
1. User navigates to "Leaderboards" section
2. User selects sport (e.g., pickleball)
3. User selects leaderboard type (individual or team)
4. User applies filters: location (local city), time period (monthly)
5. System displays ranked list of top players in area
6. User sees their current rank and rating
7. User taps on top-ranked player to view their profile
8. User views opponent's public stats (if opted in)
9. User taps "Challenge" to issue challenge to highly-ranked player
10. User navigates to "My Stats" dashboard
11. User views performance trends (win rate over time)
12. User sets personal goal (e.g., "Reach top 10 in city by end of month")
13. User shares achievement on social feed (optional)

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

**Expected Concurrent Users:**
- MVP: 100+ concurrent users without degradation
- Year 1: 10,000+ registered users, 500+ concurrent
- Year 2: 100,000+ registered users, 2,000+ concurrent
- Scale trigger: Migrate to microservices at 100K+ users

**Response Time Expectations:**
- Standard CRUD operations (user profiles, teams): <100ms p95
- Search operations (find opponents, browse teams): <500ms p95
- Leaderboard calculations and aggregations: <500ms p95
- Match result verification and stats update: <200ms p95
- Image upload and processing: <2s p95

**Data Volume Projections:**
- Year 1: 10,000 users, 50,000 matches, 200,000 challenges
- Year 2: 100,000 users, 500,000 matches, 2,000,000 challenges
- Year 3: 500,000 users, 2,500,000 matches, 10,000,000 challenges

**Database Performance:**
- Query optimization for N+1 problems (especially user_sports and team_members JOINs)
- Database indexing on frequently queried fields (user_id, team_id, sport, location)
- Materialized views for leaderboards and rankings (if needed for performance)

---

### 4.2 Security & Privacy

**Authentication Requirements:**
- JWT-based authentication with 7-day expiration
- Bcrypt password hashing with 12 rounds (salt factor)
- Refresh token support for seamless re-authentication
- Password reset via email with time-limited tokens (1-hour expiration)
- Session management with Redis for token blacklisting (optional)

**Data Privacy:**
- Field-level access control: own profile shows all fields (email, phone), other profiles hide sensitive data
- Password hash NEVER exposed in API responses
- Match results private until both parties verify
- User stats private by default with opt-in for public visibility
- Team member contact info hidden from non-members
- GDPR-ready: users can export all data and request account deletion

**API Security:**
- Rate limiting: 100 requests/minute per IP for standard endpoints
- Stricter rate limiting for auth endpoints: 5 attempts/minute for login/register
- Zod input validation on all endpoints (prevent injection attacks)
- SQL injection prevention via parameterized queries (pg-promise)
- CORS configuration for allowed origins (mobile app, web app)
- XSS prevention via content security policies
- HTTPS-only in production

**Compliance:**
- GDPR-compliant data handling (EU users)
- COPPA compliance if allowing users under 13 (likely age gate at 18+)
- Basic data privacy (no HIPAA/PCI required for MVP)

---

### 4.3 Scalability

**Growth Projections:**
- Year 1: 10,000 users (primarily US-based, 2-3 cities)
- Year 2: 100,000 users (US expansion, 10+ cities)
- Year 3: 500,000 users (global expansion, international markets)

**Geographic Distribution:**
- MVP: US-only (target cities: SF Bay Area, NYC, Austin)
- Year 2: US nationwide expansion
- Year 3: International expansion (Canada, UK, Australia, India)

**Scaling Triggers:**
- Horizontal scaling: Add read replicas for database at 50K+ users
- Microservices migration: Extract services at 100K+ users or when monolith becomes bottleneck
- CDN for media: Implement at 10K+ users when media storage costs rise
- Redis for leaderboards: Implement sorted sets at 50K+ users for real-time rankings
- Caching layer: Add Redis caching for frequent queries at 25K+ users

**Architecture Evolution:**
- Start: Modular monolith (MVP - Year 1)
- Phase 2: Add Redis caching and read replicas (Year 1-2)
- Phase 3: Extract Match Service and Stats Service to microservices (Year 2)
- Phase 4: Full microservices with event-driven architecture (Year 3+)

---

### 4.4 Reliability

**Uptime Expectations:**
- MVP: Best effort (no SLA), target 99% uptime
- Production: 99.5% uptime SLA (4.4 hours downtime/month max)
- Critical services (auth, match scheduling): 99.9% uptime target

**Data Backup Requirements:**
- Daily automated PostgreSQL backups to S3
- Backup retention: 30 days
- RPO (Recovery Point Objective): 24 hours acceptable for MVP
- RTO (Recovery Time Objective): 24 hours acceptable for MVP
- Production: RPO 1 hour, RTO 4 hours

**Critical Failure Scenarios:**
- Database failure: Restore from latest backup (24-hour data loss acceptable for MVP)
- Auth service failure: Queue login attempts, graceful degradation with cached credentials
- Notification service failure: Degrade to email notifications, queue push notifications for retry
- Payment processing failure (future): Queue payments for retry, clear user messaging

**Monitoring & Alerting:**
- Structured logging with Winston (JSON format)
- Log aggregation with CloudWatch or DataDog
- APM (Application Performance Monitoring) with DataDog or New Relic
- Alerting for: error rate spikes, response time degradation, database connection issues
- Health check endpoints for load balancer

---

## 5. CONSTRAINTS

### 5.1 Budget Constraints

**Infrastructure Budget:**
- Minimize infrastructure costs for MVP
- Free tier usage preferred (Railway, Supabase, Vercel)
- Target: <$100/month for MVP (0-1K users)
- Target: <$500/month for Year 1 (1K-10K users)
- Budget scales with user growth and revenue

**Third-Party Service Costs:**
- Email: SendGrid free tier (100 emails/day) or Mailgun free tier
- Push notifications: Firebase Cloud Messaging (free)
- Media storage: AWS S3 or Cloudinary (free tier, then pay-per-use)
- Monitoring: DataDog free tier or self-hosted logging
- Avoid expensive services (Twilio SMS, premium CDN) until revenue justifies

**Development Budget:**
- AI-driven development with human oversight
- Minimal external contractor costs
- Open-source tools and frameworks only

---

### 5.2 Timeline Constraints

**Development Approach:**
- Feature-based development (not time-based)
- Foundation-first approach (User Service → Team Service → Match Service)
- Maturity-driven progression (sequential → controlled parallel → full parallel)
- No artificial deadlines - quality and stability over speed

**Phased Rollout:**
- Phase 1: User Authentication & Profiles (foundation)
- Phase 2: Team Creation & Management (build on stable User Service)
- Phase 3: Challenge & Match System (core value proposition)
- Phase 4: Stats & Leaderboards (engagement and retention)
- Phase 5: Notifications & Social Features (community building)
- Phase 6: Leagues & Tournaments (structured competition)

**Soft Targets:**
- MVP ready for private beta: 3-6 months (Phase 1-3 complete)
- Public launch: 6-9 months (Phase 1-4 complete)
- Feature-complete v1.0: 9-12 months (all phases)

---

### 5.3 Team Constraints

**Team Composition:**
- AI-driven development (PM Agent, Task Generation Agent, Task Execution Agents)
- Human oversight and strategic decisions
- Human handles: product decisions, UX/UI design, user feedback integration
- AI handles: implementation, testing, documentation, code reviews

**Workflow:**
- PM Agent orchestrates all development activities
- PM Agent delegates to Task Generation Agent and Task Execution Agents
- Human interacts only with PM Agent (orchestrator)
- Fleet of specialized agents work in parallel on mature phases

---

### 5.4 Technical Constraints

**Required Technologies:**
- Backend: Node.js 20+ with Express.js and TypeScript (decision made)
- Database: PostgreSQL 15 (relational model fits domain)
- Cache: Redis 7 (for session management, rate limiting, future leaderboards)
- Mobile: React Native (iOS and Android from single codebase)
- Testing: Jest with TDD workflow (90%+ coverage mandatory)
- Infrastructure: Docker Compose for local development (zero cloud dependency)

**Technology Restrictions:**
- No external auth providers (build JWT auth in-house for learning and control)
- No NoSQL databases (PostgreSQL chosen for relational integrity)
- No monorepo tools (Lerna, Nx) - keep simple for MVP
- No GraphQL (REST APIs for simplicity and mobile compatibility)

**Integration Requirements:**
- Must integrate with Firebase Cloud Messaging (FCM) for push notifications
- Must integrate with SendGrid or Mailgun for transactional emails
- Must integrate with AWS S3 or Cloudinary for media storage
- Optional: Google Maps API for venue location (future)
- Optional: Stripe for payment processing (future premium features)

**Deployment Constraints:**
- Must work locally with Docker Compose (no cloud lock-in)
- Production deployment: Railway or AWS ECS (containerized)
- CI/CD: GitHub Actions (future implementation)
- Must support multiple sports without code changes (data-driven sport configuration)

---

## 6. SUCCESS METRICS

### 6.1 Technical Metrics

**Test Coverage:**
- Target: 90%+ coverage for all production code (controllers, repositories, middleware)
- Critical paths: 100% coverage (auth, match result verification, payment processing)
- Test pyramid: 60% unit tests, 30% integration tests, 10% e2e tests
- All tests pass before any deployment
- Zero TypeScript errors or warnings

**Performance Benchmarks:**
- API response time: <100ms p95 for CRUD, <500ms p95 for aggregations
- Database query time: <50ms p95 for indexed queries
- Page load time: <2s for initial load, <500ms for navigation (React Native)
- Image upload time: <2s p95

**Code Quality Standards:**
- TypeScript strict mode enabled (no `any` types except documented exceptions)
- ESLint with Airbnb style guide (customized)
- Prettier for consistent formatting
- No critical security vulnerabilities (Snyk or npm audit)
- Dependency updates within 30 days of release for security patches

---

### 6.2 Product Metrics

**User Engagement:**
- Weekly Active Users (WAU): Target 50% of registered users
- Daily Active Users (DAU): Target 20% of registered users
- Session length: Target 10+ minutes per session
- Sessions per week: Target 3+ sessions per active user

**Feature Adoption:**
- Profile completion: 80%+ of users complete profile with sports preferences
- Challenge creation: 60%+ of users create at least one challenge within first week
- Match completion: 70%+ of scheduled matches result in verified results
- Team participation: 40%+ of users join or create at least one team
- Leaderboard engagement: 50%+ of users view leaderboard at least weekly

**Retention:**
- Day 1 retention: 60%+ (users return day after signup)
- Week 1 retention: 50%+ (users return within first week)
- Month 1 retention: 40%+ (users return within first month)
- Month 3 retention: 30%+ (users still active after 3 months)

**Growth:**
- Organic growth: 20%+ month-over-month user growth from referrals
- Viral coefficient: >1.0 (each user invites >1 new user on average)
- App store ratings: 4.5+ stars average (iOS and Android)

---

### 6.3 Business Metrics

**User Acquisition:**
- Cost Per Acquisition (CPA): <$5 per user (organic growth focus)
- Referral rate: 30%+ of users refer at least one friend
- App store conversion: 25%+ of page visitors download app

**Monetization (Future):**
- Premium subscription conversion: 5%+ of active users upgrade to premium
- Average Revenue Per User (ARPU): Target $3-5/month (mix of free and premium)
- Churn rate: <5% monthly churn for premium subscribers

**Customer Satisfaction:**
- Net Promoter Score (NPS): Target 40+ (good for consumer apps)
- Customer Satisfaction Score (CSAT): Target 4.5+ out of 5
- Support ticket volume: <5% of active users submit support tickets monthly
- Issue resolution time: 80%+ of tickets resolved within 48 hours

---

## 7. USER STORIES (Optional)

### User Story 1: Find Opponents
**As a** pickleball player new to San Francisco
**I want** to find local players at my skill level
**So that** I can play competitive matches and improve my game

**Acceptance Criteria:**
- I can search for users by sport (pickleball) and location (San Francisco)
- I can filter by skill level (intermediate)
- I can view player profiles with stats and match history
- I can send challenge requests directly from search results
- I receive notifications when challenges are accepted

---

### User Story 2: Track Performance
**As a** competitive paddle tennis player
**I want** to track my win/loss record and ranking over time
**So that** I can measure my improvement and set goals

**Acceptance Criteria:**
- I can view my stats dashboard showing wins, losses, win rate
- I can see performance trends (win rate over last 3 months)
- I can view my current leaderboard rank for paddle tennis
- I can filter stats by opponent, date range, or venue
- I can export my match history as CSV

---

### User Story 3: Coordinate Team Matches
**As a** basketball team captain
**I want** to challenge other teams and manage my roster
**So that** I can organize regular competitive games for my team

**Acceptance Criteria:**
- I can create a basketball team and invite members
- I can browse and search for other basketball teams in my area
- I can send challenge requests to teams with proposed match details
- I can manage my roster (add/remove members)
- I receive notifications when other teams challenge us
- My team has a collective stats page showing our record

---

## 8. EDGE CASES & NON-GOALS

### Edge Cases to Handle

**User Management:**
- User deletes account → soft delete (is_active=false), preserve match history
- User tries to register with duplicate email → reject with clear error message
- User forgets password → email-based reset flow with time-limited token
- User updates profile while match is in progress → allow, no impact on scheduled matches
- User tries to challenge themselves → prevent with validation error

**Team Management:**
- Team captain leaves team → transfer captain role to longest-standing member or prompt for selection
- Last team member leaves team → soft delete team automatically
- User tries to join multiple teams for same sport → allow (no restriction)
- Team name conflict within same sport → prevent with uniqueness validation
- Captain tries to remove themselves from team → prevent unless transferring captain role first

**Match Management:**
- Match result dispute between parties → mark as "disputed", require admin intervention or re-submission with consensus
- Scheduled match date passes but no result submitted → auto-expire after 7 days, match marked as "no-show"
- User tries to submit result before match date → prevent with validation error
- Both parties submit different scores → require verification flow, show discrepancy
- User tries to delete verified match result → prevent (immutable after verification)

**Performance & Scalability:**
- N+1 query problem in user_sports JOIN → use eager loading or dataloader pattern
- Leaderboard calculation becomes slow (>500ms) → implement Redis sorted sets for real-time rankings
- Concurrent match result submissions → use optimistic locking or database transactions
- High volume of push notifications → implement queue with batching (FCM has rate limits)

---

### Non-Goals (Out of Scope)

**Explicitly NOT Building (MVP):**
- Live scoring / real-time match tracking (only post-match result submission)
- Video streaming or live broadcast (only post-match photo/video upload)
- In-app voice/video chat (only text messaging)
- Payment processing for match fees or tournament entry (future feature)
- Referee booking or officiating services (grassroots focus)
- Equipment marketplace or gear recommendations (out of scope)
- Fitness tracking or wearable integration (Apple Watch, Fitbit) (future feature)
- AI-powered matchmaking or opponent recommendations (future feature)
- Betting or wagering on matches (legal complications, out of scope)
- Professional athlete profiles or scouting (grassroots focus only)

**Future Features (Not MVP):**
- Multi-language support (English-only for MVP)
- Accessibility features (screen reader, high contrast) (important but post-MVP)
- Offline mode for mobile app (requires complex sync logic)
- Desktop web app (mobile-first, web admin panel only for MVP)
- Integration with Strava, Garmin, or other fitness platforms
- Advanced analytics and AI insights ("Your backhand improved 15%")
- Social sharing to Facebook, Instagram, Twitter
- Sponsorship or brand partnerships for teams/tournaments

---

## 9. INTEGRATION REQUIREMENTS

### Required Integrations (MVP)

**Firebase Cloud Messaging (FCM)**
- **Purpose:** Push notifications for iOS and Android
- **Use Cases:** Challenge received, match reminder, result submitted, team invitation
- **Criticality:** High (core engagement driver)
- **Fallback:** Degrade to email notifications if FCM unavailable
- **Implementation:** Server-side FCM SDK for Node.js, client-side React Native Firebase

**SendGrid or Mailgun**
- **Purpose:** Transactional email delivery
- **Use Cases:** Password reset, email verification, critical notifications
- **Criticality:** High (required for password reset flow)
- **Fallback:** Queue emails for retry, retry up to 3 times with exponential backoff
- **Implementation:** SendGrid Node.js SDK or Mailgun REST API

**AWS S3 or Cloudinary**
- **Purpose:** Media storage for user avatars, team logos, match photos/videos
- **Use Cases:** Profile photos, team branding, match highlight uploads
- **Criticality:** Medium (can use default avatars, skip videos)
- **Fallback:** Use default avatars/logos if upload fails, retry on next app open
- **Implementation:** AWS SDK for S3 or Cloudinary Node.js SDK with signed uploads

---

### Optional Integrations (Future)

**Google Maps API**
- **Purpose:** Venue location, map display, distance calculation
- **Use Cases:** Find nearby opponents, display match venue on map
- **Criticality:** Low (can use address text for MVP)
- **Timeline:** Phase 5 or later

**Stripe**
- **Purpose:** Payment processing for premium features, tournament fees
- **Use Cases:** Premium subscriptions, tournament entry fees
- **Criticality:** Low (freemium model, no payments for MVP)
- **Timeline:** Phase 6 or later, revenue-dependent

**Mixpanel or Amplitude**
- **Purpose:** Product analytics and user behavior tracking
- **Use Cases:** Funnel analysis, feature adoption, retention cohorts
- **Criticality:** Medium (valuable for product decisions)
- **Timeline:** Phase 4 or later

**Twilio**
- **Purpose:** SMS notifications (alternative to push/email)
- **Use Cases:** Critical match reminders for users who disabled push
- **Criticality:** Low (expensive, push/email sufficient)
- **Timeline:** Post-MVP, budget-dependent

---

## 10. REFERENCES & INSPIRATION

### Similar Products (Competitive Analysis)

**Meetup (meetup.com)**
- **Similarity:** Event organization and coordination for groups
- **Difference:** Gully is sports-specific with competitive focus and result tracking
- **Lesson:** Simple event creation flow, RSVP system, group management

**Strava (strava.com)**
- **Similarity:** Sports tracking, leaderboards, social features
- **Difference:** Gully focuses on match-based competition, not individual workouts
- **Lesson:** Excellent stats visualization, segment leaderboards, social feed

**Challenger (challenger.app)**
- **Similarity:** Tennis challenge platform with similar core features
- **Difference:** Gully supports multiple sports, stronger team focus
- **Lesson:** Clean challenge flow, result verification, ranking system

**PickleheadZ (pickleheadz.com)**
- **Similarity:** Pickleball-specific player connection and event organization
- **Difference:** Gully is multi-sport with stronger competitive/tracking features
- **Lesson:** Sport-specific community building, skill level badges

---

### Design Inspiration

**Mobile App Design:**
- Dribbble: Sports app designs (clean, action-oriented UI)
- Behance: Sports community platforms
- Material Design: Android design guidelines for React Native
- Apple Human Interface Guidelines: iOS design patterns

**Key Design Principles:**
- Mobile-first (thumb-friendly navigation)
- Action-oriented (prominent "Challenge" buttons)
- Stats-forward (visualize performance clearly)
- Social proof (show activity, rankings, verified results)
- Minimal friction (reduce steps to challenge/accept/verify)

---

### Technical References

**Existing Codebase:**
- Repository: https://github.com/sibikrishnan/Gully.git
- Local: /Users/sibikrishnan/Documents/Gully
- Foundation work completed: basic auth, user service structure

**Technology Documentation:**
- Node.js 20+ LTS: https://nodejs.org/docs
- Express.js: https://expressjs.com
- TypeScript: https://www.typescriptlang.org/docs
- PostgreSQL 15: https://www.postgresql.org/docs/15
- React Native: https://reactnative.dev/docs
- Jest Testing: https://jestjs.io/docs

**Best Practices:**
- Anthropic Claude Code: https://docs.anthropic.com/claude/docs/claude-code
- RESTful API Design: https://restfulapi.net
- TDD with Jest: https://github.com/testjavascript/nodejs-integration-tests-best-practices
- PostgreSQL Performance: https://wiki.postgresql.org/wiki/Performance_Optimization

---

## 11. UNSTRUCTURED NOTES

### Open Questions for Architect Agent

**Q1: Match Result Verification Flow**
If both parties submit different scores (dispute scenario), what is the resolution mechanism? Options:
- Admin intervention (manual review) - requires admin dashboard
- Re-submission with consensus requirement - both must agree on single score
- Third-party referee system (future feature)
- Evidence-based (photo/video proof) - requires media review workflow

**Recommendation:** Start with re-submission consensus for MVP. If dispute persists after 3 attempts, escalate to admin intervention. Build admin dashboard in Phase 4.

**Q2: Leaderboard Calculation Algorithm**
Should rankings use simple win rate or ELO-style rating system? Considerations:
- Win rate: Simple, easy to understand, but doesn't account for opponent strength
- ELO: More sophisticated, rewards wins against strong opponents, but complex to explain
- Hybrid: Win rate for display, ELO for sorting

**Recommendation:** Use ELO-style algorithm (chess rating system adapted for sports) with transparent calculation display. Educate users with tooltip/help text.

**Q3: Team vs Individual Focus**
Should platform prioritize individual or team features? Current design supports both, but UX could optimize for one.
- Individual-first: Easier onboarding, more users, but less community building
- Team-first: Stronger retention, community, but higher activation friction

**Recommendation:** Individual-first for onboarding (register → challenge someone immediately), team features available but not required. Progressively suggest team creation after 3-5 individual matches.

**Q4: Freemium vs Free Forever**
Current design is free for MVP. When/how to monetize? Options:
- Premium subscriptions ($5/month): Unlimited challenges, priority support, advanced stats
- Tournament entry fees: Platform takes % of entry fees
- Ad-supported free tier: Display ads, premium removes ads
- Team/league subscriptions: Organizations pay for league management tools

**Recommendation:** Launch free for MVP, introduce freemium in Phase 5 after product-market fit proven. Premium features: advanced analytics, custom leaderboards, team branding, ad-free experience.

**Q5: Sport Configuration**
Should sports be hardcoded or data-driven? If data-driven, who can add sports?
- Hardcoded: Simple, controlled, but requires code changes for new sports
- Data-driven: Flexible, but risk of spam/invalid sports

**Recommendation:** Data-driven with admin approval. Core sports (pickleball, paddle, basketball, soccer, cricket) pre-seeded. Users can request new sports, admin approves and configures (scoring format, team size, etc.).

---

### Design Decisions Made

**Decision 1: Modular Monolith Architecture**
- **Rationale:** Simpler deployment, faster iteration for MVP, can extract services later if needed
- **Trade-off:** Harder to parallelize development initially, but maturity-based approach mitigates this
- **Future:** Migrate to microservices at 100K+ users when monolith becomes bottleneck

**Decision 2: PostgreSQL over MongoDB**
- **Rationale:** Relational model fits sports domain well (users, teams, matches, stats have clear relationships), complex queries needed for leaderboards/stats, ACID guarantees important for match results
- **Trade-off:** Less flexible schema changes vs document DB, but migrations manageable
- **Future:** Consider read replicas for scaling before considering NoSQL

**Decision 3: JWT over Session-Based Auth**
- **Rationale:** Stateless, mobile-friendly (no session cookies), easier to scale horizontally, aligns with microservices future
- **Trade-off:** Harder to invalidate tokens (need blacklist in Redis), larger payload size
- **Mitigation:** Short expiration (7 days) + refresh tokens, Redis blacklist for logout

**Decision 4: TDD with 90% Coverage Mandate**
- **Rationale:** High coverage enables confident refactoring and parallel development later, prevents regressions, serves as documentation
- **Trade-off:** Slower initial development, but faster long-term velocity
- **Enforcement:** CI/CD pipeline blocks merge if coverage drops below 90%

**Decision 5: Soft Deletes Pattern**
- **Rationale:** Preserve match history integrity (can't delete user/team if they have verified matches), enable data recovery, comply with GDPR "right to be forgotten" while maintaining audit trail
- **Implementation:** is_active flag on users/teams, left_at timestamp on team_members
- **Trade-off:** More complex queries (must filter is_active=true everywhere), but worth it for data integrity

---

### Risks & Concerns

**Risk 1: N+1 Query Performance**
- **Description:** user_sports JOIN in profile retrieval could cause N+1 queries if not optimized
- **Impact:** Slow API response times (>500ms), poor UX, high database load
- **Mitigation:** Eager loading with pg-promise, dataloader pattern, database indexing on foreign keys
- **Monitor:** Performance tests in each task, <100ms response time gate

**Risk 2: Match Result Disputes**
- **Description:** No clear resolution mechanism if parties disagree on score
- **Impact:** Frustration, trust issues, platform reputation damage
- **Mitigation:** Build admin dashboard for dispute resolution in Phase 4, require evidence (photos) for high-stakes matches (tournaments)
- **Monitor:** Track dispute rate, aim for <5% of matches disputed

**Risk 3: Leaderboard Calculation Bottleneck**
- **Description:** Denormalized stats queries could become slow (>500ms) as users/matches grow
- **Impact:** Poor UX on leaderboard page, high database load
- **Mitigation:** Redis sorted sets for real-time rankings, materialized views for complex aggregations, batch update stats (not real-time) if needed
- **Monitor:** Performance tests, migrate to Redis at 50K+ users

**Risk 4: Media Storage Costs**
- **Description:** S3 storage costs could escalate if users upload many high-res photos/videos
- **Impact:** Budget overrun, force migration or feature removal
- **Mitigation:** Implement usage limits (5 photos per match, 1 min video max), image compression on upload, CDN caching, consider Cloudinary free tier
- **Monitor:** Track storage costs monthly, alert if >$50/month

**Risk 5: Push Notification Reliability**
- **Description:** FCM has rate limits and delivery is not guaranteed (iOS/Android can block)
- **Impact:** Users miss match reminders, challenges go unnoticed, engagement drops
- **Mitigation:** Fallback to email for critical notifications, in-app notification center for backup, retry logic with exponential backoff
- **Monitor:** Track notification delivery rates, aim for >95% delivery

---

### Brainstorming (Ideas Not Committed)

**Idea 1: AI-Powered Opponent Recommendations**
- Use ML to suggest opponents based on skill level, location, play style, availability
- Could improve matchmaking quality and reduce search friction
- Requires significant data (100+ matches per user) before recommendations are useful
- Future feature, not MVP

**Idea 2: Wearable Integration (Apple Watch, Fitbit)**
- Auto-track stats during match (steps, heart rate, calories)
- Sync with Apple Health / Google Fit
- Adds "quantified self" angle, appeals to fitness enthusiasts
- Complex integration, low ROI for grassroots focus
- Future feature, not MVP

**Idea 3: Video Analysis Features**
- AI pose detection for form analysis ("Your backhand swing improved 15%")
- Highlight reel generation from match video
- Shot tracking and heatmaps
- Very complex, expensive infrastructure (video processing)
- Interesting differentiation but low priority
- Future feature, Phase 7+

**Idea 4: Social Challenges / Viral Loops**
- "Challenge a friend" referral mechanism (invite via SMS/email)
- Leaderboard challenges ("Beat the #1 player in your city and win $50")
- Badge system for achievements (100 wins, 10-match win streak, etc.)
- Could drive viral growth and engagement
- Phase 5-6 feature, after core product proven

**Idea 5: Corporate Team Building**
- B2B offering for companies to organize employee sports events
- Corporate leagues and tournaments
- Team building analytics and reports
- Monetization opportunity ($500-1000/month per corporate account)
- Pivot to B2B if B2C doesn't gain traction
- Future consideration

---

### Context from Original IDEA

**Learning Goals (Human Context):**
The developer originally wanted to master Claude Code workflows, parallel agent coordination, TDD methodology, and microservices patterns. Gully was chosen as the vehicle for learning these skills.

**Key Insight:** Feature completeness is secondary to architectural learning. The AI-driven development funnel itself is as important as the final product. This RefinedIDEA focuses on production-grade product vision while enabling the meta-goal of perfecting the AI development process.

**Time Constraint Evolution:**
Original prompt mentioned "90 minutes daily" and "3-9 month timeline". We've removed these artificial constraints and moved to feature-based, maturity-driven development. Time-based pressure creates rushed decisions and technical debt.

**Parallel Development Priority:**
Original prompt heavily emphasized "multiple Claude instances working simultaneously". We've incorporated this via the maturity model: sequential foundation → controlled parallel → full parallel. PM Agent orchestrates the fleet of specialized agents once foundation is stable.

---

### References

**Original Prompt:** docs/archives/prompts/prompt01.md
**Git Repository:** https://github.com/sibikrishnan/Gully.git
**Local Folder:** /Users/sibikrishnan/Documents/Gully
**Tech Stack Decision:** backend/.claude/schemas/TECH_SPEC.json
**Project Plan Example:** backend/.claude/schemas/PROJECT_PLAN_EXAMPLE_GULLY.json

---

**END OF REFINED_IDEA**
