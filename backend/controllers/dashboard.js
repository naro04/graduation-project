const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const pool = require("../database/connection");
const {
    getTotalEmployees,
    getAttendanceMetrics,
    getLeaveRequestMetrics,
    getActiveLocations,
    getAttendanceChartData,
    getActivityChartData,
    getUserMetrics
} = require("../database/data/queries/dashboardQueries");

// Dashboard is accessible to all authenticated users (including inactive)
router.get("/dashboard", protect, async (req, res) => {
    try {
        // Execute all queries in parallel for performance
        const results = await Promise.all([
            pool.query(getTotalEmployees),
            pool.query(getAttendanceMetrics),
            pool.query(getLeaveRequestMetrics),
            pool.query(getActiveLocations),
            pool.query(getAttendanceChartData),
            pool.query(getActivityChartData),
            pool.query(getUserMetrics)
        ]);

        // Construct the response object
        const responseData = {
            totalEmployees: results[0].rows[0]?.total || 0,
            attendance: results[1].rows[0],
            leaveRequests: results[2].rows[0],
            activeLocations: results[3].rows[0]?.active_count || 0,
            charts: {
                attendance: results[4].rows,
                activities: results[5].rows
            },
            userMetrics: results[6].rows[0]
        };

        res.status(200).json(responseData);

    } catch (err) {
        res.status(500).json({ message: "Error loading dashboard metrics", error: err.message });
    }
});

module.exports = router;
