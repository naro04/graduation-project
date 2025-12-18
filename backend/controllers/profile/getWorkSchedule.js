const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getWorkScheduleQuery } = require("../../database/data/queries/profile");

router.get("/", async (req, res) => {
    const id = req.user.id;
    const { startDate, endDate } = req.query;

    // Validate date range parameters
    if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate query parameters are required" });
    }

    try {
        const { rows } = await pool.query(getWorkScheduleQuery, [id, startDate, endDate]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching work schedule", error: err.message });
    }
});

module.exports = router;
