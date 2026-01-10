const pool = require('../connection');

const runMigration = async () => {
    try {
        console.log('Running migration: Adding check_in_method and check_out_method columns...');

        // Add check_in_method column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'attendance' AND column_name = 'check_in_method'
                ) THEN
                    ALTER TABLE attendance ADD COLUMN check_in_method VARCHAR(20) DEFAULT 'GPS';
                END IF;
            END $$;
        `);
        console.log('✓ check_in_method column added/verified');

        // Add check_out_method column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'attendance' AND column_name = 'check_out_method'
                ) THEN
                    ALTER TABLE attendance ADD COLUMN check_out_method VARCHAR(20);
                END IF;
            END $$;
        `);
        console.log('✓ check_out_method column added/verified');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
};

runMigration();

