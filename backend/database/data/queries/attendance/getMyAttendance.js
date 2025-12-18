const getMyAttendanceQuery = `
  SELECT 
    a.id,
    DATE(a.check_in_time) as date,
    a.check_in_time,
    a.check_out_time,
    CASE 
      WHEN a.check_out_time IS NOT NULL THEN
        EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time)) / 3600
      ELSE NULL
    END as work_hours,
    a.location_address as location,
    a.work_type as type,
    a.daily_status as status,
    a.gps_status,
    a.location_latitude,
    a.location_longitude,
    a.distance_from_base
  FROM attendance a
  JOIN employees e ON a.employee_id = e.id
  WHERE e.user_id = $1
    AND ($2::TEXT IS NULL OR a.daily_status = $2)
  ORDER BY a.check_in_time DESC
  LIMIT $3 OFFSET $4;
`;

module.exports = getMyAttendanceQuery;

