const router = require('express').Router();
const leaveController = require('../controllers/leaves');
const auth = require('../middleware/auth');

// All leave routes require authentication
router.use(auth.protect);

// GET /api/v1/leaves - Get all leaves with stats and filters
router.get('/', leaveController.getLeaves);

// GET /api/v1/leaves/reports - Get leave reports
router.get('/reports', auth.restrictTo('reports:leave_reports', 'manage_employees'), leaveController.getLeaveReports);

// POST /api/v1/leaves - Create a new leave request
router.post('/', leaveController.createLeave);

// PUT /api/v1/leaves/:id/status - Update leave request status
router.put('/:id/status', leaveController.updateLeaveStatus);

// DELETE /api/v1/leaves - Bulk delete leave requests
router.delete('/', leaveController.bulkDeleteLeaves);

// GET /api/v1/leaves/my - Get personal leave requests
router.get('/my', leaveController.getMyLeaves);

// GET /api/v1/leaves/my-stats - Get personal leave balances
router.get('/my-stats', leaveController.getMyLeaveStats);

module.exports = router;
