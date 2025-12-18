const createCheckInQuery = `
  INSERT INTO attendance (
    employee_id,
    check_in_time,
    location_latitude,
    location_longitude,
    location_address,
    work_type,
    daily_status,
    gps_status
  )
  VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7)
  RETURNING *;
`;

module.exports = createCheckInQuery;

