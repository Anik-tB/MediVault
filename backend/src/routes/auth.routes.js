const express = require('express');
const { syncProfile } = require('../controllers/auth.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/sync', verifyFirebaseToken, syncProfile);

module.exports = router;
