const express = require('express');
const router = express.Router();
const gpsVerificationController = require('../controllers/gpsVerification');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get GPS verifications with filters
router.get('/', restrictTo('verify_gps'), gpsVerificationController.getGPSVerifications);

// Get GPS statistics
router.get('/stats', restrictTo('verify_gps'), gpsVerificationController.getGPSStats);

// Verify GPS for a specific attendance record
router.post('/:attendance_id/verify', restrictTo('verify_gps'), gpsVerificationController.verifyGPS);

// Update GPS status manually
router.put('/:attendance_id/status', restrictTo('verify_gps'), gpsVerificationController.updateGPSStatus);

module.exports = router;

