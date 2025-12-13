const loginQuery = `
SELECT 
  u.id, 
  u.email, 
  u.password_hash, 
  u.name, 
  u.avatar_url, 
  e.employee_code
FROM users u 
LEFT JOIN employees e ON u.id = e.user_id 
WHERE u.email = $1 OR e.employee_code = $1;
`;

module.exports = { loginQuery };
