#!/usr/bin/env node

/**
 * Gully Project Dashboard Server
 *
 * Serves the dashboard with backward-compatible API endpoints
 * that aggregate data from the fragmented structure.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const api = require('./dashboard/api.js');

const PORT = process.env.PORT || 8080;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');
const DATA_DIR = path.join(__dirname, 'data');

/**
 * MIME type mapping
 */
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Handle static file requests
 */
function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Handle API requests (aggregated from fragmented structure)
 */
function handleApiRequest(urlPath, res) {
  try {
    let data;

    if (urlPath === '/data/PROJECT_STATUS.json') {
      // Aggregate from status/current.json + status/phases/*.json
      data = api.getProjectStatus();
    } else if (urlPath === '/data/BUG_TRACKER.json') {
      // Aggregate from bugs/index.json + bugs/*.json
      data = api.getBugTracker();
    } else if (urlPath === '/data/TASK_HISTORY.json') {
      // Aggregate from history/active.json
      data = api.getTaskHistory();
    } else if (urlPath === '/data/status/current.json') {
      // New lightweight endpoint (recommended)
      data = api.getCurrentStatus();
    } else {
      // Direct file access (e.g., tasks/index.json, bugs/BUG-001.json)
      const filePath = path.join(DATA_DIR, urlPath.replace('/data/', ''));
      if (fs.existsSync(filePath)) {
        serveStaticFile(filePath, res);
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

/**
 * Main request handler
 */
const server = http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/dashboard/index.html' : req.url;

  // Remove query parameters
  urlPath = urlPath.split('?')[0];

  console.log(`${req.method} ${urlPath}`);

  // Handle API requests (backward compatibility)
  if (urlPath.startsWith('/data/')) {
    handleApiRequest(urlPath, res);
    return;
  }

  // Handle static files
  const filePath = urlPath.startsWith('/dashboard/')
    ? path.join(__dirname, urlPath)
    : path.join(DASHBOARD_DIR, urlPath.replace('/dashboard/', ''));

  serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 Gully Project Dashboard Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Dashboard: http://localhost:${PORT}/dashboard/`);
  console.log(`  API (compatible): http://localhost:${PORT}/data/PROJECT_STATUS.json`);
  console.log(`  API (new): http://localhost:${PORT}/data/status/current.json`);
  console.log('');
  console.log('✨ Features:');
  console.log('  - Backward compatible with old monolithic JSON structure');
  console.log('  - Serves fragmented data efficiently');
  console.log('  - Dashboard works without modifications');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
