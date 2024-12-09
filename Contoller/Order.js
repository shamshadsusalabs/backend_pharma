const Order = require('../Schema/Order'); // Adjust the path to your model file



exports.getConfirmedOrderByUserId = async (req, res) => {
  try {
    const {oderuserId} = req.params; 
    console.log(oderuserId)// Assuming userId is passed as a route parameter

    if (!oderuserId) {
      return res.status(400).json({ message: 'Order User ID is required' });
    }

    // Query the database for matching orders
    const confirmedOrders = await Order.find(
      {
        'userDetails.oderuserId': oderuserId,
        'userDetails.status': 'Confirmed',
      },
      { _id: 1, orderDetails: 1, userDetails: 1 } // Projection for relevant fields
    ).lean();

    if (!confirmedOrders || confirmedOrders.length === 0) {
      return res.status(404).json({ message: 'No confirmed orders found for this user' });
    }

    res.status(200).json({
      message: 'Confirmed orders retrieved successfully',
      data: confirmedOrders,
    });
  } catch (error) {
    console.error('Error retrieving confirmed orders:', error);
    res.status(500).json({ message: 'An error occurred while retrieving confirmed orders' });
  }
};

exports.getConfiredOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming userId is passed as a route parameter

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Query the database for matching orders with projection and lean
    const pendingOrders = await Order.find(
      {
        'orderDetails.userId': userId,
        'userDetails.status': 'Confirmed',
      },
      { _id: 1, orderDetails: 1, userDetails: 1 } // Projection for relevant fields
    )
      .lean(); // Get plain JS objects for better performance

    if (pendingOrders.length === 0) {
      return res.status(404).json({ message: 'No pending orders found for this user' });
    }

    res.status(200).json({ message: 'Pending orders retrieved successfully', data: pendingOrders });
  } catch (error) {
    console.error('Error retrieving pending orders:', error);
    res.status(500).json({ message: 'Error retrieving pending orders', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { _id, action } = req.body; // Extract _id and action ('Confirm' or 'Cancelled') from the request body

    // Find the order by _id
    const order = await Order.findById(_id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found!' });
    }

    // Check if userDetails exists in the order
    if (!order.userDetails) {
      return res.status(400).json({ message: 'User details are missing in the order.' });
    }

    // Update userDetails based on action
    if (action === 'Confirm') {
      order.userDetails.status = 'Confirmed';
      order.userDetails.confirmOrderTime = new Date(); // Add current date and time
      order.userDetails.message = 'Your order is confirmed.';
    } else if (action === 'Cancelled') {
      order.userDetails.status = 'Cancelled';
      order.userDetails.message = 'Your order is cancelled. Please contact the distributor.';
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "Confirm" or "Cancelled".' });
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({
      message: order.userDetails.message,
      updatedOrder: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getPendingOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming userId is passed as a route parameter

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Query the database for matching orders with projection and lean
    const pendingOrders = await Order.find(
      {
        'orderDetails.userId': userId,
        'userDetails.status': 'Pending',
      },
      { _id: 1, orderDetails: 1, userDetails: 1 } // Projection for relevant fields
    )
      .lean(); // Get plain JS objects for better performance

    if (pendingOrders.length === 0) {
      return res.status(404).json({ message: 'No pending orders found for this user' });
    }

    res.status(200).json({ message: 'Pending orders retrieved successfully', data: pendingOrders });
  } catch (error) {
    console.error('Error retrieving pending orders:', error);
    res.status(500).json({ message: 'Error retrieving pending orders', error: error.message });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { orderDetails, userDetails } = req.body;

    if (!orderDetails || !userDetails) {
      return res.status(400).json({ message: 'Order details and user details are required' });
    }

    const newOrder = new Order({
      orderDetails,
      userDetails,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', data: savedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('orderDetails.userId userDetails.oderuserId');
    res.status(200).json({ message: 'Orders fetched successfully', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('orderDetails.userId userDetails.oderuserId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order fetched successfully', data: order });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).populate('orderDetails.userId userDetails.oderuserId');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully', data: deletedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};
