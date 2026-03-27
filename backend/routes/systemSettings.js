const express = require('express');
const router = express.Router();
const systemSettingsController = require('../controllers/systemSettings');
const authMiddleware = require('../middleware/auth');

// All settings routes require authentication
router.use(authMiddleware.protect);

router.get('/', systemSettingsController.getSettings);
router.put('/', systemSettingsController.updateSettings);
router.get('/history', systemSettingsController.getSettingsHistory);

module.exports = router;

