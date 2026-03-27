const getEmployeeByIdQuery = `
  SELECT 
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.full_name,
    e.status,
    e.avatar_url,
    e.department_id,
    e.position_id,
    d.name as department_name,
    p.title as position_title,
    u.id as user_id,
    r.id as role_id,
    r.name as role_name
  FROM employees e
  LEFT JOIN users u ON e.user_id = u.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE e.id = $1;
`;

module.exports = { getEmployeeByIdQuery };

