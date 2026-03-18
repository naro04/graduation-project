const { Pool } = require('c:/Users/PC/Desktop/graduation-project/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:XSUDKjJmfuJDZfOVPTTZwcRGuEXdOqbk@shuttle.proxy.rlwy.net:39733/railway' });

async function check() {
    try {
        const locations = await pool.query("SELECT id, name, latitude, longitude FROM locations");
        console.log('\nLocations with Coordinates:');
        console.log(JSON.stringify(locations.rows, null, 2));

        const sample = await pool.query("SELECT location_address, location_latitude, location_longitude FROM attendance WHERE location_latitude IS NOT NULL LIMIT 5");
        console.log('\nSample Attendance GPS data:');
        console.log(JSON.stringify(sample.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
