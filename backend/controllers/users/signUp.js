const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../../database/connection");
const { createUser, findUserByEmail, assignRole, findRoleByName } = require("../../database/data/queries/auth");

router.post("/signup", async (req, res) => {
    const { email, password, confirm_password, first_name, last_name, phone } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail || !password || !first_name || !last_name || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    const client = await pool.connect();
    try {
        // Check if user exists
        const existingUser = await client.query(findUserByEmail, [normalizedEmail]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const full_name = `${first_name} ${last_name}`;

        await client.query('BEGIN');

        // Create user
        const newUserResult = await client.query(createUser, [full_name, normalizedEmail, hashedPassword]);
        const newUser = newUserResult.rows[0];

        // Assign Default Role
        const defaultRole = await client.query(findRoleByName, ['Employee']);
        if (defaultRole.rows.length > 0) {
            await client.query(assignRole, [newUser.id, defaultRole.rows[0].id]);
        }

        // Create employee record
        const employee_code = `EMP-${Date.now()}`;
        await client.query(`
            INSERT INTO employees (user_id, email, first_name, last_name, full_name, phone, employee_code)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [newUser.id, normalizedEmail, first_name, last_name, full_name, phone, employee_code]);

        await client.query('COMMIT');

        res.status(201).json({
            status: "success",
            message: "User created successfully",
            userId: newUser.id
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Legacy Signup Error:', err);
        res.status(500).json({ message: "Internal server error during signup" });
    } finally {
        client.release();
    }
});

module.exports = router;
