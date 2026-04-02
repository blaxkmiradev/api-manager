const express = require('express');
const router = express.Router();
const checkApiKey = require('../middleware/checkApiKey');

// Protected endpoint
router.get('/data', checkApiKey, (req, res) => {
  res.json({
    message: 'Access granted!',
    key_info: req.apiKeyData
  });
});

module.exports = router;
