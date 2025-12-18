const getAttendanceByIdQuery = `
  SELECT 
    a.*,
    e.id as employee_id
  FROM attendance a
  JOIN employees e ON a.employee_id = e.id
  WHERE a.id = $1;
`;

module.exports = getAttendanceByIdQuery;

