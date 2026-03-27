const getLocationEmployeesQuery = `
  SELECT 
    e.id as employee_id,
    e.employee_code,
    e.first_name || ' ' || e.last_name as employee_name,
    e.avatar_url,
    d.name as department,
    p.title as position
  FROM employee_locations el
  JOIN employees e ON el.employee_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  WHERE el.location_id = $1
  ORDER BY e.full_name ASC;
`;

module.exports = getLocationEmployeesQuery;

