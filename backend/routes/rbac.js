const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbac');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

const allowRoleReadForManager = (req, res, next) => {
    const role = req.user?.role_name;
    if (role === 'Manager' || role === 'Super Admin') return next();

    const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
    const allowed = ['user_management:roles_&_permissions', 'manage_roles', 'manage_employees'];
    if (allowed.some((p) => permissions.includes(p))) return next();

    return res.status(403).json({ message: 'You do not have permission to perform this action' });
};

// Roles
router.route('/roles')
    .get(allowRoleReadForManager, rbacController.getAllRoles)
    .post(restrictTo('manage_roles'), rbacController.createRole); // 'manage_roles' is an example permission slug

router.route('/roles/:id')
    .get(restrictTo('user_management:roles_&_permissions', 'manage_roles'), rbacController.getRoleById)
    .put(restrictTo('manage_roles'), rbacController.updateRole)
    .delete(restrictTo('manage_roles'), rbacController.deleteRole);

// Permissions
router.route('/permissions')
    .get(restrictTo('view_permissions', 'manage_permissions'), rbacController.getAllPermissions)
    .post(restrictTo('manage_permissions'), rbacController.createPermission);

router.route('/permissions/:id')
    .put(restrictTo('manage_permissions'), rbacController.updatePermission)
    .delete(restrictTo('manage_permissions'), rbacController.deletePermission);

module.exports = router;
