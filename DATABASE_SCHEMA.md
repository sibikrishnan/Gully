# Gully - Database Schema

## PostgreSQL Tables

### users
```sql
id                  UUID PRIMARY KEY
username            VARCHAR(50) UNIQUE NOT NULL
email               VARCHAR(255) UNIQUE NOT NULL
password_hash       VARCHAR(255) NOT NULL
phone               VARCHAR(20)
full_name           VARCHAR(100)
avatar_url          VARCHAR(500)
bio                 TEXT
location_city       VARCHAR(100)
location_country    VARCHAR(100)
date_of_birth       DATE
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
last_active         TIMESTAMP
is_verified         BOOLEAN DEFAULT FALSE
is_active           BOOLEAN DEFAULT TRUE
```

### user_sports
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES users(id)
sport_name          VARCHAR(50) NOT NULL
skill_level         VARCHAR(20) -- beginner, intermediate, advanced, expert
years_experience    INTEGER
preferred_position  VARCHAR(50)
created_at          TIMESTAMP DEFAULT NOW()
UNIQUE(user_id, sport_name)
```

### teams
```sql
id                  UUID PRIMARY KEY
name                VARCHAR(100) NOT NULL
sport_name          VARCHAR(50) NOT NULL
captain_id          UUID REFERENCES users(id)
logo_url            VARCHAR(500)
description         TEXT
location_city       VARCHAR(100)
is_public           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
is_active           BOOLEAN DEFAULT TRUE
```

### team_members
```sql
id                  UUID PRIMARY KEY
team_id             UUID REFERENCES teams(id) ON DELETE CASCADE
user_id             UUID REFERENCES users(id)
role                VARCHAR(20) DEFAULT 'member' -- captain, member
joined_at           TIMESTAMP DEFAULT NOW()
is_active           BOOLEAN DEFAULT TRUE
UNIQUE(team_id, user_id)
```

### challenges
```sql
id                  UUID PRIMARY KEY
challenger_id       UUID -- can be user_id or team_id
challenged_id       UUID -- can be user_id or team_id
challenger_type     VARCHAR(10) -- 'user' or 'team'
challenged_type     VARCHAR(10) -- 'user' or 'team'
sport_name          VARCHAR(50) NOT NULL
proposed_datetime   TIMESTAMP NOT NULL
venue_name          VARCHAR(200)
venue_address       TEXT
message             TEXT
status              VARCHAR(20) DEFAULT 'pending' -- pending, accepted, declined, cancelled
created_at          TIMESTAMP DEFAULT NOW()
responded_at        TIMESTAMP
```

### matches
```sql
id                  UUID PRIMARY KEY
challenge_id        UUID REFERENCES challenges(id)
team1_id            UUID -- References teams or users
team2_id            UUID -- References teams or users
team1_type          VARCHAR(10) -- 'user' or 'team'
team2_type          VARCHAR(10) -- 'user' or 'team'
sport_name          VARCHAR(50) NOT NULL
scheduled_datetime  TIMESTAMP NOT NULL
venue_name          VARCHAR(200)
venue_address       TEXT
team1_score         INTEGER
team2_score         INTEGER
winner_id           UUID
status              VARCHAR(20) DEFAULT 'scheduled' -- scheduled, completed, cancelled, disputed
result_verified     BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP DEFAULT NOW()
completed_at        TIMESTAMP
```

### leagues
```sql
id                  UUID PRIMARY KEY
name                VARCHAR(100) NOT NULL
sport_name          VARCHAR(50) NOT NULL
creator_id          UUID REFERENCES users(id)
description         TEXT
season_start        DATE NOT NULL
season_end          DATE NOT NULL
max_teams           INTEGER
points_win          INTEGER DEFAULT 3
points_draw         INTEGER DEFAULT 1
points_loss         INTEGER DEFAULT 0
is_public           BOOLEAN DEFAULT TRUE
status              VARCHAR(20) DEFAULT 'open' -- open, active, completed
created_at          TIMESTAMP DEFAULT NOW()
```

### league_teams
```sql
id                  UUID PRIMARY KEY
league_id           UUID REFERENCES leagues(id) ON DELETE CASCADE
team_id             UUID REFERENCES teams(id)
matches_played      INTEGER DEFAULT 0
wins                INTEGER DEFAULT 0
draws               INTEGER DEFAULT 0
losses              INTEGER DEFAULT 0
points              INTEGER DEFAULT 0
goals_for           INTEGER DEFAULT 0
goals_against       INTEGER DEFAULT 0
joined_at           TIMESTAMP DEFAULT NOW()
UNIQUE(league_id, team_id)
```

### tournaments
```sql
id                  UUID PRIMARY KEY
name                VARCHAR(100) NOT NULL
sport_name          VARCHAR(50) NOT NULL
creator_id          UUID REFERENCES users(id)
description         TEXT
tournament_type     VARCHAR(30) -- single_elimination, double_elimination, round_robin
start_date          DATE NOT NULL
end_date            DATE
max_participants    INTEGER
registration_deadline DATE
status              VARCHAR(20) DEFAULT 'registration' -- registration, active, completed
bracket_data        JSONB -- stores bracket structure
created_at          TIMESTAMP DEFAULT NOW()
```

### tournament_participants
```sql
id                  UUID PRIMARY KEY
tournament_id       UUID REFERENCES tournaments(id) ON DELETE CASCADE
participant_id      UUID -- team_id or user_id
participant_type    VARCHAR(10) -- 'user' or 'team'
seed_number         INTEGER
is_eliminated       BOOLEAN DEFAULT FALSE
final_position      INTEGER
registered_at       TIMESTAMP DEFAULT NOW()
UNIQUE(tournament_id, participant_id)
```

### marketplace_items
```sql
id                  UUID PRIMARY KEY
seller_id           UUID REFERENCES users(id)
title               VARCHAR(200) NOT NULL
description         TEXT
category            VARCHAR(50) -- equipment, apparel, services, other
sport_name          VARCHAR(50)
price               DECIMAL(10,2) NOT NULL
currency            VARCHAR(3) DEFAULT 'USD'
condition           VARCHAR(20) -- new, like_new, good, fair, poor
location_city       VARCHAR(100)
images              TEXT[] -- array of image URLs
status              VARCHAR(20) DEFAULT 'active' -- active, sold, removed
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP DEFAULT NOW()
```

### orders
```sql
id                  UUID PRIMARY KEY
item_id             UUID REFERENCES marketplace_items(id)
buyer_id            UUID REFERENCES users(id)
seller_id           UUID REFERENCES users(id)
amount              DECIMAL(10,2) NOT NULL
status              VARCHAR(20) DEFAULT 'pending' -- pending, completed, cancelled, refunded
payment_id          VARCHAR(100) -- Stripe payment ID
created_at          TIMESTAMP DEFAULT NOW()
completed_at        TIMESTAMP
```

### notifications
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES users(id)
type                VARCHAR(50) NOT NULL -- challenge_received, match_reminder, etc.
title               VARCHAR(200) NOT NULL
message             TEXT
data                JSONB -- additional metadata
is_read             BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP DEFAULT NOW()
```

