const bcrypt = require('bcrypt');
const pool = require('./database/connection');

async function resetPassword() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 12);
        console.log('🔄 Resetting password for hrsystem.project26@gmail.com...');
        await pool.query("UPDATE users SET password_hash = $1 WHERE email = 'hrsystem.project26@gmail.com'", [hashedPassword]);
        console.log('✅ Password reset successful!');
    } catch (err) {
        console.error('❌ Reset failed:', err.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
