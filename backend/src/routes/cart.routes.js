const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// Protect all cart routes with Firebase Auth
router.use(verifyFirebaseToken);

// POST /api/v1/cart
router.post('/', cartController.addToCart);

module.exports = router;
