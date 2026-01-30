const getActivityByIdQuery = `
  SELECT 
    a.*,
    l.name as location_name,
    p.name as project_name,
    CASE 
      WHEN a.employee_id IS NOT NULL THEN e.first_name || ' ' || e.last_name
      ELSE NULL
    END as responsible_employee_name,
    ARRAY_AGG(DISTINCT emp.first_name || ' ' || emp.last_name) FILTER (WHERE emp.id IS NOT NULL) as team_members
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  LEFT JOIN projects p ON a.project_id = p.id
  LEFT JOIN employees e ON a.employee_id = e.id
  LEFT JOIN activity_employees ae ON a.id = ae.activity_id
  LEFT JOIN employees emp ON ae.employee_id = emp.id
  WHERE a.id = $1
  GROUP BY a.id, l.name, p.name, e.first_name, e.last_name, a.images;
`;

module.exports = getActivityByIdQuery;

