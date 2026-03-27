const getTeamMembersQuery = `
  SELECT 
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.full_name,
    e.status,
    e.avatar_url,
    e.department_id,
    e.position_id,
    d.name as department_name,
    p.title as position_title,
    r.name as role_name,
    EXISTS (
        SELECT 1 FROM leave_requests lr 
        WHERE lr.employee_id = e.id 
        AND lr.status = 'approved' 
        AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
    ) as on_leave_today
  FROM employees e
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  LEFT JOIN roles r ON e.role_id = r.id
  WHERE e.supervisor_id = $1
    AND e.id <> $1
    AND ($2::UUID IS NULL OR e.department_id = $2)
    AND ($3::UUID IS NULL OR e.role_id = $3)
    AND ($4::TEXT IS NULL OR e.status = $4)
    AND ($5::TEXT IS NULL OR (
        e.full_name ILIKE '%' || $5 || '%' OR 
        e.employee_code ILIKE '%' || $5 || '%'
    ))
  ORDER BY e.created_at DESC;
`;

module.exports = { getTeamMembersQuery };







