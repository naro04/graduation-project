const deleteLocationQuery = `
  DELETE FROM locations
  WHERE id = $1
  RETURNING *;
`;

module.exports = deleteLocationQuery;

