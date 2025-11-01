# Start Docker Desktop (Required)

You installed `docker` CLI via Homebrew, but Docker Desktop app is needed to run containers.

## Install Docker Desktop

### Option 1: Download Manually (Recommended)
1. Visit: https://www.docker.com/products/docker-desktop
2. Download **Docker Desktop for Mac** (Apple Silicon/M1/M2)
3. Install the `.dmg` file
4. Open **Docker Desktop** from Applications folder
5. Wait for Docker to start (whale icon in menu bar)

### Option 2: Install via Homebrew Cask
```bash
brew install --cask docker
```

Then open Docker Desktop:
```bash
open /Applications/Docker.app
```

---

## Verify Docker is Running

After Docker Desktop starts, run:

```bash
# Check Docker daemon is running
docker ps

# Should show: CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS   NAMES
# (empty list is fine)
```

---

## Start Gully Infrastructure

Once Docker is running:

```bash
cd /Users/sibikrishnan/Documents/Gully/backend

# Start PostgreSQL and Redis
docker compose up -d

# Verify services are running
docker compose ps

# Expected output:
# NAME             IMAGE                 STATUS         PORTS
# gully-postgres   postgres:15-alpine    Up 10 seconds  0.0.0.0:5432->5432/tcp
# gully-redis      redis:7-alpine        Up 10 seconds  0.0.0.0:6379->6379/tcp
```

---

## Quick Commands

```bash
# Start services
docker compose up -d

# Stop services (keeps data)
docker compose stop

# View logs
docker compose logs -f

# Restart services
docker compose restart

# Stop and remove containers (keeps data in volumes)
docker compose down

# Reset everything (DELETES ALL DATA!)
docker compose down -v
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"
→ Docker Desktop isn't running. Open it from Applications folder.

### Port 5432 already in use
```bash
# Check what's using it
lsof -i :5432

# If PostgreSQL is running locally:
brew services stop postgresql
```

### Redis port 6379 already in use
```bash
# Check what's using it
lsof -i :6379

# If Redis is running locally:
brew services stop redis
```

---

After Docker Desktop is running, continue with:
```bash
cd /Users/sibikrishnan/Documents/Gully
./infrastructure/verify-setup.sh
```
