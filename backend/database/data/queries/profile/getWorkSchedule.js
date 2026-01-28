const getWorkScheduleQuery = `
SELECT
  ws.day_of_week,
  ws.start_time,
  ws.end_time,
  ws.shift_type,
  l.name as location_name,
  l.address as location_address
FROM work_schedules ws
JOIN employees e ON ws.employee_id = e.id
LEFT JOIN locations l ON ws.location_id = l.id
WHERE e.user_id = $1
ORDER BY ws.day_of_week ASC;
`;

module.exports = { getWorkScheduleQuery };
