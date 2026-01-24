const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbac');
const { protect, restrictTo } = require('../middleware/auth');

// Roles
router.route('/roles')
    .get(protect, restrictTo('user_management:roles_&_permissions', 'manage_roles'), rbacController.getAllRoles)
    .post(protect, restrictTo('manage_roles'), rbacController.createRole); // 'manage_roles' is an example permission slug

router.route('/roles/:id')
    .get(protect, restrictTo('user_management:roles_&_permissions', 'manage_roles'), rbacController.getRoleById)
    .put(protect, restrictTo('manage_roles'), rbacController.updateRole)
    .delete(protect, restrictTo('manage_roles'), rbacController.deleteRole);

// Permissions
router.route('/permissions')
    .get(protect, restrictTo('view_permissions', 'manage_permissions'), rbacController.getAllPermissions)
    .post(protect, restrictTo('manage_permissions'), rbacController.createPermission);

router.route('/permissions/:id')
    .put(protect, restrictTo('manage_permissions'), rbacController.updatePermission)
    .delete(protect, restrictTo('manage_permissions'), rbacController.deletePermission);

module.exports = router;
