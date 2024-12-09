const mongoose = require('mongoose');

// Schema for the drug row (items bought with drug details)
const drugSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: true
  },
  drugCode: {
    type: String,
    required: true,
    index: true // Index for faster search on drugCode
  },
  quantity: {
    type: Number,
    required: true
  },
  strip:{
    type: Number,
    required: true
  },
  mrp: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: false }); // _id is false because we don't need individual IDs for rows

// Main Billing Schema
const billingSchema = new mongoose.Schema({
  patientName: {
    type: String,
  },
  doctorName: {
    type: String,
  },
  AdharCardNumber: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
  },
  ContactNumber: {
    type: String,
  },
  gst: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMode:{
    type: String,
    required: false
  },
 Unpaidmessage:{
  type:String
 },
  rows: [drugSchema], // Array of drug rows
  userId: {
    type: String, // The ID of the user (could be a reference to a User model)
    index: true // Index for faster search on userId
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create compound index on userId and drugCode for faster searches involving both fields
billingSchema.index({ userId: 1, "rows.drugCode": 1 });

// Create and export the model
const StoreBilling = mongoose.model('StoreBilling', billingSchema);

module.exports = StoreBilling;
