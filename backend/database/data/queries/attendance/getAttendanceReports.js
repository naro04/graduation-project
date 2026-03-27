const getAttendanceReportsQuery = `
  SELECT 
    a.id,
    a.employee_id,
    e.full_name as employee_name,
    e.employee_code,
    e.avatar_url,
    a.check_in_time,
    a.check_out_time,
    a.work_type as attendance_type,
    a.location_address as location,
    a.daily_status as status,
    a.gps_status,
    DATE(a.check_in_time) as date
  FROM attendance a
  JOIN employees e ON a.employee_id = e.id
  WHERE ($1::DATE IS NULL OR DATE(a.check_in_time) >= $1::DATE)
    AND ($2::DATE IS NULL OR DATE(a.check_in_time) <= $2::DATE)
    AND ($3::TEXT IS NULL OR TRIM($3::TEXT) = '' OR a.location_address ILIKE '%' || TRIM($3::TEXT) || '%')
    AND ($4::TEXT IS NULL OR a.daily_status = $4::TEXT)
    AND ($5::TEXT IS NULL OR (e.full_name ILIKE '%' || $5::TEXT || '%') OR (e.employee_code ILIKE '%' || $5::TEXT || '%'))
  ORDER BY a.check_in_time DESC;
`;

module.exports = getAttendanceReportsQuery;
