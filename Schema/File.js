const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Assuming you have a User model
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,  // You can set this as optional based on your requirements
    }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
