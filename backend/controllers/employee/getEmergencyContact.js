const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getEmergencyContactQuery } = require("../../database/data/queries/employees");

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const { rows } = await pool.query(getEmergencyContactQuery, [id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching emergency contacts" });
    }
});

module.exports = router;
