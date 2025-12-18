const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(restrictTo('manage_locations'), locationsController.getAllLocations)
    .post(restrictTo('manage_locations'), locationsController.createLocation);

// Nested routes for location-specific resources (must be before /:id route to avoid conflicts)
router.get('/:location_id/employees', restrictTo('manage_locations'), locationsController.getLocationEmployees);
router.get('/:location_id/activities', restrictTo('manage_locations'), locationsController.getLocationActivities);

router.route('/:id')
    .put(restrictTo('manage_locations'), locationsController.updateLocation)
    .delete(restrictTo('manage_locations'), locationsController.deleteLocation);

module.exports = router;

