const express = require('express');
const router = express.Router();
const activityController = require('../controllers/locationActivities');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .post(restrictTo('manage_locations'), activityController.createLocationActivity);

router.route('/:activity_id')
    .put(restrictTo('manage_locations'), activityController.updateLocationActivity)
    .delete(restrictTo('manage_locations'), activityController.deleteLocationActivity);

router.get('/:activity_id/employees', restrictTo('manage_locations'), activityController.getActivityEmployees);

module.exports = router;

