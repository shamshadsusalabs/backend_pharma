const express = require('express');
const router = express.Router();
const distributorController = require('../Contoller/Discount');
const authenticateToken = require("../MiddleWare/authMiddleware");
// Route to create a new distributor
router.post('/discounts',authenticateToken, distributorController.createDistributor);

// Route to get distributor by userId
router.get('/discounts/:userId',authenticateToken, distributorController.getDistributorByUserId);

// Route to update distributor by userId
router.put('/discounts/:userId',authenticateToken, distributorController.updateDistributor);

// Route to delete distributor by userId
router.delete('/discounts/:_id', authenticateToken,distributorController.deleteDistributor);

router.get('/discounts/_GetAll/distributor',authenticateToken, distributorController.getAllDistributorsDetails);

module.exports = router;
