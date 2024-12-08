const express = require('express');
const router = express.Router();
const billingController = require('../Contoller/StoreBilling'); // Import the controller

// Routes for billing CRUD operations
router.post('/billing', billingController.createBilling); // Create billing
router.get('/billings', billingController.getAllBillings); // Get all billings
router.get('/billing/:id', billingController.getBillingById); // Get billing by ID
router.put('/billing/:id', billingController.updateBilling); // Update billing by ID
router.delete('/billing/:id', billingController.deleteBilling); // Delete billing by ID
router.get('/billings/userId/:userId', billingController.getBillingsByUserId);

router.get('/billing/unpaid/:userId', billingController.getUnpaidBillingByUserId);

router.get('/billing/revenue/:userId', billingController.getRevenueForCurrentMonth);

router.post('/billing/send-message', billingController.sendMessage);
router.get('/billing/get-unpaid-billings-notifications/:contactNumber',billingController.getUnpaidBillingWithMessage);

router.get('/billing/invoices/:userId',  billingController.getInvoicesByUserIdAndMonth);
module.exports = router; 
