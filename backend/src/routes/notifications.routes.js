const express = require('express');

const {
  getNotifications,
  markAllAsRead,
} = require('../controllers/notifications.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);

module.exports = router;
