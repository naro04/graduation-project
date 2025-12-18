const express = require('express');
const router = express.Router();
const deptController = require('../controllers/departments');
const { protect, restrictTo } = require('../middleware/auth');

router.route('/')
    .get(protect, deptController.getAllDepartments)
    .post(protect, restrictTo('manage_departments'), deptController.createDepartment);

router.route('/:id')
    .get(protect, deptController.getDepartment)
    .put(protect, restrictTo('manage_departments'), deptController.updateDepartment)
    .delete(protect, restrictTo('manage_departments'), deptController.deleteDepartment);

module.exports = router;
