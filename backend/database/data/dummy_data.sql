-- ============================================
-- DUMMY DATA (CORE + DEMO COMBINED)
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
('HR', 'Human Resources and Recruitment', 'active'),
('Field Operations', 'Field activities and site management', 'active'),
('Office', 'Administrative and office support', 'active'),
('Project Management', 'Planning and coordination', 'active'),
('Finance', 'Financial management and accounting', 'active'),
('IT', 'Information Technology and Systems', 'active')
ON CONFLICT (name) DO NOTHING;

-- 3. SEED POSITIONS (Strict Alignment)
INSERT INTO positions (title, department_id, description) VALUES
-- Super Admin
('System Administration', (SELECT id FROM departments WHERE name = 'IT'), 'Full system control'),

-- HR Admin
('HR Manager', (SELECT id FROM departments WHERE name = 'HR'), 'HR management'),

-- Manager
('Project Manager', (SELECT id FROM departments WHERE name = 'Project Management'), 'Project management'),
('Team Leader', (SELECT id FROM departments WHERE name = 'Field Operations'), 'Team coordination'),
('Field Supervisor', (SELECT id FROM departments WHERE name = 'Field Operations'), 'Field oversight'),

-- Field Worker
('Activity Facilitator', (SELECT id FROM departments WHERE name = 'Field Operations'), 'Activity implementation'),
('Trainer', (SELECT id FROM departments WHERE name = 'Field Operations'), 'Field training'),
('Social Worker', (SELECT id FROM departments WHERE name = 'Field Operations'), 'Case management'),

-- Office Staff
('Administrative Assistant', (SELECT id FROM departments WHERE name = 'Office'), 'Office support'),
('Data Entry', (SELECT id FROM departments WHERE name = 'Office'), 'Data processing'),
('Office Coordinator', (SELECT id FROM departments WHERE name = 'Office'), 'Office logistics')
ON CONFLICT (title, department_id) DO NOTHING;

-- 4. SEED USERS
INSERT INTO users (email, password_hash, name) VALUES
('admin@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Firas Alijla'),
('hr@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Sarah Jean Connor'),
('manager@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Mike David Ross'),
('eng_manager@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSRbySeWiWpcYBO', 'Ameer Jamal'),
('field@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'John Field'),
('dev@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'John Michael Doe'),
('office@company.com', '$2b$12$.ZFkaD240sNkvIq5Y47Fvuzzslr0ssQs2PFkSDpSRbySeWiWpcYBO', 'Alice Marie Smith')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- 5. LINK ROLES (Cleanup first to avoid duplicates or ghost links)
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email IN ('admin@company.com', 'hr@company.com', 'manager@company.com', 'eng_manager@company.com', 'field@company.com', 'dev@company.com', 'office@company.com'));

INSERT INTO user_roles (user_id, role_id) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), (SELECT id FROM roles WHERE name = 'Super Admin')),
((SELECT id FROM users WHERE email = 'hr@company.com'), (SELECT id FROM roles WHERE name = 'HR Admin')),
((SELECT id FROM users WHERE email = 'manager@company.com'), (SELECT id FROM roles WHERE name = 'Manager')),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), (SELECT id FROM roles WHERE name = 'Manager')),
((SELECT id FROM users WHERE email = 'field@company.com'), (SELECT id FROM roles WHERE name = 'Field Worker')),
((SELECT id FROM users WHERE email = 'dev@company.com'), (SELECT id FROM roles WHERE name = 'Office Staff')),
((SELECT id FROM users WHERE email = 'office@company.com'), (SELECT id FROM roles WHERE name = 'Office Staff'))
ON CONFLICT DO NOTHING;

-- 6. SEED PERMISSIONS
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
-- Actions
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

-- 7. LINK PERMISSIONS TO ROLES
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'Super Admin'
ON CONFLICT DO NOTHING;

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

-- 8. EMPLOYEES (Cleanup linked users first to ensure fresh assignment)
-- We don't delete employees, just unlink users to avoid FK issues while allowing re-linking
UPDATE employees SET user_id = NULL WHERE user_id IN (SELECT id FROM users WHERE email IN ('admin@company.com', 'hr@company.com', 'manager@company.com', 'eng_manager@company.com', 'field@company.com', 'dev@company.com', 'office@company.com'));

