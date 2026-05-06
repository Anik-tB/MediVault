const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// Protect all order routes with Firebase Auth
router.use(verifyFirebaseToken);

// POST /api/v1/orders — Reserve for Pickup
router.post('/', ordersController.reserveForPickup);

module.exports = router;
