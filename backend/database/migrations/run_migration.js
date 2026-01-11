const fs = require('fs');
const path = require('path');
const pool = require('../connection');

const runMigrations = async () => {
    try {
        console.log('Starting database migrations...');

        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of files) {
            console.log(`Running migration: ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            await pool.query(sql);
            console.log(`✓ Migration ${file} completed successfully`);
        }

        // Backward compatibility for the hardcoded columns if they aren't in a file yet
        // (Though better to move them to a file)

        console.log('All migrations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

runMigrations();

