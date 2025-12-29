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

-- 7. SEED PERMISSIONS (Legacy Compatible)
-- Re-inserting flat permission list valid for current backend/frontend
INSERT INTO permissions (resource, action, permission_type, slug, display_name, sort_order) VALUES
-- Menu Access
('Dashboard', 'access', 'menu_access', 'dashboard:access', 'access', 10),
('User Management', 'Employees', 'menu_access', 'user_management:employees', 'Employees', 20),
('User Management', 'Roles & Permissions', 'menu_access', 'user_management:roles_&_permissions', 'Roles & Permissions', 21),
('User Management', 'Departments', 'menu_access', 'user_management:departments', 'Departments', 22),
('Attendance', 'Daily Attendance', 'menu_access', 'attendance:daily_attendance', 'Daily Attendance', 30),
('Attendance', 'GPS Verification', 'menu_access', 'attendance:gps_verification', 'GPS Verification', 31),
('Attendance', 'My Attendance', 'menu_access', 'attendance:my_attendance', 'My Attendance', 32),
('Activities', 'All Activities', 'menu_access', 'activities:all_activities', 'All Activities', 40),
('Activities', 'Activity Approval', 'menu_access', 'activities:activity_approval', 'Activity Approval', 41),
('Activities', 'My Activities', 'menu_access', 'activities:my_activities', 'My Activities', 42),
('Activities', 'Log Activity', 'menu_access', 'activities:log_activity', 'Log Activity', 43),
('Locations Management', 'Locations', 'menu_access', 'locations_management:locations', 'Locations', 50),
('Locations Management', 'Location Type', 'menu_access', 'locations_management:location_type', 'Location Type', 51),
('Locations Management', 'Location Assignment', 'menu_access', 'locations_management:location_assignment', 'Location Assignment', 52),
('Leave Management', 'Leave Requests', 'menu_access', 'leave_management:leave_requests', 'Leave Requests', 60),
('Leave Management', 'Request Leave', 'menu_access', 'leave_management:request_leave', 'Request Leave', 61),
('Leave Management', 'My Leave', 'menu_access', 'leave_management:my_leave', 'My Leave', 62),
('Reports', 'Attendance Reports', 'menu_access', 'reports:attendance_reports', 'Attendance Reports', 70),
('Reports', 'Field Activity Reports', 'menu_access', 'reports:field_activity_reports', 'Field Activity Reports', 71),
('Reports', 'Leave Reports', 'menu_access', 'reports:leave_reports', 'Leave Reports', 72),
('Reports', 'HR Reports', 'menu_access', 'reports:hr_reports', 'HR Reports', 73),
('Reports', 'Team Reports', 'menu_access', 'reports:team_reports', 'Team Reports', 74),
('My Team', 'Team Members', 'menu_access', 'my_team:team_members', 'Team Members', 80),
('My Team', 'Team Attendance', 'menu_access', 'my_team:team_attendance', 'Team Attendance', 81),
('My Team', 'Team Activites', 'menu_access', 'my_team:team_activites', 'Team Activites', 82),
('My Team', 'Team Leave Reaquest', 'menu_access', 'my_team:team_leave_reaquest', 'Team Leave Reaquest', 83),
('More', 'My Profile', 'menu_access', 'more:my_profile', 'My Profile', 90),
('More', 'System Configuration', 'menu_access', 'more:system_configuration', 'System Configuration', 91),
('More', 'Notifications Settings', 'menu_access', 'more:notifications_settings', 'Notifications Settings', 92),
('More', 'API Keys', 'menu_access', 'more:api_keys', 'API Keys', 93),
('More', 'Help Center', 'menu_access', 'more:help_center', 'Help Center', 94),
('More', 'Support', 'menu_access', 'more:support', 'Support', 95),
('Log out', 'access', 'menu_access', 'log_out:access', 'access', 100),

