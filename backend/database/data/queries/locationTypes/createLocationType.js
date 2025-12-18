const createLocationTypeQuery = `
  INSERT INTO location_types (name, description, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

module.exports = createLocationTypeQuery;

