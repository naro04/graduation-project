const pool = require('../database/connection');
const leaveQueries = require('../database/data/queries/leaves');

/**
 * Get all leave requests with stats
 */
exports.getLeaves = async (req, res) => {
    try {
        const { search, type, status } = req.query;

        const [leavesRes, statsRes] = await Promise.all([
            pool.query(leaveQueries.getLeaves, [search || null, type || null, status || null]),
            pool.query(leaveQueries.getLeaveStats)
        ]);

        res.status(200).json({
            success: true,
            data: leavesRes.rows,
            stats: statsRes.rows[0]
        });
    } catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching leave requests. Please try again.' });
    }
};

/**
 * Create a new leave request
 */
exports.createLeave = async (req, res) => {
    try {
        let { employee_id, leave_type, start_date, end_date, reason, document_url } = req.body;

        // If a file was uploaded, override document_url
        if (req.file) {
            document_url = `/uploads/${req.file.filename}`;
        }

        if (!employee_id || !leave_type || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const result = await pool.query(leaveQueries.createLeave, [
            employee_id, leave_type, start_date, end_date, reason, document_url
        ]);

        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ success: false, message: 'An error occurred while creating your leave request. Please try again.' });
    }
};

/**
 * Update leave request status
 */
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;
        const approved_by = req.user ? req.user.employee_id : null; // Use employee_id for approved_by

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        if (status === 'rejected' && (!admin_notes || admin_notes.trim() === '')) {
            return res.status(400).json({ success: false, message: 'Admin notes are required for rejection' });
        }

        const result = await pool.query(leaveQueries.updateLeaveStatus, [
            status, admin_notes, approved_by, id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ success: false, message: 'An error occurred while updating the leave status. Please try again.' });
    }
};

/**
 * Bulk delete leave requests
 */
exports.bulkDeleteLeaves = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
        }

        const result = await pool.query(leaveQueries.bulkDeleteLeaves, [ids]);

        res.status(200).json({
            success: true,
            message: `${result.rowCount} leave requests deleted successfully`,
            deletedCount: result.rowCount
        });
    } catch (error) {
        console.error('Error bulk deleting leaves:', error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting leave requests. Please try again.' });
    }
};

/**
 * Get personal leave requests
 */
exports.getMyLeaves = async (req, res) => {
    try {
        const result = await pool.query(leaveQueries.getMyLeaves, [req.user.id]);
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching personal leaves:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching your leave requests. Please try again.' });
    }
};

/**
 * Get personal leave stats
 */
exports.getMyLeaveStats = async (req, res) => {
    try {
        const result = await pool.query(leaveQueries.getMyLeaveStats, [req.user.id]);
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching personal leave stats:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching your leave statistics. Please try again.' });
    }
};
/**
 * Get team leave requests for manager/supervisor view
 * Shows leave requests only for employees where supervisor_id = logged-in user's employee_id
 */
exports.getTeamLeaves = async (req, res) => {
    try {
        const { search, type, status } = req.query;
        const userId = req.user.id;

        // Get the manager's employee_id
        const managerResult = await pool.query('SELECT id FROM employees WHERE user_id = $1', [userId]);
        if (managerResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Manager employee record not found' });
        }
        const managerEmployeeId = managerResult.rows[0].id;

        // Get team members count
        const teamCountResult = await pool.query(
            'SELECT COUNT(*) as total FROM employees WHERE supervisor_id = $1 AND status = $2',
            [managerEmployeeId, 'active']
        );

        // Get leave requests for team members only
        const leavesQuery = `
            SELECT 
                lr.*,
                e.full_name as employee_name,
                e.avatar_url as employee_avatar,
                p.title as position_name,
                d.name as department_name,
                (lr.end_date - lr.start_date + 1) as total_days
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.supervisor_id = $1
              AND ($2::text IS NULL OR e.full_name ILIKE '%' || $2 || '%')
              AND ($3::text IS NULL OR lr.leave_type = $3)
              AND ($4::text IS NULL OR lr.status = $4)
            ORDER BY lr.created_at DESC;
        `;

        const leavesResult = await pool.query(leavesQuery, [
            managerEmployeeId,
            search || null,
            type || null,
            status || null
        ]);

        // Calculate stats for team leaves only
        const statsQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE lr.status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE lr.status = 'approved') as approved_count,
                COUNT(*) FILTER (WHERE lr.status = 'rejected') as rejected_count
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            WHERE e.supervisor_id = $1;
        `;
        const statsResult = await pool.query(statsQuery, [managerEmployeeId]);

        res.status(200).json({
            success: true,
            data: leavesResult.rows,
            stats: statsResult.rows[0] || { pending_count: 0, approved_count: 0, rejected_count: 0 }
        });
    } catch (error) {
        console.error('Error fetching team leaves:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching team leave requests. Please try again.' });
    }
};

/**
 * Get leave reports with distribution and trends
 */
exports.getLeaveReports = async (req, res) => {
    try {
        const { dateFrom, dateTo, type, status, search } = req.query;

        const [distributionRes, trendRes, recordsRes] = await Promise.all([
            pool.query(leaveQueries.getLeaveDistributionQuery),
            pool.query(leaveQueries.getLeaveTrendQuery),
            pool.query(leaveQueries.getDetailedLeaveReportQuery, [
                dateFrom || null,
                dateTo || null,
                type && type !== 'All Leave Type' ? type : null,
                status && status !== 'All Status' ? status : null,
                search || null
            ])
        ]);

        res.status(200).json({
            success: true,
            records: recordsRes.rows,
            stats: {
                distribution: distributionRes.rows,
                trend: trendRes.rows
            }
        });
    } catch (error) {
        console.error('Error fetching leave reports:', error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching leave reports. Please try again.' });
    }
};
