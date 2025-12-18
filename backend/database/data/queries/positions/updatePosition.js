const updatePositionQuery = `
  UPDATE positions
  SET department_id = $1, title = $2, description = $3, updated_at = CURRENT_TIMESTAMP
  WHERE id = $4
  RETURNING *;
`;

module.exports = updatePositionQuery;
