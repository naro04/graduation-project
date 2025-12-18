const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getMe } = require("../../database/data/queries/auth");

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(getMe, [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

module.exports = router;
