const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../apikeys.db'));

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      is_admin INTEGER DEFAULT 0,
      device_id TEXT,
      usage_count INTEGER DEFAULT 0,
      max_usage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    )
  `);
});

module.exports = db;
