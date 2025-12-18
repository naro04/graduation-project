const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getAccountSecurityQuery } = require("../../database/data/queries/profile");

const bcrypt = require("bcrypt");

router.put("/", async (req, res) => {
    const id = req.user.id;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const { rows } = await pool.query(getAccountSecurityQuery, [id, hashedPassword]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Account security updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating account security" });
    }
});

module.exports = router;
