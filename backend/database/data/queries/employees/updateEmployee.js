const updateEmployeeQuery = `
  UPDATE employees
  SET 
    first_name = $1,
    last_name = $2,
    full_name = $3,
    department_id = $4,
    position_id = $5,
    status = $6,
    avatar_url = $7,
    updated_at = NOW()
  WHERE id = $8
  RETURNING *;
`;

module.exports = { updateEmployeeQuery };
