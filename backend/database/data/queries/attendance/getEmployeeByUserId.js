const getEmployeeByUserIdQuery = `
  SELECT e.*
  FROM employees e
  WHERE e.user_id = $1;
`;

module.exports = getEmployeeByUserIdQuery;

