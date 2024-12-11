
require('dotenv').config(); 
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    profile: {
        type: String,
        required: true,
        index: true,
        enum: ["Store", "Brand", "Distributor"],
    },
    name: {
        type: String,
        required: true,
     
        index: true,
    },
    contact: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please enter a valid email address'],
    },
    address: {
        type: String,
        required: true,
    },
    licenceImage: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true,
    },
    gstinImage: {
        type: String,
        required: true,
    },
    gstNumber: {
        type: String,
        required: true,
        unique: true,
       
    },
    shopName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
       
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre("save", async function(next) {
    try {
        if (!this.isModified("password")) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to generate access token
userSchema.statics.generateAccessToken = function(user) {
    return jwt.sign(
        { _id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};


userSchema.pre("updateOne", async function(next) {
    try {
        const update = this.getUpdate();
        if (update.password) {
            update.password = await bcrypt.hash(update.password, 10);
        }
        next();
    } catch (error) {
        next(error);
    }
});
// Create User model
module.exports = mongoose.model("User", userSchema);
