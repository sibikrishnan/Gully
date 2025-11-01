#!/bin/bash

# Gully Infrastructure Verification Script
# Checks that all required tools and services are installed and running

set -e

echo "🔍 Gully Infrastructure Verification"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# Docker
echo "Checking Docker..."
docker --version > /dev/null 2>&1
check "Docker is installed"

# Docker Compose
echo "Checking Docker Compose..."
docker-compose --version > /dev/null 2>&1
check "Docker Compose is installed"

# Docker Daemon
echo "Checking Docker daemon..."
docker ps > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check "Docker daemon is running"
else
    echo -e "${RED}❌ Docker daemon is NOT running${NC}"
    echo -e "${YELLOW}→ Start Docker Desktop from Applications folder${NC}"
    exit 1
fi

# Node.js
echo "Checking Node.js..."
node --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    NODE_VERSION=$(node --version)
    check "Node.js is installed ($NODE_VERSION)"
else
    echo -e "${RED}❌ Node.js is NOT installed${NC}"
    echo -e "${YELLOW}→ Install with: brew install node@20${NC}"
fi

# PostgreSQL Container
echo "Checking PostgreSQL container..."
docker ps | grep gully-postgres > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check "PostgreSQL container is running"

    # Test connection
    docker exec gully-postgres pg_isready -U gully_user -d gully_dev > /dev/null 2>&1
    check "Can connect to PostgreSQL"
else
    echo -e "${YELLOW}⚠️  PostgreSQL container is NOT running${NC}"
    echo -e "${YELLOW}→ Start with: cd backend && docker-compose up -d${NC}"
fi

# Redis Container
echo "Checking Redis container..."
docker ps | grep gully-redis > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check "Redis container is running"

    # Test connection
    docker exec gully-redis redis-cli PING > /dev/null 2>&1
    check "Can connect to Redis"
else
    echo -e "${YELLOW}⚠️  Redis container is NOT running${NC}"
    echo -e "${YELLOW}→ Start with: cd backend && docker-compose up -d${NC}"
fi

# Git
echo "Checking Git..."
git --version > /dev/null 2>&1
if [ $? -eq 0 ]; then
    GIT_VERSION=$(git --version)
    check "Git is installed ($GIT_VERSION)"
fi

echo ""
echo "====================================="
echo -e "${GREEN}🎉 Infrastructure verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. cd backend"
echo "  2. npm install"
echo "  3. npm run dev"
echo ""
