const { Pool } = require('c:/Users/PC/Desktop/graduation-project/backend/node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:XSUDKjJmfuJDZfOVPTTZwcRGuEXdOqbk@shuttle.proxy.rlwy.net:39733/railway' });

async function check() {
    try {
        const query = `
            SELECT 
                a.daily_status,
                a.check_out_time,
                (CASE
                    WHEN a.check_out_time IS NULL THEN
                        CASE
                            WHEN (EXTRACT(EPOCH FROM (NOW() - a.check_in_time)) / 3600) > 9 OR EXTRACT(HOUR FROM NOW()) >= 17 THEN 'Missing Check-out'
                            ELSE 'In progress'
                        END
                    WHEN a.check_out_time IS NOT NULL AND EXTRACT(HOUR FROM a.check_out_time) < 16 THEN
                        CASE
                            WHEN a.daily_status = 'Late' THEN 'Late'
                            ELSE 'Early Leave'
                        END
                    ELSE COALESCE(a.daily_status, 'Present')
                END) as computed_status
            FROM attendance a
            LIMIT 10
        `;
        const result = await pool.query(query);
        console.log('Sample Computed Statuses:');
        console.log(JSON.stringify(result.rows, null, 2));

        // Test filtering by 'Present'
        const filterQuery = `
            SELECT COUNT(*) 
            FROM attendance a
            WHERE (CASE
                    WHEN a.check_out_time IS NULL THEN
                        CASE
                            WHEN (EXTRACT(EPOCH FROM (NOW() - a.check_in_time)) / 3600) > 9 OR EXTRACT(HOUR FROM NOW()) >= 17 THEN 'Missing Check-out'
                            ELSE 'In progress'
                        END
                    WHEN a.check_out_time IS NOT NULL AND EXTRACT(HOUR FROM a.check_out_time) < 16 THEN
                        CASE
                            WHEN a.daily_status = 'Late' THEN 'Late'
                            ELSE 'Early Leave'
                        END
                    ELSE COALESCE(a.daily_status, 'Present')
                END) = 'Present'
        `;
        const filterResult = await pool.query(filterQuery);
        console.log('\nCount for Present filter:', filterResult.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
