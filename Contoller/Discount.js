const Distributor = require('../Schema/Discount');
exports.countDistributors = async (req, res) => {
  try {
    const distributorCount = await Distributor.countDocuments({ profile: "Distributor" });
    res.status(200).json({ profile: "Distributor", count: distributorCount });
  } catch (error) {
    res.status(500).json({ message: "Error counting distributors", error });
  }
};

exports.countBrands = async (req, res) => {
  try {
    const brandCount = await  Distributor.countDocuments({ profile: "Brand" });
    res.status(200).json({ profile: "Brand", count: brandCount });
  } catch (error) {
    res.status(500).json({ message: "Error counting brands", error });
  }
};
// Distributor model import
exports.getAllDistributorsDetails = async (req, res) => {
  try {
    // Find all distributors where profile is 'Distributor' (case-insensitive)
    const distributors = await Distributor.find({ 
      profile: { $regex: '^Distributor$', $options: 'i' } 
    }).sort({ createdAt: -1 });

  

    if (!distributors.length) {
      console.log('No distributors found in the database');
      return res.status(404).json({ message: 'No hvfh found' });
    }

    res.status(200).json(distributors);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Error fetching distributors', error });
  }
};


exports.getAllBrandDetails = async (req, res) => {
  try {
    // Find all distributors where profile is 'Distributor' (case-insensitive)
    const distributors = await Distributor.find({ 
      profile: { $regex: '^Brand$', $options: 'i' } 
    }).sort({ createdAt: -1 });

  

    if (!distributors.length) {
      console.log('No distributors found in the database');
      return res.status(404).json({ message: 'No hvfh found' });
    }

    res.status(200).json(distributors);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Error fetching distributors', error });
  }
};

 


exports.getDistributorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all distributors by userId and sort by createdAt field in descending order
    const distributors = await Distributor.find({ userId }).sort({ createdAt: -1 });

    if (!distributors.length) {
      return res.status(404).json({ message: 'No distributors found' });
    }

    res.status(200).json(distributors);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Error fetching distributors', error });
  }
};



// Create a new distributor
exports.createDistributor = async (req, res) => {
  try {
    const { shopName, drugName, discount,  contactNumber, deliveryType1, deliveryTime, address, profile, userId } = req.body;

    // Create a new distributor instance
    const distributor = new Distributor({
      shopName,
      drugName,
      discount,
      contactNumber,
      deliveryType1,
      deliveryTime,
      address,
      profile,
      userId,
    });

    // Save the distributor to the database
    const savedDistributor = await distributor.save();
    res.status(201).json({
      message: 'Distributor created successfully!',
      distributor: savedDistributor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating distributor', error });
  }
};

// Get distributor by userId (fast search using index)


// Update distributor by userId
exports.updateDistributor = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shopName, drugName, discount,  contactNumber, deliveryType1, deliveryTime, address, profile } = req.body;

    // Find and update distributor by userId
    const updatedDistributor = await Distributor.findOneAndUpdate(
      { userId },
      { shopName, drugName, discount,  contactNumber, deliveryType1, deliveryTime, address, profile },
      { new: true } // Return the updated document
    );

    if (!updatedDistributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }

    res.status(200).json({
      message: 'Distributor updated successfully!',
      distributor: updatedDistributor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating distributor', error });
  }
};

// Delete distributor by userId
exports.deleteDistributor = async (req, res) => {
  try {
    const { _id } = req.params;

    // Find and delete distributor by userId
    const deletedDistributor = await Distributor.findOneAndDelete({ _id });

    if (!deletedDistributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }

    res.status(200).json({
      message: 'Distributor deleted successfully!',
      distributor: deletedDistributor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting distributor', error });
  }
};
