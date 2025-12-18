const createUser = `
  INSERT INTO users (name, email, password_hash)
  VALUES ($1, $2, $3)
  RETURNING id, name, email;
`;

const findUserByEmail = `
  SELECT 
    u.*,
    r.name as role_name,
    r.id as role_id
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.email = $1;
`;

const retrieveUserPermissions = `
  SELECT DISTINCT p.slug
  FROM permissions p
  JOIN role_permissions rp ON p.id = rp.permission_id
  JOIN user_roles ur ON rp.role_id = ur.role_id
  WHERE ur.user_id = $1;
`;

const assignRole = `
  INSERT INTO user_roles (user_id, role_id)
  VALUES ($1, $2);
`;

const findUserById = `
  SELECT 
    u.id, u.name, u.email, u.avatar_url,
    r.name as role_name,
    r.id as role_id
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.id = $1;
`;

const findRoleByName = `
  SELECT id FROM roles WHERE name = $1;
`;

const getMe = `
  SELECT 
    u.id, u.name, u.email, u.avatar_url,
    e.employee_code, e.first_name, e.middle_name, e.last_name, e.full_name,
    e.phone, e.birth_date, e.gender, e.marital_status, e.status, e.hired_at,
    d.name as department_name,
    pos.title as position_title,
    r.name as role_name
  FROM users u
  LEFT JOIN employees e ON u.id = e.user_id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions pos ON e.position_id = pos.id
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.id = $1;
`;

module.exports = {
  createUser,
  findUserByEmail,
  retrieveUserPermissions,
  assignRole,
  findUserById,
  findRoleByName,
  getMe
};
