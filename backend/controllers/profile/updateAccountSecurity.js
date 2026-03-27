const pool = require("../../database/connection");
const { getAccountSecurityQuery } = require("../../database/data/queries/profile");
const bcrypt = require("bcrypt");

// GET logic - returns basic security info if needed
exports.getAccountSecurity = async (req, res) => {
    try {
        const id = req.user.id;
        const userRes = await pool.query("SELECT password_hash FROM users WHERE id = $1", [id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the password starts with a bcrypt prefix ($2b$ or $2a$)
        const hash = userRes.rows[0].password_hash || '';
        const isSocial = !hash.startsWith('$2');

        res.status(200).json({ 
            message: "Security settings retrieved",
            hasPassword: !!hash,
            isSocialAccount: isSocial
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching security settings", error: err.message });
    }
};

// PUT logic - updates the password
exports.updateAccountSecurity = async (req, res) => {
    const id = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: "New password and confirmation are required" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New password and confirmation do not match" });
    }

    try {
        // 1. Get current password hash
        const userRes = await pool.query("SELECT password_hash FROM users WHERE id = $1", [id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userRes.rows[0];
        const currentHash = user.password_hash;

        // 2. Check if we need to verify the old password
        // If the current hash is a bcrypt hash, we MUST verify it.
        if (currentHash && currentHash.startsWith('$2')) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Your current password is required to set a new one" });
            }
            
            const isMatch = await bcrypt.compare(currentPassword, currentHash);
            if (!isMatch) {
                return res.status(400).json({ message: "The current password you entered is incorrect" });
            }
        }

        // 3. Hash new password and update
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        await pool.query(getAccountSecurityQuery, [id, hashedPassword]);

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error('Update security error:', err);
        res.status(500).json({ message: "Error updating account security", error: err.message });
    }
};
