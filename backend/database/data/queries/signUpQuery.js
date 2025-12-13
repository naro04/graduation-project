const signUpQuery = `
WITH new_user AS (
  INSERT INTO users (email, password_hash, name)
  VALUES ($1, $2, $3)
  RETURNING id
)
INSERT INTO employees (
  user_id, 
  email, 
  first_name, 
  last_name, 
  full_name, 
  phone, 
  employee_code
)
SELECT 
  id, 
  $1, 
  $4, 
  $5, 
  $3, 
  $6, 
  $7
FROM new_user
RETURNING id;
`;

module.exports = { signUpQuery };
