const getLocationActivitiesQuery = `
  SELECT 
    a.id,
    a.name,
    a.location_id,
    l.name as location_name,
    COUNT(DISTINCT ae.employee_id) as employee_count,
    a.start_date,
    a.end_date,
    a.status,
    a.created_at
  FROM activities a
  JOIN locations l ON a.location_id = l.id
  LEFT JOIN activity_employees ae ON a.id = ae.activity_id
  WHERE a.location_id = $1
  GROUP BY a.id, a.name, a.location_id, l.name, a.start_date, a.end_date, a.status, a.created_at
  ORDER BY a.created_at DESC;
`;

module.exports = getLocationActivitiesQuery;

