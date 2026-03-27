const express = require('express');
const router = express.Router();
const activityController = require('../controllers/locationActivities');
const { protect, restrictTo, restrictToRolesOrPermissions } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(restrictToRolesOrPermissions(['Manager'], 'manage_locations', 'manage_employees'), activityController.getAllActivities)
    .post(restrictTo('manage_locations'), activityController.createLocationActivity);

// Team activities for manager/supervisor view
router.get('/team', activityController.getTeamActivities);

router.get('/reports', restrictToRolesOrPermissions(['Manager'], 'manage_locations', 'manage_employees'), activityController.getActivityReports);

router.post('/:activity_id/assign', restrictToRolesOrPermissions(['Manager'], 'manage_locations', 'manage_employees'), activityController.assignTeamToActivity);

router.get('/:activity_id/employees', restrictToRolesOrPermissions(['Manager'], 'manage_locations', 'manage_employees'), activityController.getActivityEmployees);

router.patch('/:activity_id/approve', restrictTo('manage_locations'), activityController.approveActivity);
router.patch('/:activity_id/reject', restrictTo('manage_locations'), activityController.rejectActivity);

router.route('/:activity_id')
    .get(restrictToRolesOrPermissions(['Manager'], 'manage_locations', 'manage_employees'), activityController.getActivityById)
    .put(restrictTo('manage_locations'), activityController.updateLocationActivity)
    .patch(restrictTo('manage_locations'), activityController.updateLocationActivity)

    .delete(restrictTo('manage_locations'), activityController.deleteLocationActivity);

module.exports = router;

