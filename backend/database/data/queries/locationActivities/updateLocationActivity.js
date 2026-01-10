const updateLocationActivityQuery = `
  UPDATE activities
  SET name = $1, activity_type = $2, employee_id = $3, location_id = $4, start_date = $5, end_date = $6, activity_days = $7, description = $8, updated_at = CURRENT_TIMESTAMP
  WHERE id = $9
  RETURNING *;
`;

module.exports = updateLocationActivityQuery;

