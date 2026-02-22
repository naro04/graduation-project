const router = require('express').Router();
const leaveController = require('../controllers/leaves');
const auth = require('../middleware/auth');

// All leave routes require authentication
router.use(auth.protect);

const path = require('path');
const multer = require('multer');

// Scoped upload configuration for leave documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'leave-' + unique + path.extname(file.originalname));
    }
});
const leaveUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for documents
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|rtf/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) || allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed! Support: images, PDF, Word, TXT.'));
        }
    }
});

// GET /api/v1/leaves - Get all leaves with stats and filters
router.get('/', leaveController.getLeaves);

// GET /api/v1/leaves/team - Get team leave requests for manager/supervisor
router.get('/team', leaveController.getTeamLeaves);

// GET /api/v1/leaves/reports - Get leave reports
router.get('/reports', auth.restrictTo('reports:leave_reports', 'manage_employees'), leaveController.getLeaveReports);

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
