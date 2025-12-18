const getActivityEmployeesQuery = `
  SELECT 
    e.id as employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    e.employee_code,
    e.avatar_url,
    d.name as department,
    p.title as position
  FROM activity_employees ae
  JOIN employees e ON ae.employee_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  WHERE ae.activity_id = $1
  ORDER BY e.full_name ASC;
`;

module.exports = getActivityEmployeesQuery;

