const getLocationAssignmentsQuery = `
  SELECT 
    el.employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    e.employee_code,
    el.location_id,
    l.name as location_name,
    lt.name as type_name
  FROM employee_locations el
  JOIN employees e ON el.employee_id = e.id
  JOIN locations l ON el.location_id = l.id
  LEFT JOIN location_types lt ON l.location_type = lt.id::text OR l.location_type = lt.name
  WHERE ($1::UUID IS NULL OR el.employee_id = $1);
`;

module.exports = getLocationAssignmentsQuery;

