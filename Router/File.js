// routes/billingRoutes.js

const express = require('express');
const {  savingBillFile  } = require('../Contoller/File');
const router = express.Router();

// POST route to create a billing entry
router.post('/create',  savingBillFile );

module.exports = router;
