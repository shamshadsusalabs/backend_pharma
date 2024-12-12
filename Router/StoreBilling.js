const express = require('express');
const router = express.Router();
const billingController = require('../Contoller/StoreBilling'); // Import the controller
const authenticateToken = require("../MiddleWare/authMiddleware");
// Routes for billing CRUD operations
router.post('/billing', authenticateToken,billingController.createBilling); // Create billing
router.get('/billings/records', authenticateToken,billingController.getAllBillings); // Get all billings
router.get('/billing/:id', authenticateToken,billingController.getBillingById); // Get billing by ID
router.put('/billing/:id', authenticateToken,billingController.updateBilling); // Update billing by ID
router.delete('/billing/:id', authenticateToken,billingController.deleteBilling); // Delete billing by ID
router.get('/billings/userId/:userId', authenticateToken,billingController.getBillingsByUserId);

router.get('/billing/unpaid/:userId', authenticateToken,billingController.getUnpaidBillingByUserId);

router.get('/billing/revenue/:userId', authenticateToken,billingController.getRevenueForCurrentMonth);

router.post('/billing/send-message',authenticateToken, billingController.sendMessage);
router.get('/billing/get-unpaid-billings-notifications/:contactNumber',authenticateToken,billingController.getUnpaidBillingWithMessage);

router.get('/billing/invoices/:userId', authenticateToken, billingController.getInvoicesByUserIdAndMonth);

module.exports = router; 
