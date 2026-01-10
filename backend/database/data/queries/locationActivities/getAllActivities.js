const getAllActivitiesQuery = `
  SELECT 
    a.id,
    a.name,
    a.activity_type as type,
    a.project_id,
    p.name as project,
    a.employee_id,
    CASE 
      WHEN a.employee_id IS NOT NULL THEN e.first_name || ' ' || e.last_name
      ELSE NULL
    END as responsible_employee,
    a.location_id,
    l.name as location,
    a.location_address,
    COALESCE(a.location_latitude, l.latitude) as latitude,
    COALESCE(a.location_longitude, l.longitude) as longitude,
    a.start_date as date,
    a.end_date,
    a.activity_days as duration,
    a.status,
    a.implementation_status,
    a.approval_status as approval,
    a.description,
    COUNT(DISTINCT ae.employee_id) as employee_count,
    ARRAY_AGG(DISTINCT emp.first_name || ' ' || emp.last_name) FILTER (WHERE emp.id IS NOT NULL) as team,
    a.created_at,
    a.updated_at
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN projects p ON a.project_id = p.id
  LEFT JOIN employees e ON a.employee_id = e.id
  LEFT JOIN activity_employees ae ON a.id = ae.activity_id
  LEFT JOIN employees emp ON ae.employee_id = emp.id
  WHERE a.location_id IS NOT NULL
    AND ($1::DATE IS NULL OR a.start_date <= $1::DATE AND a.end_date >= $1::DATE)
  GROUP BY a.id, a.name, a.activity_type, a.project_id, p.name, a.employee_id, 
           e.first_name, e.last_name, a.location_id, l.name, a.location_address,
           a.location_latitude, a.location_longitude, l.latitude, l.longitude, a.start_date, a.end_date, 
           a.activity_days, a.status, a.implementation_status, a.approval_status, 
           a.description, a.created_at, a.updated_at
  ORDER BY a.start_date DESC, a.created_at DESC;
`;

module.exports = getAllActivitiesQuery;