-- Now insert/update employees and re-link
INSERT INTO employees (user_id, employee_code, first_name, middle_name, last_name, full_name, email, phone, birth_date, gender, marital_status, department_id, position_id, role_id, employment_type, city, country, status, hired_at) VALUES
((SELECT id FROM users WHERE email = 'admin@company.com'), 'EMP001', 'Firas', 'Ali', 'Alijla', 'Firas Alijla', 'admin@company.com', '+1234567890', '1990-01-01', 'Male', 'Single', (SELECT id FROM departments WHERE name = 'IT'), (SELECT id FROM positions WHERE title = 'System Administration'), (SELECT id FROM roles WHERE name = 'Super Admin'), 'Full-Time', 'Ramallah', 'Palestine', 'active', NOW()),
((SELECT id FROM users WHERE email = 'hr@company.com'), 'EMP002', 'Sarah', 'Jean', 'Connor', 'Sarah Jean Connor', 'hr@company.com', '+1987654321', '1985-05-15', 'Female', 'Married', (SELECT id FROM departments WHERE name = 'HR'), (SELECT id FROM positions WHERE title = 'HR Manager'), (SELECT id FROM roles WHERE name = 'HR Admin'), 'Full-Time', 'Gaza', 'Palestine', 'active', NOW() - INTERVAL '2 years'),
((SELECT id FROM users WHERE email = 'manager@company.com'), 'EMP003', 'Mike', 'David', 'Ross', 'Mike David Ross', 'manager@company.com', '+1122334455', '1980-08-20', 'Male', 'Married', (SELECT id FROM departments WHERE name = 'Project Management'), (SELECT id FROM positions WHERE title = 'Project Manager'), (SELECT id FROM roles WHERE name = 'Manager'), 'Full-Time', 'Jerusalem', 'Palestine', 'active', NOW() - INTERVAL '1 year'),
((SELECT id FROM users WHERE email = 'dev@company.com'), 'EMP004', 'John', 'Michael', 'Doe', 'John Michael Doe', 'dev@company.com', '+1555666777', '1995-12-10', 'Male', 'Single', (SELECT id FROM departments WHERE name = 'Office'), (SELECT id FROM positions WHERE title = 'Administrative Assistant'), (SELECT id FROM roles WHERE name = 'Office Staff'), 'Full-Time', 'Nablus', 'Palestine', 'active', NOW() - INTERVAL '6 months'),
((SELECT id FROM users WHERE email = 'office@company.com'), 'EMP005', 'Alice', 'Marie', 'Smith', 'Alice Marie Smith', 'office@company.com', '+1555888999', '1992-03-25', 'Female', 'Single', (SELECT id FROM departments WHERE name = 'Office'), (SELECT id FROM positions WHERE title = 'Office Coordinator'), (SELECT id FROM roles WHERE name = 'Office Staff'), 'Full-Time', 'Bethlehem', 'Palestine', 'active', NOW() - INTERVAL '4 months'),
((SELECT id FROM users WHERE email = 'eng_manager@company.com'), 'EMP006', 'Ameer', 'Jamal', 'Ross', 'Ameer Jamal', 'eng_manager@company.com', '+1122334466', '1982-04-12', 'Male', 'Married', (SELECT id FROM departments WHERE name = 'Field Operations'), (SELECT id FROM positions WHERE title = 'Team Leader'), (SELECT id FROM roles WHERE name = 'Manager'), 'Full-Time', 'Hebron', 'Palestine', 'active', NOW() - INTERVAL '1.5 years'),
((SELECT id FROM users WHERE email = 'field@company.com'), 'EMP007', 'John', 'Field', 'Walker', 'John Field', 'field@company.com', '+1555000111', '1988-11-30', 'Male', 'Single', (SELECT id FROM departments WHERE name = 'Field Operations'), (SELECT id FROM positions WHERE title = 'Field Supervisor'), (SELECT id FROM roles WHERE name = 'Manager'), 'Full-Time', 'Jenin', 'Palestine', 'active', NOW() - INTERVAL '8 months')
ON CONFLICT (employee_code) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    middle_name = EXCLUDED.middle_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    marital_status = EXCLUDED.marital_status,
    department_id = EXCLUDED.department_id,
    position_id = EXCLUDED.position_id,
    role_id = EXCLUDED.role_id,
    employment_type = EXCLUDED.employment_type,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    status = EXCLUDED.status,
    hired_at = EXCLUDED.hired_at;

