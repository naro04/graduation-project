const pool = require('../database/connection');

/**
 * Get team reports metrics for manager dashboard/reports page
 * GET /api/v1/reports/team
 */
exports.getTeamReports = async (req, res) => {
    try {
        const { from, to } = req.query;
        const userId = req.user.id;
        const isManager = req.user.role_name === 'Manager';
        const managerEmployeeId = req.user.employee_id;

        if (!isManager && req.user.role_name !== 'Super Admin' && req.user.role_name !== 'HR Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // 1. Get team members count
        const membersQuery = isManager 
            ? 'SELECT id, status FROM employees WHERE supervisor_id = $1'
            : 'SELECT id, status FROM employees';
        const membersParams = isManager ? [managerEmployeeId] : [];
        const membersResult = await pool.query(membersQuery, membersParams);
        
        const teamMembersCount = membersResult.rows.length;
        const activeEmployeesCount = membersResult.rows.filter(e => e.status === 'active').length;
        const teamMemberIds = membersResult.rows.map(e => e.id);

        if (teamMembersCount === 0 && isManager) {
            return res.status(200).json({
                status: 'success',
                data: {
                    teamMembersCount: 0,
                    activeEmployeesCount: 0,
                    completedTasks: 0,
                    overdueTasks: 0,
                    attendanceCommitmentRate: 0
                }
            });
        }

        // 2. Completed and Overdue Tasks (Activities)
        // Scoped to manager's team
        let activitiesWhereClause = '';
        let activitiesParams = [];
        if (isManager) {
            activitiesParams.push(managerEmployeeId);
            activitiesParams.push(teamMemberIds);
            activitiesWhereClause = `WHERE (employee_id = $1 OR EXISTS (
                SELECT 1 FROM activity_employees ae 
                WHERE ae.activity_id = a.id AND ae.employee_id = ANY($2::uuid[])
            ))`;
        }

        const activitiesQuery = `
            SELECT 
                implementation_status,
                end_date
            FROM activities a
            ${activitiesWhereClause}
        `;
        const activitiesResult = await pool.query(activitiesQuery, activitiesParams);
        const activities = activitiesResult.rows;

        const completedTasks = activities.filter(a => a.implementation_status === 'Implemented').length;
        
        const now = new Date();
        const overdueTasks = activities.filter(a => {
            const endDate = a.end_date ? new Date(a.end_date) : null;
            return endDate && endDate < now && a.implementation_status !== 'Implemented';
        }).length;

        // 3. Attendance Commitment Rate
        // Percentage of present/late records vs total records in the period
        let attendanceWhereClause = 'WHERE 1=1';
        let attendanceParams = [];
        if (from) {
            attendanceParams.push(from);
            attendanceWhereClause += ` AND check_in_time >= $${attendanceParams.length}`;
        }
        if (to) {
            attendanceParams.push(to);
            attendanceWhereClause += ` AND check_in_time <= $${attendanceParams.length}::TIMESTAMP + INTERVAL '1 day'`;
        }
        if (isManager) {
            attendanceParams.push(teamMemberIds);
            attendanceWhereClause += ` AND employee_id = ANY($${attendanceParams.length}::uuid[])`;
        }

        const attendanceQuery = `
            SELECT daily_status
            FROM attendance
            ${attendanceWhereClause}
        `;
        const attendanceResult = await pool.query(attendanceQuery, attendanceParams);
        const attendanceRecords = attendanceResult.rows;

        const committedCount = attendanceRecords.filter(r => r.daily_status === 'Present' || r.daily_status === 'Late').length;
        const totalAttendanceCount = attendanceRecords.length;
        const attendanceCommitmentRate = totalAttendanceCount > 0 
            ? Math.round((committedCount / totalAttendanceCount) * 100) 
            : 0;

        res.status(200).json({
            status: 'success',
            data: {
                teamMembersCount,
                activeEmployeesCount,
                completedTasks,
                overdueTasks,
                attendanceCommitmentRate
            }
        });

    } catch (err) {
        console.error('Error fetching team reports:', err);
        res.status(500).json({ message: 'Error fetching team reports', error: err.message });
    }
};
