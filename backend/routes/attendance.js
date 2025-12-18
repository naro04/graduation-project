const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance');
const { protect } = require('../middleware/auth');

// All routes require authentication (no specific permission needed - employees can manage their own attendance)
router.use(protect);

// Get my attendance records
router.get('/my-attendance', attendanceController.getMyAttendance);

// Check-in
router.post('/check-in', attendanceController.checkIn);

// Check-out
router.post('/check-out', attendanceController.checkOut);

module.exports = router;

