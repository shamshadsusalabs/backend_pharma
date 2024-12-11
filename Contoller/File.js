const os = require('os');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const File = require('../Schema/File');
const axios = require('axios');
const jwt = require('jsonwebtoken');




const sendWhatsAppMessage = async (contactNumber, fileUrl) => {
    try {
        const messageData = {
            messaging_product: "whatsapp",
            to: contactNumber,
            type: "template",
            template: {
                name: "thank_you_message", // Replace with your WhatsApp template name
                language: { code: "en_US" },
                components: [
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: `Thank you for your business! Here's your invoice: ${fileUrl}` }
                        ]
                    }
                ]
            }
        };

        // Sending the message via WhatsApp API
        const response = await axios.post(
            'https://graph.facebook.com/v21.0/553427024511427/messages',
            messageData,
            {
                headers: {
                    Authorization: 'Bearer YOUR_ACCESS_TOKEN', // Replace with your WhatsApp API access token
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('WhatsApp message sent:', response.data);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};


const savingBillFile = async (req, res) => {
    try {
        const { patientName, doctorName, AdharCardNumber, date, address, ContactNumber, gst, paymentMode, discount, totalAmount, rows, userId, userDetails } = req.body;

        // Generate HTML content for the invoice
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice Clone</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                }

                .invoice-container {
                    max-width: 900px;
                    margin: 20px auto;
                    border: 2px solid red;
                    background-color: #fff;
                    padding: 20px;
                }

                .header {
                    text-align: center;
                    border-bottom: 2px solid red;
                    padding-bottom: 10px;
                }

                .header h1 {
                    font-size: 20px;
                    margin: 0;
                }

                .header p {
                    margin: 5px 0;
                    font-size: 14px;
                    font-weight: bold;
                }

                .sub-header {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    font-size: 12px;
                }

                .sub-header div {
                    width: 48%;
                }

                .details {
                    margin-top: 20px;
                }

                .details table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .details th,
                .details td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                    font-size: 12px;
                }

                .details th {
                    background-color: #f0f0f0;
                }

                .totals {
                    margin-top: 20px;
                    text-align: right;
                }

                .totals table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .totals th,
                .totals td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: right;
                    font-size: 12px;
                }

                .totals th {
                    background-color: #f0f0f0;
                }

                .totals .highlight {
                    font-weight: bold;
                    background-color: #e0e0e0;
                }

                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    text-align: left;
                    line-height: 1.6;
                }

                .footer p {
                    margin: 5px 0;
                }

                .footer .signature {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }

                .footer .signature div {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <h1>TAX INVOICE</h1>
                    <p><strong>Shop Name:</strong> ${userDetails.shopName}</p>
                    <p><strong>Address:</strong> ${userDetails.address || address}</p>
                </div>

                <div class="sub-header">
                    <div>
                        <p><strong>GSTIN:</strong> ${userDetails.gstNumber}</p>
                        <p><strong>Licence No:</strong> ${userDetails.licenseNumber}</p>
                        <p><strong>Doctor Name:</strong> ${doctorName}</p>
                    </div>
                    <div style="text-align: right;">
                        <p><strong>Invoice No:</strong> GMA-14</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Phone:</strong> ${ContactNumber}</p>
                        <p><strong>Patient Name:</strong> ${patientName}</p>
                    </div>
                </div>

                <div class="details">
                    <table>
                        <thead>
                            <tr>
                                <th>Sr.</th>
                                <th>Drug Name</th>
                                <th>Drug Code</th>
                                 <th>Strip</th>
                                <th>Quantity</th>
                                <th>MRP</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.drugName}</td>
                                    <td>${item.drugCode}</td>
                                     <td>${item.strip}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.mrp}</td>
                                    <td>${item.amount}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="totals">
                    <table>
                     <tr>
                            <th>PaymentMode</th>
                            <td>${paymentMode}</td>
                        </tr>
                        <tr>
                            <th>Total Amount</th>
                            <td>${totalAmount}</td>
                        </tr>
                        <tr>
                            <th>Discount</th>
                            <td>${discount}%</td>
                        </tr>
                        <tr class="highlight">
                            <th>Net Amount</th>
                            <td>${totalAmount - (totalAmount * discount / 100)}</td>
                        </tr>
                    </table>
                </div>

                <div class="footer">
                    <p><strong>GST Applied:</strong> ${gst}%</p>
                    <p>Thank you for your business!</p>
                    <p>Invoice generated on: ${new Date().toLocaleDateString()}</p>

                    <div class="signature">
                        <div>
                            <p><strong>Checked By</strong></p>
                        </div>
                        <div>
                            <p><strong>Packed By</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `; // Same as the HTML content you've provided in the question

        // Create a temporary HTML file
        const tempFilePath = path.join(os.tmpdir(), `invoice_${new Date().getTime()}.html`);
        fs.writeFileSync(tempFilePath, htmlContent);

        // Upload to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "auto",
            folder: "invoices"
        });

        const fileUrl = cloudinaryResponse.secure_url;

        // Save file details in your database
        const newFile = new File({
            filePath: cloudinaryResponse.public_id,
            fileName: `invoice_${new Date().getTime()}.html`,
            userId: userDetails.id,
            fileUrl: fileUrl,
            patientName: patientName,
            AdharCardNumber: AdharCardNumber,
            date: date,
            paymentMode: paymentMode,
            ContactNumber: ContactNumber
        });

        await newFile.save();

        // Delete temporary file
        fs.unlinkSync(tempFilePath);

        // Send response back to the client
        res.json({ message: 'Invoice saved successfully!', fileUrl });

        // Send WhatsApp message with the file URL
        await sendWhatsAppMessage(ContactNumber, fileUrl);

    } catch (error) {
        console.error('Error during file save or WhatsApp message:', error);
        res.status(500).json({ message: 'Error saving the bill file or sending WhatsApp message' });
    }
};



// Assuming User model is in models folder


const getUsersByContactNumber = async (req, res) => {
    try {
        const { ContactNumber } = req.params;  // Extract ContactNumber from URL parameters

        // Check if ContactNumber is provided
        if (!ContactNumber) {
            return res.status(400).json({ message: 'Contact number is required in the URL.' });
        }

        // Clean and validate the contact number
        const cleanContactNumber = ContactNumber.trim();
        if (!/^\d{10}$/.test(cleanContactNumber)) {
            return res.status(400).json({ message: 'Invalid contact number format. Please provide a 10-digit number.' });
        }

        console.log("Searching for users with ContactNumber:", cleanContactNumber);

        // Find all users with the given contact number
        const users = await File.find({ ContactNumber: cleanContactNumber });
        if (users.length === 0) {
            console.log("No users found with ContactNumber:", cleanContactNumber);
            return res.status(404).json({ message: 'No users found with this contact number.' });
        }

        // Return the complete user data for all matching users
        console.log("Users found:", users);
        res.status(200).json({
            message: 'Users found successfully',
            users: users,  // Return entire user objects
        });

    } catch (err) {
        console.error("Error occurred while fetching users:", err);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};
// For generating JWT tokens (optional, for session management)
const loginWithContactNumber = async (req, res) => {
    try {
        console.log("Request body received:", req.body);

        const { ContactNumber } = req.body;
        if (!ContactNumber) {
            return res.status(400).json({ message: 'Contact number is required.' });
        }

        const cleanContactNumber = ContactNumber.trim();
        if (!/^\d{10}$/.test(cleanContactNumber)) {
            return res.status(400).json({ message: 'Invalid contact number format.' });
        }

        console.log("Attempting to find user with ContactNumber:", cleanContactNumber);
        const user = await File.findOne({ ContactNumber: cleanContactNumber });
        if (!user) {
            console.log("No user found with ContactNumber:", cleanContactNumber);
            return res.status(404).json({ message: 'No user found with this contact number.' });
        }

        console.log("User found:", user);
        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
        console.log("JWT token generated:", token);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'Strict',
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                patientName: user.patientName,
                ContactNumber:user.ContactNumber

            },
        });

    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};








const getInvoicesByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from the route parameter

        // Fetch and sort all invoices for the given userId in descending order by createdAt
        const invoices = await File.find({ userId }).sort({ createdAt: -1 });

        // Check if any invoices exist
        if (invoices.length === 0) {
            return res.status(404).json({ message: 'No invoices found for this user.' });
        }

        // Respond with the fetched invoices
        res.status(200).json({ message: 'Invoices retrieved successfully!', invoices });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
};


module.exports = {
    savingBillFile,
    getInvoicesByUserId,
 loginWithContactNumber,
 getUsersByContactNumber 
    // Export the new function
};
