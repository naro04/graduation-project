const getJobInfoQuery = `
SELECT
  d.name as department,
  p.title as position,
  r.name as employee_type, -- Maps to Role (e.g. Super Admin)
  s.full_name as supervisor,
  e.employment_type
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN employees s ON e.supervisor_id = s.id
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE e.user_id = $1;
`;

module.exports = { getJobInfoQuery };






