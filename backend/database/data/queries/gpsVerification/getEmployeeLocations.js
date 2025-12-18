const getEmployeeLocationsQuery = `
  SELECT 
    l.id,
    l.name,
    l.address,
    l.latitude,
    l.longitude,
    l.location_type
  FROM employee_locations el
  JOIN locations l ON el.location_id = l.id
  WHERE el.employee_id = $1;
`;

module.exports = getEmployeeLocationsQuery;

