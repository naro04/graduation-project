const getLocationsWithStatsQuery = `
  SELECT 
    l.id,
    l.name,
    l.location_type,
    l.status,
    COUNT(DISTINCT el.employee_id) as employee_count
  FROM locations l
  LEFT JOIN employee_locations el ON l.id = el.location_id
  WHERE ($1::TEXT IS NULL OR l.status = $1)
    AND ($2::TEXT IS NULL OR l.location_type = $2)
    AND ($3::TEXT IS NULL OR l.name ILIKE '%' || $3 || '%')
  GROUP BY l.id, l.name, l.location_type, l.status
  ORDER BY l.created_at DESC;
`;

module.exports = getLocationsWithStatsQuery;