-- ACTIONS
('User Actions', 'View all employees', 'action', 'user_actions:view_all_employees', 'View all employees', 110),
('User Actions', 'Create employee', 'action', 'user_actions:create_employee', 'Create employee', 111),
('User Actions', 'Edit employee', 'action', 'user_actions:edit_employee', 'Edit employee', 112),
('User Actions', 'Disable/Delete employee', 'action', 'user_actions:disable/delete_employee', 'Disable/Delete employee', 113),
('User Actions', 'Assign roles', 'action', 'user_actions:assign_roles', 'Assign roles', 114),
('User Actions', 'Manage departments', 'action', 'user_actions:manage_departments', 'Manage departments', 115),
('Attendance Actions', 'View all attendance', 'action', 'attendance_actions:view_all_attendance', 'View all attendance', 120),
('Attendance Actions', 'Verify GPS logs', 'action', 'attendance_actions:verify_gps_logs', 'Verify GPS logs', 121),
('Attendance Actions', 'Edit attendance', 'action', 'attendance_actions:edit_attendance', 'Edit attendance', 122),
('Attendance Actions', 'Delete attendance', 'action', 'attendance_actions:delete_attendance', 'Delete attendance', 123),
('Attendance Actions', 'Export attendance data', 'action', 'attendance_actions:export_attendance_data', 'Export attendance data', 124),
('Attendance Actions', 'View team attendance', 'action', 'attendance_actions:view_team_attendance', 'View team attendance', 125),
('Attendance Actions', 'View My attendance', 'action', 'attendance_actions:view_my_attendance', 'View My attendance', 126),
('Attendance Actions', 'Check-in/Check-out', 'action', 'attendance_actions:check-in/check-out', 'Check-in/Check-out', 127),
('Activity Actions', 'View all activities', 'action', 'activity_actions:view_all_activities', 'View all activities', 130),
('Activity Actions', 'Approve/Reject activities', 'action', 'activity_actions:approve/reject_activities', 'Approve/Reject activities', 131),
('Activity Actions', 'Edit activity', 'action', 'activity_actions:edit_activity', 'Edit activity', 132),
('Activity Actions', 'Manage activity templates', 'action', 'activity_actions:manage_activity_templates', 'Manage activity templates', 133),
('Activity Actions', 'Approve/Reject team activities', 'action', 'activity_actions:approve/reject_team_activities', 'Approve/Reject team activities', 134),
('Activity Actions', 'Log my activity', 'action', 'activity_actions:log_my_activity', 'Log my activity', 135),
('Activity Actions', 'View my activities', 'action', 'activity_actions:view_my_activities', 'View my activities', 136),
('Leave Actions', 'View all leave requests', 'action', 'leave_actions:view_all_leave_requests', 'View all leave requests', 140),
('Leave Actions', 'Approve/Reject leave', 'action', 'leave_actions:approve/reject_leave', 'Approve/Reject leave', 141),
('Leave Actions', 'Adjust leave balance', 'action', 'leave_actions:adjust_leave_balance', 'Adjust leave balance', 142),
('Leave Actions', 'Check leave balance', 'action', 'leave_actions:check_leave_balance', 'Check leave balance', 143),
('Leave Actions', 'Approve/Reject team leave requests', 'action', 'leave_actions:approve/reject_team_leave_requests', 'Approve/Reject team leave requests', 144),
('Leave Actions', 'Request leave for self', 'action', 'leave_actions:request_leave_for_self', 'Request leave for self', 145),
('Leave Actions', 'View my leave status', 'action', 'leave_actions:view_my_leave_status', 'View my leave status', 146),
('Locations Actions', 'Create/Edit/Delete locations', 'action', 'locations_actions:create/edit/delete_locations', 'Create/Edit/Delete locations', 150),
('Locations Actions', 'Assign employees to locations', 'action', 'locations_actions:assign_employees_to_locations', 'Assign employees to locations', 151),
('Locations Actions', 'Manage location types', 'action', 'locations_actions:manage_location_types', 'Manage location types', 152),
('Reports Actions', 'View/Export HR reports', 'action', 'reports_actions:view/export_hr_reports', 'View/Export HR reports', 160),
('Reports Actions', 'View/Export field activites reports', 'action', 'reports_actions:view/export_field_activites_reports', 'View/Export field activites reports', 161),
('Reports Actions', 'View/Export attendance, leave reports', 'action', 'reports_actions:view/export_attendance,_leave_reports', 'View/Export attendance, leave reports', 162),
('Reports Actions', 'View/Export team reports', 'action', 'reports_actions:view/export_team_reports', 'View/Export team reports', 163),
('System Actions', 'Access full system configuration', 'action', 'system_actions:access_full_system_configuration', 'Access full system configuration', 170),
('System Actions', 'Manage notification settings', 'action', 'system_actions:manage_notification_settings', 'Manage notification settings', 171),
('System Actions', 'Generate/Delete API keys', 'action', 'system_actions:generate/delete_api_keys', 'Generate/Delete API keys', 172),
('System Actions', 'Access system logs', 'action', 'system_actions:access_system_logs', 'Access system logs', 173)
ON CONFLICT (slug) DO NOTHING;

