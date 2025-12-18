const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, retrieveUserPermissions } = require("../../database/data/queries/auth");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

router.post("/login", async (req, res) => {
    const { email, emailOrId, password } = req.body;
    const identifier = emailOrId || email;

    if (!identifier || !password) {
        return res.status(400).json({ message: "Email/ID and password are required" });
    }

    try {
        // Support both email and employee_code login
        const loginQuery = `
            SELECT u.* 
            FROM users u 
            LEFT JOIN employees e ON u.id = e.user_id 
            WHERE u.email = $1 OR e.employee_code = $1;
        `;
        const { rows } = await pool.query(loginQuery, [identifier]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Fetch permissions
        const permResult = await pool.query(retrieveUserPermissions, [user.id]);
        user.permissions = permResult.rows.map(row => row.slug);

        // Remove sensitive data
        delete user.password_hash;

        const token = signToken(user.id);

        res.cookie('token', token, {
            expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 24) * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            user: user
        });

    } catch (err) {
        console.error('Legacy Login Error:', err);
        res.status(500).json({ message: "Internal server error during login" });
    }
});

module.exports = router;
