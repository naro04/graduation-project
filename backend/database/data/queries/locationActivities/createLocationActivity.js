// Note: This assumes activities table has location_id, start_date, end_date fields
// If schema differs, it may need to be updated
const createLocationActivityQuery = `
  INSERT INTO activities (name, activity_type, employee_id, location_id, start_date, end_date, activity_days, status, description)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;

module.exports = createLocationActivityQuery;

