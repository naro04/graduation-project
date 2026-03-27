const router = require('express').Router();
const leaveController = require('../controllers/leaves');
const { protect, restrictToRolesOrPermissions } = require('../middleware/auth');

// All leave routes require authentication
router.use(protect);

const path = require('path');
const multer = require('multer');

const upload = require('../middleware/upload');
const leaveUpload = upload; // Use the centralized Cloudinary upload

// GET /api/v1/leaves - Get all leaves with stats and filters
router.get('/', leaveController.getLeaves);

// GET /api/v1/leaves/team - Get team leave requests for manager/supervisor
router.get('/team', leaveController.getTeamLeaves);

// GET /api/v1/leaves/reports - Get leave reports
router.get(
  '/reports',
  restrictToRolesOrPermissions(['Manager', 'HR Admin'], 'reports:leave_reports', 'manage_employees'),
  leaveController.getLeaveReports
);

// POST /api/v1/leaves - Create a new leave request (with optional document)
router.post('/', leaveUpload.single('supporting_document'), leaveController.createLeave);

// PUT /api/v1/leaves/:id/status - Update leave request status
router.put('/:id/status', leaveController.updateLeaveStatus);

// DELETE /api/v1/leaves - Bulk delete leave requests
router.delete('/', leaveController.bulkDeleteLeaves);

// GET /api/v1/leaves/my - Get personal leave requests
router.get('/my', leaveController.getMyLeaves);

// GET /api/v1/leaves/my-stats - Get personal leave balances
router.get('/my-stats', leaveController.getMyLeaveStats);

module.exports = router;
