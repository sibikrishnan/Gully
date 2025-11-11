# Task Management System

Automated task management system for the Gully project.

## Structure

```
tasks/
├── src/              # TypeScript source files
│   ├── core.ts       # Core task management logic
│   ├── git.ts        # Git integration utilities
│   ├── schema.ts     # Task schema definitions
│   ├── selection.ts  # Task selection logic
│   └── test-phase1.ts # Phase 1 tests
├── dist/             # Compiled JavaScript (gitignored)
├── definitions/      # Task definition JSON files
├── state/            # Runtime state (gitignored)
├── docs/             # Documentation and test results
└── package.json      # Dependencies and scripts
```

## Setup

```bash
npm install
```

## Build

```bash
# Build once
npm run build

# Watch mode
npm run build:watch

# Clean build artifacts
npm run clean
```

## Test

```bash
npm test
```

## Usage

The task management system provides:
- Task state tracking
- Git integration for task-based workflows
- Task selection and filtering
- Definition management

See `docs/` for detailed documentation and test results.
