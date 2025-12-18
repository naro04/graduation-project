const updateLocationActivityQuery = `
  UPDATE activities
  SET name = $1, location_id = $2, start_date = $3, end_date = $4, activity_days = $5, updated_at = CURRENT_TIMESTAMP
  WHERE id = $6
  RETURNING *;
`;

module.exports = updateLocationActivityQuery;

