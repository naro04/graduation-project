const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');
const { protect, restrictTo, restrictToRolesOrPermissions } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Team reports for manager view
router.get('/team', restrictToRolesOrPermissions(['Manager'], 'manage_locations', 'manage_employees'), reportsController.getTeamReports);

module.exports = router;
