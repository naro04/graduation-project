const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth");
const locationTypesController = require("../controllers/locationTypes");

// All routes require authentication
router.use(protect);

router.route('/')
    .get(restrictTo('manage_locations'), locationTypesController.getAllLocationTypes)
    .post(restrictTo('manage_locations'), locationTypesController.createLocationType);

router.route('/:id')
    .put(restrictTo('manage_locations'), locationTypesController.updateLocationType)
    .delete(restrictTo('manage_locations'), locationTypesController.deleteLocationType);

module.exports = router;
