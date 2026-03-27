const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/tickets', supportController.getTickets);
router.post('/tickets', supportController.createTicket);

module.exports = router;
