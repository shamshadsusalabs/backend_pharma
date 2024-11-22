const express = require('express');
const { checkStockAlerts, getStockAlertsByUser } = require('../Contoller/Stockalert'); // Import controller functions
 // Import the controller functions
const router = express.Router();

// Route to manually trigger stock check
router.post('/trigger-alerts', checkStockAlerts);

// Route to fetch stock alerts for a specific user by their userId
router.get('/alerts/user/:userId', getStockAlertsByUser);

module.exports = router;
