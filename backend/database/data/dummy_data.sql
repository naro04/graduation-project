-- ============================================
-- DUMMY DATA GENERATION
-- ============================================

-- Reference constants (we rely on subqueries or hardcoded UUIDs if needed, but subqueries are safer)

-- 1. SEED ROLES
INSERT INTO roles (name, description) VALUES
('Admin', 'Administrator with full access'),
('HR Manager', 'Human Resources Manager'),
('Department Manager', 'Manager of a specific department'),
('Employee', 'Standard employee role')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED DEPARTMENTS
INSERT INTO departments (name, description, status) VALUES
('Engineering', 'Software Development and IT Operations', 'active'),
('Human Resources', 'Recruitment and Employee Relations', 'active'),
('Sales', 'Sales and Business Development', 'active'),
('Marketing', 'Brand and Communications', 'active')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED POSITIONS
-- We use subqueries to get department_ids
INSERT INTO positions (title, department_id, description) VALUES
('Senior Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering'), 'Lead technical role'),
('Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering'), 'Standard dev role'),
('HR Specialist', (SELECT id FROM departments WHERE name = 'Human Resources'), 'HR operations'),
('Sales Representative', (SELECT id FROM departments WHERE name = 'Sales'), 'Sales role'),
('Marketing Manager', (SELECT id FROM departments WHERE name = 'Marketing'), 'Marketing lead')
ON CONFLICT DO NOTHING;

-- 4. SEED USERS (Password hash is 'password123' - bcrypt hash for example)
-- Note: In a real app, generate these hashes properly. This is just a placeholder hash.
-- $2b$10$EpWaTcHZH0tF/vQ.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j.j (Not a real hash, just illustrating)
-- Let's assume a dummy hash for 'password123': $2a$12$L7i35u.q2.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u
INSERT INTO users (email, password_hash, name, avatar_url) VALUES
('admin@company.com', '$2a$12$RJZPzD/u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u', 'System Admin', 'https://i.pravatar.cc/150?u=admin'),
('hr@company.com', '$2a$12$RJZPzD/u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u', 'Sarah HR', 'https://i.pravatar.cc/150?u=sarah'),
('eng_manager@company.com', '$2a$12$RJZPzD/u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u', 'Mike Engineering', 'https://i.pravatar.cc/150?u=mike'),
('dev@company.com', '$2a$12$RJZPzD/u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u.u', 'John Dev', 'https://i.pravatar.cc/150?u=john')
ON CONFLICT (email) DO NOTHING;

-- 5. LINK USERS TO ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), (SELECT id FROM roles WHERE name = 'Admin')),
((SELECT id FROM users WHERE email = 'hr@company.com'), (SELECT id FROM roles WHERE name = 'HR Manager')),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), (SELECT id FROM roles WHERE name = 'Department Manager')),
((SELECT id FROM users WHERE email = 'dev@company.com'), (SELECT id FROM roles WHERE name = 'Employee'))
ON CONFLICT DO NOTHING;

-- 6. SEED EMPLOYEES
INSERT INTO employees (
  user_id, 
  employee_code, 
  first_name, 
  last_name, 
  full_name, 
  email, 
  department_id, 
  position_id, 
  employment_type, 
  status, 
  hired_at
) VALUES
-- Admin Employee Profile
((SELECT id FROM users WHERE email = 'admin@company.com'), 'EMP001', 'System', 'Admin', 'System Admin', 'admin@company.com', 
 NULL, NULL, 'Full-Time', 'active', NOW() - INTERVAL '3 years'),

-- HR Manager Profile
((SELECT id FROM users WHERE email = 'hr@company.com'), 'EMP002', 'Sarah', 'Connor', 'Sarah HR', 'hr@company.com', 
 (SELECT id FROM departments WHERE name = 'Human Resources'), 
 (SELECT id FROM positions WHERE title = 'HR Specialist'), 
 'Full-Time', 'active', NOW() - INTERVAL '2 years'),

-- Engineering Manager Profile
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), 'EMP003', 'Mike', 'Ross', 'Mike Engineering', 'eng_manager@company.com', 
 (SELECT id FROM departments WHERE name = 'Engineering'), 
 (SELECT id FROM positions WHERE title = 'Senior Software Engineer'), 
 'Full-Time', 'active', NOW() - INTERVAL '1 year'),

-- Developer Profile
((SELECT id FROM users WHERE email = 'dev@company.com'), 'EMP004', 'John', 'Doe', 'John Dev', 'dev@company.com', 
 (SELECT id FROM departments WHERE name = 'Engineering'), 
 (SELECT id FROM positions WHERE title = 'Software Engineer'), 
 'Full-Time', 'active', NOW() - INTERVAL '6 months')
ON CONFLICT (employee_code) DO NOTHING;

-- Set Supervisor: John Dev reports to Mike Engineering
UPDATE employees 
SET supervisor_id = (SELECT id FROM employees WHERE employee_code = 'EMP003')
WHERE employee_code = 'EMP004';


-- 7. SEED LOCATIONS
INSERT INTO locations (name, address, latitude, longitude, location_type) VALUES
('Main HQ', '123 Tech Blvd, Silicon Valley, CA', 37.7749, -122.4194, 'Office'),
('Remote Hub NY', '456 Innovation Dr, New York, NY', 40.7128, -74.0060, 'Remote Hub')
ON CONFLICT DO NOTHING; -- Assuming name constraint, but schema doesn't show unique on name. If duplicates allowed, this might duplicate. Adding distinct check if needed or just insert.
-- Schema doesn't have unique constraint on name for locations. To prevent dupes in this script we can use EXISTS or just assume clean DB.
-- Improved Insert:
INSERT INTO locations (name, address, latitude, longitude, location_type)
SELECT 'Downtown Office', '789 Business Rd', 34.0522, -118.2437, 'Office'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Downtown Office');


-- 8. SEED ATTENDANCE (Recent activity for John Dev)
INSERT INTO attendance (employee_id, check_in_time, check_out_time, status, location_address) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP004'), NOW() - INTERVAL '1 day' + INTERVAL '9 hours', NOW() - INTERVAL '1 day' + INTERVAL '17 hours', 'approved', 'Main HQ'),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), NOW() - INTERVAL '2 days' + INTERVAL '9 hours', NOW() - INTERVAL '2 days' + INTERVAL '17 hours', 'approved', 'Main HQ'),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), NOW() + INTERVAL '9 hours', NULL, 'pending', 'Main HQ');


-- 9. SEED LEAVE REQUESTS
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'vacation', CURRENT_DATE + INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month' + INTERVAL '5 days', 'Family trip', 'pending');


-- 10. SEED ACTIVITIES
INSERT INTO activities (employee_id, activity_type, description, start_time, status) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'client_meeting', 'Meeting with Client X', NOW() - INTERVAL '3 hours', 'approved');
