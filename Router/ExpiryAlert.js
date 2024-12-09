const express = require('express');
const authenticateToken = require("../MiddleWare/authMiddleware");
const { triggerExpiryCheck, getExpiryAlertsByUser,countDistinctDrugAlerts } = require('../Contoller/ExpiryAlert'); // Import the controller functions
const router = express.Router();

// Route to trigger expiry alerts check manually
router.post('/trigger-expiry-check',authenticateToken, triggerExpiryCheck);

// Route to fetch expiry alerts for a specific user by userId
router.get('/expiry/user/:userId',authenticateToken, getExpiryAlertsByUser);

router.get('/count-drug-expiry-alerts/:userId',authenticateToken, countDistinctDrugAlerts);

module.exports = router;
