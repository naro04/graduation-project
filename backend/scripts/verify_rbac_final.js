const pool = require('../database/connection');

async function verifyRolesAndPermissions() {
    console.log('--- Verifying Role & Permission Mapping ---');

    try {
        // 1. Check Role Names
        const rolesRes = await pool.query('SELECT name FROM roles ORDER BY name');
        const roles = rolesRes.rows.map(r => r.name);
        console.log('Roles found:', roles);

        const expectedRoles = ['Field Worker', 'HR Admin', 'Manager', 'Office Staff', 'Super Admin'];
        const missingRoles = expectedRoles.filter(r => !roles.includes(r));
        if (missingRoles.length > 0) {
            console.error('FAIL: Missing roles:', missingRoles);
        } else {
            console.log('PASS: All 5 roles exist.');
        }

        // 2. Check Permissions for HR Admin (Image 1 Sample)
        const hrAdminPermsRes = await pool.query(`
            SELECT p.slug FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN roles r ON rp.role_id = r.id
            WHERE r.name = 'HR Admin'
        `);
        const hrPerms = hrAdminPermsRes.rows.map(p => p.slug);

        console.log('\nChecking HR Admin Permissions:');
        const hrShouldHave = ['user:create', 'attendance:verify_gps', 'leave:approve_reject', 'activity:view_all'];
        const hrShouldNotHave = ['menu:users:roles', 'location:manage', 'system:access_config'];

        hrShouldHave.forEach(p => {
            if (hrPerms.includes(p)) console.log(`[OK] Has ${p}`);
            else console.error(`[FAIL] Missing ${p}`);
        });

        hrShouldNotHave.forEach(p => {
            if (!hrPerms.includes(p)) console.log(`[OK] Does NOT have ${p}`);
            else console.error(`[FAIL] Should not have ${p}`);
        });

        // 3. Check Permissions for Manager (Image 2 Sample)
        const managerPermsRes = await pool.query(`
            SELECT p.slug FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN roles r ON rp.role_id = r.id
            WHERE r.name = 'Manager'
        `);
        const managerPerms = managerPermsRes.rows.map(p => p.slug);

        console.log('\nChecking Manager Permissions:');
        const managerShouldHave = ['menu:my_team', 'activity:approve_team', 'attendance:view_team'];
        const managerShouldNotHave = ['user:create', 'location:manage'];

        managerShouldHave.forEach(p => {
            if (managerPerms.includes(p)) console.log(`[OK] Has ${p}`);
            else console.error(`[FAIL] Missing ${p}`);
        });

        managerShouldNotHave.forEach(p => {
            if (!managerPerms.includes(p)) console.log(`[OK] Does NOT have ${p}`);
            else console.error(`[FAIL] Should not have ${p}`);
        });

    } catch (err) {
        console.error('Error during verification:', err);
    } finally {
        pool.end();
    }
}

verifyRolesAndPermissions();
