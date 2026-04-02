const db = require('../database');
const fs = require('fs');
const path = require('path');

function logUsage(apiKey, route) {
  const logLine = `${new Date().toISOString()} | ${apiKey} | ${route}\n`;
  fs.appendFileSync(path.join(__dirname, '../logs/usage.log'), logLine);
}

function checkApiKey(req, res, next) {
  const apiKey = req.header('x-api-key');
  const deviceId = req.header('x-device-id');

  if (!apiKey) return res.status(401).json({ error: 'API key required' });
  if (!deviceId) return res.status(400).json({ error: 'Device ID required' });

  db.get('SELECT * FROM api_keys WHERE key = ?', [apiKey], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(403).json({ error: 'Invalid API key' });

    // Expiration check
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return res.status(403).json({ error: 'API key expired' });
    }

    // Device lock check
    if (row.device_id && row.device_id !== deviceId) {
      return res.status(403).json({ error: 'API key is locked to another device' });
    }

    // Usage limit check
    if (row.max_usage && row.usage_count >= row.max_usage) {
      return res.status(403).json({ error: 'API key usage limit reached' });
    }

    // Increment usage count
    db.run('UPDATE api_keys SET usage_count = usage_count + 1 WHERE id = ?', [row.id]);

    req.apiKeyData = row;

    logUsage(apiKey, req.originalUrl);

    next();
  });
}

module.exports = checkApiKey;
