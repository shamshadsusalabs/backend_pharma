const mongoose = require("mongoose");

// Utility function to validate and parse date
const parseDate = (value) => {
  // Check if the date is in DD/MM/YYYY format
  const dateParts = value.split('/');
  if (dateParts.length === 3) {
    // Convert to YYYY-MM-DD format (JavaScript Date expects this format)
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const parsedDate = new Date(formattedDate);
    
    if (isNaN(parsedDate)) {
      throw new Error(`Invalid date format: ${value}`);
    }
    return parsedDate;
  } else {
    const parsedDate = new Date(value); // Default parsing if not in DD/MM/YYYY format
    if (isNaN(parsedDate)) {
      throw new Error(`Invalid date format: ${value}`);
    }
    return parsedDate;
  }
};

// Drug Schema
const drugSchema = new mongoose.Schema({
  drugName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  drugCode: {
    type: String,
    required: true,
    unique: true, 
    index: true,// Ensure drugCode is unique
  },
  batchNumber: {
    type: String,
    required: true,
  },
  strip:{
    type: Number,
    required: true,
  },
  perStripQuantity:{
    type: Number,
    required: false,
  },
  perStripPrice:{
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    index:true
  },
  discount: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: true,
    set: (value) => parseDate(value), // Use the new parseDate function
  },
  manufactureDate: {
    type: Date,
    required: true,
    set: (value) => parseDate(value), // Use the new parseDate function
  },
  manufacturer: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  typeofSack:{
    type: String,
    required: true,

  }
 
}, { timestamps: true });
drugSchema.index({ drugCode: 1 });
drugSchema.index({ drugName: 1 });
// Removed virtual field for expiry check

const supplyDetailsSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Store Schema
const storeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,  // ObjectId type to reference another document
    ref: 'User',  // Reference to the User model
    required: true, 
    index: true, // Ensure the user reference is mandatory
  },
  supplier: [supplyDetailsSchema],
  distributorSupplied: [drugSchema], // Embedded Drug Schema
}, { timestamps: true });

// Removed middleware for expiry check in store schema

module.exports = mongoose.model("Store", storeSchema);
