const getEmergencyContactQuery = `
SELECT
  id,
  name,
  relationship,
  phone
  -- alternate_phone, address, email are not in the schema
FROM emergency_contacts
WHERE employee_id = $1;
`;

module.exports = { getEmergencyContactQuery };













