const Store = require('../Schema/Store'); // Import the Store schema
const StockAlert = require('../Schema/ExpiryAlert'); // Import the StockAlert schema
const cron = require('node-cron'); // Import node-cron for scheduled tasks
const mongoose = require("mongoose");
// Function to check expiry alerts
const checkExpiryAlerts = async () => {
  try {
    console.log('Starting the expiry check process...'); // Log when the process starts
    const stores = await Store.find().populate('user'); // Fetch all stores with user info
    console.log(`Found ${stores.length} stores.`); // Log the number of stores found

    stores.forEach(async (store) => {
      console.log(`Processing store: ${store._id}`); // Log store processing
      store.distributorSupplied.forEach(async (drug) => {
        console.log(`Checking drug: ${drug.drugName} (Code: ${drug.drugCode})`); // Log each drug being checked

        const currentDate = new Date();
        const expiryDate = new Date(drug.expiryDate);

        // Calculate days until expiry
        const timeDifference = expiryDate - currentDate;
        const daysUntilExpiry = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 30) {
          let alertMessage;
          if (daysUntilExpiry >= 0) {
            alertMessage = `⚠️ Expiry Alert: Drug "${drug.drugName}" (drug-Code: ${drug.drugCode}, Batch: ${drug.batchNumber}) is expiring in ${daysUntilExpiry} days. Expiry Date: ${expiryDate.toLocaleDateString()}`;
            console.log(`Drug "${drug.drugName}" will expire in ${daysUntilExpiry} days.`);
          } else {
            alertMessage = `❌ Expired Alert: Drug "${drug.drugName}" (drug-Code: ${drug.drugCode}, Batch: ${drug.batchNumber}) expired ${Math.abs(daysUntilExpiry)} days ago. Expiry Date: ${expiryDate.toLocaleDateString()}`;
            console.log(`Drug "${drug.drugName}" expired ${Math.abs(daysUntilExpiry)} days ago.`);
          }

          // Check if an alert for the same drug has been created in the last 24 hours
          const last24Hours = new Date();
          last24Hours.setDate(last24Hours.getDate() - 1); // 24 hours ago

          const existingAlert = await StockAlert.findOne({
            userId: store.user._id,
            drugCode: drug.drugCode,
            batchNumber: drug.batchNumber,
            createdAt: { $gte: last24Hours },
          });

          if (!existingAlert) {
            // Create a new Expiry Alert and save it to the database
            const alert = new StockAlert({
              userId: store.user._id, // Reference to the user associated with the store
              drugName: drug.drugName,
              drugCode: drug.drugCode,
              batchNumber: drug.batchNumber,
              message: alertMessage,
            });

            await alert.save();
            console.log(`Alert created: ${alertMessage}`);
          } else {
            console.log(`Alert already exists for drug "${drug.drugName}" within the last 24 hours.`);
          }
        } else {
          console.log(`Drug "${drug.drugName}" is safe. Days until expiry: ${daysUntilExpiry}.`);
        }
      });
    });
  } catch (error) {
    console.error('Error checking expiry notifications:', error.message);
  }
};

// Schedule the task to run every 10 seconds for testing
cron.schedule('0 * * * *', checkExpiryAlerts); // Runs every 10 seconds


// Controller to trigger expiry alerts check manually
const triggerExpiryCheck = async (req, res) => {
  try {
    console.log('Manually triggering the expiry check process...');
    await checkExpiryAlerts(); // Trigger the expiry check function
    res.status(200).json({ message: 'Expiry alerts checked successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error checking expiry alerts.', error: err.message });
  }
};

// Controller to fetch expiry alerts for a specific user by their userId
const getExpiryAlertsByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Extract the userId from the URL parameters
    console.log(`Fetching expiry alerts for user: ${userId}`);

    // Fetch all expiry alerts for the specified userId, sorted by timestamp
    const alerts = await StockAlert.find({ userId }).sort({ alertTimestamp: -1 });

    console.log(`Found ${alerts.length} expiry alerts for user ${userId}.`); // Log the number of alerts found
    res.status(200).json(alerts); // Return the alerts as a JSON response
  } catch (err) {
    console.error('Error fetching expiry alerts:', err.message); // Log error
    res.status(500).json({ message: 'Error fetching expiry alerts for user.', error: err.message });
  }
};


const countDistinctDrugAlerts = async (req, res) => {
  try {
      // Extract userId from the URL parameter
      const { userId } = req.params;

      // Validate userId
      if (!userId) {
          return res.status(400).json({ message: 'userId is required.' });
      }

      // Query the database to find all documents for the given userId
      const result = await StockAlert.aggregate([
          // Match documents based on userId
          {
              $match: {
                  userId: new mongoose.Types.ObjectId(userId),  // Use 'new' keyword here
              },
          },
          // Group by drugCode to count only distinct drugCodes
          {
              $group: {
                  _id: "$drugCode",  // Group by drugCode only
              },
          },
          // Count the distinct drugCodes
          {
              $count: "totalCountExpiry",  // Count how many distinct drugCodes are there
          }
      ]);

      // If no results found
      if (result.length === 0) {
          return res.status(404).json({ message: 'No documents found for the provided userId.' });
      }

      // Send the distinct drug code count
      return res.status(200).json({
        totalCountExpiry: result[0]. totalCountExpiry,
      });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { checkExpiryAlerts, triggerExpiryCheck, getExpiryAlertsByUser,countDistinctDrugAlerts  };
