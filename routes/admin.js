const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const checkAdminKey = require('../middleware/checkAdminKey');

// Generate API key
router.post('/generate-key', checkAdminKey, (req, res) => {
  const isAdmin = req.body.is_admin ? 1 : 0;
  const expiresAt = req.body.expires_at || null;
  const maxUsage = req.body.max_usage || 0;
  const deviceId = req.body.device_id || null;
  const newKey = uuidv4();

  db.run(
    'INSERT INTO api_keys (key, is_admin, device_id, max_usage, expires_at) VALUES (?, ?, ?, ?, ?)',
    [newKey, isAdmin, deviceId, maxUsage, expiresAt],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create key' });
      res.json({ key: newKey, is_admin: !!isAdmin, device_id: deviceId, max_usage: maxUsage, expires_at: expiresAt });
    }
  );
});

// List keys
router.get('/list-keys', checkAdminKey, (req, res) => {
  db.all('SELECT id, key, is_admin, device_id, usage_count, max_usage, created_at, expires_at FROM api_keys', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Revoke key
router.delete('/revoke-key/:key', checkAdminKey, (req, res) => {
  const keyToDelete = req.params.key;
  db.run('DELETE FROM api_keys WHERE key = ?', [keyToDelete], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'Key not found' });
    res.json({ message: 'Key revoked successfully' });
  });
});

module.exports = router;
