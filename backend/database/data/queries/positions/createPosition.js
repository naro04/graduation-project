const createPositionQuery = `
  INSERT INTO positions (department_id, title, description)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

module.exports = createPositionQuery;
