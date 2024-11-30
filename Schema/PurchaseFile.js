const mongoose = require("mongoose");

const purchaseFileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PurchaseFile", purchaseFileSchema);
