const os = require('os');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const File = require('../Schema/File');

const savingBillFile = async (req, res) => {
    try {
        const { patientName, doctorName, AdharCardNumber, date, address, ContactNumber, gst, discount, totalAmount, rows, userId, userDetails } = req.body;

        // Generate the HTML content using the provided data
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
        `;

        // Create a temporary file
        const tempFilePath = path.join(os.tmpdir(), `invoice_${new Date().getTime()}.html`);
        fs.writeFileSync(tempFilePath, htmlContent);

        // Upload the file to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "auto",
            folder: "invoices"
        });

        // Generate file URL from Cloudinary response
        const fileUrl = cloudinaryResponse.secure_url;

        // Save the file details in the database
        const newFile = new File({
            filePath: cloudinaryResponse.public_id,
            fileName: `invoice_${new Date().getTime()}.html`,
            userId: userDetails.id,
            fileUrl: fileUrl,
            patientName:  patientName,
            AdharCardNumber: AdharCardNumber,
            date: date,
            ContactNumber:ContactNumber
        });

        await newFile.save();

        // Delete the temporary file
        fs.unlinkSync(tempFilePath);

        // Send the file URL as a response
        res.json({ message: 'Invoice saved successfully!', fileUrl });

    } catch (error) {
        console.error('Error saving the bill file:', error);
        res.status(500).json({ message: 'Error saving the bill file' });
    }
};


const getInvoicesByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from the route parameter

        // Fetch all invoices for the given userId
        const invoices = await File.find({ userId });

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
    getInvoicesByUserId, // Export the new function
};
