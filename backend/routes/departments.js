const express = require('express');
const router = express.Router();
const deptController = require('../controllers/departments');
const { protect, restrictTo } = require('../middleware/auth');

router.route('/')
    .get(deptController.getAllDepartments)
    .post(restrictTo('manage_departments'), deptController.createDepartment);

router.post('/bulk-action', restrictTo('manage_departments'), deptController.bulkAction);

router.route('/:id')
    .get(deptController.getDepartment)
    .put(restrictTo('manage_departments'), deptController.updateDepartment)
    .delete(restrictTo('manage_departments'), deptController.deleteDepartment);

module.exports = router;
