const getTeamMembersQuery = `
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
    r.name as role_name
  FROM employees e
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  LEFT JOIN roles r ON e.role_id = r.id
  WHERE e.supervisor_id = $1
  ORDER BY e.created_at DESC;
`;

module.exports = { getTeamMembersQuery };


