const pool = require('../../database/connection');
const {
  getEmergencyContactQuery
} = require('../../database/data/queries/profile');

module.exports = async (req, res) => {
  const id = req.user.id;

  try {
    const { rows } = await pool.query(getEmergencyContactQuery, [id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('GET Emergency Contact Error:', err);
    res.status(500).json({
      message: 'Error fetching emergency contacts',
      error: err.message
    });
  }
};
