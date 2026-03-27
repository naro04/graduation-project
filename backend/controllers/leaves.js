const pool = require('../database/connection');
const leaveQueries = require('../database/data/queries/leaves');
const notificationController = require('./notifications');

const isManagerUser = (user) => String(user?.role_name ?? '').trim().toLowerCase() === 'manager';

/**
 * Get all leave requests with stats
 */
exports.getLeaves = async (req, res) => {
    try {
        const { search, type, status } = req.query;

        const isManager = isManagerUser(req.user);
        const managerEmployeeId = req.user.employee_id;

        // Scoping query for leaves with descriptive fields
        const leavesQuery = `
            SELECT 
                lr.*, 
                e.full_name as employee_name, 
                e.avatar_url as employee_avatar,
                p.title as position,
                d.name as department,
                (lr.end_date - lr.start_date + 1) as total_days
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE ($1::text IS NULL OR e.full_name ILIKE '%' || $1 || '%')
              AND ($2::text IS NULL OR lr.leave_type = $2)
              AND ($3::text IS NULL OR lr.status = $3)
              AND ($4::UUID IS NULL OR e.supervisor_id = $4)
            ORDER BY lr.created_at DESC;
        `;

        // Scoping query for stats
        const statsQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE lr.status = 'pending') as pending_count,
                COUNT(*) FILTER (WHERE lr.status = 'approved') as approved_count,
                COUNT(*) FILTER (WHERE lr.status = 'rejected') as rejected_count
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            WHERE ($1::UUID IS NULL OR e.supervisor_id = $1);
        `;

        const [leavesRes, statsRes] = await Promise.all([
            pool.query(leavesQuery, [
                search || null,
                type || null,
                status || null,
                isManager ? managerEmployeeId : null
            ]),
            pool.query(statsQuery, [isManager ? managerEmployeeId : null])
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
            document_url = req.file.path;
        }

        if (!employee_id || !leave_type || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const result = await pool.query(leaveQueries.createLeave, [
            employee_id, leave_type, start_date, end_date, reason, document_url
        ]);

        const newLeave = result.rows[0];

        // NOTIFICATION: Notify Manager
        try {
            const employeeResult = await pool.query('SELECT full_name, supervisor_id FROM employees WHERE id = $1', [employee_id]);
            if (employeeResult.rows.length > 0 && employeeResult.rows[0].supervisor_id) {
                const emp = employeeResult.rows[0];
                const managerResult = await pool.query('SELECT user_id FROM employees WHERE id = $1', [emp.supervisor_id]);
                if (managerResult.rows.length > 0) {
                    await notificationController.createNotification(
                        managerResult.rows[0].user_id,
                        'leave',
                        'New Leave Request',
                        `${emp.full_name} has submitted a new ${leave_type} request for the period ${start_date} to ${end_date}.`,
                        `/leaves/${newLeave.id}`
                    );
                }
            }
        } catch (notifyErr) {
            console.error('Failed to send leave creation notification:', notifyErr);
        }

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

        const isManager = isManagerUser(req.user);
        const isAdmin = req.user.role_name === 'Super Admin' || req.user.role_name === 'HR Admin';

        // Authorization check
        const leaveCheckResult = await pool.query(`
            SELECT lr.*, e.supervisor_id 
            FROM leave_requests lr 
            JOIN employees e ON lr.employee_id = e.id 
            WHERE lr.id = $1
        `, [id]);

        if (leaveCheckResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        const leaveRequest = leaveCheckResult.rows[0];

        if (isManager && leaveRequest.supervisor_id !== req.user.employee_id) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: You can only act on leave requests from your team.'
            });
        }

        if (!isAdmin && !isManager) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: You do not have permission to perform this action.'
            });
        }

        const result = await pool.query(leaveQueries.updateLeaveStatus, [
            status, admin_notes, approved_by, id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Leave request not found' });
        }

        const updatedLeave = result.rows[0];

        // NOTIFICATION: Notify Employee
        try {
            const employeeResult = await pool.query(
                'SELECT e.user_id, e.full_name FROM employees e WHERE e.id = $1',
                [updatedLeave.employee_id]
            );
            if (employeeResult.rows.length > 0) {
                const emp = employeeResult.rows[0];
                const statusText = status === 'approved' ? 'Approved' : 'Rejected';
                await notificationController.createNotification(
                    emp.user_id,
                    'leave',
                    `Leave Request ${statusText}`,
                    `Your ${updatedLeave.leave_type} request has been ${status}.`,
                    `/leaves/my-leaves`
                );
            }
        } catch (notifyErr) {
            console.error('Failed to send leave status notification:', notifyErr);
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

        const isManager = isManagerUser(req.user);
        const managerEmployeeId = req.user.employee_id;

        let result;
        if (isManager) {
            // Only delete if all IDs belong to team members
            result = await pool.query(`
                DELETE FROM leave_requests 
                WHERE id = ANY($1::UUID[]) 
                AND employee_id IN (SELECT id FROM employees WHERE supervisor_id = $2)
            `, [ids, managerEmployeeId]);
        } else {
            result = await pool.query(leaveQueries.bulkDeleteLeaves, [ids]);
        }

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
        const dateFrom = req.query.dateFrom || req.query.from_date || req.query.from || null;
        const dateTo = req.query.dateTo || req.query.to_date || req.query.to || null;
        const { type, status, search } = req.query;
        const isManager = isManagerUser(req.user);
        const managerEmployeeId = isManager ? req.user.employee_id : null;

        const [distributionRes, trendRes, recordsRes] = await Promise.all([
            pool.query(leaveQueries.getLeaveDistributionQuery, [managerEmployeeId]),
            pool.query(leaveQueries.getLeaveTrendQuery, [managerEmployeeId]),
            pool.query(leaveQueries.getDetailedLeaveReportQuery, [
                dateFrom || null,
                dateTo || null,
                type && type !== 'All Leave Type' ? type : null,
                status && status !== 'All Status' ? status : null,
                search || null,
                managerEmployeeId
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
