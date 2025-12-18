const createLocationAssignmentQuery = `
  INSERT INTO employee_locations (employee_id, location_id)
  VALUES ($1, $2)
  ON CONFLICT (employee_id, location_id) DO NOTHING
  RETURNING *;
`;

module.exports = createLocationAssignmentQuery;

