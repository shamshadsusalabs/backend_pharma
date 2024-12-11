
const PurchaseFile = require("../Schema/PurchaseFile");
const cloudinary = require("cloudinary").v2;
const os = require("os");
const fs = require("fs");
const path = require("path");
const Store = require("../Schema/Store");
const mongoose = require("mongoose");


 // Adjust the model import to your setup

// Controller to get the total count of distributorSupplied objects for a given userID
exports.getDistributorSuppliedCount = async (req, res) => {
  try {
    // Retrieve userID from the request params
    const userID = req.params.userID;

    // Check if userID is provided
    if (!userID) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Query to find all records for the given userID
    const records = await Store.find({ user: userID });

    // Check if no records were found for the provided userID
    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found for the provided userID' });
    }

    // Calculate the total count of distributorSupplied objects
    const totalCount = records.reduce((count, record) => {
      return count + (record.distributorSupplied ? record.distributorSupplied.length : 0);
    }, 0);

    // Send the total count in the response
    res.status(200).json({ totalTypeofdrugs: totalCount });

  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getExpiringDrugs = async (req, res) => {
  try {
    const { userId } = req.params;
   

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
   
      return res.status(400).json({ message: "Valid User ID is required" });
    }
 

    // Get current date and set it to midnight (start of the day)
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);  // Midnight of today


    // Calculate the first day of next month
    const nextMonthStart = new Date(currentDate);
    nextMonthStart.setMonth(currentDate.getMonth() + 1);
    nextMonthStart.setUTCDate(1); // Set date to first of the next month
    nextMonthStart.setUTCHours(0, 0, 0, 0);  // Midnight of next month
  

 
    const stores = await Store.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$distributorSupplied" },
      {
        $match: {
          $or: [
            {
              "distributorSupplied.expiryDate": { $lt: currentDate }  // Already expired
            },
            {
              "distributorSupplied.expiryDate": {
                $gte: currentDate,  // Expiry date after or equal to today
                $lt: nextMonthStart  // Expiry date before the start of next month
              }
            }
          ]
        }
      },
      { $project: { _id: 0, drug: "$distributorSupplied" } }  // Project the drug information
    ]);


    // Return empty array if no drugs found
    if (stores.length === 0) {
      console.log("No expiring or expired drugs found.");
      return res.status(200).json([]);  // Empty array response
    }

   
    res.status(200).json(stores.map(store => store.drug));
  } catch (error) {
 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






exports.getDynamicDrugs = async (req, res) => {
  const { userId } = req.params; // Extract userId from URL params
  
  let { searchCriteria } = req.query; // Extract search criteria from query string

  // Check if searchCriteria is provided, return error if not
  if (!searchCriteria) {
    console.log("Search criteria is missing or empty."); // Debugging: Log missing search criteria
    return res.status(400).json({ success: false, message: 'Search criteria is required.' });
  }

  // Ensure searchCriteria is an array if it's a single string
  if (typeof searchCriteria === 'string') {
    searchCriteria = [searchCriteria]; // Convert string to array if it's a single string
  }

  // Escape special characters in search criteria terms
  const regexPattern = searchCriteria.map(term => escapeRegex(term)).join('|');

  const regexSearch = new RegExp(regexPattern, "i"); // Case-insensitive regex

  try {
    // Use aggregation for more efficient querying and mapping
    const results = await Store.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId), // Use 'new' here for ObjectId
          $or: [
            { "distributorSupplied.drugName": { $regex: regexSearch } },
            { "distributorSupplied.drugCode": { $regex: regexSearch } }
          ]
        }
      },
      {
        $project: { // Only return relevant fields
          distributorSupplied: 1
        }
      },
      {
        $unwind: "$distributorSupplied" // Flatten the distributorSupplied array
      },
      {
        $match: { // Final filter to check if drug matches search criteria
          $or: [
            { "distributorSupplied.drugName": { $regex: regexSearch } },
            { "distributorSupplied.drugCode": { $regex: regexSearch } }
          ]
        }
      },
      {
        $project: { // Clean up the result and return the desired fields
          drugName: "$distributorSupplied.drugName",
          drugCode: "$distributorSupplied.drugCode",
          perStripPrice: "$distributorSupplied.perStripPrice",
         perStripQuantity: "$distributorSupplied.perStripQuantity"  // Add this field to the projection
        }
      }
    ]);

    if (results.length > 0) {
      return res.status(200).json({ success: true, drugs: results });
    } else {
      return res.status(404).json({ success: false, message: 'No drugs found matching the criteria.' });
    }
  } catch (error) {
    console.error("Error fetching drugs:", error.message); // Log error message
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};



