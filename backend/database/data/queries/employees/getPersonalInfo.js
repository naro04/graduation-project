const pool = require("../../../connection");


const getPersonalInfoQuery = `
SELECT
  e.id,
  e.employee_code,
  e.status,
  e.first_name,
  e.middle_name,
  e.last_name,
  e.full_name,
  e.birth_date,
  e.gender,
  e.marital_status,
  e.email,
  e.phone,
  e.avatar_url,
  p.title as position,
  r.name as role
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE e.id = $1;
`;

module.exports = { getPersonalInfoQuery };