-- 8. LINK PERMISSIONS TO ROLES

-- Super Admin: ALL
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'Super Admin'
ON CONFLICT DO NOTHING;

-- HR Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'HR Admin'), id FROM permissions
WHERE slug IN (
    'dashboard:access', 'user_management:employees', 'user_management:departments',
    'attendance:daily_attendance', 'attendance:gps_verification', 'attendance:my_attendance',
    'leave_management:leave_requests', 'leave_management:request_leave', 'leave_management:my_leave',
    'reports:attendance_reports', 'reports:field_activity_reports', 'reports:leave_reports', 'reports:hr_reports',
    'more:my_profile', 'more:help_center', 'more:support', 'log_out:access',
    'user_actions:view_all_employees', 'user_actions:create_employee', 'user_actions:edit_employee', 'user_actions:disable/delete_employee',
    'attendance_actions:view_all_attendance', 'attendance_actions:verify_gps_logs', 'attendance_actions:edit_attendance', 'attendance_actions:delete_attendance', 'attendance_actions:export_attendance_data', 'attendance_actions:view_my_attendance', 'attendance_actions:check-in/check-out',
    'activity_actions:view_all_activities', 
    'leave_actions:view_all_leave_requests', 'leave_actions:approve/reject_leave', 'leave_actions:adjust_leave_balance', 'leave_actions:check_leave_balance', 'leave_actions:request_leave_for_self', 'leave_actions:view_my_leave_status',
    'reports_actions:view/export_hr_reports', 'reports_actions:view/export_field_activites_reports', 'reports_actions:view/export_attendance,_leave_reports'
) ON CONFLICT DO NOTHING;

-- Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'Manager'), id FROM permissions
WHERE slug IN (
    'dashboard:access', 'attendance:my_attendance', 
    'activities:all_activities', 'activities:activity_approval', 'activities:my_activities', 'activities:log_activity',
    'leave_management:leave_requests', 'leave_management:request_leave', 'leave_management:my_leave',
    'reports:attendance_reports', 'reports:leave_reports', 'reports:team_reports',
    'my_team:team_members', 'my_team:team_attendance', 'my_team:team_activites', 'my_team:team_leave_reaquest',
    'more:my_profile', 'more:help_center', 'more:support', 'log_out:access',
    'attendance_actions:view_team_attendance', 'attendance_actions:view_my_attendance', 'attendance_actions:check-in/check-out',
    'activity_actions:approve/reject_activities', 'activity_actions:approve/reject_team_activities', 'activity_actions:log_my_activity', 'activity_actions:view_my_activities',
    'leave_actions:check_leave_balance', 'leave_actions:approve/reject_team_leave_requests', 'leave_actions:request_leave_for_self', 'leave_actions:view_my_leave_status',
    'reports_actions:view/export_attendance,_leave_reports', 'reports_actions:view/export_team_reports'
) ON CONFLICT DO NOTHING;

