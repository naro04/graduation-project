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
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

/**
 * Create a new leave request
 */
exports.createLeave = async (req, res) => {
    try {
        const { employee_id, leave_type, start_date, end_date, reason, document_url } = req.body;

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
        console.error('Error creating leave:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        console.error('Error fetching my leaves:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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
        console.error('Error fetching my leave stats:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
