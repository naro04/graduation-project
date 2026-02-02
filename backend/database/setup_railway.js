const pool = require('./connection');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('🔄 Verifying database connection...');
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Connected to:', process.env.DATABASE_URL.split('@')[1] || 'Unknown Host');
        console.log('⏰ Database Time:', result.rows[0].now);
        console.log('');

        // 1. Run schema.sql
        console.log('🔄 Step 1: Creating tables (schema.sql)...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'data/schema.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('✅ Tables created/verified!\n');

        // 1.5 Patch existing schema (for cases where table already existed without UNIQUE constraint)
        console.log('🔄 Step 1.5: Patching existing schema for idempotency...');
        try {
            await pool.query(`
                -- Cleanup duplicate locations (PostgreSQL compatible way for UUIDs)
                DELETE FROM locations a 
                USING locations b 
                WHERE a.id < b.id AND a.name = b.name;
                
                -- Add unique constraint if not exists
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'locations_name_key') THEN
                        ALTER TABLE locations ADD CONSTRAINT locations_name_key UNIQUE (name);
                    END IF;

                    -- Add missing columns to employees table
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'city') THEN
                        ALTER TABLE employees ADD COLUMN city TEXT;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'country') THEN
                        ALTER TABLE employees ADD COLUMN country TEXT;
                    END IF;
                END $$;
            `);
            console.log('✅ Schema patches applied!\n');
        } catch (err) {
            console.error('❌ Error in Step 1.5:', err.message);
            throw err;
        }

        // 2. Run dummy_data.sql
        console.log('🔄 Step 2: Seeding initial core data (dummy_data.sql)...');
        const dummySQL = fs.readFileSync(path.join(__dirname, 'data/dummy_data.sql'), 'utf8');
        await pool.query(dummySQL);
        console.log('✅ Core data seeded/verified!\n');

        // 3. Run migrations
        console.log('🔄 Step 3: Running migrations...');
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            console.log(`   Running: ${file}...`);
            const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            try {
                await pool.query(migrationSQL);
                console.log(`   ✅ ${file} completed`);
            } catch (err) {
                // Ignore errors that suggest columns/tables already exist
                if (err.message.includes('already exists') || err.message.includes('already a column')) {
                    console.log(`   ℹ️ ${file} (Already applied)`);
                } else {
                    console.error(`   ❌ ${file} error:`, err.message);
                }
            }
        }
        console.log('✅ Migrations completed!\n');

        // 4. Verification
        console.log('🔄 Step 4: Verifying seeded data...');
        const verifyResult = await pool.query(`
            SELECT u.email, r.name as role, e.employee_code 
            FROM users u 
            LEFT JOIN user_roles ur ON u.id = ur.user_id 
            LEFT JOIN roles r ON ur.role_id = r.id 
            LEFT JOIN employees e ON u.id = e.user_id;
        `);
        console.table(verifyResult.rows);

        console.log('\n🎉 Database setup complete!');
        console.log('\n📝 Initial Demo Accounts:');
        console.log('   Email: hrsystem.project26@gmail.com    Password: password123 (Super Admin)');
        console.log('   Email: hr@company.com                  Password: password123 (HR Admin)');
        console.log('   Email: manager@company.com             Password: password123 (Manager)');

    } catch (err) {
        console.error('❌ Critical Error during setup:', err.message);
    } finally {
        await pool.end();
    }
}

setupDatabase();




