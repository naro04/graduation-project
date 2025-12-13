const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getAccountSecuirtyQuery } = require("../../database/data/queries/employees");

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Check if password is provided
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        // NOTE: In a production environment, you MUST hash the password before storing it.
        // Example with bcrypt: const hash = await bcrypt.hash(password, 10);
        // For now, passing the plain password as requested by the query interface.
        const passwordHash = password;

        const { rows } = await pool.query(getAccountSecuirtyQuery, [id, passwordHash]);

        // The query returns the ID if successful
        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Account security updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating account security" });
    }
});

module.exports = router;
