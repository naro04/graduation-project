const pool = require('./database/connection');

async function debugAdmin() {
    try {
        console.log('🔍 Debugging Admin User...');
        const res = await pool.query("SELECT id, email, password_hash, name FROM users WHERE email = 'hrsystem.project26@gmail.com'");
        if (res.rows.length === 0) {
            console.log('❌ User hrsystem.project26@gmail.com not found!');
        } else {
            const user = res.rows[0];
            console.log('✅ User found:', {
                id: user.id,
                email: user.email,
                name: user.name,
                has_password: !!user.password_hash
            });

            const roles = await pool.query("SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1", [user.id]);
            console.log('🎭 Roles:', roles.rows.map(r => r.name));
        }
    } catch (err) {
        console.error('❌ Debug failed:', err.message);
    } finally {
        await pool.end();
    }
}

debugAdmin();
