const { Pool } = require('c:/Users/PC/Desktop/graduation-project/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:XSUDKjJmfuJDZfOVPTTZwcRGuEXdOqbk@shuttle.proxy.rlwy.net:39733/railway' });

async function check() {
    try {
        console.log('--- Attendance Records (Recent) ---');
        const attendance = await pool.query(`
            SELECT a.id, e.full_name, a.location_address, a.location_latitude, a.location_longitude, a.check_in_time 
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY a.check_in_time DESC
            LIMIT 20
        `);
        console.log(JSON.stringify(attendance.rows, null, 2));

        console.log('\n--- Locations Table (All) ---');
        const locations = await pool.query("SELECT id, name, address, latitude, longitude FROM locations");
        console.log(JSON.stringify(locations.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
