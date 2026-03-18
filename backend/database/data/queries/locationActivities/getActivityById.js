const getActivityByIdQuery = `
  SELECT 
    a.*,
    l.name as location_name,
    l.latitude as location_latitude,
    l.longitude as location_longitude,
    a.activity_days as duration_hours_count,
    (CASE 
        WHEN a.end_date IS NOT NULL THEN 'Implemented'
        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
        ELSE 'Planned'
    END) as implementation_status,
    (CASE 
        WHEN a.end_date IS NOT NULL THEN 'Implemented'
        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
        ELSE 'Planned'
    END) as computed_status,
    CASE
      WHEN a.employee_id IS NOT NULL THEN e.first_name || ' ' || e.last_name
      ELSE NULL
    END as responsible_employee_name,
    ARRAY_AGG(DISTINCT emp.first_name || ' ' || emp.last_name) FILTER (WHERE emp.id IS NOT NULL) as team_members
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN employees e ON a.employee_id = e.id
  LEFT JOIN activity_employees ae ON a.id = ae.activity_id
  LEFT JOIN employees emp ON ae.employee_id = emp.id
  WHERE a.id = $1
  GROUP BY a.id, l.id, e.id;
`;

module.exports = getActivityByIdQuery;

