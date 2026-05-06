const express = require('express');

const { getDashboard } = require('../controllers/dashboard.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/', getDashboard);

module.exports = router;
