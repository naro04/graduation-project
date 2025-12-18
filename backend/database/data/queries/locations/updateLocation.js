const updateLocationQuery = `
  UPDATE locations
  SET name = $1, address = $2, latitude = $3, longitude = $4, location_type = $5, updated_at = CURRENT_TIMESTAMP
  WHERE id = $6
  RETURNING *;
`;

module.exports = updateLocationQuery;

