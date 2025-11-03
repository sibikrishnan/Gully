# Database Indexes

**Purpose:** Performance optimization through strategic indexing.

---

## Index Strategy

**General Rules:**
1. **Index foreign keys** - Always index columns used in JOINs
2. **Index WHERE clauses** - Columns frequently in WHERE/HAVING
3. **Index ORDER BY** - Columns used for sorting
4. **Composite indexes** - When multiple columns queried together
5. **Don't over-index** - Each index adds write overhead

---

## users Table

```sql
-- Primary key (automatic)
PRIMARY KEY (id)

-- Email lookups (login, uniqueness)
CREATE INDEX idx_users_email ON users(email);
```

**Query patterns:**
- `SELECT * FROM users WHERE email = ?` (login)
- `SELECT * FROM users WHERE id = ?` (profile fetch)

---

## user_sports Table

```sql
-- Primary key (automatic)
PRIMARY KEY (id)

-- User's sports lookup
CREATE INDEX idx_user_sports_user_id ON user_sports(user_id);

-- Find users by sport
CREATE INDEX idx_user_sports_sport ON user_sports(sport);

-- Composite unique constraint (prevents duplicates)
UNIQUE(user_id, sport)
```

**Query patterns:**
- `SELECT * FROM user_sports WHERE user_id = ?` (user profile)
- `SELECT * FROM user_sports WHERE sport = ?` (find players)
- `SELECT * FROM user_sports WHERE user_id = ? AND sport = ?` (check preference)

---

## teams Table

```sql
-- Primary key (automatic)
PRIMARY KEY (id)

-- Captain's teams
CREATE INDEX idx_teams_captain_id ON teams(captain_id);

-- Teams by sport
CREATE INDEX idx_teams_sport ON teams(sport);
```

**Query patterns:**
- `SELECT * FROM teams WHERE captain_id = ?` (user's teams)
- `SELECT * FROM teams WHERE sport = ?` (find teams)
- `SELECT * FROM teams WHERE id = ?` (team profile)

---

## team_members Table

```sql
-- Primary key (automatic)
PRIMARY KEY (id)

-- Team roster lookup
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- User's teams lookup
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- Composite unique constraint
UNIQUE(team_id, user_id)
```

**Query patterns:**
- `SELECT * FROM team_members WHERE team_id = ?` (roster)
- `SELECT * FROM team_members WHERE user_id = ?` (user's teams)
- `SELECT * FROM team_members WHERE team_id = ? AND user_id = ?` (membership check)

**Possible composite index (if needed):**
```sql
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);
```

---

## challenges Table

```sql
-- Primary key (automatic)
PRIMARY KEY (id)

-- Challenger's challenges (sent)
CREATE INDEX idx_challenges_challenger ON challenges(challenger_type, challenger_id);

-- Challenged's challenges (received)
CREATE INDEX idx_challenges_challenged ON challenges(challenged_type, challenged_id);

-- Status filtering
CREATE INDEX idx_challenges_status ON challenges(status);
```

**Query patterns:**
- `SELECT * FROM challenges WHERE challenger_type = ? AND challenger_id = ?` (sent challenges)
- `SELECT * FROM challenges WHERE challenged_type = ? AND challenged_id = ?` (received challenges)
- `SELECT * FROM challenges WHERE status = 'pending'` (pending challenges)

**Possible composite index (if filtering by status is common):**
```sql
CREATE INDEX idx_challenges_challenger_status
  ON challenges(challenger_type, challenger_id, status);
```

---

## matches Table

```sql
-- Primary key (automatic)
PRIMARY KEY (id)

-- Team 1's matches
CREATE INDEX idx_matches_team1 ON matches(team1_type, team1_id);

-- Team 2's matches
CREATE INDEX idx_matches_team2 ON matches(team2_type, team2_id);

-- Status filtering
CREATE INDEX idx_matches_status ON matches(status);

-- Scheduled matches ordering
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
```

**Query patterns:**
- `SELECT * FROM matches WHERE team1_type = ? AND team1_id = ?` (team's matches)
- `SELECT * FROM matches WHERE team2_type = ? AND team2_id = ?` (team's matches)
- `SELECT * FROM matches WHERE status = 'scheduled' ORDER BY scheduled_at` (upcoming matches)
- `SELECT * FROM matches WHERE status = 'completed'` (past matches for stats)

**Possible composite indexes:**
```sql
-- Upcoming matches for a team
CREATE INDEX idx_matches_team1_scheduled
  ON matches(team1_type, team1_id, status, scheduled_at);

-- Match history with status filter
CREATE INDEX idx_matches_status_scheduled
  ON matches(status, scheduled_at DESC);
```

---

## Index Maintenance

### Monitor Index Usage

```sql
-- PostgreSQL: Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

**Action:** Drop indexes with 0 scans after 1 month

### Monitor Index Size

```sql
-- Check index sizes
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::regclass) DESC;
```

### EXPLAIN ANALYZE

```sql
-- Check if index is being used
EXPLAIN ANALYZE
SELECT * FROM matches
WHERE team1_type = 'team' AND team1_id = '123'
ORDER BY scheduled_at DESC;
```

**Look for:** "Index Scan" vs "Seq Scan"

---

## When to Add More Indexes

**Add index if:**
- Query appears in slow query log (>500ms)
- Query scans >1000 rows
- Query is executed frequently (>100 times/day)

**Don't add index if:**
- Table has <1000 rows (seq scan is fast enough)
- Column has low cardinality (many duplicates)
- Write performance is critical (indexes slow INSERTs)

---

## Composite Index Guidelines

**Order matters!**

```sql
-- Good: supports WHERE sport = ? AND skill_level = ?
CREATE INDEX idx_user_sports_sport_skill ON user_sports(sport, skill_level);

-- Also supports: WHERE sport = ? (first column only)

-- Does NOT support: WHERE skill_level = ? (second column only)
```

**Rule:** Most selective column first, or follow WHERE clause order

---

**Current Status:** Basic indexes in place for MVP
**Review:** After Week 12, analyze slow queries and add targeted indexes
