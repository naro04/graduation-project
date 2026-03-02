const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');
const authMiddleware = require('../middleware/auth');

// Protect all notification routes
router.use(authMiddleware.protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
