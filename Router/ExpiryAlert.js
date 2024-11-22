const express = require('express');
const { triggerExpiryCheck, getExpiryAlertsByUser } = require('../Contoller/ExpiryAlert'); // Import the controller functions
const router = express.Router();

// Route to trigger expiry alerts check manually
router.post('/trigger-expiry-check', triggerExpiryCheck);

// Route to fetch expiry alerts for a specific user by userId
router.get('/expiry/user/:userId', getExpiryAlertsByUser);

module.exports = router;
