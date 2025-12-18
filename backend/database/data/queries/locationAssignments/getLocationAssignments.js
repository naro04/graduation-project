const getLocationAssignmentsQuery = `
  SELECT 
    el.employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    e.employee_code,
    el.location_id,
    l.name as location_name,
    l.location_type
  FROM employee_locations el
  JOIN employees e ON el.employee_id = e.id
  JOIN locations l ON el.location_id = l.id
  WHERE ($1::UUID IS NULL OR el.employee_id = $1);
`;

module.exports = getLocationAssignmentsQuery;

