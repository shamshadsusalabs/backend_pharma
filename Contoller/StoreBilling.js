const express = require('express');
const Billing = require('../Schema/StoreBilling'); // Import Billing schema

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
    const { userId } = req.params;  // Extract the userId from the request parameters

    // Find all billing records where userId matches
    const billings = await Billing.find({ userId });

    if (billings.length === 0) {
      return res.status(404).json({ message: 'No billing records found for this user' });
    }

    res.status(200).json({
      message: 'Fetched billing records successfully for user',
      data: billings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching billing records for user' });
  }
};
