const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All employee routes are protected and restricted to users with manage_employees permission

router.route('/')
    .get(restrictTo('user_management:employees', 'user_actions:view_all_employees', 'manage_employees'), employeesController.getAllEmployees)
    .post(restrictTo('user_management:employees', 'user_actions:create_employee', 'manage_employees'), upload.single('avatar'), upload.diagnostic, employeesController.createEmployee);

router.get('/reports', restrictTo('reports:hr_reports', 'manage_employees'), employeesController.getHRReports);

router.get('/team/members', employeesController.getTeamMembers);

router.post('/bulk-action', restrictTo('user_management:employees', 'user_actions:disable/delete_employee', 'manage_employees'), employeesController.bulkAction);

router.route('/:id')
    .get(restrictTo('user_management:employees', 'user_actions:view_all_employees', 'manage_employees'), employeesController.getEmployeeById)
    .put(restrictTo('user_management:employees', 'user_actions:edit_employee', 'manage_employees'), upload.single('avatar'), upload.diagnostic, employeesController.updateEmployee)
    .patch(restrictTo('user_management:employees', 'user_actions:edit_employee', 'manage_employees'), upload.single('avatar'), upload.diagnostic, employeesController.updateEmployee)
    .delete(restrictTo('user_management:employees', 'user_actions:disable/delete_employee', 'manage_employees'), employeesController.deleteEmployee);

module.exports = router;
