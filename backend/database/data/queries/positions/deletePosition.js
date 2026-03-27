const deletePositionQuery = `
  DELETE FROM positions
  WHERE id = $1
  RETURNING *;
`;

module.exports = deletePositionQuery;
