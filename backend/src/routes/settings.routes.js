const express = require('express');

const {
  getSettings,
  updateAppearanceSettings,
  updateNotificationSettings,
} = require('../controllers/settings.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/', getSettings);
router.patch('/notifications', updateNotificationSettings);
router.patch('/appearance', updateAppearanceSettings);

module.exports = router;
