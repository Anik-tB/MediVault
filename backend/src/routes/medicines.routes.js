const express = require('express');
const router = express.Router();
const medicinesController = require('../controllers/medicines.controller');

// GET /api/v1/medicines
router.get('/', medicinesController.getMedicines);

module.exports = router;
