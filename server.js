require('dotenv').config();
const express = require('express');
const db = require('./database');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) fs.mkdirSync(path.join(__dirname, 'logs'));

// Insert initial admin key if not exists
const INITIAL_ADMIN_KEY = process.env.INITIAL_ADMIN_KEY || 'admin-key';
db.get('SELECT * FROM api_keys WHERE key = ?', [INITIAL_ADMIN_KEY], (err, row) => {
  if (!row) {
    db.run('INSERT INTO api_keys (key, is_admin) VALUES (?, 1)', [INITIAL_ADMIN_KEY]);
    console.log('Initial admin key inserted:', INITIAL_ADMIN_KEY);
  }
});

// Routes
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Optional: cleanup expired keys every hour
setInterval(() => {
  const now = new Date().toISOString();
  db.run('DELETE FROM api_keys WHERE expires_at IS NOT NULL AND expires_at < ?', [now], function(err) {
    if (!err && this.changes > 0) console.log(`Removed ${this.changes} expired keys`);
  });
}, 1000 * 60 * 60);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
