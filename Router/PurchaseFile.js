const express = require('express');
const { getPurchaseFilesByUserId } = require('../Contoller/PurchaseFile'); // Import the controller
const router = express.Router();

// Define the route to get purchase files by userId, sorted by date
router.get('/purchase-files/:userId', getPurchaseFilesByUserId);

module.exports = router;