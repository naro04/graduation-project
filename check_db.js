const { Pool } = require('pg');
const connectionString = 'postgresql://postgres:XSUDKjJmfuJDZfOVPTTZwcRGuEXdOqbk@shuttle.proxy.rlwy.net:39733/railway';

const pool = new Pool({
    connectionString: connectionString
});

async function check() {
    try {
        console.log('Checking database content...');
        
        const activities = await pool.query('SELECT * FROM activities LIMIT 2');
        console.log('Activities (Sample):', JSON.stringify(activities.rows, null, 2));

        const leaves = await pool.query('SELECT * FROM leave_requests LIMIT 2');
        console.log('Leave Requests (Sample):', JSON.stringify(leaves.rows, null, 2));

        const leaves_count = await pool.query('SELECT COUNT(*) FROM leave_requests');
        console.log('Total Leave Requests:', leaves_count.rows[0].count);

        const employees_count = await pool.query('SELECT COUNT(*) FROM employees');
        console.log('Total Employees:', employees_count.rows[0].count);

        if (leaves_count.rows[0].count > 0) {
            const leave_emp_ids = await pool.query('SELECT DISTINCT employee_id FROM leave_requests');
            const emp_ids = await pool.query('SELECT id FROM employees');
            console.log('Employee IDs in leaves:', leave_emp_ids.rows.map(r => r.employee_id));
            console.log('First 5 Employee IDs in employees:', emp_ids.rows.slice(0, 5).map(r => r.id));
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error during DB check:', err);
        process.exit(1);
    }
}

check();
