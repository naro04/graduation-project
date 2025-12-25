const getEmergencyContactQuery = `
SELECT
  ec.id,
  ec.name,
  ec.relationship,
  ec.phone,
  ec.alternate_phone,
  ec.address,
  ec.email
FROM emergency_contacts ec
JOIN employees e ON ec.employee_id = e.id
WHERE e.user_id = $1;
`;

const upsertEmergencyContactQuery = `
INSERT INTO emergency_contacts (employee_id, name, relationship, phone, alternate_phone, address, email, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
ON CONFLICT (employee_id) 
DO UPDATE SET 
    name = EXCLUDED.name,
    relationship = EXCLUDED.relationship,
    phone = EXCLUDED.phone,
    alternate_phone = EXCLUDED.alternate_phone,
    address = EXCLUDED.address,
    email = EXCLUDED.email,
    updated_at = NOW()
RETURNING *;
`;

module.exports = { getEmergencyContactQuery, upsertEmergencyContactQuery };