exports.createStore = async (req, res) => {
  try {
    const { user, supplier, distributorSupplied } = req.body;

    // Step 1: Save data to the Store schema
    const store = new Store(req.body);
    await store.save();

    // Step 2: Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase invoice</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f8f9fa;
              }
              .container {
                  max-width: 900px;
                  margin: 20px auto;
                  padding: 20px;
                  background-color: #fff;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  border-radius: 5px;
              }
              h1 {
                  text-align: center;
                  color: #333;
                  margin-bottom: 20px;
              }
              .section {
                  margin-bottom: 20px;
              }
              .section h2 {
                  font-size: 18px;
                  color: #555;
                  border-bottom: 2px solid #ddd;
                  padding-bottom: 5px;
                  margin-bottom: 10px;
              }
              .table-container {
                  overflow-x: auto;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
              }
              th, td {
                  padding: 8px;
                  text-align: left;
                  border: 1px solid #ddd;
              }
              th {
                  background-color: #f4f4f4;
                  color: #333;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Supplier and Distributor Details</h1>
              
              <div class="section">
                  <h2>Supplier Details</h2>
                  <div class="table-container">
                      <table>
                          <thead>
                              <tr>
                                  <th>Supplier Name</th>
                                  <th>Type</th>
                                  <th>Contact Number</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${supplier.map(
                                (sup) => `
                                  <tr>
                                      <td>${sup.supplierName}</td>
                                      <td>${sup.type}</td>
                                      <td>${sup.contactNumber}</td>
                                  </tr>
                              `
                              ).join("")}
                          </tbody>
                      </table>
                  </div>
              </div>

              <div class="section">
                  <h2>Distributor Supplied Details</h2>
                  <div class="table-container">
                      <table>
                          <thead>
                              <tr>
                                  <th>Drug Name</th>
                                  <th>Drug Code</th>
                                  <th>Batch Number</th>
                                   <th>Strip</th>
                                    <th>PerStripQuantity</th>
                                     <th>PerStripPrice</th>
                                  <th>Price</th>
                                  <th>Stock</th>
                                  <th>Discount</th>
                                  <th>Expiry Date</th>
                                  <th>Manufacture Date</th>
                                  <th>Manufacturer</th>
                                  <th>Category</th>
                                     <th>Sack</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${distributorSupplied.map(
                                (dist) => `
                                  <tr>
                                      <td>${dist.drugName}</td>
                                      <td>${dist.drugCode}</td>
                                      <td>${dist.batchNumber}</td>
                                        <td>${dist.strip}</td>
                                          <td>${dist.perStripQuantity}</td>
                                            <td>${dist. perStripPrice}</td>
                                      <td>${dist.price}</td>
                                      <td>${dist.stock}</td>
                                      <td>${dist.discount}</td>
                                      <td>${dist.expiryDate}</td>
                                      <td>${dist.manufactureDate}</td>
                                      <td>${dist.manufacturer}</td>
                                      <td>${dist.category}</td>
                                       <td>${dist.typeofSack}</td>
                                  </tr>
                              `
                              ).join("")}
                          </tbody>
                      </table>
                  </div>
                  
              </div>
          </div>
      </body>
      </html>
    `;

    // Step 3: Create a temporary HTML file
    const tempFilePath = path.join(
      os.tmpdir(),
      `supplier_distributor_${supplier[0].supplierName}_${supplier[0].type}_${Date.now()}.html`
    );
    
    fs.writeFileSync(tempFilePath, htmlContent);

    // Step 4: Upload the file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "auto",
      folder: "supplier_distributor_files",
    });

    const fileUrl = cloudinaryResponse.secure_url;

    // Step 5: Save file metadata to PurchaseFile schema
    const purchaseFile = new PurchaseFile({
      userId: user,
      fileUrl,
      fileName: `supplier_distributor_${Date.now()}.html`,
      date: new Date(),
    });

    await purchaseFile.save();

    // Cleanup: Delete the temporary file
    fs.unlinkSync(tempFilePath);

    res.status(201).json({
      message: "Store created and file saved successfully",
      store,
      fileUrl,
    });
  } catch (error) {
    console.error("Error creating store and file:", error);
    res.status(500).json({ message: "Error creating store and file", error: error.message });
  }
};


// Escape special characters in search criteria
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // Escape special regex characters
};

// Function to dynamically get drugs based on userId and search terms (drug names or drug codes)


exports.updateStore = async (req, res) => {
  try {
    const { user, supplier, distributorSupplied } = req.body;



    // Step 1: Find the existing store by user ID
    const store = await Store.findOne({ user: req.body.user });

    // Check if store exists
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Loop through received supplier data and match it with the existing data
    req.body.supplier.forEach(newSupplier => {
      const existingSupplier = store.supplier.find(s => s.supplierName === newSupplier.supplierName);
      
      if (!existingSupplier) {
        // If supplier does not exist, add it
        store.supplier.push(newSupplier);
      } else {
        // Update existing supplier if needed
        existingSupplier.contactNumber = newSupplier.contactNumber;
        existingSupplier.type = newSupplier.type;
      }
    });
    
    // Loop through received distributorSupplied data and match it with the existing data
    req.body.distributorSupplied.forEach(newDrug => {
      const existingDrug = store.distributorSupplied.find(d => d.drugCode === newDrug.drugCode);
      
      if (!existingDrug) {
        // If drug does not exist, add it
        store.distributorSupplied.push(newDrug);
      } else {
        // Update existing drug if needed
        existingDrug.stock += newDrug.stock; // For example, increasing stock
        existingDrug.price = newDrug.price;  // Update price with the new price
        existingDrug.perStripPrice = newDrug.perStripPrice; // Update per strip price
        existingDrug.strip += newDrug.strip; // Add the new strip value
      }
    });
    
    // Save the updated store
    await store.save();
    
    
    
    
    // Step 4: Generate HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Invoice</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
            }
            .container {
                max-width: 900px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                border-radius: 5px;
            }
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
            }
            .section {
                margin-bottom: 20px;
            }
            .section h2 {
                font-size: 18px;
                color: #555;
                border-bottom: 2px solid #ddd;
                padding-bottom: 5px;
                margin-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                padding: 8px;
                text-align: left;
                border: 1px solid #ddd;
            }
            th {
                background-color: #f4f4f4;
                color: #333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Supplier and Distributor Details</h1>
            
            <div class="section">
                <h2>Supplier Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Type</th>
                            <th>Contact Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${supplier.map(sup => `
                            <tr>
                                <td>${sup.supplierName}</td>
                                <td>${sup.type}</td>
                                <td>${sup.contactNumber}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>Distributor Supplied Details</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Drug Name</th>
                            <th>Drug Code</th>
                            <th>Batch Number</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${distributorSupplied.map(dist => `
                            <tr>
                                <td>${dist.drugName}</td>
                                <td>${dist.drugCode}</td>
                                <td>${dist.batchNumber}</td>
                                <td>${dist.price}</td>
                                <td>${dist.stock}</td>
                                <td>${dist.expiryDate}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </body>
    </html>`;

    console.log("Generated HTML content");

    // Step 5: Create a temporary HTML file
    const tempFilePath = path.join(
      os.tmpdir(),
      `supplier_distributor_${Date.now()}.html`
    );
    fs.writeFileSync(tempFilePath, htmlContent);
    console.log("HTML file written to temporary path");

    // Step 6: Upload the file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "auto",
      folder: "supplier_distributor_files",
    });

    const fileUrl = cloudinaryResponse.secure_url;

    // Step 7: Save file metadata to the PurchaseFile schema
    const purchaseFile = new PurchaseFile({
      userId: user,
      fileUrl,
      fileName: `supplier_distributor_${Date.now()}.html`,
      date: new Date(),
    });

    await purchaseFile.save();
 

    // Cleanup: Delete the temporary file
    fs.unlinkSync(tempFilePath);
  

    // Step 8: Save the updated store data
    await store.save();


    res.status(200).json({
      message: "Store updated and file saved successfully",
      store,
      fileUrl,
    });
  } catch (error) {
    console.error("Error updating store and file:", error);
    res.status(500).json({ message: "Error updating store and file", error: error.message });
  }
};






