const removeEmployeesFromActivityQuery = `
  DELETE FROM activity_employees
  WHERE activity_id = $1;
`;

module.exports = removeEmployeesFromActivityQuery;

