const getLocationsQuery = `
  SELECT 
    l.*,
    lt.name as type_name
  FROM locations l
  LEFT JOIN location_types lt ON l.location_type = lt.id::text OR l.location_type = lt.name
  WHERE ($1::TEXT IS NULL OR l.status = $1)
    AND ($2::TEXT IS NULL OR l.location_type = $2)
    AND ($3::TEXT IS NULL OR l.name ILIKE '%' || $3 || '%')
  ORDER BY l.created_at DESC;
`;

module.exports = getLocationsQuery;

