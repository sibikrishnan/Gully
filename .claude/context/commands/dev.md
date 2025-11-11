# Development Commands

**Purpose:** npm scripts for development, testing, and code quality.

---

## Installation

```bash
# Install all dependencies
npm install

# Install specific package
npm install <package-name>

# Install dev dependency
npm install -D <package-name>

# Clean install (removes node_modules first)
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update
npm outdated  # Check for outdated packages
```

---

## Running Application

```bash
# Start development server (with hot reload)
npm run dev

# Start production build
npm start

# Build TypeScript to JavaScript
npm run build

# Watch mode for TypeScript compilation
npm run build:watch

# Clean build artifacts
npm run clean
rm -rf dist/
```

---

## Testing

```bash
# Run all tests
npm test
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- user.test.ts
npm test -- --testPathPattern=user

# Run tests with coverage
npm run test:coverage
npm run test:coverage -- --collectCoverageFrom="src/**/*.ts"

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Run tests in specific folder
npm test -- src/services/user-service

# Debug tests
npm run test:debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Lint specific files
npm run lint -- src/services/user-service/**/*.ts

# Check for lint errors (CI)
npm run lint:ci
```

### Type Checking

```bash
# Run TypeScript type checker
npm run type-check

# Watch mode for type checking
npm run type-check:watch

# Generate type definitions
npm run build:types
```

### Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting without modifying
npm run format:check

# Format specific files
npm run format -- src/services/**/*.ts
```

### Code Analysis

```bash
# Run all quality checks
npm run quality-check
# This typically runs: lint + type-check + test

# Check bundle size
npm run analyze-bundle

# Security audit
npm audit
npm audit fix
npm audit fix --force  # Careful!
```

---

## Debugging

```bash
# Start with Node debugger
npm run debug

# Start with inspect mode
node --inspect dist/app.js

# Start with inspect and break on first line
node --inspect-brk dist/app.js

# Debug tests
npm run test:debug
```

**VS Code Debug Configuration:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug App",
  "skipFiles": ["<node_internals>/**"],
  "program": "${workspaceFolder}/dist/app.js",
  "preLaunchTask": "npm: build",
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

---

## Development Workflow

### Daily Startup

```bash
# 1. Start Docker services (from backend/)
cd backend
docker compose up -d

# 2. Install/update dependencies (if needed)
npm install

# 3. Run migrations (if schema changed)
npm run migrate:latest

# 4. Start dev server
npm run dev

# Server runs on http://localhost:3000 (or configured port)
```

### Before Committing

```bash
# 1. Run linter
npm run lint:fix

# 2. Run type check
npm run type-check

# 3. Run tests
npm test

# 4. Check formatting
npm run format

# Or run all at once
npm run pre-commit  # If configured
```

### Pre-Push Checklist

```bash
# Run full quality check
npm run quality-check

# Ensure build works
npm run build

# Run tests with coverage
npm run test:coverage

# Check for security vulnerabilities
npm audit
```

---

## Productivity Scripts

### Custom npm Scripts (package.json)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/app.ts",
    "start": "node dist/app.js",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "lint": "eslint 'src/**/*.ts'",
    "lint:fix": "eslint 'src/**/*.ts' --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write 'src/**/*.ts'",
    "format:check": "prettier --check 'src/**/*.ts'",
    "migrate:latest": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "migrate:create": "knex migrate:make",
    "migrate:status": "knex migrate:status",
    "seed:run": "knex seed:run",
    "seed:create": "knex seed:make",
    "quality-check": "npm run lint && npm run type-check && npm test"
  }
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
npm run clean
npm run build

# Check tsconfig.json is correct
cat tsconfig.json

# Restart TypeScript server (VS Code)
# CMD+Shift+P → "TypeScript: Restart TS Server"
```

### Tests Failing

```bash
# Run specific test with verbose output
npm test -- --verbose user.test.ts

# Clear Jest cache
npm test -- --clearCache

# Run tests serially (not parallel)
npm test -- --runInBand

# Update snapshots
npm test -- -u
```

### Dependency Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency warnings
npm ls

# Fix peer dependencies
npm install --legacy-peer-deps
```

---

**Tip:** Use `npm run` to see all available scripts!
