const Store = require('../Schema/Store'); // Import the Store model
const StockAlert = require('../Schema/Stockalert'); // Import the StockAlert model
const cron = require('node-cron'); // Import node-cron for scheduled tasks

const STOCK_THRESHOLD = 100; // Threshold for stock alerts

// Function to check for low stock and send notifications
const checkLowStockNotifications = async () => {
  try {
    console.log('Starting the low stock notification process...');
    const stores = await Store.find().populate('user'); // Fetch all stores and populate user details

    stores.forEach(async (store) => {
      store.distributorSupplied.forEach(async (drug) => {
        if (drug.stock <= STOCK_THRESHOLD) {
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
            // Prepare the notification message
            const notificationMessage = `⚠️ Stock Alert: Drug "${drug.drugName}" (Drug-Code: ${drug.drugCode}, Batch: ${drug.batchNumber})  has stock below ${STOCK_THRESHOLD}. Current stock: ${drug.stock}.`;

            // Create a new StockAlert and save it to the database
            const alert = new StockAlert({
              userId: store.user._id, // Reference to the user associated with the store
              drugName: drug.drugName,
              drugCode: drug.drugCode,
              batchNumber: drug.batchNumber,
              message: notificationMessage,
            });

            // Save the alert to the database
            await alert.save();
            console.log(notificationMessage);
          } else {
            console.log(
              `Stock alert for drug "${drug.drugName}" (Code: ${drug.drugCode}) already exists within the last 24 hours.`
            );
          }
        } else {
          console.log(`Drug "${drug.drugName}" (Code: ${drug.drugCode}) has sufficient stock.`);
        }
      });
    });
  } catch (error) {
    console.error('Error checking stock notifications:', error.message);
  }
};

// Schedule the task to run every 10 seconds (for testing purposes, adjust as needed)
cron.schedule('0 * * * *', checkLowStockNotifications); // Runs every 10 seconds


// Controller to manually trigger the stock check
const checkStockAlerts = async (req, res) => {
  try {
    console.log('Manually triggering the stock check...');
    await checkLowStockNotifications(); // Trigger the stock check manually
    res.status(200).json({ message: 'Stock alerts checked successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error checking stock alerts.', error: err.message });
  }
};

// Controller to fetch stock alerts for a specific user by their userId
const getStockAlertsByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Extract the userId from the URL parameters
    console.log(`Fetching stock alerts for user: ${userId}`);

    // Fetch all alerts for the specified userId, sorted by timestamp
    const alerts = await StockAlert.find({ userId }).sort({ alertTimestamp: -1 });

    console.log(`Found ${alerts.length} alerts for user ${userId}.`);
    res.status(200).json(alerts);
  } catch (err) {
    console.error('Error fetching stock alerts:', err.message);
    res.status(500).json({ message: 'Error fetching stock alerts for user.', error: err.message });
  }
};

module.exports = { checkStockAlerts, getStockAlertsByUser };
