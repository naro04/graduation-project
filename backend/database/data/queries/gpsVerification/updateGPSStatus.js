const updateGPSStatusQuery = `
  UPDATE attendance
  SET 
    distance_from_base = $1,
    gps_status = $2,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $3
  RETURNING *;
`;

module.exports = updateGPSStatusQuery;

