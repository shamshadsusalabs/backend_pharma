const express = require("express");
const router = express.Router();
const storeController = require("../Contoller/Store");
const authenticateToken = require("../MiddleWare/authMiddleware");
// Routes for Store
router.post("/create",authenticateToken, storeController.createStore);
router.post("/update/store",authenticateToken, storeController.updateStore); // Create a new store
router.get("/getAll", authenticateToken,storeController.getAllStores); // Get all stores
router.get("/:id",authenticateToken, storeController.getStoreById); // Get a specific store by ID

router.delete("/:id", authenticateToken,storeController.deleteStore); // Delete a store by ID
router.get("/getAllbyUserId/:userId",authenticateToken,storeController.getAllStoresByUserId);
// Routes for Drug Management in Store
router.post("/:id/drugs", storeController.addDrugToStore); // Add a drug to a store
router.get("/:id/drugs/expired",authenticateToken, storeController.getExpiredDrugs); // Get expired drugs in a store
router.post("/update-drug-stock", authenticateToken,storeController.updateDrugStock);


router.get("/low-stock/:userId",authenticateToken, storeController.getLowStockDrugs);
router.get("/expiry-date/:userId",authenticateToken, storeController.getExpiringDrugs);

router.get("/get-drugs/:userId",authenticateToken, storeController.getDynamicDrugs);

router.get('/distributor-supplied-count/:userID',authenticateToken,storeController.getDistributorSuppliedCount);

module.exports = router;
