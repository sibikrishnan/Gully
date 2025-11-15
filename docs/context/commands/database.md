# Database Commands

**Purpose:** PostgreSQL and Redis operations for development.

---

## Migrations

### Running Migrations

```bash
# Run all pending migrations
npm run migrate:latest

# Dry run (see what would be executed)
npm run migrate:latest -- --dry-run

# Run specific migration
npm run migrate:up <migration_name>
```

### Rolling Back Migrations

```bash
# Rollback last migration
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback --all

# Rollback to specific migration
npm run migrate:rollback --to <migration_name>
```

### Creating Migrations

```bash
# Create new migration file
npm run migrate:create <migration_name>

# Example:
npm run migrate:create create_users_table
npm run migrate:create add_avatar_to_users
```

**Migration file created:** `migrations/YYYYMMDDHHMMSS_migration_name.js`

### Checking Migration Status

```bash
# List applied and pending migrations
npm run migrate:status

# Check current version
npm run migrate:current-version
```

---

## Seeding

### Running Seeds

```bash
# Run all seed files in order
npm run seed:run

# Run specific seed file
npm run seed:run --specific=01_users.js
npm run seed:run --specific=02_teams.js

# Force re-seed (even if already run)
npm run seed:run --force
```

### Creating Seed Files

```bash
# Create new seed file
npm run seed:create <seed_name>

# Example:
npm run seed:create users
npm run seed:create teams
```

**Seed file created:** `seeds/##_seed_name.js`

---

## Direct PostgreSQL Access

### Connecting via psql

```bash
# Connect to database
psql -h localhost -p 5432 -U gully_user -d gully_dev
# Password: gully_password

# Connect with connection string
psql postgresql://gully_user:gully_password@localhost:5432/gully_dev

# Connect from Docker container
docker compose exec postgres psql -U gully_user -d gully_dev
```

### Common psql Commands

```sql
-- List all databases
\l

-- List all tables
\dt

-- Describe table structure
\d users
\d+ users  -- More details

-- List all indexes
\di

-- List all views
\dv

-- Show table sizes
\dt+

-- Execute SQL file
\i /path/to/file.sql

-- Change database
\c gully_dev

-- Quit psql
\q

-- Help
\?
\h SELECT  -- Help on specific command
```

### Running SQL Queries

```bash
# Run query from command line
psql -h localhost -U gully_user -d gully_dev -c "SELECT * FROM users;"

# Run SQL file
psql -h localhost -U gully_user -d gully_dev -f script.sql

# Run query and output to CSV
psql -h localhost -U gully_user -d gully_dev -c "COPY users TO STDOUT WITH CSV HEADER" > users.csv
```

---

## Database Backup & Restore

### Backup

```bash
# Dump entire database
pg_dump -h localhost -U gully_user gully_dev > backup.sql

# Dump with compression
pg_dump -h localhost -U gully_user gully_dev | gzip > backup.sql.gz

# Dump specific tables only
pg_dump -h localhost -U gully_user -t users -t teams gully_dev > backup.sql

# Dump schema only (no data)
pg_dump -h localhost -U gully_user --schema-only gully_dev > schema.sql

# Dump data only (no schema)
pg_dump -h localhost -U gully_user --data-only gully_dev > data.sql
```

### Restore

```bash
# Restore from backup
psql -h localhost -U gully_user -d gully_dev < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql -h localhost -U gully_user -d gully_dev

# Drop and recreate database, then restore
dropdb -h localhost -U gully_user gully_dev
createdb -h localhost -U gully_user gully_dev
psql -h localhost -U gully_user -d gully_dev < backup.sql
```

---

## Database Inspection

### Common SQL Queries

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Count records in each table
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM teams) as teams,
  (SELECT COUNT(*) FROM matches) as matches
FROM pg_tables
WHERE schemaname = 'public';

-- Check migration status
SELECT * FROM knex_migrations ORDER BY id;
SELECT * FROM knex_migrations_lock;

-- View table columns and types
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users';

-- Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check database size
SELECT pg_size_pretty(pg_database_size('gully_dev'));

-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

---

## Redis Commands

### Connecting via redis-cli

```bash
# Connect to Redis
redis-cli -h localhost -p 6379

# Connect with authentication (if set)
redis-cli -h localhost -p 6379 -a <password>

# Connect from Docker container
docker compose exec redis redis-cli
```

### Common Redis Commands

```bash
# Check connection
PING
# Response: PONG

# View all keys (DEV ONLY - slow on production!)
KEYS *

# Search keys by pattern
KEYS user:*
KEYS session:*

# Get specific key
GET session:abc123

# Set key with expiration
SET session:xyz456 "value" EX 3600

# Delete key
DEL session:abc123

# Check if key exists
EXISTS user:123

# Get key type
TYPE leaderboard:cricket

# Get TTL (time to live)
TTL session:abc123

# View key value (any type)
DUMP session:abc123

# Sorted set operations (leaderboards)
ZADD leaderboard:cricket 100 user:123
ZRANGE leaderboard:cricket 0 9 WITHSCORES  # Top 10
ZREVRANGE leaderboard:cricket 0 9 WITHSCORES  # Top 10 descending
ZRANK leaderboard:cricket user:123  # Get rank
ZSCORE leaderboard:cricket user:123  # Get score

# List operations (queues)
LPUSH notifications:queue "notification1"
RPOP notifications:queue

# Check memory usage
INFO memory
MEMORY USAGE session:abc123

# Check database size
DBSIZE

# Flush all data (DANGER!)
FLUSHDB  # Current database
FLUSHALL  # All databases

# Exit redis-cli
exit
```

### Redis Monitoring

```bash
# Monitor all commands in real-time
redis-cli MONITOR

# Get server info
redis-cli INFO
redis-cli INFO stats
redis-cli INFO memory
redis-cli INFO replication

# Check slow log
redis-cli SLOWLOG GET 10

# Check client connections
redis-cli CLIENT LIST
```

---

## Troubleshooting

### Migration Fails

```bash
# Check if migration is locked
SELECT * FROM knex_migrations_lock;

# Manually unlock if stuck
UPDATE knex_migrations_lock SET is_locked = 0;

# Check last run migration
SELECT * FROM knex_migrations ORDER BY id DESC LIMIT 1;

# Manually mark migration as run (careful!)
INSERT INTO knex_migrations (name, batch, migration_time)
VALUES ('YYYYMMDDHHMMSS_migration_name', 1, NOW());
```

### Can't Connect to Database

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
psql -h localhost -p 5432 -U gully_user -d gully_dev

# Check if port is available
lsof -i :5432
```

### Database Performance Issues

```sql
-- Find slow queries (PostgreSQL)
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '1 second';

-- Kill long-running query
SELECT pg_terminate_backend(pid);

-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Analyze table statistics
ANALYZE users;
ANALYZE teams;

-- Vacuum tables
VACUUM users;
VACUUM ANALYZE users;
```

---

## Development Workflow

### Fresh Database Setup

```bash
# 1. Start Docker services
docker compose up -d

# 2. Run migrations
npm run migrate:latest

# 3. Seed data
npm run seed:run

# 4. Verify
psql -h localhost -U gully_user -d gully_dev -c "SELECT COUNT(*) FROM users;"
```

### Reset Database

```bash
# Option 1: Rollback and rerun
npm run migrate:rollback --all
npm run migrate:latest
npm run seed:run

# Option 2: Drop and recreate (faster)
docker compose down -v
docker compose up -d
npm run migrate:latest
npm run seed:run
```

---

**Tip:** Always backup before running destructive operations!
