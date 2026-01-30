const pool = require('../database/connection');
const router = require('express').Router();
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name FROM projects WHERE status = 'active' ORDER BY name ASC");
        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching projects', error: err.message });
    }
});

module.exports = router;

