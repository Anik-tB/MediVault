const express = require('express');

const { getHealth } = require('../controllers/health.controller');

const authRoutes = require('./auth.routes');
const medicinesRoutes = require('./medicines.routes');
const cartRoutes = require('./cart.routes');

const router = express.Router();

router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/medicines', medicinesRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
