# Docker Commands

**Purpose:** Docker Compose operations for local development.

---

## Starting Services

```bash
# Start all services in background
docker compose up -d

# Start with logs visible (foreground)
docker compose up

# Start specific service only
docker compose up -d postgres
docker compose up -d redis

# Rebuild and start (after Dockerfile changes)
docker compose up -d --build
```

---

## Checking Status

```bash
# Check running containers
docker compose ps

# View all containers (including stopped)
docker compose ps -a

# Check resource usage (CPU, memory)
docker stats

# Check service health
docker compose ps --format json
```

---

## Viewing Logs

```bash
# View logs for all services
docker compose logs

# Follow logs in real-time (tail -f equivalent)
docker compose logs -f

# View logs for specific service
docker compose logs -f postgres
docker compose logs -f redis

# Last 50 lines only
docker compose logs --tail=50

# Logs since timestamp
docker compose logs --since="2024-01-01T00:00:00"

# Follow logs for multiple services
docker compose logs -f postgres redis
```

---

## Stopping Services

```bash
# Stop services (containers remain, data persists)
docker compose stop

# Stop specific service
docker compose stop postgres

# Stop and remove containers (volumes persist)
docker compose down

# Stop and remove including volumes (DANGER: data loss!)
docker compose down -v

# Stop and remove including images
docker compose down --rmi all
```

---

## Restarting Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart postgres

# Restart with rebuild
docker compose up -d --build --force-recreate
```

---

## Executing Commands in Containers

```bash
# Run command in running container
docker compose exec postgres psql -U gully_user -d gully_dev

# Run command in new container instance
docker compose run postgres psql -U gully_user -d gully_dev

# Interactive shell in container
docker compose exec postgres sh
docker compose exec postgres bash

# Execute as specific user
docker compose exec -u postgres postgres psql
```

---

## Inspecting Containers

```bash
# View container details
docker compose inspect postgres

# View container processes
docker compose top postgres

# View container port mappings
docker compose port postgres 5432

# View environment variables
docker compose exec postgres env
```

---

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect gully_postgres_data

# Remove unused volumes (careful!)
docker volume prune

# Backup volume data
docker run --rm -v gully_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect gully_default

# View network connections
docker network inspect gully_default --format '{{json .Containers}}'
```

---

## Cleaning Up

```bash
# Remove stopped containers
docker compose rm

# Remove everything (containers, networks, volumes)
docker compose down -v

# System-wide cleanup (Docker)
docker system prune

# Remove unused images, containers, volumes
docker system prune -a --volumes

# Check disk usage
docker system df
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs for errors
docker compose logs postgres

# Check if port is already in use
lsof -i :5432  # macOS/Linux
netstat -an | grep 5432  # Windows

# Remove and recreate
docker compose down
docker compose up -d
```

### Container Keeps Restarting

```bash
# View restart count
docker compose ps

# Check logs for crash reason
docker compose logs --tail=100 postgres

# Check resource limits
docker stats postgres
```

### Can't Connect to Database

```bash
# Check if container is running
docker compose ps

# Check if port is exposed
docker compose port postgres 5432

# Test connection from host
psql -h localhost -p 5432 -U gully_user -d gully_dev

# Test connection from another container
docker compose exec backend psql -h postgres -U gully_user -d gully_dev
```

### Slow Performance

```bash
# Check resource usage
docker stats

# Check if volumes are mounted correctly
docker compose config

# Restart services
docker compose restart
```

---

## Development Workflow

### Daily Startup

```bash
cd backend
docker compose up -d
docker compose ps  # Verify running
docker compose logs -f  # Check for errors
```

### Daily Shutdown

```bash
docker compose stop  # Preserve data
# OR
docker compose down  # Remove containers but keep volumes
```

### Fresh Start (Reset Everything)

```bash
docker compose down -v  # Remove volumes
docker compose up -d    # Start clean
npm run migrate:latest  # Re-run migrations
npm run seed:run        # Re-seed data
```

---

## docker-compose.yml Reference

**Location:** `backend/docker-compose.yml`

**Services:**
- `postgres` - PostgreSQL 15+ database
- `redis` - Redis 7+ cache

**Volumes:**
- `postgres_data` - PostgreSQL data persistence
- `redis_data` - Redis data persistence (optional)

**Networks:**
- `gully_network` - Internal network for services

---

**Tip:** Always use `docker compose` (with space) not `docker-compose` (hyphen) - newer syntax!
