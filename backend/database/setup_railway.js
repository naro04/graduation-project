const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use DATABASE_URL from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await pool.query('SELECT NOW()');
        console.log('✅ Connected!\n');

        // Run schema.sql
        console.log('🔄 Creating tables (schema.sql)...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'data/schema.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('✅ Tables created!\n');

        // Run dummy_data.sql
        console.log('🔄 Seeding data (dummy_data.sql)...');
        const dummySQL = fs.readFileSync(path.join(__dirname, 'data/dummy_data.sql'), 'utf8');
        await pool.query(dummySQL);
        console.log('✅ Data seeded!\n');

        // Run migrations
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
        
        for (const file of migrationFiles) {
            console.log(`🔄 Running migration: ${file}...`);
            const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            try {
                await pool.query(migrationSQL);
                console.log(`✅ ${file} completed`);
            } catch (err) {
                console.log(`⚠️ ${file}: ${err.message} (may already exist)`);
            }
        }

        console.log('\n🎉 Database setup complete!');
        console.log('\n📝 Test accounts:');
        console.log('   admin@company.com / password123');
        console.log('   hr@company.com / password123');
        console.log('   manager@company.com / password123');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

setupDatabase();



