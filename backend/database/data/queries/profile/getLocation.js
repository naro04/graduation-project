const getLocationQuery = `
SELECT
  l.id,
  l.name,
  l.address,
  l.location_type,
  l.location_code,
  l.status,
  l.operating_days,
  l.contact_person_name,
  l.contact_person_phone,
  l.opening_time,
  l.closing_time,
  l.latitude,
  l.longitude,
  el.is_primary
FROM locations l
JOIN employee_locations el ON l.id = el.location_id
JOIN employees e ON el.employee_id = e.id
WHERE e.user_id = $1
ORDER BY el.is_primary DESC;
`;

module.exports = { getLocationQuery };
