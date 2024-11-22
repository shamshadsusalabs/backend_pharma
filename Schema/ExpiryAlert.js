const mongoose = require('mongoose');

// StockAlert Schema
const expiryAlertSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  drugName: {
    type: String,
    required: true,
  },
  drugCode: {
    type: String,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
 
  alertTimestamp: {
    type: Date,
    default: Date.now, // Timestamp when the alert was created
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // Includes createdAt and updatedAt

// Create the model
const ExpiryAlert = mongoose.model('ExpiryAlert', expiryAlertSchema);

module.exports = ExpiryAlert;
