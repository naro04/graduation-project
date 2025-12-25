const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getPersonalInfoQuery } = require("../../database/data/queries/profile");
const { updateProfile } = require("./updateProfile");

router.get("/", async (req, res) => {
    const id = req.user.id;

    try {
        const { rows } = await pool.query(getPersonalInfoQuery, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching personal info", error: err.message });
    }
});

router.put("/", updateProfile);

module.exports = router;
