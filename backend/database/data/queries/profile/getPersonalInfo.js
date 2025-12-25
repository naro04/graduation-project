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
WHERE e.user_id = $1;
`;

module.exports = { getPersonalInfoQuery };

const updatePersonalInfoQuery = `
UPDATE employees
SET 
    first_name = COALESCE($2, first_name),
    middle_name = COALESCE($3, middle_name),
    last_name = COALESCE($4, last_name),
    birth_date = COALESCE($5, birth_date),
    gender = COALESCE($6, gender),
    marital_status = COALESCE($7, marital_status),
    phone = COALESCE($8, phone),
    updated_at = NOW()
WHERE id = $1
RETURNING *;
`;

module.exports = { getPersonalInfoQuery, updatePersonalInfoQuery };
