const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getPersonalInfoQuery } = require("../../database/data/queries/employees");

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { rows } = await pool.query(getPersonalInfoQuery, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching personal info" });
    }
});

module.exports = router;
