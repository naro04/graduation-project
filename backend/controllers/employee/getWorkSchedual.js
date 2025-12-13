const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getWorkSchedualQuery } = require("../../database/data/queries/employees");

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Validate date range parameters
    if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate query parameters are required" });
    }

    try {
        const { rows } = await pool.query(getWorkSchedualQuery, [id, startDate, endDate]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching work schedule" });
    }
});

module.exports = router;
