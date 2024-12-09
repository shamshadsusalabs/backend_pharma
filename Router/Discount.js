const express = require('express');
const router = express.Router();
const distributorController = require('../Contoller/Discount');

// Route to create a new distributor
router.post('/discounts', distributorController.createDistributor);

// Route to get distributor by userId
router.get('/discounts/:userId', distributorController.getDistributorByUserId);

// Route to update distributor by userId
router.put('/discounts/:userId', distributorController.updateDistributor);

// Route to delete distributor by userId
router.delete('/discounts/:_id', distributorController.deleteDistributor);

router.get('/discounts/_GetAll/distributor', distributorController.getAllDistributorsDetails);

module.exports = router;
