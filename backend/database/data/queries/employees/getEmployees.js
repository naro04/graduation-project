const getEmployeesQuery = `
  SELECT DISTINCT ON (e.id)
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
    r.id as role_id,
    r.name as role_name
  FROM employees e
  LEFT JOIN users u ON e.user_id = u.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE ($1::UUID IS NULL OR e.department_id = $1::UUID)
    AND ($2::UUID IS NULL OR ur.role_id = $2::UUID)
    AND ($3::TEXT IS NULL OR e.status = $3)
    AND ($4::TEXT IS NULL OR (e.full_name ILIKE '%' || $4 || '%' OR e.employee_code ILIKE '%' || $4 || '%'))
  ORDER BY e.id, e.created_at DESC;
`;

module.exports = { getEmployeesQuery };
