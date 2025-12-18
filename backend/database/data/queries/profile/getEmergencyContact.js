const getEmergencyContactQuery = `
SELECT
  id,
  name,
  relationship,
  phone
  -- alternate_phone, address, email are not in the schema
FROM emergency_contacts ec
JOIN employees e ON ec.employee_id = e.id
WHERE e.user_id = $1;
`;

module.exports = { getEmergencyContactQuery };













