const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

// Protect all cart routes with Firebase Auth
router.use(verifyFirebaseToken);

// POST /api/v1/cart
router.post('/', cartController.addToCart);

// GET /api/v1/cart
router.get('/', cartController.getCart);

// PATCH /api/v1/cart/:cartItemId
router.patch('/:cartItemId', cartController.updateQuantity);

// DELETE /api/v1/cart/:cartItemId
router.delete('/:cartItemId', cartController.removeItem);

// DELETE /api/v1/cart (clear entire cart)
router.delete('/', cartController.clearCart);

module.exports = router;
