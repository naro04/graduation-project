const getActivityByIdQuery = `
  SELECT 
    a.*,
    l.name as location_name
  FROM activities a
  LEFT JOIN locations l ON a.location_id = l.id
  WHERE a.id = $1;
`;

module.exports = getActivityByIdQuery;

