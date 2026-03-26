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
        const { role_name, employee_id } = req.user;
        const isAdmin = role_name === 'Super Admin' || role_name === 'HR Admin';
        const isManager = role_name === 'Manager';
        const isEmployee = role_name === 'Officer' || role_name === 'Field Worker';

        // Determine scope
        let scope = 'system';
        if (isManager) scope = 'team';
        if (isEmployee) scope = 'personal';

        const queryId = isManager || isEmployee ? employee_id : null;

        // Execute queries based on role
        const tasks = [
            pool.query(getAttendanceMetrics(scope), queryId ? [queryId] : []),
            pool.query(getLeaveRequestMetrics(scope), queryId ? [queryId] : []),
            pool.query(getActiveLocations(scope), queryId ? [queryId] : []),
            pool.query(getAttendanceChartData(scope), queryId ? [queryId] : []),
            pool.query(getActivityChartData(scope), queryId ? [queryId] : [])
        ];

        // Add Admin-only and Manager-only queries
        if (!isEmployee) {
            tasks.push(pool.query(getTotalEmployees(scope), queryId ? [queryId] : []));
        } else {
            tasks.push(Promise.resolve({ rows: [{ total: 0 }] })); // Placeholder for Employee count
        }

        if (isAdmin) {
            tasks.push(pool.query(getUserMetrics));
        }

        const results = await Promise.all(tasks);

        const attendanceRaw = results[0].rows[0] || { present_count: 0, late_count: 0, total_active: 0 };
        const totalActive = parseInt(attendanceRaw.total_active) || 0;
        
        // Calculate Attendance Percentages
        const attendance = {
            present_count: parseInt(attendanceRaw.present_count) || 0,
            late_count: parseInt(attendanceRaw.late_count) || 0,
            total_active: totalActive,
            present_percentage: totalActive > 0 ? Math.round((parseInt(attendanceRaw.present_count) / totalActive) * 100) : 0,
            late_percentage: totalActive > 0 ? Math.round((parseInt(attendanceRaw.late_count) / totalActive) * 100) : 0
        };

        // Construct the response object
        const responseData = {
            role: role_name,
            attendance,
            leaveRequests: results[1].rows[0] || { approved_count: 0, pending_count: 0, total_count: 0 },
            activeLocations: parseInt(results[2].rows[0]?.active_count) || 0,
            charts: {
                attendance: results[3].rows,
                activities: results[4].rows
            }
        };

        // Conditional fields
        if (!isEmployee) {
            responseData.totalEmployees = parseInt(results[5].rows[0]?.total) || 0;
        }

        if (isAdmin) {
            responseData.userMetrics = results[6]?.rows[0] || null;
        }

        res.status(200).json(responseData);

    } catch (err) {
        console.error('Dashboard Error:', err);
        res.status(500).json({ message: "Error loading dashboard metrics", error: err.message });
    }
});

module.exports = router;
