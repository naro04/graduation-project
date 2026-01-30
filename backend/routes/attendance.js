const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get my attendance records (all authenticated users)
router.get('/my-attendance', attendanceController.getMyAttendance);

// Get daily attendance for all employees (HR/Admin view)
router.get('/daily', attendanceController.getDailyAttendance);

// Get team attendance for manager/supervisor view
router.get('/team', attendanceController.getTeamAttendance);

// Get attendance reports with date range and statistics
router.get('/reports', attendanceController.getAttendanceReports);

// Get available locations for manual selection (GPS fallback)
router.get('/locations', attendanceController.getLocationsForCheckIn);

// Check-in
router.post('/check-in', attendanceController.checkIn);

// Check-out
router.post('/check-out', attendanceController.checkOut);

// Delete attendance record
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;

