-- ============================================
-- DUMMY DATA GENERATION
-- ============================================

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
INSERT INTO positions (title, department_id, description) VALUES
('Senior Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering'), 'Lead technical role'),
('Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering'), 'Standard dev role'),
('HR Specialist', (SELECT id FROM departments WHERE name = 'Human Resources'), 'HR operations'),
('Sales Representative', (SELECT id FROM departments WHERE name = 'Sales'), 'Sales role'),
('Marketing Manager', (SELECT id FROM departments WHERE name = 'Marketing'), 'Marketing lead')
ON CONFLICT DO NOTHING;

-- 4. SEED USERS
-- Password hash for 'password123': $2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO
INSERT INTO users (email, password_hash, name, avatar_url) VALUES
('admin@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'System Admin', 'https://i.pravatar.cc/150?u=admin'),
('hr@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Sarah HR', 'https://i.pravatar.cc/150?u=sarah'),
('eng_manager@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Mike Engineering', 'https://i.pravatar.cc/150?u=mike'),
('dev@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'John Dev', 'https://i.pravatar.cc/150?u=john')
ON CONFLICT (email) DO NOTHING;

-- 5. LINK USERS TO ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), (SELECT id FROM roles WHERE name = 'Admin')),
((SELECT id FROM users WHERE email = 'hr@company.com'), (SELECT id FROM roles WHERE name = 'HR Manager')),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), (SELECT id FROM roles WHERE name = 'Department Manager')),
((SELECT id FROM users WHERE email = 'dev@company.com'), (SELECT id FROM roles WHERE name = 'Employee'))
ON CONFLICT DO NOTHING;

-- 6. SEED PROJECTS (NEW)
INSERT INTO projects (name, description, status) VALUES
('Project X', 'Main Graduation Project', 'active'),
('Project Y', 'Community Outreach', 'active'),
('Project Z', 'Internal Tools', 'active')
ON CONFLICT (name) DO NOTHING;

-- 7. SEED PERMISSIONS (NEW STRUCTURE)
-- Top Level Menus
INSERT INTO permissions (slug, display_name, permission_type, sort_order) VALUES
('menu:dashboard', 'Dashboard', 'menu', 1),
('menu:user_management', 'User Management', 'menu', 2),
('menu:attendance', 'Attendance', 'menu', 3),
('menu:activities', 'Activities', 'menu', 4),
('menu:locations', 'Locations Management', 'menu', 5),
('menu:leave', 'Leave Management', 'menu', 6),
('menu:reports', 'Reports', 'menu', 7),
('menu:more', 'More', 'menu', 99)
ON CONFLICT (slug) DO NOTHING;

