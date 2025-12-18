// Note: This assumes activities table has location_id, start_date, end_date fields
// If schema differs, it may need to be updated
const createLocationActivityQuery = `
  INSERT INTO activities (name, location_id, start_date, end_date, activity_days, status)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`;

module.exports = createLocationActivityQuery;

