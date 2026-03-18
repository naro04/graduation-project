const pool = require('../database/connection');
const activityQueries = require('../database/data/queries/locationActivities');
const locationQueries = require('../database/data/queries/locations');

exports.getAllActivities = async (req, res) => {
    try {
        const { search, status, approval_status, date } = req.query;
        const isManager = req.user.role_name === 'Manager';
        const managerEmployeeId = req.user.employee_id;

        let queryParams = [];
        let whereClause = "WHERE a.location_id IS NOT NULL";

        if (date) {
            queryParams.push(date);
            whereClause += ` AND (DATE(start_time) <= $${queryParams.length}::DATE AND DATE(end_time) >= $${queryParams.length}::DATE)`;
        }

        if (status && status !== 'All Status') {
            queryParams.push(status);
            whereClause += ` AND computed_status = $${queryParams.length}`;
        }

        if (approval_status && approval_status !== 'All Approval Status') {
            queryParams.push(approval_status.toLowerCase());
            whereClause += ` AND approval_status = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            whereClause += ` AND name ILIKE $${queryParams.length}`;
        }

        if (isManager) {
            queryParams.push(managerEmployeeId);
            whereClause += ` AND (employee_id = $${queryParams.length} OR EXISTS (
                SELECT 1 FROM activity_employees ae2 
                JOIN employees e2 ON ae2.employee_id = e2.id 
                WHERE ae2.activity_id = id AND e2.supervisor_id = $${queryParams.length}
            ))`;
        }

        const query = `
            WITH base_activities AS (
                SELECT
                    a.*,
                    (CASE 
                        WHEN a.end_date IS NOT NULL THEN 'Implemented'
                        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
                        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
                        ELSE 'Planned'
                    END) as computed_status
                FROM activities a
            )
            SELECT
                ba.*,
                ba.computed_status as implementation_status,
                ba.name as activity_name,
                ba.activity_type as type,
                ba.project_name as project,
                e.first_name || ' ' || e.last_name as responsible_employee,
                e.avatar_url as employee_photo,
                l.name as location,
                COALESCE(ba.location_latitude, l.latitude) as latitude,
                COALESCE(ba.location_longitude, l.longitude) as longitude,
                ba.activity_days as duration,
                ARRAY_AGG(DISTINCT emp.first_name || ' ' || emp.last_name) FILTER (WHERE emp.id IS NOT NULL) as team
            FROM base_activities ba
            LEFT JOIN locations l ON ba.location_id = l.id
            LEFT JOIN employees e ON ba.employee_id = e.id
            LEFT JOIN activity_employees ae ON ba.id = ae.activity_id
            LEFT JOIN employees emp ON ae.employee_id = emp.id
            ${whereClause}
            GROUP BY ba.id, ba.employee_id, ba.project_name, ba.name, ba.activity_type, ba.description, 
                     ba.location_id, ba.location_latitude, ba.location_longitude, ba.location_address, 
                     ba.start_time, ba.end_time, ba.start_date, ba.end_date, ba.activity_days, 
                     ba.status, ba.implementation_status, ba.approval_status, ba.approved_by, 
                     ba.approved_at, ba.created_at, ba.updated_at, ba.attendees_count, ba.actual_date,
                     ba.project_id, ba.images, ba.computed_status,
                     e.first_name, e.last_name, e.avatar_url, l.name, l.latitude, l.longitude
            ORDER BY ba.start_time DESC, ba.created_at DESC
        `;

        const result = await pool.query(query, queryParams);

        // Calculate stats from the scoped/filtered results
        const activities = result.rows;
        const stats = {
            planned: activities.filter(a => a.implementation_status === 'Planned').length,
            implemented: activities.filter(a => a.implementation_status === 'Implemented').length,
            pending_progress: activities.filter(a => a.implementation_status === 'Pending').length,
            overdue: activities.filter(a => a.implementation_status === 'Overdue').length,
            approved: activities.filter(a => (a.approval_status || '').toLowerCase() === 'approved').length,
            pending_approval: activities.filter(a => (a.approval_status || '').toLowerCase() === 'pending').length
        };

        res.status(200).json({
            status: 'success',
            activities: activities,
            stats: stats
        });
    } catch (err) {
        console.error('Error in getAllActivities:', err);
        res.status(500).json({ message: 'Error fetching activities', error: err.message });
    }
};

exports.getActivityById = async (req, res) => {
    try {
        const { activity_id } = req.params;

        const result = await pool.query(activityQueries.getActivityByIdQuery, [activity_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching activity', error: err.message });
    }
};

exports.createLocationActivity = async (req, res) => {
    try {
        const { name, activity_type, responsible_employee_id, location_id, project_name, employee_ids, activity_days, dates, description, images } = req.body;

        let final_project_name = project_name;
        let final_images = images || [];
        let final_description = description;

        // The frontend bundles projectName and activityImageUrls into the description field separated by newlines.
        // We need to split them: text → project_name + description, URLs → images.
        // The frontend's ActivityDetailsModal reads 'description' for display and 'images' for photos.
        if (description && !project_name) {
            const lines = description.split('\n');
            const urlLines = lines.filter(line => line.startsWith('http') || line.startsWith('https') || line.startsWith('data:image'));
            const textLines = lines.filter(line => !line.startsWith('http') && !line.startsWith('https') && !line.startsWith('data:image') && line.trim() !== '');
            
            const extractedText = textLines.length > 0 ? textLines.join('\n') : null;
            final_project_name = extractedText;
            final_description = extractedText; // Keep text in description for the details modal
            if (urlLines.length > 0) {
                final_images = urlLines;
            }
        }

        if (!name) {
            return res.status(400).json({ message: 'Activity name is required' });
        }

        if (!location_id) {
            return res.status(400).json({ message: 'location_id is required' });
        }

        if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
            return res.status(400).json({ message: 'employee_ids array with at least one employee is required' });
        }

        if (!dates || !Array.isArray(dates) || dates.length === 0) {
            return res.status(400).json({ message: 'dates array is required' });
        }

        if (activity_days && dates.length !== activity_days) {
            return res.status(400).json({ message: 'dates array length must match activity_days' });
        }

        const start_date = dates[0];
        const end_date = dates[dates.length - 1];

        // 1. Validate responsible employee is a Manager
        if (responsible_employee_id) {
            const respEmpResult = await pool.query(`
                SELECT r.name as role_name 
                FROM employees e 
                JOIN roles r ON e.role_id = r.id 
                WHERE e.id = $1
            `, [responsible_employee_id]);

            if (respEmpResult.rows.length === 0 || respEmpResult.rows[0].role_name !== 'Manager') {
                return res.status(400).json({ status: 'fail', message: 'Responsible employee must have the Manager role' });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const activityResult = await client.query(activityQueries.createLocationActivityQuery, [
                name,
                activity_type || 'Workshop',
                responsible_employee_id || null,
                location_id,
                start_date,
                end_date,
                activity_days || dates.length,
                'Active',
                final_description || null,
                final_project_name || null,
                final_images || []
            ]);

            const activity = activityResult.rows[0];

            // Assign employees to activity
            for (const employee_id of employee_ids) {
                await client.query(activityQueries.assignEmployeesToActivityQuery, [
                    activity.id,
                    employee_id
                ]);

                // Automatically update supervisor_id if responsible_employee_id is provided
                if (responsible_employee_id) {
                    await client.query(
                        'UPDATE employees SET supervisor_id = $1 WHERE id = $2',
                        [responsible_employee_id, employee_id]
                    );
                }
            }

            await client.query('COMMIT');

            // Get location name for response
            const locationResult = await pool.query('SELECT name FROM locations WHERE id = $1', [location_id]);
            const location_name = locationResult.rows[0]?.name || null;

            res.status(201).json({
                status: 'success',
                data: {
                    ...activity,
                    location_name,
                    employee_count: employee_ids.length
                }
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error creating location activity:', err);
        res.status(500).json({ message: 'Error creating location activity', error: err.message });
    }
};

exports.updateLocationActivity = async (req, res) => {
    try {
        const { activity_id } = req.params;
        const { 
            name, activity_type, responsible_employee_id, location_id, 
            project_name, employee_ids, activity_days, dates, 
            description, images,
            actual_start_date, actual_end_date
        } = req.body;

        let final_project_name = project_name;
        let final_images = images || [];
        let final_description = description;

        if (description && !project_name) {
            const lines = description.split('\n');
            const urlLines = lines.filter(line => line.startsWith('http') || line.startsWith('https') || line.startsWith('data:image'));
            const textLines = lines.filter(line => !line.startsWith('http') && !line.startsWith('https') && !line.startsWith('data:image') && line.trim() !== '');
            
            const extractedText = textLines.length > 0 ? textLines.join('\n') : null;
            final_project_name = extractedText;
            final_description = extractedText; // Keep text in description for the details modal
            if (urlLines.length > 0) {
                final_images = urlLines;
            }
        }

        console.log('Update activity request:', {
            activity_id,
            name,
            activity_type,
            responsible_employee_id,
            location_id,
            project_name,
            employee_ids,
            actual_start_date,
            actual_end_date
        });

        // Check if activity exists
        const existingActivityResult = await pool.query(activityQueries.getActivityByIdQuery, [activity_id]);
        if (existingActivityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const existingActivity = existingActivityResult.rows[0];

        // Planned dates (using existing dates array if provided)
        const planned_start = dates ? dates[0] : existingActivity.start_time;
        const planned_end = dates ? dates[dates.length - 1] : existingActivity.end_time;
        const final_activity_days = dates ? dates.length : (activity_days || existingActivity.activity_days);

        // Actual dates (from request or fallback to existing)
        // If the user sends 'actual_end_date', it marks as Implemented
        // If the user sends 'actual_start_date', it marks as Pending
        const actual_start = actual_start_date !== undefined ? actual_start_date : existingActivity.start_date;
        const actual_end = actual_end_date !== undefined ? actual_end_date : existingActivity.end_date;

        // Validate responsible employee if changed
        if (responsible_employee_id) {
            const respEmpResult = await pool.query(`
                SELECT r.name as role_name 
                FROM employees e 
                JOIN roles r ON e.role_id = r.id 
                WHERE e.id = $1
            `, [responsible_employee_id]);

            if (respEmpResult.rows.length === 0 || respEmpResult.rows[0].role_name !== 'Manager') {
                return res.status(400).json({ status: 'fail', message: 'Responsible employee must have the Manager role' });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const query = `
                UPDATE activities
                SET name = $1, 
                    activity_type = $2, 
                    employee_id = $3, 
                    location_id = $4, 
                    start_time = $5, 
                    end_time = $6, 
                    activity_days = $7, 
                    description = $8, 
                    project_name = $9, 
                    images = $10,
                    start_date = $11,
                    end_date = $12,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $13
                RETURNING *;
            `;

            const updateResult = await client.query(query, [
                name || existingActivity.name,
                activity_type || existingActivity.activity_type || 'Workshop',
                responsible_employee_id || existingActivity.employee_id || null,
                location_id || existingActivity.location_id,
                planned_start,
                planned_end,
                final_activity_days,
                final_description !== undefined ? final_description : existingActivity.description,
                final_project_name !== undefined ? final_project_name : existingActivity.project_name || null,
                final_images.length > 0 ? final_images : existingActivity.images || [],
                actual_start,
                actual_end,
                activity_id
            ]);

            if (updateResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Activity not found' });
            }

            // Update employee assignments if provided
            if (employee_ids && Array.isArray(employee_ids)) {
                // Remove existing assignments
                await client.query(activityQueries.removeEmployeesFromActivityQuery, [activity_id]);

                // Add new assignments and update supervisor_id
                const managerToAssign = responsible_employee_id || existingActivity.employee_id;

                for (const employee_id of employee_ids) {
                    await client.query(activityQueries.assignEmployeesToActivityQuery, [
                        activity_id,
                        employee_id
                    ]);

                    // Automatically update supervisor_id if a manager is responsible
                    if (managerToAssign) {
                        await client.query(
                            'UPDATE employees SET supervisor_id = $1 WHERE id = $2',
                            [managerToAssign, employee_id]
                        );
                    }
                }
            }

            await client.query('COMMIT');
            res.status(200).json({
                status: 'success',
                data: updateResult.rows[0]
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error updating location activity:', err);
        res.status(500).json({ message: 'Error updating location activity', error: err.message });
    }
};

exports.deleteLocationActivity = async (req, res) => {
    try {
        const { activity_id } = req.params;

        const result = await pool.query(activityQueries.deleteLocationActivityQuery, [activity_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Activity deleted successfully'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting location activity', error: err.message });
    }
};

exports.getActivityEmployees = async (req, res) => {
    try {
        const { activity_id } = req.params;
        console.log('Fetching employees for activity:', activity_id);

        const result = await pool.query(activityQueries.getActivityEmployeesQuery, [activity_id]);
        console.log('Activity employees query result:', result.rows.length, 'rows');

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching activity employees:', err);
        res.status(500).json({ message: 'Error fetching activity employees', error: err.message });
    }
};

exports.approveActivity = async (req, res) => {
    try {
        const { activity_id } = req.params;
        const approved_by = req.user.employee_id || req.user.id;

        const result = await pool.query(`
            UPDATE activities
            SET approval_status = 'Approved',
                approved_by = $2,
                approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `, [activity_id, approved_by]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error approving activity', error: err.message });
    }
};

exports.rejectActivity = async (req, res) => {
    try {
        const { activity_id } = req.params;
        const approved_by = req.user.employee_id || req.user.id;

        const result = await pool.query(`
            UPDATE activities
            SET approval_status = 'Rejected',
                approved_by = $2,
                approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
        `, [activity_id, approved_by]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error rejecting activity', error: err.message });
    }
};

/**
 * Get team activities for manager/supervisor view
 * Shows activities where the responsible employee or team members are under the manager's supervision
 */
exports.getTeamActivities = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.id;

        // Get the manager's employee_id
        const managerResult = await pool.query('SELECT id FROM employees WHERE user_id = $1', [userId]);
        if (managerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Manager employee record not found' });
        }
        const managerEmployeeId = managerResult.rows[0].id;

        // Get team members IDs (employees where supervisor_id = manager's employee_id)
        const teamMembersResult = await pool.query(
            'SELECT id FROM employees WHERE supervisor_id = $1',
            [managerEmployeeId]
        );
        const teamMemberIds = teamMembersResult.rows.map(e => e.id);

        if (teamMemberIds.length === 0) {
            return res.status(200).json({
                status: 'success',
                activities: [],
                stats: { planned: 0, implemented: 0, approved: 0, pending: 0 }
            });
        }

        // Get activities where:
        // 1. The responsible employee is in the team, OR
        // 2. Any team member is in the activity_employees table
        const { status, approval_status, search } = req.query;

        const activitiesQuery = `
            WITH base_activities AS (
                SELECT
                    a.*,
                    (CASE 
                        WHEN a.end_date IS NOT NULL THEN 'Implemented'
                        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
                        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
                        ELSE 'Planned'
                    END) as computed_status
                FROM activities a
            )
            SELECT DISTINCT
                ba.id,
                ba.name,
                ba.activity_type as type,
                ba.project_name as project,
                ba.employee_id,
                e.first_name || ' ' || e.last_name as responsible_employee,
                ba.location_id,
                l.name as location,
                COALESCE(ba.location_address, l.address) as location_address,
                COALESCE(ba.location_latitude, l.latitude) as latitude,
                COALESCE(ba.location_longitude, l.longitude) as longitude,
                ba.start_date,
                ba.end_date,
                ba.start_time,
                ba.end_time,
                ba.start_time as date,
                ba.activity_days as duration,
                ba.status,
                ba.computed_status as implementation_status,
                ba.approval_status,
                ba.description,
                ba.images,
                ba.created_at,
                ba.updated_at
            FROM base_activities ba
            LEFT JOIN employees e ON ba.employee_id = e.id
            LEFT JOIN locations l ON ba.location_id = l.id
            LEFT JOIN activity_employees ae ON ba.id = ae.activity_id
            WHERE (
                ba.employee_id = ANY($1::uuid[])
                OR ae.employee_id = ANY($1::uuid[])
            )
            AND ($2::DATE IS NULL OR DATE(ba.start_time) = $2)
            AND ($3::TEXT IS NULL OR ba.computed_status = $3)
            AND ($4::TEXT IS NULL OR ba.approval_status = $4)
            AND ($5::TEXT IS NULL OR ba.name ILIKE '%' || $5 || '%')
            ORDER BY ba.start_time DESC, ba.created_at DESC
        `;

        const result = await pool.query(activitiesQuery, [
            teamMemberIds,
            date || null,
            status && status !== 'All Status' ? status : null,
            approval_status && approval_status !== 'All Approval Status' ? approval_status : null,
            search || null
        ]);

        // Calculate stats
        const activities = result.rows;
        const stats = {
            planned: activities.filter(a => a.implementation_status === 'Planned').length,
            implemented: activities.filter(a => a.implementation_status === 'Implemented').length,
            pending_progress: activities.filter(a => a.implementation_status === 'Pending').length,
            overdue: activities.filter(a => a.implementation_status === 'Overdue').length,
            approved: activities.filter(a => (a.approval_status || '').toLowerCase() === 'approved').length,
            pending_approval: activities.filter(a => (a.approval_status || '').toLowerCase() === 'pending').length
        };

        res.status(200).json({
            status: 'success',
            activities: activities,
            stats: stats
        });
    } catch (err) {
        console.error('Error fetching team activities:', err);
        res.status(500).json({ message: 'Error fetching team activities', error: err.message });
    }
};

exports.getActivityReports = async (req, res) => {
    try {
        const { from, to, type, status, search } = req.query;

        const isManager = req.user.role_name === 'Manager';
        const managerEmployeeId = req.user.employee_id;

        const recordsResult = await pool.query(`
            WITH base_activities AS (
                SELECT
                    a.*,
                    (CASE 
                        WHEN a.end_date IS NOT NULL THEN 'Implemented'
                        WHEN CURRENT_DATE > DATE(a.end_time) AND a.end_date IS NULL THEN 'Overdue'
                        WHEN a.start_date IS NOT NULL AND a.end_date IS NULL THEN 'Pending'
                        ELSE 'Planned'
                    END) as computed_status
                FROM activities a
            )
            SELECT DISTINCT
                ba.id,
                ba.name,
                ba.activity_type,
                ba.description,
                ba.start_time,
                ba.end_time,
                ba.start_date,
                ba.end_date,
                ba.computed_status as implementation_status,
                ba.approval_status,
                ba.created_at,
                ba.project_name,
                ba.start_time as actual_date,
                COALESCE((
                    SELECT CAST(COUNT(DISTINCT att.employee_id) AS INTEGER)
                    FROM attendance att
                    WHERE att.employee_id IN (SELECT ae2.employee_id FROM activity_employees ae2 WHERE ae2.activity_id = ba.id)
                      AND att.check_in_time::DATE >= DATE(ba.start_time) 
                      AND att.check_in_time::DATE <= DATE(ba.end_time) 
                      AND att.gps_status = 'Verified'
                ), 0) as attendees_count,
                e.first_name || ' ' || e.last_name as responsible_employee,
                l.name as location_name
            FROM base_activities ba
            LEFT JOIN employees e ON ba.employee_id = e.id
            LEFT JOIN locations l ON ba.location_id = l.id
            LEFT JOIN activity_employees ae ON ba.id = ae.activity_id
            WHERE ($1::DATE IS NULL OR DATE(ba.start_time) >= $1)
              AND ($2::DATE IS NULL OR DATE(ba.end_time) <= $2)
              AND ($3::TEXT IS NULL OR ba.activity_type = $3)
              AND ($4::TEXT IS NULL OR ba.approval_status = $4)
              AND ($5::TEXT IS NULL OR ba.name ILIKE '%' || $5 || '%')
              AND ($6::UUID IS NULL OR ba.employee_id = $6 OR ae.employee_id IN (SELECT id FROM employees WHERE supervisor_id = $6))
            ORDER BY ba.created_at DESC;
        `, [
            from || null,
            to || null,
            type && type !== 'All Type' ? type : null,
            status && status !== 'All Status' ? status : null,
            search || null,
            isManager ? managerEmployeeId : null
        ]);

        let trendParams = [];
        let trendWhereClause = "WHERE start_date >= date_trunc('year', CURRENT_DATE)";
        
        let participantsParams = [];
        let participantsWhereClause = "WHERE implementation_status = 'Implemented'";

        if (isManager) {
            trendParams.push(managerEmployeeId);
            trendWhereClause += ` AND (employee_id = $1 OR EXISTS (
                SELECT 1 FROM activity_employees ae2 
                JOIN employees e2 ON ae2.employee_id = e2.id 
                WHERE ae2.activity_id = activities.id AND e2.supervisor_id = $1
            ))`;

            participantsParams.push(managerEmployeeId);
            participantsWhereClause += ` AND (employee_id = $1 OR EXISTS (
                SELECT 1 FROM activity_employees ae3 
                JOIN employees e3 ON ae3.employee_id = e3.id 
                WHERE ae3.activity_id = activities.id AND e3.supervisor_id = $1
            ))`;
        }

        const trendQuery = `
            SELECT 
                TO_CHAR(date_trunc('month', start_date), 'Mon') as month,
                COUNT(*) FILTER (WHERE implementation_status IN ('Planned', 'Implemented')) as planned,
                COUNT(*) FILTER (WHERE implementation_status = 'Implemented') as implemented
            FROM activities
            ${trendWhereClause}
            GROUP BY date_trunc('month', start_date)
            ORDER BY date_trunc('month', start_date);
        `;

        const participantsQuery = `
            SELECT 
                activity_type as type,
                SUM(
                  COALESCE((
                      SELECT CAST(COUNT(DISTINCT att.employee_id) AS INTEGER)
                      FROM attendance att
                      WHERE att.employee_id IN (SELECT ae2.employee_id FROM activity_employees ae2 WHERE ae2.activity_id = activities.id)
                        AND att.check_in_time::DATE >= activities.start_date 
                        AND att.check_in_time::DATE <= activities.end_date 
                        AND att.gps_status = 'Verified'
                  ), 0)
                ) as attendees
            FROM activities
            ${participantsWhereClause}
            GROUP BY activity_type;
        `;

        const trendResult = await pool.query(trendQuery, trendParams);
        const participantsResult = await pool.query(participantsQuery, participantsParams);

        res.status(200).json({
            status: 'success',
            records: recordsResult.rows,
            stats: {
                completionTrend: trendResult.rows,
                participantsByType: participantsResult.rows
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching activity reports', error: err.message });
    }
};

/**
 * Assign team members to an activity (bulk)
 * POST /api/v1/location-activities/:activity_id/assign
 */
exports.assignTeamToActivity = async (req, res) => {
    const client = await pool.connect();
    try {
        const { activity_id } = req.params;
        const { employee_ids } = req.body;

        if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
            return res.status(400).json({ message: 'employee_ids must be a non-empty array' });
        }

        // 1. Verify activity exists
        const activityRes = await client.query('SELECT id FROM activities WHERE id = $1', [activity_id]);
        if (activityRes.rowCount === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        await client.query('BEGIN');

        // 2. Assign employees
        for (const employee_id of employee_ids) {
            await client.query(activityQueries.assignEmployeesToActivityQuery, [activity_id, employee_id]);
        }

        await client.query('COMMIT');

        res.status(200).json({
            status: 'success',
            message: `Successfully assigned ${employee_ids.length} employee(s) to activity`
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in assignTeamToActivity:', err);
        res.status(500).json({ message: 'Error assigning team members', error: err.message });
    } finally {
        client.release();
    }
};


