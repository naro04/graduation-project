const updateLocationQuery = `
  UPDATE locations
  SET name = $1, address = $2, latitude = $3, longitude = $4, location_type = $5, status = $6, updated_at = CURRENT_TIMESTAMP
  WHERE id = $7
  RETURNING *;
`;

module.exports = updateLocationQuery;

