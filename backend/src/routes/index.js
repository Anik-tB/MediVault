const express = require('express');

const { getHealth } = require('../controllers/health.controller');

const authRoutes = require('./auth.routes');
const medicinesRoutes = require('./medicines.routes');
const cartRoutes = require('./cart.routes');
const profileRoutes = require('./profile.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

router.get('/health', getHealth);
router.use('/auth', authRoutes);
router.use('/medicines', medicinesRoutes);
router.use('/cart', cartRoutes);
router.use('/profile', profileRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
