const createEmployeeQuery = `
  INSERT INTO employees (
    user_id, employee_code, first_name, last_name, full_name, 
    department_id, position_id, status, hired_at, avatar_url
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
  RETURNING *;
`;

module.exports = { createEmployeeQuery };
