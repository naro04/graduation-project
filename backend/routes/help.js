const express = require('express');
const router = express.Router();
const helpController = require('../controllers/help');
const { protect } = require('../middleware/auth');

// Protect these routes to ensure only logged in users can see them
router.use(protect);

router.get('/content', helpController.getHelpContent);

module.exports = router;
