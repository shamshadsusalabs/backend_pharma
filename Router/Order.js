const express = require('express');
const orderController = require('../Contoller/Order'); // Adjust path
const router = express.Router();
const authenticateToken = require("../MiddleWare/authMiddleware");
router.post('/orders',authenticateToken, orderController.createOrder);
router.get('/orders', authenticateToken,orderController.getAllOrders);
router.get('/orders/:id',authenticateToken,orderController.getOrderById);
router.put('/orders/:id',authenticateToken,orderController.updateOrder);
router.delete('/orders/:id', authenticateToken,orderController.deleteOrder);
router.get('/orders/pending/:userId', authenticateToken,orderController.getPendingOrdersByUserId);
router.get('/orders/confirm/:userId', authenticateToken,orderController.getConfiredOrdersByUserId);
router.get('/orders/confirm/orderuser/:oderuserId', authenticateToken,orderController.getConfirmedOrderByUserId);

router.post('/orders/update-order-status', authenticateToken,orderController.updateOrderStatus);
module.exports = router;
