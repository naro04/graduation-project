const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getJobInfoQuery } = require("../../database/data/queries/profile");

router.get("/", async (req, res) => {
    const id = req.user.id;

    try {
        const { rows } = await pool.query(getJobInfoQuery, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching job info" });
    }
});

module.exports = router;