-- Sub Menus (User Management)
INSERT INTO permissions (slug, display_name, permission_type, parent_id, sort_order) VALUES
('menu:users:employees', 'Employees', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:user_management'), 1),
('menu:users:roles', 'Roles & Permissions', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:user_management'), 2),
('menu:users:departments', 'Departments', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:user_management'), 3)
ON CONFLICT (slug) DO NOTHING;

-- Sub Menus (Attendance)
INSERT INTO permissions (slug, display_name, permission_type, parent_id, sort_order) VALUES
('menu:attendance:daily', 'Daily Attendance', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:attendance'), 1),
('menu:attendance:gps', 'GPS Verification', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:attendance'), 2),
('menu:attendance:my', 'My Attendance', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:attendance'), 3)
ON CONFLICT (slug) DO NOTHING;

-- Sub Menus (Activities)
INSERT INTO permissions (slug, display_name, permission_type, parent_id, sort_order) VALUES
('menu:activities:all', 'All Activities', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 1),
('menu:activities:approval', 'Activity Approval', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 2),
('menu:activities:my', 'My Activities', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 3),
('menu:activities:log', 'Log Activity', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 4)
ON CONFLICT (slug) DO NOTHING;

-- Actions (Updated to match routes)
INSERT INTO permissions (slug, display_name, permission_type, resource, action, sort_order) VALUES
('view_employees', 'View all employees', 'action', 'employees', 'read', 101),
('manage_employees', 'Manage employees', 'action', 'employees', 'manage', 102),
('view_roles', 'View roles', 'action', 'roles', 'read', 103),
('manage_roles', 'Manage roles', 'action', 'roles', 'manage', 104),
('view_permissions', 'View permissions', 'action', 'permissions', 'read', 105),
('manage_permissions', 'Manage permissions', 'action', 'permissions', 'manage', 106),
('manage_departments', 'Manage departments', 'action', 'departments', 'manage', 107),
('verify_gps', 'Verify GPS logs', 'action', 'attendance', 'verify', 201),
('approve_activity', 'Approve/Reject activities', 'action', 'activities', 'approve', 301)
ON CONFLICT (slug) DO NOTHING;

-- 7.5 LINK ADMIN ROLE TO PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;


-- 8. SEED EMPLOYEES
INSERT INTO employees (user_id, employee_code, first_name, last_name, full_name, email, department_id, position_id, employment_type, status, hired_at) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), 'EMP001', 'System', 'Admin', 'System Admin', 'admin@company.com', NULL, NULL, 'Full-Time', 'active', NOW() - INTERVAL '3 years'),
((SELECT id FROM users WHERE email = 'hr@company.com'), 'EMP002', 'Sarah', 'Connor', 'Sarah HR', 'hr@company.com', (SELECT id FROM departments WHERE name = 'Human Resources'), (SELECT id FROM positions WHERE title = 'HR Specialist'), 'Full-Time', 'active', NOW() - INTERVAL '2 years'),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), 'EMP003', 'Mike', 'Ross', 'Mike Engineering', 'eng_manager@company.com', (SELECT id FROM departments WHERE name = 'Engineering'), (SELECT id FROM positions WHERE title = 'Senior Software Engineer'), 'Full-Time', 'active', NOW() - INTERVAL '1 year'),
((SELECT id FROM users WHERE email = 'dev@company.com'), 'EMP004', 'John', 'Doe', 'John Dev', 'dev@company.com', (SELECT id FROM departments WHERE name = 'Engineering'), (SELECT id FROM positions WHERE title = 'Software Engineer'), 'Full-Time', 'active', NOW() - INTERVAL '6 months')
ON CONFLICT (employee_code) DO NOTHING;

-- Supervisor Link
UPDATE employees SET supervisor_id = (SELECT id FROM employees WHERE employee_code = 'EMP003') WHERE employee_code = 'EMP004';

-- 9. SEED LOCATIONS
INSERT INTO locations (name, address, latitude, longitude, location_type) VALUES
('Head Office', 'Gaza Office', 31.5000, 34.4667, 'Office'),
('School A', 'Hattin School', 31.5100, 34.4700, 'Field Site')
ON CONFLICT DO NOTHING;

-- 10. SEED ATTENDANCE (Updated with GPS & Status)
INSERT INTO attendance (employee_id, check_in_time, check_out_time, location_latitude, location_longitude, location_address, distance_from_base, gps_status, daily_status, work_type, approval_status) VALUES
-- John Dev: Verified Present
((SELECT id FROM employees WHERE employee_code = 'EMP004'), '2025-12-07 08:00:00', '2025-12-07 16:02:00', 31.5000, 34.4667, 'Head Office', 0.00, 'Verified', 'Present', 'Office', 'approved'),
-- John Dev: Suspicious (150m away)
((SELECT id FROM employees WHERE employee_code = 'EMP004'), '2025-12-08 10:05:00', '2025-12-08 16:20:00', 31.5005, 34.4670, 'School A', 150.00, 'Suspicious', 'Late', 'Office', 'pending'),
-- Ameer Jamal (Mike): Verified
((SELECT id FROM employees WHERE employee_code = 'EMP003'), '2025-12-07 08:00:00', '2025-12-07 16:00:00', 31.5100, 34.4700, 'Hattin School', 51.00, 'Verified', 'Present', 'Field', 'approved');

-- 11. SEED ACTIVITIES (Updated with Project & Status)
INSERT INTO activities (employee_id, project_id, name, activity_type, description, start_time, implementation_status, approval_status, approved_by) VALUES
-- Workshop A (Implemented & Approved)
((SELECT id FROM employees WHERE employee_code = 'EMP003'), (SELECT id FROM projects WHERE name = 'Project X'), 'Workshop A', 'Workshop', 'Technical Workshop', NOW() - INTERVAL '5 days', 'Implemented', 'Approved', (SELECT id FROM employees WHERE employee_code = 'EMP001')),
-- Group Session A (Planned & rejected)
((SELECT id FROM employees WHERE employee_code = 'EMP003'), (SELECT id FROM projects WHERE name = 'Project Y'), 'Group Session A', 'Group Session', 'Community Session', NOW() + INTERVAL '2 days', 'Planned', 'Rejected', (SELECT id FROM employees WHERE employee_code = 'EMP001')),
-- Workshop B (Planned & Pending)
((SELECT id FROM employees WHERE employee_code = 'EMP002'), (SELECT id FROM projects WHERE name = 'Project Z'), 'Workshop B', 'Workshop', 'HR Training', NOW() + INTERVAL '5 days', 'Planned', 'Pending', NULL);
