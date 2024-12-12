const Billing = require('../Schema/StoreBilling');





exports.getInvoicesByUserIdAndMonth = async (req, res) => {
  try {
      const { userId } = req.params; // Get userId from request parameters

      // Get the start and end of the current month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

      // Find invoices matching the userId and date within the current month
      const invoices = await Billing.find({
          userId: userId, // Now directly matching with top-level userId
          date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      if (invoices.length === 0) {
          return res.status(404).json({ message: 'No invoices found for this user ID in the current month' });
      }

      // Calculate the total quantity from rows array in all matched invoices
      const totalQuantity = invoices.reduce((total, invoice) => {
          return total + (invoice.rows || []).reduce((rowTotal, row) => {
              return rowTotal + (row.quantity || 0); // Assume `quantity` is the field name
          }, 0);
      }, 0);

      // Return only totalQuantity and totalDocuments fields
      res.status(200).json({
          totalQuantity,
          totalDocuments: invoices.length
      });
  } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ message: 'An error occurred while fetching invoices', error });
  }
};
exports.getRevenueForCurrentMonth = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    // Get the current month and year
    const currentMonth = new Date().getMonth(); // 0 = January, 11 = December
    const currentYear = new Date().getFullYear();

    // Set the start and end date for the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1); // First day of the current month
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0); // Last day of the current month

    // Fetch data where paymentMode is "Unpaid" and createdAt is within the current month
    const monthlyBillings = await Billing.aggregate([
      {
        $match: {
          userId: userId,
       
          createdAt: {
            $gte: startOfMonth, // Greater than or equal to the first day of the month
            $lte: endOfMonth // Less than or equal to the last day of the month
          }
        }
      },
      {
        $group: {
          _id: null, // No grouping by any field, just summing up
          totalRevenue: { $sum: "$totalAmount" } // Sum of the `totalAmount` field
        }
      }
    ]);

    // Respond with the total revenue for the current month
    if (monthlyBillings.length > 0) {
      res.status(200).json({
        message: `Total revenue for ${currentMonth + 1}-${currentYear} fetched successfully for userId: ${userId}`,
        data: { totalRevenue: monthlyBillings[0].totalRevenue }
      });
    } else {
      res.status(200).json({
        message: `No unpaid billing records found for ${currentMonth + 1}-${currentYear} for userId: ${userId}`,
        data: { totalRevenue: 0 }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching revenue for current month' });
  }
};
exports.getUnpaidBillingWithMessage = async (req, res) => {
  try {
    const { contactNumber } = req.params; // Extract contactNumber from the URL parameters

    if (!contactNumber) {
      return res.status(400).json({ message: 'Contact number is required' });
    }

    // Find the unpaid billings with non-empty Unpaidmessage
    const unpaidBillings = await Billing.find({
      ContactNumber: contactNumber,
      paymentMode: "Unpaid", // Filter for unpaid records
      Unpaidmessage: { $ne: "" }, // Only records with a non-empty Unpaidmessage
    }).select('date totalAmount Unpaidmessage'); // Select only the date and totalAmount fields

    if (unpaidBillings.length === 0) {
      return res.status(404).json({ message: 'No unpaid billings found for this contact number' });
    }

    // Respond with the fetched data
    res.status(200).json({
      message: `Unpaid billing records fetched successfully for contact number: ${contactNumber}`,
      data: unpaidBillings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching unpaid billing records' });
  }
};


exports.sendMessage = async (req, res) => {
  try {
    // Log the incoming request body
    console.log('Incoming request body:', req.body);

    const { billingId, message } = req.body; // Extract billingId and message from the request body

    // Log the extracted billingId and message
    console.log('Extracted billingId:', billingId);
    console.log('Extracted message:', message);

    // Find the billing record by _id (which is the default MongoDB identifier)
    const billing = await Billing.findById(billingId); // Use _id to query

    // Log the result of the billing query
    console.log('Found billing record:', billing);

    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    // Update the billing record with the new message
    billing.Unpaidmessage = message; // Assuming you have a field for storing the message
    console.log('Updated billing record:', billing);

    // Save the updated billing record
    await billing.save();

    // Respond with a success message
    res.status(200).json({
      message: `Message sent successfully for billing ID: ${billingId}`,
      data: billing
    });
  } catch (error) {
    // Log the error
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};
// Import Billing schema
exports.getUnpaidBillingByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    // Fetch data where paymentMode is "Unpaid"
    const unpaidBillings = await Billing.find({
      userId: userId,
      paymentMode: "Unpaid" // Filter for unpaid records
    });

    // Respond with the fetched data
    res.status(200).json({
      message: `Unpaid billing records fetched successfully for userId: ${userId}`,
      data: unpaidBillings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching unpaid billing records' });
  }
};

// New function to calculate the total revenue for the current month


exports.getUnpaidBillingByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extract userId from request parameters

    // Fetch data where paymentMode is "Unpaid"
    const unpaidBillings = await Billing.find({
      userId: userId,
      paymentMode: "Unpaid" // Filter for unpaid records
    });

    // Respond with the fetched data
    res.status(200).json({
      message: `Unpaid billing records fetched successfully for userId: ${userId}`,
      data: unpaidBillings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching unpaid billing records' });
  }
};
// Create a new billing record
exports.createBilling = async (req, res) => {
  try {
    const formData = req.body;

    // Create a new Billing document based on the form data
    const billingData = new Billing({
      patientName: formData.patientName,
      doctorName: formData.doctorName,
      AdharCardNumber: formData.AdharCardNumber,
      date: formData.date,
      address: formData.address,
      ContactNumber: formData.ContactNumber,
      gst: formData.gst,
      discount: formData.discount,
      totalAmount: formData.totalAmount,
      paymentMode:formData.paymentMode,
      rows: formData.rows,  // Array of drug objects
      userId: formData.userId
    });

    // Save the document to the database
    await billingData.save();

    res.status(201).json({
      message: 'Billing data saved successfully',
      data: billingData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving billing data' });
  }
};

// Get all billing records
exports.getAllBillings = async (req, res) => {
  try {
    const billings = await Billing.find();
    res.status(200).json({
      message: 'Fetched all billing records',
      data: billings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching billing data' });
  }
};

// Get a specific billing record by ID
exports.getBillingById = async (req, res) => {
  try {
    const billingId = req.params.id;

    const billing = await Billing.findById(billingId);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    res.status(200).json({
      message: 'Billing record fetched successfully',
      data: billing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching billing record' });
  }
};

// Update a specific billing record by ID
exports.updateBilling = async (req, res) => {
  try {
    const billingId = req.params.id;
    const updateData = req.body;

    const billing = await Billing.findByIdAndUpdate(billingId, updateData, { new: true });

    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    res.status(200).json({
      message: 'Billing record updated successfully',
      data: billing
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating billing record' });
  }
};

// Delete a specific billing record by ID
exports.deleteBilling = async (req, res) => {
  try {
    const billingId = req.params.id;

    const billing = await Billing.findByIdAndDelete(billingId);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    res.status(200).json({
      message: 'Billing record deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting billing record' });
  }
};
// Get all billing records for a specific userId
exports.getBillingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extract the userId from the request parameters

    // Find all billing records where userId matches and sort them in descending order by createdAt
    const billings = await Billing.find({ userId }).sort({ createdAt: -1 });

    if (!billings.length) {
      return res.status(404).json({ message: 'No billing records found for this user' });
    }

    res.status(200).json({
      message: 'Fetched billing records successfully for user',
      data: billings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching billing records for user' });
  }
};

