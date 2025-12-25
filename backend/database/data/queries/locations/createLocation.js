const createLocationQuery = `
  INSERT INTO locations (name, address, latitude, longitude, location_type, status)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`;

module.exports = createLocationQuery;