### friendships
```sql
id                  UUID PRIMARY KEY
user1_id            UUID REFERENCES users(id)
user2_id            UUID REFERENCES users(id)
status              VARCHAR(20) DEFAULT 'pending' -- pending, accepted, blocked
created_at          TIMESTAMP DEFAULT NOW()
accepted_at         TIMESTAMP
UNIQUE(user1_id, user2_id)
```

---

## MongoDB Collections

### match_stats
```json
{
  "_id": "ObjectId",
  "match_id": "UUID",
  "sport_name": "string",
  "player_stats": [
    {
      "user_id": "UUID",
      "team_id": "UUID",
      "goals": 0,
      "assists": 0,
      "shots": 0,
      "fouls": 0,
      // sport-specific stats
    }
  ],
  "team_stats": {
    "team1": { "possession": 55, "shots": 12 },
    "team2": { "possession": 45, "shots": 8 }
  },
  "created_at": "ISODate"
}
```

### video_highlights
```json
{
  "_id": "ObjectId",
  "match_id": "UUID",
  "user_id": "UUID",
  "title": "string",
  "description": "string",
  "video_url": "string",
  "thumbnail_url": "string",
  "duration_seconds": 0,
  "views": 0,
  "likes": 0,
  "tags": ["string"],
  "created_at": "ISODate"
}
```

### activity_logs
```json
{
  "_id": "ObjectId",
  "user_id": "UUID",
  "activity_type": "string",
  "entity_type": "string",
  "entity_id": "UUID",
  "metadata": {},
  "timestamp": "ISODate"
}
```

---

## Redis Keys

### Session Management
- `session:{user_id}` → session data
- `refresh_token:{token}` → user_id

### Caching
- `user:{user_id}` → user object (TTL: 1 hour)
- `team:{team_id}` → team object (TTL: 1 hour)
- `leaderboard:{sport}:{type}` → sorted set

### Real-time
- `online_users` → set of user_ids
- `match_live:{match_id}` → live match data

### Rate Limiting
- `rate_limit:{user_id}:{endpoint}` → counter

---

## Indexes

### PostgreSQL
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_sport ON teams(sport_name);
CREATE INDEX idx_matches_datetime ON matches(scheduled_datetime);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_league_teams_points ON league_teams(points DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_marketplace_status_sport ON marketplace_items(status, sport_name);
```

### MongoDB
```javascript
db.match_stats.createIndex({ "match_id": 1 });
db.video_highlights.createIndex({ "user_id": 1, "created_at": -1 });
db.activity_logs.createIndex({ "user_id": 1, "timestamp": -1 });
```
