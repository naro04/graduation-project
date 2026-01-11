const express = require('express');
const router = express.Router();
const activityController = require('../controllers/locationActivities');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(restrictTo('manage_locations'), activityController.getAllActivities)
    .post(restrictTo('manage_locations'), activityController.createLocationActivity);

router.get('/reports', restrictTo('manage_locations'), activityController.getActivityReports);

router.get('/:activity_id/employees', restrictTo('manage_locations'), activityController.getActivityEmployees);

router.patch('/:activity_id/approve', restrictTo('manage_locations'), activityController.approveActivity);
router.patch('/:activity_id/reject', restrictTo('manage_locations'), activityController.rejectActivity);

router.route('/:activity_id')
    .get(restrictTo('manage_locations'), activityController.getActivityById)
    .put(restrictTo('manage_locations'), activityController.updateLocationActivity)
    .patch(restrictTo('manage_locations'), activityController.updateLocationActivity)
    .delete(restrictTo('manage_locations'), activityController.deleteLocationActivity);

module.exports = router;

