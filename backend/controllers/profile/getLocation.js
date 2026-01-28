const pool = require("../../database/connection");
const { getLocationQuery } = require("../../database/data/queries/profile");

module.exports = async (req, res) => {
    const id = req.user.id;

    try {
        const { rows } = await pool.query(getLocationQuery, [id]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching locations", error: err.message });
    }
};
