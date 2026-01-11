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
    a.actual_date,
    a.attendees_count as attendees,
    a.implementation_status as status,
    a.approval_status as approval,
    a.description
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN employees e ON a.employee_id = e.id
  WHERE ($1::DATE IS NULL OR a.start_date >= $1::DATE)
    AND ($2::DATE IS NULL OR a.start_date <= $2::DATE)
    AND ($3::TEXT IS NULL OR a.activity_type = $3::TEXT)
    AND ($4::TEXT IS NULL OR a.implementation_status = $4::TEXT)
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
    SUM(attendees_count) as attendees
  FROM activities
  WHERE implementation_status = 'Implemented'
  GROUP BY activity_type;
`;

module.exports = {
    getActivityReportsQuery,
    getCompletionTrendQuery,
    getParticipantsByTypeQuery
};
