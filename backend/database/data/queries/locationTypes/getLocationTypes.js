const getLocationTypesQuery = `
  SELECT *
  FROM location_types
  ORDER BY created_at DESC;
`;

module.exports = getLocationTypesQuery;

