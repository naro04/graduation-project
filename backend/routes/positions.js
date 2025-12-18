const express = require('express');
const router = express.Router();
const posController = require('../controllers/positions');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(posController.getAllPositions)
    .post(restrictTo('manage_departments'), posController.createPosition);

router.route('/:id')
    .put(restrictTo('manage_departments'), posController.updatePosition)
    .delete(restrictTo('manage_departments'), posController.deletePosition);

module.exports = router;
