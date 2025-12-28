const pool = require('./connection');

const permissions = [
    // Menu Access (Left Column)
    { resource: 'Dashboard', action: 'access', permission_type: 'menu_access', sort_order: 10 },

    { resource: 'User Management', action: 'Employees', permission_type: 'menu_access', sort_order: 20 },
    { resource: 'User Management', action: 'Roles & Permissions', permission_type: 'menu_access', sort_order: 21 },
    { resource: 'User Management', action: 'Departments', permission_type: 'menu_access', sort_order: 22 },

    { resource: 'Attendance', action: 'Daily Attendance', permission_type: 'menu_access', sort_order: 30 },
    { resource: 'Attendance', action: 'GPS Verification', permission_type: 'menu_access', sort_order: 31 },
    { resource: 'Attendance', action: 'My Attendance', permission_type: 'menu_access', sort_order: 32 },

    { resource: 'Activities', action: 'All Activities', permission_type: 'menu_access', sort_order: 40 },
    { resource: 'Activities', action: 'Activity Approval', permission_type: 'menu_access', sort_order: 41 },
    { resource: 'Activities', action: 'My Activities', permission_type: 'menu_access', sort_order: 42 },
    { resource: 'Activities', action: 'Log Activity', permission_type: 'menu_access', sort_order: 43 },

    { resource: 'Locations Management', action: 'Locations', permission_type: 'menu_access', sort_order: 50 },
    { resource: 'Locations Management', action: 'Location Type', permission_type: 'menu_access', sort_order: 51 },
    { resource: 'Locations Management', action: 'Location Assignment', permission_type: 'menu_access', sort_order: 52 },

    { resource: 'Leave Management', action: 'Leave Requests', permission_type: 'menu_access', sort_order: 60 },
    { resource: 'Leave Management', action: 'Request Leave', permission_type: 'menu_access', sort_order: 61 },
    { resource: 'Leave Management', action: 'My Leave', permission_type: 'menu_access', sort_order: 62 },

    { resource: 'Reports', action: 'Attendance Reports', permission_type: 'menu_access', sort_order: 70 },
    { resource: 'Reports', action: 'Field Activity Reports', permission_type: 'menu_access', sort_order: 71 },
    { resource: 'Reports', action: 'Leave Reports', permission_type: 'menu_access', sort_order: 72 },
    { resource: 'Reports', action: 'HR Reports', permission_type: 'menu_access', sort_order: 73 },
    { resource: 'Reports', action: 'Team Reports', permission_type: 'menu_access', sort_order: 74 },

    { resource: 'My Team', action: 'Team Members', permission_type: 'menu_access', sort_order: 80 },
    { resource: 'My Team', action: 'Team Attendance', permission_type: 'menu_access', sort_order: 81 },
    { resource: 'My Team', action: 'Team Activites', permission_type: 'menu_access', sort_order: 82 }, // Typo as in screenshot
    { resource: 'My Team', action: 'Team Leave Reaquest', permission_type: 'menu_access', sort_order: 83 }, // Typo as in screenshot

    { resource: 'More', action: 'My Profile', permission_type: 'menu_access', sort_order: 90 },
    { resource: 'More', action: 'System Configuration', permission_type: 'menu_access', sort_order: 91 },
    { resource: 'More', action: 'Notifications Settings', permission_type: 'menu_access', sort_order: 92 },
    { resource: 'More', action: 'API Keys', permission_type: 'menu_access', sort_order: 93 },
    { resource: 'More', action: 'Help Center', permission_type: 'menu_access', sort_order: 94 },
    { resource: 'More', action: 'Support', permission_type: 'menu_access', sort_order: 95 },

    { resource: 'Log out', action: 'access', permission_type: 'menu_access', sort_order: 100 },

    // Action Permissions (Right Column)
    { resource: 'User Actions', action: 'View all employees', permission_type: 'action', sort_order: 110 },
    { resource: 'User Actions', action: 'Create employee', permission_type: 'action', sort_order: 111 },
    { resource: 'User Actions', action: 'Edit employee', permission_type: 'action', sort_order: 112 },
    { resource: 'User Actions', action: 'Disable/Delete employee', permission_type: 'action', sort_order: 113 },
    { resource: 'User Actions', action: 'Assign roles', permission_type: 'action', sort_order: 114 },
    { resource: 'User Actions', action: 'Manage departments', permission_type: 'action', sort_order: 115 },

    { resource: 'Attendance Actions', action: 'View all attendance', permission_type: 'action', sort_order: 120 },
    { resource: 'Attendance Actions', action: 'Verify GPS logs', permission_type: 'action', sort_order: 121 },
    { resource: 'Attendance Actions', action: 'Edit attendance', permission_type: 'action', sort_order: 122 },
    { resource: 'Attendance Actions', action: 'Delete attendance', permission_type: 'action', sort_order: 123 },
    { resource: 'Attendance Actions', action: 'Export attendance data', permission_type: 'action', sort_order: 124 },
    { resource: 'Attendance Actions', action: 'View team attendance', permission_type: 'action', sort_order: 125 },
    { resource: 'Attendance Actions', action: 'View My attendance', permission_type: 'action', sort_order: 126 },
    { resource: 'Attendance Actions', action: 'Check-in/Check-out', permission_type: 'action', sort_order: 127 },

    { resource: 'Activity Actions', action: 'View all activities', permission_type: 'action', sort_order: 130 },
    { resource: 'Activity Actions', action: 'Approve/Reject activities', permission_type: 'action', sort_order: 131 },
    { resource: 'Activity Actions', action: 'Edit activity', permission_type: 'action', sort_order: 132 },
    { resource: 'Activity Actions', action: 'Manage activity templates', permission_type: 'action', sort_order: 133 },
    { resource: 'Activity Actions', action: 'Approve/Reject team activities', permission_type: 'action', sort_order: 134 },
    { resource: 'Activity Actions', action: 'Log my activity', permission_type: 'action', sort_order: 135 },
    { resource: 'Activity Actions', action: 'View my activities', permission_type: 'action', sort_order: 136 },

    { resource: 'Leave Actions', action: 'View all leave requests', permission_type: 'action', sort_order: 140 },
    { resource: 'Leave Actions', action: 'Approve/Reject leave', permission_type: 'action', sort_order: 141 },
    { resource: 'Leave Actions', action: 'Adjust leave balance', permission_type: 'action', sort_order: 142 },
    { resource: 'Leave Actions', action: 'Check leave balance', permission_type: 'action', sort_order: 143 },
    { resource: 'Leave Actions', action: 'Approve/Reject team leave requests', permission_type: 'action', sort_order: 144 },
    { resource: 'Leave Actions', action: 'Request leave for self', permission_type: 'action', sort_order: 145 },
    { resource: 'Leave Actions', action: 'View my leave status', permission_type: 'action', sort_order: 146 },

    { resource: 'Locations Actions', action: 'Create/Edit/Delete locations', permission_type: 'action', sort_order: 150 },
    { resource: 'Locations Actions', action: 'Assign employees to locations', permission_type: 'action', sort_order: 151 },
    { resource: 'Locations Actions', action: 'Manage location types', permission_type: 'action', sort_order: 152 },

    { resource: 'Reports Actions', action: 'View/Export HR reports', permission_type: 'action', sort_order: 160 },
    { resource: 'Reports Actions', action: 'View/Export field activites reports', permission_type: 'action', sort_order: 161 }, // Typo as in screenshot
    { resource: 'Reports Actions', action: 'View/Export attendance, leave reports', permission_type: 'action', sort_order: 162 },
    { resource: 'Reports Actions', action: 'View/Export team reports', permission_type: 'action', sort_order: 163 },

    { resource: 'System Actions', action: 'Access full system configuration', permission_type: 'action', sort_order: 170 },
    { resource: 'System Actions', action: 'Manage notification settings', permission_type: 'action', sort_order: 171 },
    { resource: 'System Actions', action: 'Generate/Delete API keys', permission_type: 'action', sort_order: 172 },
    { resource: 'System Actions', action: 'Access system logs', permission_type: 'action', sort_order: 173 }
];

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Clearing old permissions...');
        await client.query('TRUNCATE permissions CASCADE');

        console.log('Seeding permissions...');
        for (const p of permissions) {
            const slug = `${p.resource.toLowerCase().replace(/ /g, '_')}:${p.action.toLowerCase().replace(/ /g, '_')}`;
            const displayName = p.action === 'access' ? p.resource : p.action;

            await client.query(`
        INSERT INTO permissions (resource, action, permission_type, slug, display_name, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [p.resource, p.action, p.permission_type, slug, displayName, p.sort_order]);
        }

        // Assign all to Super Admin
        const superAdminRole = await client.query("SELECT id FROM roles WHERE name = 'Super Admin'");
        if (superAdminRole.rows.length > 0) {
            const roleId = superAdminRole.rows[0].id;
            const allPerms = await client.query("SELECT id FROM permissions");
            for (const perm of allPerms.rows) {
                await client.query(`
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [roleId, perm.id]);
            }
        }

        await client.query('COMMIT');
        console.log('Successfully seeded permissions and updated Super Admin!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error seeding:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
