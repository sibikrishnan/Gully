#!/bin/bash

# Task Directory Structure Migration Script
# Reorganizes flat task structure into hierarchical parent/subtask structure
#
# New Structure:
# tasks/
# ├── P2-PROF-T1/              (parent task folder)
# │   ├── task.json            (parent task definition)
# │   ├── P2-PROF-T1.1.json    (subtask 1)
# │   └── P2-PROF-T1.2.json    (subtask 2)
# ├── P2-PROF-T2/              (parent task folder)
# │   ├── task.json            (parent task definition)
# │   ├── P2-PROF-T2.1-repo.json
# │   ├── P2-PROF-T2.2-controller.json
# │   └── P2-PROF-T2.3-route.json
# └── P2-PROF-T3/              (standalone task - no subtasks)
#     └── task.json

set -e  # Exit on error

TASKS_DIR="/Users/sibikrishnan/Documents/Gully/tools/tracker/data/tasks"

echo "🔄 Starting task directory migration..."
echo ""

cd "$TASKS_DIR"

# Backup current structure
echo "📦 Creating backup..."
BACKUP_DIR="migration-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp *.json "$BACKUP_DIR/" 2>/dev/null || true
echo "   ✓ Backup created: $BACKUP_DIR"
echo ""

# Phase 1 Tasks (old naming convention)
echo "📁 Migrating Phase 1 tasks..."
if [ -f "task-3-jwt-utils.json" ]; then
    mkdir -p "task-3-jwt-utils"
    mv "task-3-jwt-utils.json" "task-3-jwt-utils/task.json"
    echo "   ✓ task-3-jwt-utils → task-3-jwt-utils/task.json"
fi

if [ -f "task-4-auth-tests.json" ]; then
    mkdir -p "task-4-auth-tests"
    mv "task-4-auth-tests.json" "task-4-auth-tests/task.json"
    echo "   ✓ task-4-auth-tests → task-4-auth-tests/task.json"
fi
echo ""

# Phase 2 Tasks
echo "📁 Migrating Phase 2 tasks..."

# P2-PROF-T1 (has subtasks: T1.1, T1.2)
if [ -f "P2-PROF-T1.1.json" ] || [ -f "P2-PROF-T1.2.json" ]; then
    mkdir -p "P2-PROF-T1"
    # Create parent task placeholder if not exists
    if [ ! -f "P2-PROF-T1.json" ]; then
        echo "   ⚠️  Parent task P2-PROF-T1.json not found - subtasks exist but no parent"
    else
        mv "P2-PROF-T1.json" "P2-PROF-T1/task.json"
        echo "   ✓ P2-PROF-T1.json → P2-PROF-T1/task.json"
    fi
    [ -f "P2-PROF-T1.1.json" ] && mv "P2-PROF-T1.1.json" "P2-PROF-T1/" && echo "   ✓ P2-PROF-T1.1.json → P2-PROF-T1/"
    [ -f "P2-PROF-T1.2.json" ] && mv "P2-PROF-T1.2.json" "P2-PROF-T1/" && echo "   ✓ P2-PROF-T1.2.json → P2-PROF-T1/"
fi

# P2-PROF-T2 (has subtasks: T2.1, T2.2, T2.3)
if [ -f "P2-PROF-T2.1-repo.json" ] || [ -f "P2-PROF-T2.2-controller.json" ] || [ -f "P2-PROF-T2.3-route.json" ]; then
    mkdir -p "P2-PROF-T2"
    if [ ! -f "P2-PROF-T2.json" ]; then
        echo "   ⚠️  Parent task P2-PROF-T2.json not found - subtasks exist but no parent"
    else
        mv "P2-PROF-T2.json" "P2-PROF-T2/task.json"
        echo "   ✓ P2-PROF-T2.json → P2-PROF-T2/task.json"
    fi
    [ -f "P2-PROF-T2.1-repo.json" ] && mv "P2-PROF-T2.1-repo.json" "P2-PROF-T2/" && echo "   ✓ P2-PROF-T2.1-repo.json → P2-PROF-T2/"
    [ -f "P2-PROF-T2.2-controller.json" ] && mv "P2-PROF-T2.2-controller.json" "P2-PROF-T2/" && echo "   ✓ P2-PROF-T2.2-controller.json → P2-PROF-T2/"
    [ -f "P2-PROF-T2.3-route.json" ] && mv "P2-PROF-T2.3-route.json" "P2-PROF-T2/" && echo "   ✓ P2-PROF-T2.3-route.json → P2-PROF-T2/"
fi

# P2-PROF-T3 (standalone)
if [ -f "P2-PROF-T3.json" ]; then
    mkdir -p "P2-PROF-T3"
    mv "P2-PROF-T3.json" "P2-PROF-T3/task.json"
    echo "   ✓ P2-PROF-T3.json → P2-PROF-T3/task.json"
fi

# P2-PROF-T4 (standalone)
if [ -f "P2-PROF-T4.json" ]; then
    mkdir -p "P2-PROF-T4"
    mv "P2-PROF-T4.json" "P2-PROF-T4/task.json"
    echo "   ✓ P2-PROF-T4.json → P2-PROF-T4/task.json"
fi

# P2-PROF-T5 (standalone)
if [ -f "P2-PROF-T5.json" ]; then
    mkdir -p "P2-PROF-T5"
    mv "P2-PROF-T5.json" "P2-PROF-T5/task.json"
    echo "   ✓ P2-PROF-T5.json → P2-PROF-T5/task.json"
fi
echo ""

# Phase 3 Tasks
echo "📁 Migrating Phase 3 tasks..."

for task in P3-TEAM-T1 P3-TEAM-T2 P3-TEAM-T3 P3-TEAM-T4 P3-TEAM-T5 P3-TEAM-T6 P3-TEAM-T7; do
    if [ -f "${task}.json" ]; then
        mkdir -p "$task"
        mv "${task}.json" "${task}/task.json"
        echo "   ✓ ${task}.json → ${task}/task.json"
    fi
done
echo ""

echo "✅ Migration complete!"
echo ""
echo "📊 New structure:"
tree -L 2 -I 'archive|tests|migration-backup-*|index.json|README.md|schema.ts|state-machine.ts|*.sh' "$TASKS_DIR" || find "$TASKS_DIR" -maxdepth 2 -type d | grep -E "P[0-9]|task-" | sort

echo ""
echo "⚠️  Next steps:"
echo "   1. Update index.json with new file paths"
echo "   2. Update PROJECT_STRUCTURE.md"
echo "   3. Update PM agent and task-generation-agent instructions"
echo "   4. Test task loading with new paths"
echo "   5. Delete backup after verification: rm -rf $BACKUP_DIR"
