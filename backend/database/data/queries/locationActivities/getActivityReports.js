const getActivityReportsQuery = `
  SELECT DISTINCT
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
    COALESCE(a.actual_date, a.start_date) as actual_date,
    (
      COALESCE(a.attendees_count, 0) + 
      (SELECT COUNT(DISTINCT ae3.employee_id) FROM activity_employees ae3 WHERE ae3.activity_id = a.id) + 
      1
    ) as attendees,
    a.implementation_status as status,
    a.approval_status as approval,
    a.description
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN employees e ON a.employee_id = e.id
  LEFT JOIN activity_employees ae ON a.id = ae.activity_id
  WHERE ($1::DATE IS NULL OR a.end_date >= $1::DATE)
    AND ($2::DATE IS NULL OR a.start_date <= $2::DATE)
    AND ($3::TEXT IS NULL OR LOWER(TRIM(a.activity_type)) = LOWER(TRIM($3::TEXT)))
    AND ($4::TEXT IS NULL OR (
        CASE 
          WHEN $4 = 'Implemented' THEN (a.implementation_status = 'Implemented' OR a.approval_status = 'Approved')
          ELSE a.implementation_status = $4 
        END
    ))
    AND ($5::TEXT IS NULL OR (a.name ILIKE '%' || $5::TEXT || '%'))
    AND ($6::UUID IS NULL OR a.employee_id = $6::UUID
      OR a.employee_id IN (SELECT id FROM employees WHERE supervisor_id = $6::UUID)
      OR EXISTS (
          SELECT 1 FROM activity_employees ae2 
          JOIN employees e2 ON ae2.employee_id = e2.id 
          WHERE ae2.activity_id = a.id AND e2.supervisor_id = $6::UUID
      ))
  ORDER BY a.start_date DESC;
`;

const getCompletionTrendQuery = `
  SELECT 
    TO_CHAR(date_trunc('month', a.start_date), 'Mon') as month,
    COUNT(*) FILTER (WHERE a.implementation_status IN ('Planned', 'Implemented') OR a.approval_status = 'Approved') as planned,
    COUNT(*) FILTER (WHERE a.implementation_status = 'Implemented' OR a.approval_status = 'Approved') as implemented
  FROM activities a
  WHERE a.start_date >= date_trunc('year', CURRENT_DATE)
  GROUP BY date_trunc('month', a.start_date)
  ORDER BY date_trunc('month', a.start_date);
`;

const getParticipantsByTypeQuery = `
  SELECT 
    a.activity_type as type,
    SUM(
        COALESCE(a.attendees_count, 0) + 
        (SELECT COUNT(DISTINCT ae4.employee_id) FROM activity_employees ae4 WHERE ae4.activity_id = a.id) + 
        1
    ) as attendees
  FROM activities a
  WHERE (a.implementation_status = 'Implemented' OR a.approval_status = 'Approved')
  GROUP BY a.activity_type;
`;

module.exports = {
    getActivityReportsQuery,
    getCompletionTrendQuery,
    getParticipantsByTypeQuery
};
