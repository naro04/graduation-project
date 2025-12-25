const pool = require('../database/connection');

async function applyRBACMigration() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('--- Starting RBAC Migration ---');

        // 1. Rename Roles if they exist with old names
        const renameMap = {
            'Admin': 'Super Admin',
            'HR Manager': 'HR Admin',
            'Department Manager': 'Manager',
            'Employee': 'Field Worker'
        };

        for (const [oldName, newName] of Object.entries(renameMap)) {
            await client.query('UPDATE roles SET name = $1 WHERE name = $2', [newName, oldName]);
            console.log(`Renamed role ${oldName} to ${newName} (if it existed)`);
        }

        // Ensure all 5 roles exist (including Office Staff)
        const roles = ['Super Admin', 'HR Admin', 'Manager', 'Field Worker', 'Office Staff'];
        for (const role of roles) {
            await client.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [role]);
        }

        // 2. Insert All New Permissions (Menus & Actions)
        // I'll extract these from my previous dummy_data.sql update logic
        const permissions = [
            // Menus
            { slug: 'menu:dashboard', name: 'Dashboard' },
            { slug: 'menu:user_management', name: 'User Management' },
            { slug: 'menu:attendance', name: 'Attendance' },
            { slug: 'menu:activities', name: 'Activities' },
            { slug: 'menu:locations', name: 'Locations Management' },
            { slug: 'menu:leave', name: 'Leave Management' },
            { slug: 'menu:reports', name: 'Reports' },
            { slug: 'menu:my_team', name: 'My Team' },
            { slug: 'menu:more', name: 'More' },
            { slug: 'menu:logout', name: 'Log out' },
            // Sub Menus
            { slug: 'menu:users:employees', name: 'Employees' },
            { slug: 'menu:users:roles', name: 'Roles & Permissions' },
            { slug: 'menu:users:departments', name: 'Departments' },
            { slug: 'menu:attendance:daily', name: 'Daily Attendance' },
            { slug: 'menu:attendance:gps', name: 'GPS Verification' },
            { slug: 'menu:attendance:my', name: 'My Attendance' },
            { slug: 'menu:activities:all', name: 'All Activities' },
            { slug: 'menu:activities:approval', name: 'Activity Approval' },
            { slug: 'menu:activities:my', name: 'My Activities' },
            { slug: 'menu:activities:log', name: 'Log Activity' },
            { slug: 'menu:locations:list', name: 'Locations' },
            { slug: 'menu:locations:type', name: 'Location Type' },
            { slug: 'menu:locations:assignment', name: 'Location Assignment' },
            { slug: 'menu:leave:requests', name: 'Leave Requests' },
            { slug: 'menu:leave:req_self', name: 'Request Leave' },
            { slug: 'menu:leave:my', name: 'My Leave' },
            { slug: 'menu:reports:attendance', name: 'Attendance Reports' },
            { slug: 'menu:reports:field', name: 'Field Activity Reports' },
            { slug: 'menu:reports:leave', name: 'Leave Reports' },
            { slug: 'menu:reports:hr', name: 'HR Reports' },
            { slug: 'menu:reports:team', name: 'Team Reports' },
            { slug: 'menu:team:members', name: 'Team Members' },
            { slug: 'menu:team:attendance', name: 'Team Attendance' },
            { slug: 'menu:team:activities', name: 'Team Activities' },
            { slug: 'menu:team:leave', name: 'Team Leave Requests' },
            { slug: 'menu:more:profile', name: 'My Profile' },
            { slug: 'menu:more:sys_config', name: 'System Configuration' },
            { slug: 'menu:more:notifications', name: 'Notifications Settings' },
            { slug: 'menu:more:api_keys', name: 'API Keys' },
            { slug: 'menu:more:help', name: 'Help Center' },
            { slug: 'menu:more:support', name: 'Support' },
            // Actions
            { slug: 'user:view_all', name: 'View all employees' },
            { slug: 'user:create', name: 'Create employee' },
            { slug: 'user:edit', name: 'Edit employee' },
            { slug: 'user:delete', name: 'Disable/Delete employee' },
            { slug: 'user:assign_roles', name: 'Assign roles' },
            { slug: 'user:manage_depts', name: 'Manage departments' },
            { slug: 'attendance:view_all', name: 'View all attendance' },
            { slug: 'attendance:verify_gps', name: 'Verify GPS logs' },
            { slug: 'attendance:edit', name: 'Edit attendance' },
            { slug: 'attendance:delete', name: 'Delete attendance' },
            { slug: 'attendance:export', name: 'Export attendance data' },
            { slug: 'attendance:view_team', name: 'View team attendance' },
            { slug: 'attendance:view_my', name: 'View My attendance' },
            { slug: 'attendance:check_in_out', name: 'Check-in/Check-out' },
            { slug: 'activity:view_all', name: 'View all activities' },
            { slug: 'activity:approve_reject', name: 'Approve/Reject activities' },
            { slug: 'activity:edit', name: 'Edit activity' },
            { slug: 'activity:manage_templates', name: 'Manage activity templates' },
            { slug: 'activity:approve_team', name: 'Approve/Reject team activities' },
            { slug: 'activity:log_my', name: 'Log my activity' },
            { slug: 'activity:view_my', name: 'View my activities' },
            { slug: 'leave:view_all', name: 'View all leave requests' },
            { slug: 'leave:approve_reject', name: 'Approve/Reject leave' },
            { slug: 'leave:adjust_balance', name: 'Adjust leave balance' },
            { slug: 'leave:check_balance', name: 'Check leave balance' },
            { slug: 'leave:approve_team', name: 'Approve/Reject team leave requests' },
            { slug: 'leave:request_self', name: 'Request leave for self' },
            { slug: 'leave:view_my', name: 'View my leave status' },
            { slug: 'location:manage', name: 'Create/Edit/Delete locations' },
            { slug: 'location:assign_employees', name: 'Assign employees to locations' },
            { slug: 'location:manage_types', name: 'Manage location types' },
            { slug: 'report:export_hr', name: 'View/Export HR reports' },
            { slug: 'report:export_field', name: 'View/Export field activities reports' },
            { slug: 'report:export_attendance_leave', name: 'View/Export attendance, leave reports' },
            { slug: 'report:export_team', name: 'View/Export team reports' },
            { slug: 'system:access_config', name: 'Access full system configuration' },
            { slug: 'system:manage_notifications', name: 'Manage notification settings' },
            { slug: 'system:manage_api_keys', name: 'Generate/Delete API keys' },
            { slug: 'system:access_logs', name: 'Access system logs' }
        ];

        for (const p of permissions) {
            await client.query('INSERT INTO permissions (slug, display_name, permission_type) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING', [p.slug, p.name, p.slug.startsWith('menu:') ? 'menu' : 'action']);
        }

        // 3. Clear existing role_permissions for these roles to ensure fresh mapping
        console.log('Clearing old role-permission links...');
        const roleIdsRes = await client.query('SELECT id, name FROM roles');
        const roleMap = {};
        roleIdsRes.rows.forEach(r => roleMap[r.name] = r.id);

        await client.query('DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles)');

        // 4. Map Permissions (Same logic as dummy_data.sql)
        const mappings = {
            'Super Admin': 'ALL',
            'HR Admin': [
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
            ],
            'Manager': [
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
            ],
            'Field Worker': [
                'menu:dashboard', 'menu:attendance', 'menu:attendance:my',
                'menu:activities', 'menu:activities:my', 'menu:activities:log',
                'menu:leave', 'menu:leave:req_self', 'menu:leave:my',
                'menu:more', 'menu:more:profile', 'menu:more:help', 'menu:more:support', 'menu:logout',
                'attendance:view_my', 'attendance:check_in_out',
                'activity:log_my', 'activity:view_my',
                'leave:request_self', 'leave:view_my'
            ],
            'Office Staff': [
                'menu:dashboard', 'menu:attendance', 'menu:attendance:my',
                'menu:leave', 'menu:leave:req_self', 'menu:leave:my',
                'menu:more', 'menu:more:profile', 'menu:more:help', 'menu:more:support', 'menu:logout',
                'attendance:view_my', 'attendance:check_in_out',
                'leave:request_self', 'leave:view_my'
            ]
        };

        for (const [roleName, slugs] of Object.entries(mappings)) {
            const roleId = roleMap[roleName];
            if (!roleId) continue;

            if (slugs === 'ALL') {
                await client.query('INSERT INTO role_permissions (role_id, permission_id) SELECT $1, id FROM permissions', [roleId]);
            } else {
                for (const slug of slugs) {
                    await client.query(`
                        INSERT INTO role_permissions (role_id, permission_id)
                        SELECT $1, id FROM permissions WHERE slug = $2
                    `, [roleId, slug]);
                }
            }
            console.log(`Mapped permissions for ${roleName}`);
        }

        await client.query('COMMIT');
        console.log('--- Migration Successful ---');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration Failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

applyRBACMigration();
