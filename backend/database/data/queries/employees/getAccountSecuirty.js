const getAccountSecuirtyQuery = `
UPDATE users
SET password_hash = $2, updated_at = NOW()
WHERE id = (SELECT user_id FROM employees WHERE id = $1)
RETURNING id;
`;

module.exports = { getAccountSecuirtyQuery };