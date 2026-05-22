const express = require('express');

const {
  createPrescription,
  getPrescriptions,
} = require('../controllers/prescriptions.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const multer = require('multer');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/', getPrescriptions);
router.post('/', upload.single('prescription'), createPrescription);

module.exports = router;
