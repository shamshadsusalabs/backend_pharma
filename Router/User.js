const express = require("express");
const router = express.Router();
const { signUp, login, logout, updateUser } = require("../Contoller/User");
const authenticateToken = require("../MiddleWare/authMiddleware");

const upload = require("../MiddleWare/multerConfig")
// Public routes
router.post("/register", upload.fields([
    { name: "Licence", maxCount: 1 }, // File field for the licence image
    { name: "Gstin", maxCount: 1 }    // File field for the GST image
]), signUp);
router.post("/login", login);

// Protected routes (Require authentication)
router.post("/logout", logout);


module.exports = router;
