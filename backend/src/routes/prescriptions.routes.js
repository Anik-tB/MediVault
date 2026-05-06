const express = require('express');

const {
  createPrescription,
  getPrescriptions,
} = require('../controllers/prescriptions.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyFirebaseToken);

router.get('/', getPrescriptions);
router.post('/', createPrescription);

module.exports = router;
