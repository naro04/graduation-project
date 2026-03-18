const { Pool } = require('c:/Users/PC/Desktop/graduation-project/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:XSUDKjJmfuJDZfOVPTTZwcRGuEXdOqbk@shuttle.proxy.rlwy.net:39733/railway' });

async function check() {
    try {
        const columns = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'attendance'");
        console.log('Columns in attendance table:');
        console.log(JSON.stringify(columns.rows, null, 2));

        const locations = await pool.query("SELECT id, name FROM locations");
        console.log('\nLocations:');
        console.log(JSON.stringify(locations.rows, null, 2));

        const sample = await pool.query("SELECT location_address FROM attendance LIMIT 20");
        console.log('\nSample Addresses:');
        console.log(JSON.stringify(sample.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
