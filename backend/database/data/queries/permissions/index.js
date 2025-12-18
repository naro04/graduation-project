const createPermission = `
  INSERT INTO permissions (description, resource, action, permission_type)
  VALUES ($1, $2, $3, $4)
  RETURNING *;
`;

const getPermissions = `
  SELECT *, (resource || ':' || action) as slug FROM permissions ORDER BY resource;
`;

const getPermissionById = `
  SELECT *, (resource || ':' || action) as slug FROM permissions WHERE id = $1;
`;

const updatePermission = `
  UPDATE permissions
  SET description = $1, resource = $2, action = $3, permission_type = $4, updated_at = NOW()
  WHERE id = $5
  RETURNING *, (resource || ':' || action) as slug;
`;

const deletePermission = `
  DELETE FROM permissions WHERE id = $1 RETURNING *;
`;

module.exports = {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};
