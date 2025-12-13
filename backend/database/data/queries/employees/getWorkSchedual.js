
const getWorkSchedualQuery = `
SELECT
  check_in_time,
  check_out_time,
  location_address as location,
  'Office' as shift_type -- Placeholder
FROM attendance
WHERE employee_id = $1
  AND check_in_time BETWEEN $2 AND $3 -- Date Range
ORDER BY check_in_time ASC;
`;

module.exports = { getWorkSchedualQuery };
