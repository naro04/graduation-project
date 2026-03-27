const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');
const settingsController = require('../controllers/notificationSettings');
const authMiddleware = require('../middleware/auth');

// Protect all notification routes
router.use(authMiddleware.protect);

// Settings routes
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

// Inbox routes
router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
