const deleteEmployeeQuery = `
  DELETE FROM employees
  WHERE id = $1
  RETURNING id;
`;

module.exports = { deleteEmployeeQuery };
