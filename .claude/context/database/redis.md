# Redis Data Structures

**Purpose:** Caching, sessions, and ephemeral data storage patterns.

---

## Session Management

```
Key Pattern: session:{user_id}
Type: String (JSON)
TTL: 7 days (604800 seconds)
Value: {
  userId: "uuid",
  email: "user@example.com",
  exp: 1234567890,
  ...
}
```

**Usage:**
- Store JWT session data
- Quick authentication checks
- Automatic expiration via TTL

**Example:**
```typescript
// Set session
await redis.set(
  `session:${userId}`,
  JSON.stringify(sessionData),
  'EX',
  604800
);

// Get session
const session = await redis.get(`session:${userId}`);
```

---

## User Cache

```
Key Pattern: user:{user_id}
Type: String (JSON)
TTL: 1 hour (3600 seconds)
Value: {
  id: "uuid",
  email: "user@example.com",
  full_name: "John Doe",
  avatar_url: "https://...",
  ...
}
```

**Usage:**
- Cache frequently accessed user profiles
- Reduce database queries
- Invalidate on profile updates

---

## Team Cache

```
Key Pattern: team:{team_id}
Type: String (JSON)
TTL: 1 hour (3600 seconds)
Value: {
  id: "uuid",
  name: "Team Alpha",
  captain_id: "uuid",
  sport: "cricket",
  ...
}
```

**Usage:**
- Cache team details
- Include member count for leaderboard displays
- Invalidate on team updates

---

## Leaderboard (by sport)

```
Key Pattern: leaderboard:{sport}
Type: Sorted Set (ZSET)
Score: win_count or win_percentage
Member: user_id or team_id
TTL: No expiration (manually refresh)
```

**Usage:**
- Real-time leaderboard rankings
- Fast range queries (top 10, top 100)
- Efficient score updates

**Example:**
```typescript
// Add to leaderboard
await redis.zadd(`leaderboard:cricket`, winCount, userId);

// Get top 10
const top10 = await redis.zrevrange(
  `leaderboard:cricket`,
  0,
  9,
  'WITHSCORES'
);

// Get user rank
const rank = await redis.zrevrank(`leaderboard:cricket`, userId);
```

---

## Rate Limiting

```
Key Pattern: ratelimit:{user_id}:{endpoint}
Type: String (counter)
TTL: 1 minute (60 seconds) or 1 hour
Value: request_count (integer)
```

**Usage:**
- Prevent API abuse
- Throttle expensive operations
- Auto-reset via TTL

**Example:**
```typescript
// Increment counter
const count = await redis.incr(`ratelimit:${userId}:${endpoint}`);
if (count === 1) {
  await redis.expire(`ratelimit:${userId}:${endpoint}`, 60);
}

// Check limit
if (count > RATE_LIMIT) {
  throw new Error('Rate limit exceeded');
}
```

**Common Limits:**
- Login attempts: 5 per minute
- API calls: 100 per hour
- Challenge creation: 10 per hour

---

## Real-time Presence (Future - v2+)

```
Key Pattern: presence:{user_id}
Type: String
TTL: 5 minutes (300 seconds)
Value: last_seen_timestamp (ISO 8601)
```

**Usage:**
- Track online/offline status
- Show "last seen" indicators
- Heartbeat pattern (client pings every 2 minutes)

---

## Challenge Notifications Queue (Future - v2+)

```
Key Pattern: notifications:queue
Type: List
TTL: No expiration
Value: JSON notification objects
```

**Usage:**
- Queue notifications for processing
- LPUSH for new notifications
- RPOP for worker consumption

---

## Cache Invalidation Strategy

**User Profile Updated:**
```typescript
await redis.del(`user:${userId}`);
```

**Team Updated:**
```typescript
await redis.del(`team:${teamId}`);
// Also invalidate team members' caches if needed
```

**Match Completed:**
```typescript
// Recalculate and update leaderboard
await updateLeaderboard(sport);
// Invalidate user/team caches
await redis.del(`user:${userId}`);
```

---

## Redis Configuration

**docker-compose.yml:**
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
```

**Connection (Node.js):**
```typescript
import { createClient } from 'redis';

const redis = createClient({
  url: 'redis://localhost:6379'
});

await redis.connect();
```

---

## Memory Management

**Eviction Policy:** `allkeys-lru` (least recently used)

**Max Memory:** 256MB for MVP (adjust based on usage)

**Monitoring:**
```bash
# Check memory usage
redis-cli INFO memory

# Check key count
redis-cli DBSIZE

# List all keys (dev only!)
redis-cli KEYS *
```

---

**Principle:** Use Redis for ephemeral data only. PostgreSQL is source of truth.
