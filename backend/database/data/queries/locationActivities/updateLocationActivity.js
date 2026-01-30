const updateLocationActivityQuery = `
  UPDATE activities
  SET name = $1, activity_type = $2, employee_id = $3, location_id = $4, start_date = $5, end_date = $6, activity_days = $7, description = $8, project_id = $9, images = $10, updated_at = CURRENT_TIMESTAMP
  WHERE id = $11
  RETURNING *;
`;

module.exports = updateLocationActivityQuery;

