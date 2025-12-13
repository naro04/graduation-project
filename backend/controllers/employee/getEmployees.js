const express = require("express");
const router = express.Router();
const pool = require("../../database/connection");
const { getEmployeesQuery } = require("../../database/data/queries/employees");

router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(getEmployeesQuery);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching employees" });
    }
});

module.exports = router;
