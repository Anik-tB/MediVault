const express = require('express');

const adminAuthController = require('../controllers/adminAuth.controller');
const adminDashboardController = require('../controllers/adminDashboard.controller');
const adminMedicinesController = require('../controllers/adminMedicines.controller');
const adminOrdersController = require('../controllers/adminOrders.controller');
const adminPrescriptionsController = require('../controllers/adminPrescriptions.controller');
const adminInteractionsController = require('../controllers/adminInteractions.controller');
const adminSettingsController = require('../controllers/adminSettings.controller');
const { verifyAdminSession } = require('../middleware/admin.middleware');

const router = express.Router();

router.post('/auth/login', adminAuthController.login);
router.post('/auth/register', adminAuthController.register);
router.post('/auth/firebase-login', adminAuthController.firebaseLogin);


router.use(verifyAdminSession);

router.get('/auth/me', adminAuthController.getMe);
router.post('/auth/logout', adminAuthController.logout);

router.get('/dashboard', adminDashboardController.getAdminDashboard);

router.get('/medicines', adminMedicinesController.getAdminMedicines);
router.post('/medicines', adminMedicinesController.createMedicine);
router.patch('/medicines/:medicineId', adminMedicinesController.updateMedicine);
router.delete('/medicines/:medicineId', adminMedicinesController.deleteMedicine);

router.get('/orders', adminOrdersController.getAdminOrders);
router.post('/orders/:orderId/verify-prescription', adminOrdersController.verifyOrderPrescription);
router.patch('/orders/:orderId/approve', adminOrdersController.approveOrder);
router.patch('/orders/:orderId/reject', adminOrdersController.rejectOrder);
router.patch('/orders/:orderId/pickup', adminOrdersController.markPickedUp);

router.get('/prescriptions', adminPrescriptionsController.getAdminPrescriptions);
router.patch('/prescriptions/:prescriptionId/approve', adminPrescriptionsController.approvePrescription);
router.patch('/prescriptions/:prescriptionId/reject', adminPrescriptionsController.rejectPrescription);

router.get('/interactions', adminInteractionsController.getAdminInteractions);
router.post('/interactions', adminInteractionsController.createInteraction);
router.patch('/interactions/:interactionId', adminInteractionsController.updateInteraction);
router.delete('/interactions/:interactionId', adminInteractionsController.deleteInteraction);

router.get('/settings', adminSettingsController.getStaffSettings);
router.patch('/settings/profile', adminSettingsController.updateProfile);
router.patch('/settings/notifications', adminSettingsController.updateNotifications);
router.patch('/settings/appearance', adminSettingsController.updateAppearance);
router.patch('/settings/password', adminSettingsController.updatePassword);

module.exports = router;
