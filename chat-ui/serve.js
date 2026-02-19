#!/usr/bin/env node
/**
 * Zero-dependency dev server with SSE live reload.
 * Usage: node chat-ui/serve.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const DIR = __dirname;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

let sseClients = [];

const server = http.createServer((req, res) => {
  if (req.url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'Access-Control-Allow-Origin': '*' });
    sseClients.push(res);
    req.on('close', () => { sseClients = sseClients.filter(c => c !== res); });
    return;
  }

  let filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
  let ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  });
});

// Watch for file changes
fs.watch(DIR, { recursive: true }, (event, filename) => {
  if (!filename || filename.startsWith('.')) return;
  console.log(`  changed: ${filename}`);
  sseClients.forEach(c => c.write('data: reload\n\n'));
});

server.listen(PORT, () => {
  console.log(`\n  Chat UI dev server running at http://localhost:${PORT}\n  Live reload enabled — edit any file to auto-refresh\n`);
});
