const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// Protect all order routes with Firebase Auth
router.use(verifyFirebaseToken);

// GET /api/v1/orders
router.get('/', ordersController.getOrders);

// GET /api/v1/orders/:orderId — order details
router.get('/:orderId', ordersController.getOrderDetails);

// DELETE /api/v1/orders/:orderId — cancel a pending order
router.delete('/:orderId', ordersController.cancelOrder);

// POST /api/v1/orders — Reserve for Pickup
router.post('/', ordersController.reserveForPickup);

module.exports = router;