-- Field Worker
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'Field Worker'), id FROM permissions
WHERE slug IN (
    'dashboard:access', 'attendance:my_attendance',
    'activities:my_activities', 'activities:log_activity',
    'leave_management:request_leave', 'leave_management:my_leave',
    'more:my_profile', 'more:help_center', 'more:support', 'log_out:access',
    'attendance_actions:view_my_attendance', 'attendance_actions:check-in/check-out',
    'activity_actions:log_my_activity', 'activity_actions:view_my_activities',
    'leave_actions:request_leave_for_self', 'leave_actions:view_my_leave_status'
) ON CONFLICT DO NOTHING;

-- Office Staff
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'Office Staff'), id FROM permissions
WHERE slug IN (
    'dashboard:access', 'attendance:my_attendance',
    'leave_management:request_leave', 'leave_management:my_leave',
    'more:my_profile', 'more:help_center', 'more:support', 'log_out:access',
    'attendance_actions:view_my_attendance', 'attendance_actions:check-in/check-out',
    'leave_actions:request_leave_for_self', 'leave_actions:view_my_leave_status'
) ON CONFLICT DO NOTHING;


-- 8. SEED EMPLOYEES
-- 8. SEED EMPLOYEES
INSERT INTO employees (user_id, employee_code, first_name, middle_name, last_name, full_name, email, phone, birth_date, gender, marital_status, department_id, position_id, employment_type, status, hired_at) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), 'EMP001', 'Firas', 'Ali', 'Alijla', 'Firas Alijla', 'admin@company.com', '+1234567890', '1990-01-01', 'Male', 'Single', NULL, NULL, 'Full-Time', 'active', NOW() - INTERVAL '3 years'),
((SELECT id FROM users WHERE email = 'hr@company.com'), 'EMP002', 'Sarah', 'Jean', 'Connor', 'Sarah HR', 'hr@company.com', '+1987654321', '1985-05-15', 'Female', 'Married', (SELECT id FROM departments WHERE name = 'Human Resources'), (SELECT id FROM positions WHERE title = 'HR Specialist'), 'Full-Time', 'active', NOW() - INTERVAL '2 years'),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), 'EMP003', 'Mike', 'David', 'Ross', 'Mike Engineering', 'eng_manager@company.com', '+1122334455', '1980-08-20', 'Male', 'Married', (SELECT id FROM departments WHERE name = 'Engineering'), (SELECT id FROM positions WHERE title = 'Senior Software Engineer'), 'Full-Time', 'active', NOW() - INTERVAL '1 year'),
((SELECT id FROM users WHERE email = 'dev@company.com'), 'EMP004', 'John', 'Michael', 'Doe', 'John Dev', 'dev@company.com', '+1555666777', '1995-12-10', 'Male', 'Single', (SELECT id FROM departments WHERE name = 'Engineering'), (SELECT id FROM positions WHERE title = 'Software Engineer'), 'Full-Time', 'active', NOW() - INTERVAL '6 months')
ON CONFLICT (employee_code) DO UPDATE SET 
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    marital_status = EXCLUDED.marital_status,
    middle_name = EXCLUDED.middle_name;

-- Supervisor Link
UPDATE employees SET supervisor_id = (SELECT id FROM employees WHERE employee_code = 'EMP003') WHERE employee_code = 'EMP004';

-- 9. SEED EMERGENCY CONTACTS
INSERT INTO emergency_contacts (employee_id, name, relationship, phone, email, address) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Ali Alijla', 'Father', '+1234567899', 'ali@example.com', '123 Main St, City'),
((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Kyle Reese', 'Husband', '+1987654322', 'kyle@example.com', '456 Oak Ave, Town'),
((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Rachel Ross', 'Wife', '+1122334466', 'rachel@example.com', '789 Pine Ln, Village'),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Harry Doe', 'Father', '+1555666778', 'harry@example.com', '321 Elm St, Hamlet')
ON CONFLICT (employee_id) DO UPDATE SET
    name = EXCLUDED.name,
    relationship = EXCLUDED.relationship,
    phone = EXCLUDED.phone;

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
