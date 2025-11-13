#!/bin/bash

# Gully Project Dashboard Launcher
# Launches a simple HTTP server to view the project dashboard

echo "🚀 Launching Gully Project Dashboard..."
echo ""
echo "Dashboard will be available at:"
echo "  → http://localhost:8080/dashboard/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080
