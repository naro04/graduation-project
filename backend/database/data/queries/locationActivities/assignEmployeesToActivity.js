const assignEmployeesToActivityQuery = `
  INSERT INTO activity_employees (activity_id, employee_id)
  VALUES ($1, $2)
  ON CONFLICT DO NOTHING;
`;

module.exports = assignEmployeesToActivityQuery;

