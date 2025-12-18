const getTodayAttendanceQuery = `
  SELECT 
    a.*
  FROM attendance a
  JOIN employees e ON a.employee_id = e.id
  WHERE e.user_id = $1
    AND DATE(a.check_in_time) = CURRENT_DATE
    AND a.check_out_time IS NULL
  ORDER BY a.check_in_time DESC
  LIMIT 1;
`;

module.exports = getTodayAttendanceQuery;

