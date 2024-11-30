const PurchaseFile = require('../Schema/PurchaseFile'); // Import the model

// Controller function to get purchase files by userId and sort by date
const getPurchaseFilesByUserId = async (req, res) => {
  const { userId } = req.params; // Extract userId from the request parameters

  try {
    // Find purchase files for the given userId and sort by date in descending order
    const purchaseFiles = await PurchaseFile.find({ userId })
      .sort({ date: -1 }) // -1 for descending order
      .exec();

    if (purchaseFiles.length === 0) {
      return res.status(404).json({ message: "No purchase files found for this user." });
    }

    res.status(200).json(purchaseFiles); // Return the sorted files
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { getPurchaseFilesByUserId };
