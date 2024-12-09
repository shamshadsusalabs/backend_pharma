const express = require('express');
const orderController = require('../Contoller/Order'); // Adjust path
const router = express.Router();

router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id', orderController.updateOrder);
router.delete('/orders/:id', orderController.deleteOrder);
router.get('/orders/pending/:userId',  orderController.getPendingOrdersByUserId);
router.get('/orders/confirm/:userId',  orderController.getConfiredOrdersByUserId);
router.get('/orders/confirm/orderuser/:oderuserId',  orderController.getConfirmedOrderByUserId);

router.post('/orders/update-order-status',  orderController.updateOrderStatus);
module.exports = router;
