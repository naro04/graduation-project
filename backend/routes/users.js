const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder route - can be expanded later if needed
router.get('/', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Users endpoint - functionality can be added here'
  });
});

module.exports = router;

