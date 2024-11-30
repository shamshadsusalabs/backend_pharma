const express = require("express");
const router = express.Router();
const storeController = require("../Contoller/Store");

// Routes for Store
router.post("/create", storeController.createStore); // Create a new store
router.get("/getAll", storeController.getAllStores); // Get all stores
router.get("/:id", storeController.getStoreById); // Get a specific store by ID
router.put("/:id", storeController.updateStore); // Update a store by ID
router.delete("/:id", storeController.deleteStore); // Delete a store by ID
router.get("/getAllbyUserId/:userId", storeController.getAllStoresByUserId);
// Routes for Drug Management in Store
router.post("/:id/drugs", storeController.addDrugToStore); // Add a drug to a store
router.get("/:id/drugs/expired", storeController.getExpiredDrugs); // Get expired drugs in a store
router.post("/update-drug-stock", storeController.updateDrugStock);


router.get("/low-stock/:userId", storeController.getLowStockDrugs);
router.get("/expiry-date/:userId", storeController.getLowStockDrugs);

router.get("/get-drugs/:userId", storeController.getDynamicDrugs);

module.exports = router;
