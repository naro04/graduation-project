const getLocationsQuery = `
  SELECT 
    l.*
  FROM locations l
  WHERE ($1::TEXT IS NULL OR l.status = $1)
    AND ($2::TEXT IS NULL OR l.location_type = $2)
    AND ($3::TEXT IS NULL OR l.name ILIKE '%' || $3 || '%')
  ORDER BY l.created_at DESC;
`;

module.exports = getLocationsQuery;

