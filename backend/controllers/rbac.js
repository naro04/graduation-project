const pool = require('../database/connection');
const rolesQueries = require('../database/data/queries/roles');
const permissionsQueries = require('../database/data/queries/permissions');

// --- ROLES ---

exports.getAllRoles = async (req, res) => {
    try {
        const result = await pool.query(rolesQueries.getRoles);
        // Map data to match frontend expectations if necessary
        const roles = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description
        }));
        res.status(200).json(roles);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching roles', error: err.message });
    }
};

exports.getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const roleResult = await pool.query(rolesQueries.getRoleById, [id]);
        if (roleResult.rows.length === 0) return res.status(404).json({ message: 'Role not found' });

        const role = roleResult.rows[0];
        const permsResult = await pool.query(rolesQueries.getRolePermissions, [id]);

        const response = {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: permsResult.rows.map(p => ({
                permissionId: p.id,
                resource: p.resource,
                action: p.action,
                permissionType: p.permission_type,
                slug: p.slug
            }))
        };

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching role', error: err.message });
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
        const { name, description, permissionIds, permissions } = req.body;

        // Use either permissionIds or permissions (frontend uses permissions)
        const finalPermissionIds = permissionIds || permissions;

        // Only update role details if name or description is provided
        let role = null;
        if (name || description) {
            const roleResult = await pool.query(rolesQueries.getRoleById, [id]);
            if (roleResult.rows.length === 0) return res.status(404).json({ message: 'Role not found' });

            const currentRole = roleResult.rows[0];
            const updatedName = name || currentRole.name;
            const updatedDescription = description !== undefined ? description : currentRole.description;

            const result = await pool.query(rolesQueries.updateRole, [updatedName, updatedDescription, id]);
            role = result.rows[0];
        } else {
            const roleResult = await pool.query(rolesQueries.getRoleById, [id]);
            if (roleResult.rows.length === 0) return res.status(404).json({ message: 'Role not found' });
            role = roleResult.rows[0];
        }

        // Update permissions (simple approach: remove all, add new)
        if (finalPermissionIds && Array.isArray(finalPermissionIds)) {
            await pool.query(rolesQueries.removePermissionsFromRole, [id]);
            for (const pid of finalPermissionIds) {
                await pool.query(rolesQueries.addPermissionToRole, [id, pid]);
            }
        }

        res.status(200).json({ status: 'success', data: role });
    } catch (err) {
        console.error('Update Role Error:', err);
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
        const perms = result.rows.map(p => ({
            id: p.id,
            resource: p.resource,
            action: p.action,
            permissionType: p.permission_type,
            description: p.description,
            slug: p.slug
        }));
        res.status(200).json(perms);
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
