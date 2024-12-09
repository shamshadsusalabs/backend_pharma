const express = require('express');
const authenticateToken = require("../MiddleWare/authMiddleware");
const { checkStockAlerts, getStockAlertsByUser,countDistinctDrugAlerts } = require('../Contoller/Stockalert'); // Import controller functions
 // Import the controller functions
const router = express.Router();

// Route to manually trigger stock check
router.post('/trigger-alerts',authenticateToken, checkStockAlerts);

// Route to fetch stock alerts for a specific user by their userId
router.get('/alerts/user/:userId',authenticateToken, getStockAlertsByUser);

router.get('/count-drug-alerts/:userId',authenticateToken, countDistinctDrugAlerts);

module.exports = router;
