/**
 * When an employee is removed from a location, also remove them from all
 * activities at that location so View Employees / Edit Activity stay in sync.
 */
const removeEmployeeFromActivitiesAtLocationQuery = `
  DELETE FROM activity_employees
  WHERE employee_id = $1
    AND activity_id IN (SELECT id FROM activities WHERE location_id = $2);
`;

module.exports = removeEmployeeFromActivitiesAtLocationQuery;
