const getGPSStatsQuery = `
  SELECT 
    COUNT(*) as total_logs,
    COUNT(*) FILTER (WHERE gps_status = 'Verified') as verified_logs,
    COUNT(*) FILTER (WHERE gps_status = 'Suspicious') as suspicious_logs,
    COUNT(*) FILTER (WHERE gps_status = 'Rejected') as rejected_logs,
    COUNT(*) FILTER (WHERE gps_status = 'Not Verified') as not_verified_logs
  FROM attendance
  WHERE ($1::DATE IS NULL OR DATE(check_in_time) = $1);
`;

module.exports = getGPSStatsQuery;

