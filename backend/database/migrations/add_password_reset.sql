-- Add password reset columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;

-- Create an index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token);




