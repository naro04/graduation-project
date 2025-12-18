const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees');
const { protect, restrictTo } = require('../middleware/auth');

// All employee routes are protected and restricted to users with manage_employees permission
router.use(protect);

router.route('/')
    .get(restrictTo('view_employees', 'manage_employees'), employeesController.getAllEmployees)
    .post(restrictTo('manage_employees'), employeesController.createEmployee);

router.route('/:id')
    .put(restrictTo('manage_employees'), employeesController.updateEmployee)
    .delete(restrictTo('manage_employees'), employeesController.deleteEmployee);

module.exports = router;