exports.getLowStockDrugs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId (Check if it's a valid MongoDB ObjectId)
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid User ID is required" });
    }

    // Find stores with low stock drugs (stock <= 500) for the given user
    const stores = await Store.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },  // Use 'new' for ObjectId
      { $unwind: "$distributorSupplied" },
      { $match: { "distributorSupplied.stock": { $lte: 500 } } },
      { $project: { _id: 0, drug: "$distributorSupplied" } }
    ]);

    // Instead of 404, return 200 with an empty array if no low stock drugs are found
    if (stores.length === 0) {
      return res.status(200).json([]);  // Return empty array with 200 status
    }

    // Send the found low stock drugs
    res.status(200).json(stores.map(store => store.drug));
  } catch (error) {
    console.error("Error fetching low stock drugs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};







// Update stock by drugCode
exports.updateDrugStock = async (req, res) => {
  try {


    const { updates } = req.body;


    // Validate input
    if (!Array.isArray(updates) || updates.length === 0) {
      console.log("Validation failed: updates is not a valid array or is empty");
      return res.status(400).json({ message: "Invalid updates array" });
    }

    for (const update of updates) {
      const { drugCode, quantity, strip } = update;
     

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
        console.log(`Drug with code ${drugCode} not found`);
        throw new Error(`Drug with code ${drugCode} not found`);
      }

      if (drug.stock < quantity) {
        console.log(
          `Insufficient stock for drug ${drugCode}. Available: ${drug.stock}`
        );
        throw new Error(
          `Insufficient stock for drug ${drugCode}. Available: ${drug.stock}`
        );
      }

      // If strip is provided, check if it's sufficient; if not, skip strip validation
      if (strip !== undefined && drug.strip < strip) {
        console.log(
          `Insufficient strip for drug ${drugCode}. Available: ${drug.strip}`
        );
        throw new Error(
          `Insufficient strip for drug ${drugCode}. Available: ${drug.strip}`
        );
      }

      // Deduct the quantity (and strip, if provided) from the drug's stock
      drug.stock -= quantity;
      if (strip !== undefined) {
        drug.strip -= strip;
      }
     

      // Save the updated store
      await store.save();
     
    }

 
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error.message);
    res.status(500).json({ message: error.message });
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



