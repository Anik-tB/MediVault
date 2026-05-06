const express = require('express');

const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/', getProfile);
router.patch('/', updateProfile);

module.exports = router;
