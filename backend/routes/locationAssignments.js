const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/locationAssignments');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(restrictTo('manage_locations'), assignmentController.getLocationAssignments)
    .post(restrictTo('manage_locations'), assignmentController.createLocationAssignment);

router.delete('/:employee_id/:location_id', restrictTo('manage_locations'), assignmentController.deleteLocationAssignment);

module.exports = router;

