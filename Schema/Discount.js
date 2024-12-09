const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the distributor schema
const discountSchema = new Schema({
  shopName: {
    type: String,
    required: true
  },
  drugName:{
     type: String,
    required: true
  },
  contactNumber:{
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true,
    min: [0, 'Discount cannot be negative']
  },
  deliveryType1: {
    type: String,
    required: true,
    enum: ['self-pickup', 'home-delivery', 'courier'], // Valid values for deliveryType1
  },
 
  deliveryTime: {
    type: Number,
    required: true,
    min: [1, 'Delivery Time must be at least 1 days'] // Ensure at least 1 hour delivery time
  },
  address: {
    type: String,
    required: true
  },
  profile: {
    type: String,
   
  },
  userId: {
    type: String,
    required: true,
    index: true // Indexing userId for faster search
  }
}, { timestamps: true }); // This will add createdAt and updatedAt fields

// Create and export the Distributor model
const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;