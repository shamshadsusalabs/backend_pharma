const express = require("express");
const router = express.Router();
const { signUp, login, logout,  updateUser,getUserById ,countStoreProfiles,countDistributorProfiles,countBrandProfiles, getStoreProfile,getDistributorProfile,getBrandProfile} = require("../Contoller/User");
const authenticateToken = require("../MiddleWare/authMiddleware");

const upload = require("../MiddleWare/multerConfig")
// Public routes
router.post("/register", upload.fields([
    { name: "Licence", maxCount: 1 }, // File field for the licence image
    { name: "Gstin", maxCount: 1 }    // File field for the GST image
]), signUp);
router.post("/login", login);

// Protected routes (Require authentication)
router.post("/logout",  authenticateToken ,logout);
router.get("/:id", authenticateToken, getUserById);

// Update user by ID with file upload support
router.put(
    "/update/:id",
    authenticateToken,
    upload.fields([
        { name: "Licence", maxCount: 1 },
        { name: "Gstin", maxCount: 1 },
    ]),
    updateUser
);


router.get("/count/store", authenticateToken, countStoreProfiles);

// Route to count Distributor profiles
router.get("/count/distributor", authenticateToken, countDistributorProfiles);

// Route to count Brand profiles
router.get("/count/brand", authenticateToken, countBrandProfiles);


router.get('/getAll/store', authenticateToken, getStoreProfile);
router.get('/getAll/distributor',  authenticateToken,getDistributorProfile);
router.get('/getAll/brand', authenticateToken, getBrandProfile);
module.exports = router;
