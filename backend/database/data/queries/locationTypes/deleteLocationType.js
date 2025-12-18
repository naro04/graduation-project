const deleteLocationTypeQuery = `
  DELETE FROM location_types
  WHERE id = $1
  RETURNING *;
`;

module.exports = deleteLocationTypeQuery;

