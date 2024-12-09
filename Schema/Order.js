const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderDetails: {
      deliveryTime: { type: Number, required: true }, // e.g., delivery time in hours
      deliveryType1: { type: String, required: true },
      discount: { type: Number, default: 0 }, // percentage
      drugName: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // User linked to the order
    },
    userDetails: {
      contact: { type: String, required: true },
      email: { type: String, required: true },
      gstNumber: { type: String },
      licenseNumber: { type: String },
      name: { type: String, required: true },
      shopName: { type: String },
      quantity:{type:Number},
      oderuserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, 
      status: {
        type: String,
        index: true,
        default: 'Pending', // Default status is Pending
        enum: ['Pending', 'Confirmed', 'Cancelled'] // Define allowed statuses
      },
      confirmOrderTime: {
        type: Date // This will store the confirmation time
      }// User who created/processed the order
    },
    message:{
      type:String
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);
orderSchema.index({ 'orderDetails.userId': 1, 'userDetails.status': 1 });

orderSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'Confirmed') {
    this.confirmOrderTime = new Date(); // Set confirmOrderTime to current time
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
