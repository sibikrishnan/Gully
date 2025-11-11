# PostgreSQL Tables Schema

**Purpose:** Complete database table definitions for all entities.

---

## users

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

CREATE INDEX idx_users_email ON users(email);
```

**Purpose:** User accounts, profiles, authentication

---

## user_sports

```sql
CREATE TABLE user_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport VARCHAR(50) NOT NULL, -- 'cricket', 'football', etc.
  skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, sport)
);

CREATE INDEX idx_user_sports_user_id ON user_sports(user_id);
CREATE INDEX idx_user_sports_sport ON user_sports(sport);
```

**Purpose:** User sport preferences and skill levels (many-to-many relationship)

---

## teams

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

CREATE INDEX idx_teams_captain_id ON teams(captain_id);
CREATE INDEX idx_teams_sport ON teams(sport);
```

**Purpose:** Team information and metadata

---

## team_members

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

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
```

**Purpose:** Team membership and roles (many-to-many relationship)

---

## challenges

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

CREATE INDEX idx_challenges_challenger ON challenges(challenger_type, challenger_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_type, challenged_id);
CREATE INDEX idx_challenges_status ON challenges(status);
```

**Purpose:** Challenge requests between users/teams

**Notes:** Polymorphic relationships (challenger/challenged can be user OR team)

---

## matches

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

CREATE INDEX idx_matches_team1 ON matches(team1_type, team1_id);
CREATE INDEX idx_matches_team2 ON matches(team2_type, team2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at);
```

**Purpose:** Scheduled and completed matches

**Notes:** Polymorphic relationships for participants and winners

---

## notifications (Future - v2+)

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

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

**Purpose:** User notifications (deferred to v2+)

---

## friendships (Future - v2+)

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
```

**Purpose:** User connections (deferred to v2+)

---

## Key Design Decisions

**UUIDs vs Auto-increment IDs:**
- Using UUIDs for better distribution, no sequential guessing
- Trade-off: Slightly larger storage, but better for distributed systems later

**Polymorphic Relationships:**
- challenges/matches support both user and team entities
- Uses type + id columns (e.g., `challenger_type`, `challenger_id`)

**Soft Deletes:**
- Not implemented (KISS principle for MVP)
- Use `ON DELETE CASCADE` or `ON DELETE SET NULL`

**Timestamps:**
- `created_at` on all tables
- `updated_at` on entities that can be modified

---

**Total Tables (MVP):** 6 core tables
**Total Tables (Future):** +2 for notifications, friendships
