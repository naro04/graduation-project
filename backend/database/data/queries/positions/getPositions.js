const getPositionsQuery = `
  SELECT 
    p.*,
    d.name as department_name
  FROM positions p
  LEFT JOIN departments d ON p.department_id = d.id
  ORDER BY p.title ASC;
`;

module.exports = getPositionsQuery;
