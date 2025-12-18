const getGPSVerificationsQuery = `
  SELECT 
    a.id,
    a.check_in_time,
    a.check_out_time,
    a.location_latitude,
    a.location_longitude,
    a.location_address,
    a.distance_from_base,
    a.gps_status,
    a.daily_status,
    a.work_type,
    e.id as employee_id,
    e.employee_code,
    e.first_name || ' ' || e.last_name as employee_name,
    e.avatar_url,
    d.name as department,
    p.title as position
  FROM attendance a
  JOIN employees e ON a.employee_id = e.id
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  WHERE ($1::DATE IS NULL OR DATE(a.check_in_time) = $1)
    AND ($2::TEXT IS NULL OR a.gps_status = $2)
    AND ($3::TEXT IS NULL OR (e.full_name ILIKE '%' || $3 || '%' OR e.employee_code ILIKE '%' || $3 || '%'))
  ORDER BY a.check_in_time DESC
  LIMIT $4 OFFSET $5;
`;

module.exports = getGPSVerificationsQuery;

