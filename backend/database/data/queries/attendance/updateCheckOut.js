const updateCheckOutQuery = `
  UPDATE attendance
  SET 
    check_out_time = CURRENT_TIMESTAMP,
    daily_status = CASE 
      WHEN daily_status = 'Present' THEN 'Present'
      WHEN daily_status = 'Late' THEN 'Late'
      ELSE daily_status
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $1
  RETURNING *;
`;

module.exports = updateCheckOutQuery;

