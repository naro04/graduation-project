const getEmployeeDistributionQuery = `
  SELECT 
    d.id,
    d.name as department,
    COUNT(e.id) as count
  FROM departments d
  LEFT JOIN employees e ON d.id = e.department_id
  GROUP BY d.id, d.name;
`;

const getAttendanceLeaveCorrelationQuery = `
  SELECT 
    d.name as department,
    (
      SELECT COALESCE(ROUND(AVG(CASE WHEN a.daily_status = 'Present' THEN 100 ELSE 0 END), 1), 0)
      FROM employees e2
      LEFT JOIN attendance a ON e2.id = a.employee_id
      WHERE e2.department_id = d.id
    ) as attendance_rate,
    (
      SELECT COALESCE(SUM(lr.end_date - lr.start_date + 1), 0)
      FROM employees e3
      LEFT JOIN leave_requests lr ON e3.id = lr.employee_id AND lr.status = 'approved'
      WHERE e3.department_id = d.id
    ) as leave_days
  FROM departments d;
`;

const getDetailedHRReportQuery = `
  SELECT 
    e.id,
    e.full_name as name,
    d.name as department,
    p.title as position,
    e.status,
    e.avatar_url,
    (
      SELECT COALESCE(ROUND(AVG(CASE WHEN a.daily_status = 'Present' THEN 100 ELSE 0 END), 1), 0)
      FROM attendance a 
      WHERE a.employee_id = e.id
    ) as attendance_rate,
    (
      SELECT COALESCE(SUM(lr.end_date - lr.start_date + 1), 0)
      FROM leave_requests lr 
      WHERE lr.employee_id = e.id AND lr.status = 'approved'
    ) as leave_days
  FROM employees e
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  WHERE ($1::UUID IS NULL OR e.department_id = $1::UUID)
    AND ($2::TEXT IS NULL OR e.status = $2::TEXT)
    AND ($3::TEXT IS NULL OR e.full_name ILIKE '%' || $3::TEXT || '%')
  ORDER BY e.created_at DESC;
`;

module.exports = {
  getEmployeeDistributionQuery,
  getAttendanceLeaveCorrelationQuery,
  getDetailedHRReportQuery
};
