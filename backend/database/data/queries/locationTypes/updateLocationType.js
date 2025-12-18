const updateLocationTypeQuery = `
  UPDATE location_types
  SET name = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP
  WHERE id = $4
  RETURNING *;
`;

module.exports = updateLocationTypeQuery;

