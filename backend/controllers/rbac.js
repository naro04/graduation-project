const pool = require('../database/connection');
const rolesQueries = require('../database/data/queries/roles');
const permissionsQueries = require('../database/data/queries/permissions');

// --- ROLES ---

exports.getAllRoles = async (req, res) => {
    try {
        const result = await pool.query(rolesQueries.getRoles);
        res.status(200).json({ status: 'success', results: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching roles', error: err.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const { name, description, permissionIds } = req.body;
        const result = await pool.query(rolesQueries.createRole, [name, description]);
        const newRole = result.rows[0];

        // Add permissions if provided
        if (permissionIds && permissionIds.length > 0) {
            for (const pid of permissionIds) {
                await pool.query(rolesQueries.addPermissionToRole, [newRole.id, pid]);
            }
        }

        res.status(201).json({ status: 'success', data: newRole });
    } catch (err) {
        res.status(500).json({ message: 'Error creating role', error: err.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissionIds } = req.body;

        const result = await pool.query(rolesQueries.updateRole, [name, description, id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Role not found' });

        // Update permissions (simple approach: remove all, add new)
        if (permissionIds) {
            await pool.query(rolesQueries.removePermissionsFromRole, [id]);
            for (const pid of permissionIds) {
                await pool.query(rolesQueries.addPermissionToRole, [id, pid]);
            }
        }

        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error updating role', error: err.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(rolesQueries.deleteRole, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json({ status: 'success', message: 'Role deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting role', error: err.message });
    }
};

// --- PERMISSIONS ---

exports.getAllPermissions = async (req, res) => {
    try {
        const result = await pool.query(permissionsQueries.getPermissions);
        res.status(200).json({ status: 'success', results: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching permissions', error: err.message });
    }
};

exports.createPermission = async (req, res) => {
    try {
        const { description, resource, action, permission_type } = req.body;
        const result = await pool.query(permissionsQueries.createPermission, [description, resource, action, permission_type]);
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error creating permission', error: err.message });
    }
};

exports.updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, resource, action, permission_type } = req.body;
        const result = await pool.query(permissionsQueries.updatePermission, [description, resource, action, permission_type, id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Permission not found' });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error updating permission', error: err.message });
    }
};

exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(permissionsQueries.deletePermission, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Permission not found' });
        res.status(200).json({ status: 'success', message: 'Permission deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting permission', error: err.message });
    }
};
