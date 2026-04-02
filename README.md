# 🔑 API License Manager

> Device-locked, expiring license keys with admin controls, usage limits, and audit logging.

![Node.js](https://img.shields.io/badge/Node.js-Express.js-green) ![Database](https://img.shields.io/badge/Database-SQLite-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛡️ **Admin key management** | Only admin keys can generate or revoke license keys |
| ⏳ **Key expiration** | Set `expires_at` per key; expired keys are purged hourly |
| 💻 **Device locking** | Bind a license to a specific device UUID |
| 🔢 **Usage limits** | Set `max_usage` per key; enforced on every request |
| 🚫 **Key revocation** | Admins can instantly revoke any license key |
| 📋 **Usage logging** | Every request logged to `logs/usage.log` |

---

## 📁 Project Structure

```
api-license-manager/
├─ database/
│  └─ index.js          # SQLite setup & queries
├─ middleware/
│  ├─ checkApiKey.js     # License validation
│  └─ checkAdminKey.js   # Admin auth guard
├─ routes/
│  ├─ admin.js           # Generate / list / revoke
│  └─ api.js             # Protected endpoints
├─ logs/
│  └─ usage.log          # ISO_DATE | API_KEY | ROUTE
├─ .env
├─ .gitignore
├─ package.json
└─ server.js
```

---

## 🚀 Setup

**1. Clone the repository**

```bash
git clone https://github.com/blaxkmiradev/api-manager.git
cd api-manager
```

**2. Install dependencies**

```bash
npm install
```

**3. Create `.env` file**

```env
PORT=3000
INITIAL_ADMIN_KEY=super-secret-admin-key
```

**4. Start the server**

```bash
npm start
```

Server will run at: `http://localhost:3000`

---

## 📡 API Endpoints

### Admin Endpoints

> 🔐 Require admin key in `x-api-key` header

#### Generate Key

```http
POST /admin/generate-key
x-api-key: <admin_key>
Content-Type: application/json

{
  "is_admin": false,
  "expires_at": "2026-12-31T23:59:59Z",
  "device_id": "device-uuid",
  "max_usage": 100
}
```

#### List All Keys

```http
GET /admin/list-keys
x-api-key: <admin_key>
```

#### Revoke Key

```http
DELETE /admin/revoke-key/:key
x-api-key: <admin_key>
```

---

### API Endpoints

> 🔒 Require license key and `device_id` in headers

#### Get Data

```http
GET /api/data
x-api-key: <license_key>
x-device-id: <device-uuid>
```

---

## 📋 License Key Rules

- **`expires_at`** — Key is invalid after this ISO 8601 datetime.
- **`device_id`** — Optional. Binds the key to one device; all other devices are rejected.
- **`max_usage`** — Optional. Limits total calls; the counter increments on every valid request.

---

## 🗂️ Logging

All API usage is logged to `logs/usage.log`.

**Format:**
```
ISO_DATE | API_KEY | ROUTE
```

**Example:**
```
2026-04-01T10:23:45.000Z | abc123xyz | GET /api/data
```

---

## ⏱️ Automatic Cleanup

Expired keys are automatically removed from the database **every hour** — no manual intervention needed.

---

## 🔍 Key Validation Checks

The middleware validates every request against:

1. ✅ Key exists in the database
2. ✅ Key has not been revoked
3. ✅ Key has not expired (`expires_at`)
4. ✅ Request device matches the bound device (`device_id`)
5. ✅ Usage count is within the limit (`max_usage`)
