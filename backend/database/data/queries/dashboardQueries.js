const dashboardQueries = {
    // 1. Total Employees
    getTotalEmployees: `
    SELECT COUNT(*) as total FROM employees;
  `,

    // 2. Attendance Metrics (Present today, Late today, On Leave today)
    // Note: Assuming 'Late' is after 9:00 AM. 'On Leave' checks approved leave requests for today.
    getAttendanceMetrics: `
    SELECT 
      (SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE DATE(check_in_time) = CURRENT_DATE) as present_count,
      (SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE DATE(check_in_time) = CURRENT_DATE AND check_in_time::time > '09:00:00') as late_count,
      (SELECT COUNT(*) FROM leave_requests WHERE status = 'approved' AND CURRENT_DATE BETWEEN start_date AND end_date) as on_leave_count;
  `,

    // 3. Leave Requests (Counts by status)
    getLeaveRequestMetrics: `
    SELECT 
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
    FROM leave_requests;
  `,

    // 4. Active Locations
    getActiveLocations: `
    SELECT COUNT(*) as active_count FROM locations;
  `,

    // 5. Organization-wide Attendance Chart (Last 7 days)
    getAttendanceChartData: `
    SELECT 
      TO_CHAR(day_series, 'Mon') as day_name,
      COUNT(DISTINCT a.employee_id) as present_count
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as day_series
    LEFT JOIN attendance a ON DATE(a.check_in_time) = day_series
    GROUP BY day_series
    ORDER BY day_series ASC;
  `,

    // 6. Activity Statistics Chart (Last 7 days, grouped by status)
    getActivityChartData: `
    SELECT 
      TO_CHAR(day_series, 'Mon') as day_name,
      SUM(CASE WHEN act.status = 'approved' THEN 1 ELSE 0 END) as implemented_count,
      SUM(CASE WHEN act.status = 'pending' THEN 1 ELSE 0 END) as planned_count
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as day_series
    LEFT JOIN activities act ON DATE(act.start_time) = day_series
    GROUP BY day_series
    ORDER BY day_series ASC;
  `,

    // 7. User Metrics (Active, Inactive, New)
    getUserMetrics: `
    SELECT 
      (SELECT COUNT(*) FROM employees WHERE status = 'active') as active_users,
      (SELECT COUNT(*) FROM employees WHERE status != 'active') as inactive_users,
      (SELECT COUNT(*) FROM employees WHERE hired_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d;
  `
};

module.exports = dashboardQueries;
