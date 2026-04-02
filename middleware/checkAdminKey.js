const checkApiKey = require('./checkApiKey');

function checkAdminKey(req, res, next) {
  checkApiKey(req, res, () => {
    if (req.apiKeyData.is_admin !== 1) {
      return res.status(403).json({ error: 'Admin API key required' });
    }
    next();
  });
}

module.exports = checkAdminKey;
