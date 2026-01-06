const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKey');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', apiKeyController.getKeys);
router.post('/', apiKeyController.createKey);
router.delete('/:id', apiKeyController.deleteKey);
router.put('/:id/rotate', apiKeyController.rotateKey);

module.exports = router;
