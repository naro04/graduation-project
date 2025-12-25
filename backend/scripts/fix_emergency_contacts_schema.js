const pool = require('../database/connection');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('--- Fixing Emergency Contacts Schema ---');

        // 1. Add missing columns if they don't exist
        await client.query(`
            ALTER TABLE emergency_contacts 
            ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS email TEXT,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        // 2. Add Unique Constraint on employee_id if not exists
        // We can use an anonymous block or just try/catch if it fails (using IF NOT EXISTS logic via a check)
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'emergency_contacts_employee_id_key'
                ) THEN
                    ALTER TABLE emergency_contacts ADD CONSTRAINT emergency_contacts_employee_id_key UNIQUE (employee_id);
                END IF;
            END $$;
        `);
        console.log('✅ Unique constraint and columns verified.');

        // 2. Verify columns
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'emergency_contacts'
        `);
        console.log('Current columns:', res.rows.map(r => r.column_name).join(', '));

        console.log('--- Migration Complete ---');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
