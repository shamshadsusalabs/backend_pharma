// routes/billingRoutes.js

const express = require('express');
const {  savingBillFile ,getInvoicesByUserId } = require('../Contoller/File');
const router = express.Router();

// POST route to create a billing entry
router.post('/create',  savingBillFile );
router.get('/invoices/:userId', getInvoicesByUserId);
module.exports = router;
