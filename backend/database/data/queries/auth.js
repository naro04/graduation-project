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
  JOIN (
    SELECT ur.role_id AS rid FROM user_roles ur WHERE ur.user_id = $1
    UNION
    SELECT e.role_id AS rid FROM employees e WHERE e.user_id = $1 AND e.role_id IS NOT NULL
  ) role_src ON rp.role_id = role_src.rid;
`;

const assignRole = `
  INSERT INTO user_roles (user_id, role_id)
  VALUES ($1, $2);
`;

const findUserById = `
  SELECT DISTINCT ON (u.id)
    u.id, u.name, u.email, u.avatar_url,
    e.id as employee_id,
    e.avatar_url as employee_avatar_url,
    e.status as employee_status,
    COALESCE(r.name, r_emp.name) AS role_name,
    COALESCE(r.id, r_emp.id) AS role_id
  FROM users u
  LEFT JOIN employees e ON u.id = e.user_id
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  LEFT JOIN roles r_emp ON e.role_id = r_emp.id
  WHERE u.id = $1
  ORDER BY u.id,
    CASE COALESCE(r.name, r_emp.name)
      WHEN 'Super Admin' THEN 0
      WHEN 'HR Admin' THEN 1
      WHEN 'Manager' THEN 2
      ELSE 3
    END,
    COALESCE(r.name, r_emp.name) NULLS LAST;
`;

const findRoleByName = `
  SELECT id FROM roles WHERE name = $1;
`;

const getMe = `
  SELECT 
    u.id, u.name, u.email, u.avatar_url,
    e.id as employee_id,
    e.employee_code, e.first_name, e.middle_name, e.last_name, e.full_name,
    e.phone, e.birth_date, e.gender, e.marital_status, e.status, e.hired_at, e.city, e.country, e.avatar_url as employee_avatar_url,
    e.department_id, e.position_id, e.supervisor_id, e.employment_type,
    d.name as department_name,
    pos.title as position_title,
    COALESCE(r.name, r_emp.name) as role_name,
    COALESCE(r.id, r_emp.id) as role_id,
    s.full_name as supervisor_name,
    ec.name as ec_name,
    ec.relationship as ec_relationship,
    ec.phone as ec_phone,
    ec.alternate_phone as ec_alternate_phone,
    ec.address as ec_address,
    ec.email as ec_email
  FROM users u
  LEFT JOIN employees e ON u.id = e.user_id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions pos ON e.position_id = pos.id
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  LEFT JOIN roles r_emp ON e.role_id = r_emp.id
  LEFT JOIN emergency_contacts ec ON e.id = ec.employee_id
  LEFT JOIN employees s ON e.supervisor_id = s.id
  WHERE u.id = $1
  ORDER BY CASE WHEN COALESCE(r.name, r_emp.name) = 'Super Admin' THEN 0 ELSE 1 END;
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
