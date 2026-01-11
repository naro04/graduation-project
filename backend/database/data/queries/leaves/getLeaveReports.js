const getLeaveDistributionQuery = `
  SELECT 
    leave_type as type,
    COUNT(*) as count
  FROM leave_requests
  WHERE status = 'approved'
  GROUP BY leave_type;
`;

const getLeaveTrendQuery = `
  SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
    COUNT(*) as count
  FROM leave_requests
  WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
  GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon')
  ORDER BY DATE_TRUNC('month', created_at);
`;

const getDetailedLeaveReportQuery = `
  SELECT 
    lr.id,
    e.full_name as employee_name,
    e.avatar_url as employee_avatar,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    (lr.end_date - lr.start_date + 1) as total_days,
    lr.created_at as submitted_date,
    lr.status
  FROM leave_requests lr
  JOIN employees e ON lr.employee_id = e.id
  WHERE ($1::DATE IS NULL OR lr.start_date >= $1::DATE)
    AND ($2::DATE IS NULL OR lr.end_date <= $2::DATE)
    AND ($3::TEXT IS NULL OR lr.leave_type = $3::TEXT)
    AND ($4::TEXT IS NULL OR lr.status = $4::TEXT)
    AND ($5::TEXT IS NULL OR e.full_name ILIKE '%' || $5::TEXT || '%')
  ORDER BY lr.created_at DESC;
`;

module.exports = {
    getLeaveDistributionQuery,
    getLeaveTrendQuery,
    getDetailedLeaveReportQuery
};
