const deleteLocationAssignmentQuery = `
  DELETE FROM employee_locations
  WHERE employee_id = $1 AND location_id = $2;
`;

module.exports = deleteLocationAssignmentQuery;

