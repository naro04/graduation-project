const getEmployeesQuery = `
SELECT
  e.id,
  e.first_name,
  e.last_name,
  e.full_name,
  e.avatar_url,
  e.employee_code,
  d.name as department,
  p.title as position,
  r.name as role,
  e.status
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY e.created_at DESC;
`;

module.exports = { getEmployeesQuery };

