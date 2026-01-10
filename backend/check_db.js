const pool = require('./database/connection');

(async () => {
    try {
        console.log('\n📊 Checking database status...\n');

        // Check tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in database:', tables.rows.length > 0 
            ? tables.rows.map(r => r.table_name).join(', ') 
            : 'NONE');

        if (tables.rows.length === 0) {
            console.log('\n⚠️  Database is EMPTY - no tables exist');
            console.log('👉 Run: npm run db:build');
            process.exit(0);
        }

        // Check record counts
        const checks = [
            { name: 'Users', table: 'users' },
            { name: 'Employees', table: 'employees' },
            { name: 'Attendance', table: 'attendance' },
            { name: 'Departments', table: 'departments' },
            { name: 'Locations', table: 'locations' }
        ];

        console.log('\n📋 Record counts:');
        let hasData = false;
        for (const check of checks) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${check.table}`);
                const count = parseInt(result.rows[0].count);
                console.log(`   ${check.name}: ${count} records`);
                if (count > 0) hasData = true;
            } catch (e) {
                console.log(`   ${check.name}: table not found`);
            }
        }

        // Check if attendance table has the new columns
        console.log('\n🔍 Checking attendance table columns:');
        const columns = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'attendance'
        `);
        const columnNames = columns.rows.map(r => r.column_name);
        console.log('   Columns:', columnNames.join(', '));
        
        const hasCheckInMethod = columnNames.includes('check_in_method');
        const hasCheckOutMethod = columnNames.includes('check_out_method');
        
        console.log(`   check_in_method: ${hasCheckInMethod ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`   check_out_method: ${hasCheckOutMethod ? '✅ EXISTS' : '❌ MISSING'}`);

        // Recommendation
        console.log('\n💡 Recommendation:');
        if (!hasCheckInMethod || !hasCheckOutMethod) {
            if (hasData) {
                console.log('   You have data - run: npm run db:migrate');
            } else {
                console.log('   No data yet - run: npm run db:reset');
            }
        } else {
            console.log('   ✅ Database is up to date!');
        }

        process.exit(0);
    } catch (e) {
        console.log('Error:', e.message);
        process.exit(1);
    }
})();

