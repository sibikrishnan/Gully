# Infrastructure Setup Guide

**Platform:** macOS (M1/M2 or Intel)
**Goal:** Zero-cost local development environment
**Time:** ~30 minutes

---

## Prerequisites Check

Run these commands to verify:

```bash
# Check Homebrew (package manager)
brew --version
# ✅ Should show: Homebrew 4.x.x

# Check Node.js
node --version
# ✅ Should show: v18.x or v20.x
# ❌ If not: brew install node@20

# Check Git
git --version
# ✅ Should show: git version 2.x.x
```

---

## Step 1: Install Docker Desktop (Required)

Docker Desktop is **free** for personal use and provides both Docker and Docker Compose.

### Installation Options:

#### Option A: Download from Docker Website (Recommended)
```bash
# Visit https://www.docker.com/products/docker-desktop
# Download "Docker Desktop for Mac" (Apple Silicon or Intel)
# Install the .dmg file
# Start Docker Desktop app
```

#### Option B: Install via Homebrew
```bash
brew install --cask docker

# Start Docker Desktop
open -a Docker

# Wait for Docker to fully start (whale icon in menu bar)
```

### Verify Docker Installation
```bash
# Check Docker
docker --version
# Should show: Docker version 24.x.x

# Check Docker Compose
docker compose version
# Should show: Docker Compose version v2.x.x

# Test Docker is running
docker run hello-world
# Should download and run a test container
```

---

## Step 2: Setup PostgreSQL & Redis via Docker Compose

Once Docker is running, proceed:

```bash
cd /Users/sibikrishnan/Documents/Gully/services/backend

# Start all services
docker compose up -d

# Verify services are running
docker compose ps

# Expected output:
# NAME                  IMAGE           STATUS          PORTS
# gully-postgres        postgres:15     Up 10 seconds   0.0.0.0:5432->5432/tcp
# gully-redis          redis:7         Up 10 seconds   0.0.0.0:6379->6379/tcp
```

### View Logs
```bash
# All services
docker compose logs -f

# Just PostgreSQL
docker compose logs -f postgres

# Just Redis
docker compose logs -f redis
```

### Stop Services
```bash
# Stop (data persists)
docker compose stop

# Stop and remove containers (data persists in volumes)
docker compose down

# Stop and DELETE all data (use carefully!)
docker compose down -v
```

---

## Step 3: Install Database Tools (Optional but Helpful)

### PostgreSQL CLI (psql)
```bash
# Install PostgreSQL client tools
brew install postgresql@15

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Test connection to Docker PostgreSQL
psql -h localhost -U gully_user -d gully_dev
# Password: gully_password (from .env file)
```

### Redis CLI
```bash
# Install Redis client tools
brew install redis

# Test connection to Docker Redis
redis-cli -h localhost -p 6379
# Should show: 127.0.0.1:6379>
# Test command: PING
# Should respond: PONG
```

### GUI Tools (Optional)
```bash
# PostgreSQL GUI: pgAdmin, TablePlus, or DBeaver
brew install --cask tableplus  # Recommended (free tier)

# Redis GUI: RedisInsight or Medis
brew install --cask redis  # This includes RedisInsight
```

---

## Step 4: Environment Variables

Create your local `.env` file:

```bash
cd /Users/sibikrishnan/Documents/Gully/services/backend

# Copy example to actual .env
cp .env.example .env

# Edit if needed (default values work for local dev)
# nano .env  # or use your editor
```

---

## Step 5: Verify Everything Works

Run this verification script:

```bash
cd /Users/sibikrishnan/Documents/Gully

# Run verification
./infrastructure/verify-setup.sh
```

Expected output:
```
✅ Docker is installed
✅ Docker Compose is installed
✅ PostgreSQL container is running
✅ Redis container is running
✅ Can connect to PostgreSQL
✅ Can connect to Redis
✅ Node.js is installed (v20.x.x)

🎉 Infrastructure setup complete!
```

---

## Troubleshooting

### Docker Desktop Won't Start
```bash
# Reset Docker Desktop
# Open Docker Desktop → Preferences → Reset → Reset to Factory Defaults
# Restart your Mac
```

### PostgreSQL Connection Refused
```bash
# Check if container is running
docker compose ps

# Check logs for errors
docker compose logs postgres

# Restart the container
docker compose restart postgres
```

### Port Already in Use
```bash
# Check what's using port 5432
lsof -i :5432

# If PostgreSQL is already installed locally:
brew services stop postgresql@15

# Or change port in docker-compose.yml
# ports: ["5433:5432"]  # Use 5433 instead
```

### Redis Connection Issues
```bash
# Check if container is running
docker compose ps

# Check logs
docker compose logs redis

# Test connection
docker exec -it gully-redis redis-cli PING
# Should respond: PONG
```

---

## Daily Usage

### Starting Your Dev Environment
```bash
# Navigate to project
cd /Users/sibikrishnan/Documents/Gully/services/backend

# Start all services (PostgreSQL, Redis)
docker compose up -d

# Verify running
docker compose ps

# Start your app (after Week 1 setup)
npm run dev
```

### Stopping Your Dev Environment
```bash
# Stop services (data persists)
docker compose stop

# Or stop and remove containers
docker compose down
```

### Resetting Database (Fresh Start)
```bash
# WARNING: This deletes all data!
docker compose down -v  # -v removes volumes
docker compose up -d
npm run migrate:latest  # Re-run migrations
npm run seed:run        # Re-seed test data
```

---

## Cost Verification

✅ **Docker Desktop:** Free for personal use
✅ **PostgreSQL:** Running locally, $0
✅ **Redis:** Running locally, $0
✅ **All tools:** Open source, free

**Total Monthly Cost:** $0

---

## Next Steps

After infrastructure is running:
1. Install Node.js dependencies: `cd services/backend && npm install`
2. Run database migrations: `npm run migrate:latest`
3. Seed test data: `npm run seed:run`
4. Start development server: `npm run dev`
5. Access app: `http://localhost:3000/health`

See `docs/archives/tasks/WEEK1_TASKS.md` for Week 1 development tasks.

---

**Last Updated:** Week 1, Day 1
**Support:** Check Docker Desktop logs or ask Claude Code for help
