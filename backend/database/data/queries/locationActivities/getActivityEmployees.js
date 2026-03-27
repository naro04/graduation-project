const getActivityEmployeesQuery = `
  SELECT 
    e.id,
    e.id as employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.first_name || ' ' || e.last_name as full_name,
    e.first_name || ' ' || e.last_name as employee_name,
    e.avatar_url,
    d.name as department,
    d.name as department_name,
    p.title as position,
    p.title as position_title
  FROM activity_employees ae
  JOIN employees e ON ae.employee_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  WHERE ae.activity_id = $1
  ORDER BY e.first_name, e.last_name ASC;
`;

module.exports = getActivityEmployeesQuery;

