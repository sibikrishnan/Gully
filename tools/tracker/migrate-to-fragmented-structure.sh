#!/usr/bin/env bash

# Migration Script: Monolithic JSON → Fragmented Structure
# Purpose: Split large JSON files into index + individual files for scalability
# Author: Claude Code
# Date: 2025-11-12

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
BACKUP_DIR="$DATA_DIR/migration-backup-$(date +%Y%m%d_%H%M%S)"

echo "🚀 Starting migration to fragmented structure..."
echo "📁 Data directory: $DATA_DIR"
echo "💾 Backup directory: $BACKUP_DIR"

# Step 1: Create backup
echo ""
echo "Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$DATA_DIR/PROJECT_STATUS.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$DATA_DIR/BUG_TRACKER.json" "$BACKUP_DIR/" 2>/dev/null || true
cp "$DATA_DIR/TASK_HISTORY.json" "$BACKUP_DIR/" 2>/dev/null || true
echo "✅ Backup created at: $BACKUP_DIR"

# Step 2: Create new directory structure
echo ""
echo "Step 2: Creating new directory structure..."
mkdir -p "$DATA_DIR/status/phases"
mkdir -p "$DATA_DIR/bugs"
mkdir -p "$DATA_DIR/history"
echo "✅ Directory structure created"

# Step 3: Phase 1 - Split PROJECT_STATUS.json
echo ""
echo "Step 3: Phase 1 - Splitting PROJECT_STATUS.json..."

# Extract current phase data (hot data)
node -e "
const fs = require('fs');
const projectStatus = JSON.parse(fs.readFileSync('$DATA_DIR/PROJECT_STATUS.json', 'utf8'));

// Create status/current.json (lightweight, frequently accessed)
const current = {
  version: projectStatus.version,
  lastUpdated: projectStatus.lastUpdated,
  project: projectStatus.project,
  currentPhase: projectStatus.currentPhase,
  currentTask: projectStatus.currentTask
};

fs.writeFileSync('$DATA_DIR/status/current.json', JSON.stringify(current, null, 2));
console.log('✅ Created status/current.json');

// Create individual phase files
projectStatus.phases.forEach(phase => {
  const phaseFile = \`$DATA_DIR/status/phases/\${phase.id}.json\`;
  fs.writeFileSync(phaseFile, JSON.stringify(phase, null, 2));
  console.log(\`✅ Created status/phases/\${phase.id}.json\`);
});
"

# Step 4: Phase 2 - Split BUG_TRACKER.json
echo ""
echo "Step 4: Phase 2 - Splitting BUG_TRACKER.json..."

node -e "
const fs = require('fs');
const bugTracker = JSON.parse(fs.readFileSync('$DATA_DIR/BUG_TRACKER.json', 'utf8'));

// Create bugs/index.json (metadata only)
const bugsIndex = {
  version: bugTracker.version,
  lastUpdated: bugTracker.lastUpdated,
  bugs: bugTracker.bugs.map(bug => ({
    id: bug.id,
    title: bug.title,
    severity: bug.severity,
    priority: bug.priority,
    status: bug.status,
    category: bug.category,
    discoveredDate: bug.discoveredIn.date,
    file: \`bugs/\${bug.id}.json\`
  })),
  stats: bugTracker.stats
};

fs.writeFileSync('$DATA_DIR/bugs/index.json', JSON.stringify(bugsIndex, null, 2));
console.log('✅ Created bugs/index.json');

// Create individual bug files
bugTracker.bugs.forEach(bug => {
  const bugFile = \`$DATA_DIR/bugs/\${bug.id}.json\`;
  fs.writeFileSync(bugFile, JSON.stringify(bug, null, 2));
  console.log(\`✅ Created bugs/\${bug.id}.json\`);
});
"

# Step 5: Phase 3 - Create history/active.json
echo ""
echo "Step 5: Phase 3 - Creating history/active.json..."

node -e "
const fs = require('fs');
const taskHistory = JSON.parse(fs.readFileSync('$DATA_DIR/TASK_HISTORY.json', 'utf8'));

// For now, all tasks go into active.json
// Future: Implement monthly rotation
const active = {
  version: taskHistory.version,
  lastUpdated: taskHistory.lastUpdated,
  tasks: taskHistory.tasks,
  metrics: taskHistory.metrics
};

fs.writeFileSync('$DATA_DIR/history/active.json', JSON.stringify(active, null, 2));
console.log('✅ Created history/active.json');
"

# Step 6: Create compatibility layer (symlinks/aliases for dashboard)
echo ""
echo "Step 6: Creating backward compatibility layer..."

# Keep original files but mark them as deprecated
node -e "
const fs = require('fs');

// Add deprecation notice to original files
const deprecationNotice = {
  _deprecated: true,
  _message: 'This file is deprecated. Use the fragmented structure instead.',
  _migration_date: new Date().toISOString(),
  _new_locations: {
    'PROJECT_STATUS.json': ['status/current.json', 'status/phases/{phaseId}.json'],
    'BUG_TRACKER.json': ['bugs/index.json', 'bugs/{bugId}.json'],
    'TASK_HISTORY.json': ['history/active.json']
  }
};

// Read and re-write with deprecation notice
['PROJECT_STATUS.json', 'BUG_TRACKER.json', 'TASK_HISTORY.json'].forEach(file => {
  const filePath = '$DATA_DIR/' + file;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data._deprecated = deprecationNotice;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(\`✅ Added deprecation notice to \${file}\`);
});
"

# Step 7: Verify migration
echo ""
echo "Step 7: Verifying migration..."

VERIFY_STATUS=0

# Check that new files exist
[ -f "$DATA_DIR/status/current.json" ] || { echo "❌ status/current.json not found"; VERIFY_STATUS=1; }
[ -f "$DATA_DIR/bugs/index.json" ] || { echo "❌ bugs/index.json not found"; VERIFY_STATUS=1; }
[ -f "$DATA_DIR/history/active.json" ] || { echo "❌ history/active.json not found"; VERIFY_STATUS=1; }

# Check that phase files exist
for i in 1 2 3 4 5 6 7; do
  [ -f "$DATA_DIR/status/phases/P$i.json" ] || { echo "❌ status/phases/P$i.json not found"; VERIFY_STATUS=1; }
done

if [ $VERIFY_STATUS -eq 0 ]; then
  echo "✅ All new files created successfully"
else
  echo "⚠️  Some files missing - migration may be incomplete"
  exit 1
fi

# Print summary
echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ Migration completed successfully!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 New Structure:"
echo "  status/"
echo "    ├── current.json          (300 tokens - hot data)"
echo "    └── phases/"
echo "        ├── P1.json           (phase details)"
echo "        ├── P2.json"
echo "        └── ... (P3-P7)"
echo ""
echo "  bugs/"
echo "    ├── index.json            (bug registry)"
echo "    ├── BUG-001.json"
echo "    └── BUG-002.json"
echo ""
echo "  history/"
echo "    └── active.json           (recent tasks)"
echo ""
echo "💡 Old files preserved with deprecation notices"
echo "💾 Backup saved at: $BACKUP_DIR"
echo ""
echo "🔧 Next steps:"
echo "  1. Update dashboard to use new structure"
echo "  2. Update /gullystatus command"
echo "  3. Test dashboard functionality"
echo "  4. Remove old monolithic files after verification"
echo ""
