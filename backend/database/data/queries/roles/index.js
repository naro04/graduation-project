const createRole = `
  INSERT INTO roles (name, description)
  VALUES ($1, $2)
  RETURNING *;
`;

const getRoles = `
  SELECT * FROM roles ORDER BY created_at DESC;
`;

const getRoleById = `
  SELECT * FROM roles WHERE id = $1;
`;

const updateRole = `
  UPDATE roles
  SET name = $1, description = $2, updated_at = NOW()
  WHERE id = $3
  RETURNING *;
`;

const deleteRole = `
  DELETE FROM roles WHERE id = $1 RETURNING *;
`;

// Link permissions to role
const addPermissionToRole = `
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES ($1, $2)
  ON CONFLICT DO NOTHING;
`;

const removePermissionsFromRole = `
  DELETE FROM role_permissions WHERE role_id = $1;
`;

const getRolePermissions = `
    SELECT p.* 
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    WHERE rp.role_id = $1;
`;

module.exports = {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    addPermissionToRole,
    removePermissionsFromRole,
    getRolePermissions
};
