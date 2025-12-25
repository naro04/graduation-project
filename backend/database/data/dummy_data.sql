-- ============================================
-- DUMMY DATA GENERATION
-- ============================================

-- 1. SEED ROLES
INSERT INTO roles (name, description) VALUES
('Super Admin', 'Full system access and configuration'),
('HR Admin', 'HR operations and employee management'),
('Manager', 'Team management and activity coordination'),
('Field Worker', 'Field operations and activity implementation'),
('Office Staff', 'Office activities and self-service access')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. SEED DEPARTMENTS
INSERT INTO departments (name, description, status) VALUES
('Engineering', 'Software Development and IT Operations', 'active'),
('Human Resources', 'Recruitment and Employee Relations', 'active'),
('Operations', 'Field and Office Operations', 'active')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED POSITIONS (Simplified)
INSERT INTO positions (title, department_id, description) VALUES
('Director', (SELECT id FROM departments WHERE name = 'Human Resources'), 'Top level management'),
('HR Specialist', (SELECT id FROM departments WHERE name = 'Human Resources'), 'HR operations'),
('Senior Lead', (SELECT id FROM departments WHERE name = 'Engineering'), 'Lead role'),
('Coordinator', (SELECT id FROM departments WHERE name = 'Operations'), 'Field coordinator')
ON CONFLICT DO NOTHING;

-- 4. SEED USERS
INSERT INTO users (email, password_hash, name) VALUES
('admin@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Super Admin'),
('hr@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'HR Admin Sarah'),
('manager@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Manager Mike'),
('field@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Field Worker John'),
('office@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Office Staff Alice')
ON CONFLICT (email) DO NOTHING;

-- 5. LINK USERS TO ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), (SELECT id FROM roles WHERE name = 'Super Admin')),
((SELECT id FROM users WHERE email = 'hr@company.com'), (SELECT id FROM roles WHERE name = 'HR Admin')),
((SELECT id FROM users WHERE email = 'manager@company.com'), (SELECT id FROM roles WHERE name = 'Manager')),
((SELECT id FROM users WHERE email = 'field@company.com'), (SELECT id FROM roles WHERE name = 'Field Worker')),
((SELECT id FROM users WHERE email = 'office@company.com'), (SELECT id FROM roles WHERE name = 'Office Staff'))
ON CONFLICT DO NOTHING;

-- 7. SEED PERMISSIONS (Comprehensive from screenshots)
-- MENUS
INSERT INTO permissions (slug, display_name, permission_type, sort_order) VALUES
('menu:dashboard', 'Dashboard', 'menu', 1),
('menu:user_management', 'User Management', 'menu', 2),
('menu:attendance', 'Attendance', 'menu', 3),
('menu:activities', 'Activities', 'menu', 4),
('menu:locations', 'Locations Management', 'menu', 5),
('menu:leave', 'Leave Management', 'menu', 6),
('menu:reports', 'Reports', 'menu', 7),
('menu:my_team', 'My Team', 'menu', 8),
('menu:more', 'More', 'menu', 9),
('menu:logout', 'Log out', 'menu', 100)
ON CONFLICT (slug) DO NOTHING;

