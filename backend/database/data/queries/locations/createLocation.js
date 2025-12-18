const createLocationQuery = `
  INSERT INTO locations (name, address, latitude, longitude, location_type)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

module.exports = createLocationQuery;