-- Supervisor Links
UPDATE employees SET supervisor_id = (SELECT id FROM employees WHERE employee_code = 'EMP003') WHERE employee_code IN ('EMP004', 'EMP005', 'EMP006', 'EMP007');

-- 9. EMERGENCY CONTACTS
INSERT INTO emergency_contacts (employee_id, name, relationship, phone, alternate_phone, email, address) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Ali Alijla', 'Father', '+1234567899', '+0004567899', 'ali@example.com', '123 Main St, City'),
((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Kyle Reese', 'Husband', '+1987654322', '+1900054322', 'kyle@example.com', '456 Oak Ave, Town'),
((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Rachel Ross', 'Wife', '+1122334466', '+1120004466', 'rachel@example.com', '789 Pine Ln, Village'),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Harry Doe', 'Father', '+1555666778', '+155000666778', 'harry@example.com', '321 Elm St, Hamlet')
ON CONFLICT (employee_id) DO UPDATE SET
    name = EXCLUDED.name,
    relationship = EXCLUDED.relationship,
    phone = EXCLUDED.phone,
    alternate_phone = EXCLUDED.alternate_phone,
    email = EXCLUDED.email,
    address = EXCLUDED.address;

-- 10. LOCATIONS
INSERT INTO locations (name, address, latitude, longitude, location_type) VALUES
('Head Office', 'Gaza Office', 31.5000, 34.4667, 'Office'),
('School A', 'Hattin School', 31.5100, 34.4700, 'Field Site')
ON CONFLICT (name) DO NOTHING;

-- 11. ATTENDANCE
INSERT INTO attendance (employee_id, check_in_time, check_out_time, location_latitude, location_longitude, location_address, distance_from_base, gps_status, daily_status, work_type, approval_status) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP004'), '2025-12-07 08:00:00', '2025-12-07 16:02:00', 31.5000, 34.4667, 'Head Office', 0.00, 'Verified', 'Present', 'Office', 'approved'),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), '2025-12-08 10:05:00', '2025-12-08 16:20:00', 31.5005, 34.4670, 'School A', 150.00, 'Suspicious', 'Late', 'Office', 'pending'),
((SELECT id FROM employees WHERE employee_code = 'EMP003'), '2025-12-07 08:00:00', '2025-12-07 16:00:00', 31.5100, 34.4700, 'Hattin School', 51.00, 'Verified', 'Present', 'Field', 'approved');

-- 12. LEAVE REQUESTS
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, created_at, admin_notes) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Annual Leave', '2025-12-24', '2025-12-29', 'Family vacation during holidays', 'pending', '2025-12-14', NULL),
((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Sick Leave', '2025-12-19', '2025-12-21', 'Catch cold', 'rejected', '2025-12-18', 'Denied - critical client meetings scheduled'),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Annual Leave', '2025-12-17', '2025-12-19', 'Personal matters', 'approved', '2025-12-09', 'Approved - adequate coverage available'),
((SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Compensatory Time Off', '2026-01-01', '2026-01-05', 'Project completion bonus days', 'pending', '2026-01-01', NULL)
ON CONFLICT DO NOTHING;

-- 13. LEAVE BALANCES
INSERT INTO leave_balances (employee_id, leave_type, total_days, used_days) VALUES
((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Annual Leave', 20, 8),
((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Sick Leave', 10, 2),
((SELECT id FROM employees WHERE employee_code = 'EMP001'), 'Emergency Leave', 5, 1),
((SELECT id FROM employees WHERE employee_code = 'EMP002'), 'Annual Leave', 20, 5),
((SELECT id FROM employees WHERE employee_code = 'EMP003'), 'Annual Leave', 20, 10),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Annual Leave', 20, 3),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Sick Leave', 10, 0),
((SELECT id FROM employees WHERE employee_code = 'EMP004'), 'Emergency Leave', 5, 0),
((SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Annual Leave', 20, 0),
((SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Sick Leave', 10, 0),
((SELECT id FROM employees WHERE employee_code = 'EMP005'), 'Emergency Leave', 5, 0),
((SELECT id FROM employees WHERE employee_code = 'EMP006'), 'Annual Leave', 20, 2),
((SELECT id FROM employees WHERE employee_code = 'EMP007'), 'Annual Leave', 20, 4)
ON CONFLICT (employee_id, leave_type) DO UPDATE SET 
    total_days = EXCLUDED.total_days,
    used_days = EXCLUDED.used_days;
