const pool = require('../database/connection');

const createTableRequest = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating emergency_contacts table...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS emergency_contacts (
                id SERIAL PRIMARY KEY,
                employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                relationship VARCHAR(100),
                phone VARCHAR(50),
                alternate_phone VARCHAR(50),
                address TEXT,
                email VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(employee_id) -- Assuming 1 contact per employee for now based on UI, or valid for a primary contact
            );
        `;

        await client.query(createTableQuery);

        console.log('emergency_contacts table created successfully.');
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating table:', err);
    } finally {
        client.release();
        pool.end();
    }
};

createTableRequest();
