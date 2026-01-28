const pool = require("../../database/connection");
const { getWorkScheduleQuery } = require("../../database/data/queries/profile");

module.exports = async (req, res) => {
    const userId = req.user.id;

    try {
        // 1. Get Routine Schedule
        const { rows: routine } = await pool.query(getWorkScheduleQuery, [userId]);

        // 2. Get Specific Assignments/Activities for this employee
        const { rows: assignments } = await pool.query(`
            SELECT DISTINCT
                a.id as activity_id,
                a.name as activity_name,
                a.activity_type,
                a.start_date,
                a.end_date,
                a.status,
                l.name as location_name,
                l.address as location_address
            FROM activities a
            LEFT JOIN activity_employees ae ON a.id = ae.activity_id
            LEFT JOIN employees e_team ON ae.employee_id = e_team.id
            LEFT JOIN employees e_resp ON a.employee_id = e_resp.id
            LEFT JOIN locations l ON a.location_id = l.id
            WHERE (e_team.user_id = $1 OR e_resp.user_id = $1 OR a.approved_by = (SELECT id FROM employees WHERE user_id = $1))
              AND a.approval_status = 'Approved'
            ORDER BY a.start_date ASC;
        `, [userId]);

        res.status(200).json({
            routine,
            assignments
        });
    } catch (err) {
        console.error('getWorkSchedule error:', err);
        res.status(500).json({ message: "Error fetching work schedule", error: err.message });
    }
};
