const getActivityReportsQuery = `
  SELECT 
    a.id,
    a.name,
    a.activity_type as type,
    a.employee_id,
    CASE 
      WHEN a.employee_id IS NOT NULL THEN e.first_name || ' ' || e.last_name
      ELSE NULL
    END as responsible_employee,
    a.location_id,
    l.name as location,
    a.start_date,
    a.end_date,
    (CASE 
        WHEN a.end_date IS NOT NULL THEN 'Implemented'
        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
        ELSE 'Planned'
    END) as status,
    a.approval_status as approval,
    a.description
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN employees e ON a.employee_id = e.id
  WHERE ($1::DATE IS NULL OR DATE(a.start_time) >= $1::DATE)
    AND ($2::DATE IS NULL OR DATE(a.start_time) <= $2::DATE)
    AND ($3::TEXT IS NULL OR a.activity_type = $3::TEXT)
    AND ($4::TEXT IS NULL OR (CASE 
        WHEN a.end_date IS NOT NULL THEN 'Implemented'
        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
        ELSE 'Planned'
    END) = $4::TEXT)
    AND ($5::TEXT IS NULL OR (a.name ILIKE '%' || $5::TEXT || '%'))
  ORDER BY a.start_date DESC;
`;

const getCompletionTrendQuery = `
  SELECT 
    TO_CHAR(date_trunc('month', start_date), 'Mon') as month,
    COUNT(*) FILTER (WHERE implementation_status IN ('Planned', 'Implemented')) as planned,
    COUNT(*) FILTER (WHERE implementation_status = 'Implemented') as implemented
  FROM activities
  WHERE start_date >= date_trunc('year', CURRENT_DATE)
  GROUP BY date_trunc('month', start_date)
  ORDER BY date_trunc('month', start_date);
`;

const getParticipantsByTypeQuery = `
  SELECT 
    activity_type as type,
    SUM(
      COALESCE((
          SELECT CAST(COUNT(DISTINCT att.employee_id) AS INTEGER)
          FROM attendance att
          WHERE att.employee_id IN (SELECT ae2.employee_id FROM activity_employees ae2 WHERE ae2.activity_id = activities.id)
            AND att.check_in_time::DATE >= activities.start_date 
            AND att.check_in_time::DATE <= activities.end_date 
            AND att.gps_status = 'Verified'
      ), 0)
    ) as attendees
  FROM activities
  WHERE implementation_status = 'Implemented'
  GROUP BY activity_type;
`;

module.exports = {
    getActivityReportsQuery,
    getCompletionTrendQuery,
    getParticipantsByTypeQuery
};
