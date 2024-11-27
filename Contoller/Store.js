const Store = require("../Schema/Store");



// Update stock by drugCode
exports.updateDrugStock = async (req, res) => {
  try {
    const { updates } = req.body;

    // Validate input
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Invalid updates array" });
    }

    for (const update of updates) {
      const { drugCode, quantity } = update;

      // Find the store and the drug containing the required drugCode
      const store = await Store.findOne({
        "distributorSupplied.drugCode": drugCode,
      });

      if (!store) {
        throw new Error(`Drug with code ${drugCode} not found in any store`);
      }

      // Locate the drug in the store's distributorSupplied array
      const drug = store.distributorSupplied.find(
        (d) => d.drugCode === drugCode
      );

      if (!drug) {
        throw new Error(`Drug with code ${drugCode} not found`);
      }

      // Check if the stock is sufficient
      if (drug.stock < quantity) {
        throw new Error(
          `Insufficient stock for drug ${drugCode}. Available: ${drug.stock}`
        );
      }

      // Deduct the quantity from the drug's stock
      drug.stock -= quantity;

      // Save the updated store
      await store.save();
    }

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error.message);
    res.status(500).json({ message: error.message });
  }
};








// Create a new store
exports.createStore = async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    res.status(400).json({ message: "Error creating store", error: error.message });
  }
};

// Get all stores
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.status(200).json(stores);
  } catch (error) {
    res.status(400).json({ message: "Error fetching stores", error: error.message });
  }
};


exports.getAllStoresByUserId = async (req, res) => {
  const { userId } = req.params; // Extract userId from route parameters
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find all stores matching the given user ID
    const stores = await Store.find({ user: userId }).select("distributorSupplied createdAt").lean();

    // Sort the distributorSupplied arrays by createdAt in descending order
    const sortedData = stores.map(store => {
      const sortedSupplied = store.distributorSupplied.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      return { ...store, distributorSupplied: sortedSupplied };
    });

    res.status(200).json(sortedData);
  } catch (error) {
    res.status(400).json({ message: "Error fetching stores", error: error.message });
  }
};

// Get a single store by ID
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store);
  } catch (error) {
    res.status(400).json({ message: "Error fetching store", error: error.message });
  }
};

// Update a store
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json({ message: "Store updated successfully", store });
  } catch (error) {
    res.status(400).json({ message: "Error updating store", error: error.message });
  }
};

// Delete a store
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting store", error: error.message });
  }
};

// Add a drug to a store
exports.addDrugToStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    store.distributorSupplied.push(req.body);
    await store.save();
    res.status(200).json({ message: "Drug added successfully", store });
  } catch (error) {
    res.status(400).json({ message: "Error adding drug", error: error.message });
  }
};

// Get expired drugs in a store
exports.getExpiredDrugs = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    const expiredDrugs = store.distributorSupplied.filter(
      (drug) => new Date(drug.expiryDate) < Date.now()
    );
    res.status(200).json({ expiredDrugs });
  } catch (error) {
    res.status(400).json({ message: "Error fetching expired drugs", error: error.message });
  }
};



