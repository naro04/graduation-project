const pool = require('./backend/database/connection');

const seedDesignData = async () => {
    try {
        console.log('--- Seeding Dynamic Role-Position Data ---');

        // 1. Departments
        const depts = ['HR', 'Field Operations', 'Office', 'Project Management', 'Finance', 'IT'];
        const deptMap = {};
        for (const name of depts) {
            const res = await pool.query('INSERT INTO departments (name, status) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET status = $2 RETURNING id', [name, 'active']);
            deptMap[name] = res.rows[0].id;
        }
        console.log('Departments seeded.');

        // 2. Roles (Employee Type)
        const roles = ['Super Admin', 'HR Admin', 'Manager', 'Field Worker', 'Office Staff'];
        const roleMap = {};
        for (const name of roles) {
            const res = await pool.query('INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = $2 RETURNING id', [name, `${name} role`]);
            roleMap[name] = res.rows[0].id;
        }
        console.log('Roles seeded.');

        // 3. Positions (No unique constraint on title alone, so we check existence)
        const mapping = [
            { role: 'HR Admin', dept: 'HR', titles: ['HR Manager'] },
            { role: 'Manager', dept: 'Project Management', titles: ['Project Manager', 'Team Leader', 'Field Supervisor'] },
            { role: 'Field Worker', dept: 'Field Operations', titles: ['Activity Facilitator', 'Trainer', 'Social Worker'] },
            { role: 'Office Staff', dept: 'Office', titles: ['Administrative Assistant', 'Data Entry', 'Office Coordinator'] },
            { role: 'Super Admin', dept: 'IT', titles: ['System Administration'] }
        ];

        for (const m of mapping) {
            const deptId = deptMap[m.dept];
            for (const title of m.titles) {
                const exists = await pool.query('SELECT id FROM positions WHERE title = $1', [title]);
                if (exists.rows.length === 0) {
                    await pool.query('INSERT INTO positions (title, department_id) VALUES ($1, $2)', [title, deptId]);
                } else {
                    await pool.query('UPDATE positions SET department_id = $1 WHERE title = $2', [deptId, title]);
                }
            }
        }

        console.log('Positions and Mappings seeded successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
};

seedDesignData();
