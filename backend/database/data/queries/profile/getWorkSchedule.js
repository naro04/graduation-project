
const getWorkScheduleQuery = `
SELECT
  check_in_time,
  check_out_time,
  location_address as location,
  'Office' as shift_type -- Placeholder
FROM attendance a
JOIN employees e ON a.employee_id = e.id
WHERE e.user_id = $1
  AND check_in_time BETWEEN $2 AND $3 -- Date Range
ORDER BY check_in_time ASC;
`;

module.exports = { getWorkScheduleQuery };
