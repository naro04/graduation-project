const express = require('express');
const router = express.Router();
const notificationSettingsController = require('../controllers/notificationSettings');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/settings', notificationSettingsController.getSettings);
router.put('/settings', notificationSettingsController.updateSettings);

module.exports = router;
