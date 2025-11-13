#!/bin/bash

# Gully Project Dashboard Launcher
# Launches Node.js server with backward-compatible API layer

cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js to run the dashboard server"
    exit 1
fi

# Launch the Node.js server
node server.js
