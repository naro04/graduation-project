const getLocationQuery = `
SELECT
  l.id,
  l.name,
  l.address,
  l.location_type,
  l.latitude,
  l.longitude
FROM locations l
JOIN employee_locations el ON l.id = el.location_id
WHERE el.employee_id = $1;
`;

module.exports = { getLocationQuery };