-- SUB MENUS
INSERT INTO permissions (slug, display_name, permission_type, parent_id, sort_order) VALUES
-- User Mgt
('menu:users:employees', 'Employees', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:user_management'), 1),
('menu:users:roles', 'Roles & Permissions', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:user_management'), 2),
('menu:users:departments', 'Departments', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:user_management'), 3),
-- Attendance
('menu:attendance:daily', 'Daily Attendance', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:attendance'), 1),
('menu:attendance:gps', 'GPS Verification', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:attendance'), 2),
('menu:attendance:my', 'My Attendance', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:attendance'), 3),
-- Activities
('menu:activities:all', 'All Activities', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 1),
('menu:activities:approval', 'Activity Approval', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 2),
('menu:activities:my', 'My Activities', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 3),
('menu:activities:log', 'Log Activity', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:activities'), 4),
-- Locations
('menu:locations:list', 'Locations', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:locations'), 1),
('menu:locations:type', 'Location Type', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:locations'), 2),
('menu:locations:assignment', 'Location Assignment', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:locations'), 3),
-- Leave
('menu:leave:requests', 'Leave Requests', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:leave'), 1),
('menu:leave:req_self', 'Request Leave', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:leave'), 2),
('menu:leave:my', 'My Leave', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:leave'), 3),
-- Reports
('menu:reports:attendance', 'Attendance Reports', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:reports'), 1),
('menu:reports:field', 'Field Activity Reports', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:reports'), 2),
('menu:reports:leave', 'Leave Reports', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:reports'), 3),
('menu:reports:hr', 'HR Reports', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:reports'), 4),
('menu:reports:team', 'Team Reports', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:reports'), 5),
-- My Team
('menu:team:members', 'Team Members', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:my_team'), 1),
('menu:team:attendance', 'Team Attendance', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:my_team'), 2),
('menu:team:activities', 'Team Activities', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:my_team'), 3),
('menu:team:leave', 'Team Leave Requests', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:my_team'), 4),
-- More
('menu:more:profile', 'My Profile', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:more'), 1),
('menu:more:sys_config', 'System Configuration', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:more'), 2),
('menu:more:notifications', 'Notifications Settings', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:more'), 3),
('menu:more:api_keys', 'API Keys', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:more'), 4),
('menu:more:help', 'Help Center', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:more'), 5),
('menu:more:support', 'Support', 'menu', (SELECT id FROM permissions WHERE slug = 'menu:more'), 6)
ON CONFLICT (slug) DO NOTHING;

-- ACTIONS
INSERT INTO permissions (slug, display_name, permission_type, resource, action) VALUES
-- User
('user:view_all', 'View all employees', 'action', 'employees', 'read'),
('user:create', 'Create employee', 'action', 'employees', 'create'),
('user:edit', 'Edit employee', 'action', 'employees', 'update'),
('user:delete', 'Disable/Delete employee', 'action', 'employees', 'delete'),
('user:assign_roles', 'Assign roles', 'action', 'roles', 'assign'),
('user:manage_depts', 'Manage departments', 'action', 'departments', 'manage'),
-- Attendance
('attendance:view_all', 'View all attendance', 'action', 'attendance', 'read_all'),
('attendance:verify_gps', 'Verify GPS logs', 'action', 'attendance', 'verify'),
('attendance:edit', 'Edit attendance', 'action', 'attendance', 'update'),
('attendance:delete', 'Delete attendance', 'action', 'attendance', 'delete'),
('attendance:export', 'Export attendance data', 'action', 'attendance', 'export'),
('attendance:view_team', 'View team attendance', 'action', 'attendance', 'read_team'),
('attendance:view_my', 'View My attendance', 'action', 'attendance', 'read_own'),
('attendance:check_in_out', 'Check-in/Check-out', 'action', 'attendance', 'create'),
-- Activity
('activity:view_all', 'View all activities', 'action', 'activities', 'read_all'),
('activity:approve_reject', 'Approve/Reject activities', 'action', 'activities', 'approve'),
('activity:edit', 'Edit activity', 'action', 'activities', 'update'),
('activity:manage_templates', 'Manage activity templates', 'action', 'activities', 'manage_templates'),
('activity:approve_team', 'Approve/Reject team activities', 'action', 'activities', 'approve_team'),
('activity:log_my', 'Log my activity', 'action', 'activities', 'create_own'),
('activity:view_my', 'View my activities', 'action', 'activities', 'read_own'),
-- Leave
('leave:view_all', 'View all leave requests', 'action', 'leave', 'read_all'),
('leave:approve_reject', 'Approve/Reject leave', 'action', 'leave', 'approve'),
('leave:adjust_balance', 'Adjust leave balance', 'action', 'leave', 'adjust'),
('leave:check_balance', 'Check leave balance', 'action', 'leave', 'read_balance'),
('leave:approve_team', 'Approve/Reject team leave requests', 'action', 'leave', 'approve_team'),
('leave:request_self', 'Request leave for self', 'action', 'leave', 'create_own'),
('leave:view_my', 'View my leave status', 'action', 'leave', 'read_own'),
-- Locations
('location:manage', 'Create/Edit/Delete locations', 'action', 'locations', 'manage'),
('location:assign_employees', 'Assign employees to locations', 'action', 'locations', 'assign'),
('location:manage_types', 'Manage location types', 'action', 'locations', 'manage_types'),
-- Reports
('report:export_hr', 'View/Export HR reports', 'action', 'reports', 'hr'),
('report:export_field', 'View/Export field activities reports', 'action', 'reports', 'field'),
('report:export_attendance_leave', 'View/Export attendance, leave reports', 'action', 'reports', 'attendance_leave'),
('report:export_team', 'View/Export team reports', 'action', 'reports', 'team'),
-- System
('system:access_config', 'Access full system configuration', 'action', 'system', 'config'),
('system:manage_notifications', 'Manage notification settings', 'action', 'system', 'notifications'),
('system:manage_api_keys', 'Generate/Delete API keys', 'action', 'system', 'api_keys'),
('system:access_logs', 'Access system logs', 'action', 'system', 'logs')
ON CONFLICT (slug) DO NOTHING;

-- LINKING (EXACTLY FROM IMAGES)

-- Super Admin: ALL
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'Super Admin'
ON CONFLICT DO NOTHING;

-- HR Admin (Image 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'HR Admin'), id FROM permissions
WHERE slug IN (
    'menu:dashboard', 'menu:user_management', 'menu:users:employees', 'menu:users:departments',
    'menu:attendance', 'menu:attendance:daily', 'menu:attendance:gps', 'menu:attendance:my',
    'menu:leave', 'menu:leave:requests', 'menu:leave:req_self', 'menu:leave:my',
    'menu:reports', 'menu:reports:attendance', 'menu:reports:field', 'menu:reports:leave', 'menu:reports:hr',
    'menu:more', 'menu:more:profile', 'menu:more:help', 'menu:more:support', 'menu:logout',
    'user:view_all', 'user:create', 'user:edit', 'user:delete',
    'attendance:view_all', 'attendance:verify_gps', 'attendance:edit', 'attendance:delete', 'attendance:export', 'attendance:view_my', 'attendance:check_in_out',
    'activity:view_all',
    'leave:view_all', 'leave:approve_reject', 'leave:adjust_balance', 'leave:check_balance', 'leave:request_self', 'leave:view_my',
    'report:export_hr', 'report:export_field', 'report:export_attendance_leave'
) ON CONFLICT DO NOTHING;

-- Manager (Image 2)
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'Manager'), id FROM permissions
WHERE slug IN (
    'menu:dashboard', 'menu:attendance:my', 'menu:attendance',
    'menu:activities', 'menu:activities:all', 'menu:activities:approval', 'menu:activities:my', 'menu:activities:log',
    'menu:leave', 'menu:leave:requests', 'menu:leave:req_self', 'menu:leave:my',
    'menu:reports', 'menu:reports:attendance', 'menu:reports:leave', 'menu:reports:team',
    'menu:my_team', 'menu:team:members', 'menu:team:attendance', 'menu:team:activities', 'menu:team:leave',
    'menu:more', 'menu:more:profile', 'menu:more:help', 'menu:more:support', 'menu:logout',
    'attendance:view_team', 'attendance:view_my', 'attendance:check_in_out',
    'activity:approve_reject', 'activity:approve_team', 'activity:log_my', 'activity:view_my',
    'leave:check_balance', 'leave:approve_team', 'leave:request_self', 'leave:view_my',
    'report:export_attendance_leave', 'report:export_team'
) ON CONFLICT DO NOTHING;

-- Field Worker (Image 3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'Field Worker'), id FROM permissions
WHERE slug IN (
    'menu:dashboard', 'menu:attendance', 'menu:attendance:my',
    'menu:activities', 'menu:activities:my', 'menu:activities:log',
    'menu:leave', 'menu:leave:req_self', 'menu:leave:my',
    'menu:more', 'menu:more:profile', 'menu:more:help', 'menu:more:support', 'menu:logout',
    'attendance:view_my', 'attendance:check_in_out',
    'activity:log_my', 'activity:view_my',
    'leave:request_self', 'leave:view_my'
) ON CONFLICT DO NOTHING;

-- Office Staff (Image 4)
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'Office Staff'), id FROM permissions
WHERE slug IN (
    'menu:dashboard', 'menu:attendance', 'menu:attendance:my',
    'menu:leave', 'menu:leave:req_self', 'menu:leave:my',
    'menu:more', 'menu:more:profile', 'menu:more:help', 'menu:more:support', 'menu:logout',
    'attendance:view_my', 'attendance:check_in_out',
    'leave:request_self', 'leave:view_my'
) ON CONFLICT DO NOTHING;


-- 8. SEED EMPLOYEES
INSERT INTO employees (user_id, employee_code, first_name, last_name, full_name, email, department_id, position_id, employment_type, status, hired_at) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), 'EMP001', 'System', 'Admin', 'System Admin', 'admin@company.com', NULL, NULL, 'Full-Time', 'active', NOW() - INTERVAL '3 years'),
((SELECT id FROM users WHERE email = 'hr@company.com'), 'EMP002', 'Sarah', 'Connor', 'Sarah HR', 'hr@company.com', (SELECT id FROM departments WHERE name = 'Human Resources'), (SELECT id FROM positions WHERE title = 'HR Specialist'), 'Full-Time', 'active', NOW() - INTERVAL '2 years'),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), 'EMP003', 'Mike', 'Ross', 'Mike Engineering', 'eng_manager@company.com', (SELECT id FROM departments WHERE name = 'Engineering'), (SELECT id FROM positions WHERE title = 'Senior Software Engineer'), 'Full-Time', 'active', NOW() - INTERVAL '1 year'),
((SELECT id FROM users WHERE email = 'dev@company.com'), 'EMP004', 'John', 'Doe', 'John Dev', 'dev@company.com', (SELECT id FROM departments WHERE name = 'Engineering'), (SELECT id FROM positions WHERE title = 'Software Engineer'), 'Full-Time', 'active', NOW() - INTERVAL '6 months')
ON CONFLICT (employee_code) DO NOTHING;

-- Supervisor Link
UPDATE employees SET supervisor_id = (SELECT id FROM employees WHERE employee_code = 'EMP003') WHERE employee_code = 'EMP004';

-- 9. EMERGENCY CONTACTS TABLE (Ensure it exists)
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(50),
    alternate_phone VARCHAR(50),
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- 10. SEED LOCATIONS
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
