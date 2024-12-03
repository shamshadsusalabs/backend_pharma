const Distributor = require('../Schema/Discount'); // Distributor model import

// Create a new distributor
exports.createDistributor = async (req, res) => {
  try {
    const { shopName, discount, deliveryType1, deliveryTime, address, profile, userId } = req.body;

    // Create a new distributor instance
    const distributor = new Distributor({
      shopName,
      discount,
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
exports.getDistributorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find distributor by userId
    const distributor = await Distributor.findOne({ userId });

    if (!distributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }

    res.status(200).json(distributor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching distributor', error });
  }
};

// Update distributor by userId
exports.updateDistributor = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shopName, discount, deliveryType1, deliveryTime, address, profile } = req.body;

    // Find and update distributor by userId
    const updatedDistributor = await Distributor.findOneAndUpdate(
      { userId },
      { shopName, discount, deliveryType1, deliveryTime, address, profile },
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
