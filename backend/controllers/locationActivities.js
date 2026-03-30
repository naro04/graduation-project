const pool = require('../database/connection');
const activityQueries = require('../database/data/queries/locationActivities');
const locationQueries = require('../database/data/queries/locations');

// Sync implementation_status with approval_status and date:
//   Pending   → implementation_status = 'Pending'
//   Rejected  → implementation_status = 'Cancelled'
//   Approved  + end_date passed  → 'Implemented'
//   Approved  + end_date future  → 'Planned'
const autoImplementPastActivities = async () => {
    await pool.query(`
        UPDATE activities
        SET implementation_status = CASE
                WHEN approval_status ILIKE 'rejected' THEN 'Cancelled'
                WHEN approval_status ILIKE 'pending'  THEN 'Pending'
                WHEN approval_status ILIKE 'approved' AND end_date < CURRENT_DATE  THEN 'Implemented'
                WHEN approval_status ILIKE 'approved' AND end_date >= CURRENT_DATE THEN 'Planned'
                ELSE implementation_status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            (approval_status ILIKE 'rejected' AND implementation_status != 'Cancelled')
            OR (approval_status ILIKE 'pending'  AND implementation_status != 'Pending')
            OR (approval_status ILIKE 'approved' AND end_date < CURRENT_DATE  AND implementation_status != 'Implemented')
            OR (approval_status ILIKE 'approved' AND end_date >= CURRENT_DATE AND implementation_status NOT IN ('Planned', 'Implemented'))
    `);
};

exports.getAllActivities = async (req, res) => {
    try {
        await autoImplementPastActivities();
        const { search, status, approval_status, date } = req.query;
        const { role_name, employee_id } = req.user;
        const isManager = role_name === 'Manager';
        const isAdmin = role_name === 'Super Admin' || role_name === 'HR Admin';
        const isEmployee = role_name === 'Officer' || role_name === 'Field Worker';
        const managerEmployeeId = employee_id;

        let queryParams = [];
        let whereClause = "WHERE a.location_id IS NOT NULL";

        if (date) {
            queryParams.push(date);
            whereClause += ` AND (a.start_date <= $${queryParams.length}::DATE AND a.end_date >= $${queryParams.length}::DATE)`;
        }

        if (status && status !== 'All Status') {
            queryParams.push(status);
            whereClause += ` AND a.implementation_status = $${queryParams.length}`;
        }

        if (approval_status && approval_status !== 'All Approval Status') {
            queryParams.push(approval_status.toLowerCase());
            whereClause += ` AND a.approval_status = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            whereClause += ` AND a.name ILIKE $${queryParams.length}`;
        }

        if (isManager) {
            queryParams.push(managerEmployeeId);
            whereClause += ` AND (a.employee_id = $${queryParams.length} OR EXISTS (
                SELECT 1 FROM activity_employees ae2 
                JOIN employees e2 ON ae2.employee_id = e2.id 
                WHERE ae2.activity_id = a.id AND e2.supervisor_id = $${queryParams.length}
            ))`;
        } else if (isEmployee) {
            // Strict scoping: Employees only see activities they are directly assigned to
            queryParams.push(employee_id);
            whereClause += ` AND EXISTS (
                SELECT 1 FROM activity_employees ae3 
                WHERE ae3.activity_id = a.id AND ae3.employee_id = $${queryParams.length}
            )`;
        }

        const query = `
            SELECT
                a.*,
                a.name as activity_name,
                a.activity_type as type,
                a.project_name as project,
                e.first_name || ' ' || e.last_name as responsible_employee,
                e.avatar_url as employee_photo,
                l.name as location,
                COALESCE(a.location_latitude, l.latitude) as latitude,
                COALESCE(a.location_longitude, l.longitude) as longitude,
                a.activity_days as duration,
                ARRAY_AGG(DISTINCT emp.first_name || ' ' || emp.last_name) FILTER (WHERE emp.id IS NOT NULL) as team
            FROM activities a
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN employees e ON a.employee_id = e.id
            LEFT JOIN activity_employees ae ON a.id = ae.activity_id
            LEFT JOIN employees emp ON ae.employee_id = emp.id
            ${whereClause}
            GROUP BY a.id, e.first_name, e.last_name, e.avatar_url, l.name, l.latitude, l.longitude
            ORDER BY a.start_date DESC, a.created_at DESC
        `;

        const result = await pool.query(query, queryParams);

        // Calculate stats from the scoped/filtered results
        const activities = result.rows;
        const stats = {
            planned: activities.filter(a => a.implementation_status === 'Planned').length,
            implemented: activities.filter(a => a.implementation_status === 'Implemented').length,
            approved: activities.filter(a => a.approval_status === 'approved').length,
            pending: activities.filter(a => a.approval_status === 'pending').length
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
        const { role_name, employee_id } = req.user;

        const isManager = role_name === 'Manager';
        const isAdmin = role_name === 'Super Admin' || role_name === 'HR Admin';
        const isEmployee = role_name === 'Officer' || role_name === 'Field Worker';

        const result = await pool.query(activityQueries.getActivityByIdQuery, [activity_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const activity = result.rows[0];

        // Strict scoping check
        if (isEmployee) {
            const assignmentCheck = await pool.query('SELECT 1 FROM activity_employees WHERE activity_id = $1 AND employee_id = $2', [activity_id, employee_id]);
            if (assignmentCheck.rows.length === 0) {
                return res.status(403).json({ status: 'fail', message: 'Access Denied: You are not assigned to this activity.' });
            }
        }

        if (isManager) {
            // Managers see if they are responsible OR if a team member is assigned
            const managerCheck = await pool.query(`
                SELECT 1 FROM activities a 
                WHERE a.id = $1 AND (a.employee_id = $2 OR EXISTS (
                    SELECT 1 FROM activity_employees ae 
                    JOIN employees e ON ae.employee_id = e.id 
                    WHERE ae.activity_id = a.id AND e.supervisor_id = $2
                ))
            `, [activity_id, employee_id]);
            
            if (managerCheck.rows.length === 0) {
                return res.status(403).json({ status: 'fail', message: 'Access Denied: You are not authorized to view this activity.' });
            }
        }

        res.status(200).json({
            status: 'success',
            data: activity
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
        const { name, activity_type, responsible_employee_id, location_id, project_name, employee_ids, activity_days, dates, description, images } = req.body;

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
            employee_ids_type: typeof employee_ids,
            employee_ids_isArray: Array.isArray(employee_ids),
            employee_ids_length: employee_ids?.length,
            activity_days,
            dates,
            images
        });

        // Check if activity exists and get its end_date
        const existingActivityResult = await pool.query(activityQueries.getActivityByIdQuery, [activity_id]);
        if (existingActivityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const existingActivity = existingActivityResult.rows[0];

        // Validate dates if provided
        if (dates && (!Array.isArray(dates) || dates.length === 0)) {
            return res.status(400).json({ message: 'dates must be a non-empty array' });
        }

        // If dates is provided, use dates.length as activity_days (dates takes precedence)
        // Only validate activity_days if it's provided AND dates is NOT provided
        const start_date = dates ? dates[0] : existingActivity.start_date;
        const end_date = dates ? dates[dates.length - 1] : existingActivity.end_date;
        const final_activity_days = dates ? dates.length : (activity_days || existingActivity.activity_days);

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

            const updateResult = await client.query(activityQueries.updateLocationActivityQuery, [
                name || existingActivity.name,
                activity_type || existingActivity.activity_type || 'Workshop',
                responsible_employee_id || existingActivity.employee_id || null,
                location_id || existingActivity.location_id,
                start_date,
                end_date,
                final_activity_days,
                final_description !== undefined ? final_description : existingActivity.description,
                final_project_name !== undefined ? final_project_name : existingActivity.project_name || null,
                final_images.length > 0 ? final_images : existingActivity.images || [],
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
        await autoImplementPastActivities();
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
            SELECT DISTINCT
                a.id,
                a.name,
                a.activity_type as type,
                a.project_name as project,
                a.employee_id,
                e.first_name || ' ' || e.last_name as responsible_employee,
                a.location_id,
                l.name as location,
                COALESCE(a.location_address, l.address) as location_address,
                COALESCE(a.location_latitude, l.latitude) as latitude,
                COALESCE(a.location_longitude, l.longitude) as longitude,
                a.start_date,
                a.end_date,
                a.start_date as date,
                a.activity_days as duration,
                a.status,
                a.implementation_status,
                a.approval_status,
                a.description,
                a.images,
                a.created_at,
                a.updated_at
            FROM activities a
            LEFT JOIN employees e ON a.employee_id = e.id
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN activity_employees ae ON a.id = ae.activity_id
            WHERE (
                a.employee_id = ANY($1::uuid[])
                OR ae.employee_id = ANY($1::uuid[])
            )
            AND ($2::DATE IS NULL OR DATE(a.start_date) = $2)
            AND ($3::TEXT IS NULL OR a.implementation_status = $3)
            AND ($4::TEXT IS NULL OR a.approval_status = $4)
            AND ($5::TEXT IS NULL OR a.name ILIKE '%' || $5 || '%')
            ORDER BY a.start_date DESC, a.created_at DESC
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
            approved: activities.filter(a => a.approval_status === 'Approved').length,
            pending: activities.filter(a => a.approval_status === 'Pending').length
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

        const isManager = String(req.user.role_name ?? '').trim().toLowerCase() === 'manager';
        const managerEmployeeId = req.user.employee_id;

        // 1. Get detailed activity records
        const recordsResult = await pool.query(`
            SELECT DISTINCT
                a.id,
                a.name,
                a.activity_type,
                a.description,
                a.start_date,
                a.end_date,
                a.implementation_status,
                a.approval_status,
                a.created_at,
                a.project_name,
                COALESCE(a.actual_date, a.start_date) as actual_date,
                (
                    COALESCE(a.attendees_count, 0) + 
                    (SELECT COUNT(DISTINCT ae3.employee_id) FROM activity_employees ae3 WHERE ae3.activity_id = a.id) + 
                    1
                ) as attendees_count,
                e.first_name || ' ' || e.last_name as responsible_employee,
                l.name as location_name
            FROM activities a
            LEFT JOIN employees e ON a.employee_id = e.id
            LEFT JOIN locations l ON a.location_id = l.id
            LEFT JOIN activity_employees ae ON a.id = ae.activity_id
            WHERE ($1::DATE IS NULL OR a.end_date >= $1::DATE)
              AND ($2::DATE IS NULL OR a.start_date <= $2::DATE)
              AND ($3::TEXT IS NULL OR LOWER(TRIM(a.activity_type)) = LOWER(TRIM($3::TEXT)))
              AND ($4::TEXT IS NULL OR (
                  CASE 
                    WHEN LOWER(TRIM($4::TEXT)) IN ('implemented', 'completed') THEN (a.implementation_status ILIKE 'Implemented' OR a.approval_status ILIKE 'Approved')
                    WHEN LOWER(TRIM($4::TEXT)) = 'in progress' THEN (a.implementation_status ILIKE 'Planned' AND a.approval_status NOT ILIKE 'Approved')
                    ELSE a.implementation_status ILIKE $4 
                  END
              ))
              AND ($5::TEXT IS NULL OR a.name ILIKE '%' || $5 || '%')
              AND ($6::UUID IS NULL OR a.employee_id = $6::UUID
                OR a.employee_id IN (SELECT id FROM employees WHERE supervisor_id = $6::UUID)
                OR EXISTS (
                    SELECT 1 FROM activity_employees ae2 
                    JOIN employees e2 ON ae2.employee_id = e2.id 
                    WHERE ae2.activity_id = a.id AND e2.supervisor_id = $6::UUID
                ))
            ORDER BY a.start_date DESC;
        `, [
            from || null,
            to || null,
            type && type !== 'All Type' ? type : null,
            status && status !== 'All Status' ? status : null,
            search || null,
            isManager ? managerEmployeeId : null
        ]);

        const fromD = from || null;
        const toD = to || null;

        // Scoping boilerplate for charts (Full current year)
        const currentYearStart = `${new Date().getFullYear()}-01-01`;
        const currentYearEnd = `${new Date().getFullYear()}-12-31`;
        let yearParams = [currentYearStart, currentYearEnd];
        let yearWhereClause = `WHERE (a.start_date >= $1::DATE AND a.start_date <= $2::DATE)`;

        if (isManager) {
            yearParams.push(managerEmployeeId);
            yearWhereClause += ` AND (
                a.employee_id = $3::UUID
                OR a.employee_id IN (SELECT id FROM employees WHERE supervisor_id = $3::UUID)
                OR EXISTS (
                    SELECT 1 FROM activity_employees ae2 
                    JOIN employees e2 ON ae2.employee_id = e2.id 
                    WHERE ae2.activity_id = a.id AND e2.supervisor_id = $3::UUID
                )
            )`;
        }

        // 2. Activity Completion Trend (Monthly for current year)
        const trendQuery = `
            SELECT 
                TO_CHAR(date_trunc('month', a.start_date), 'Mon') as month,
                COUNT(*) FILTER (WHERE a.implementation_status ILIKE 'Planned' OR a.implementation_status ILIKE 'Implemented' OR a.approval_status ILIKE 'Approved') as planned,
                COUNT(*) FILTER (WHERE a.implementation_status ILIKE 'Implemented' OR a.approval_status ILIKE 'Approved') as implemented
            FROM activities a
            ${yearWhereClause}
            GROUP BY date_trunc('month', a.start_date)
            ORDER BY date_trunc('month', a.start_date);
        `;

        // 3. Participants by Activity Type and Month (Current year)
        const participantsQuery = `
            SELECT 
                TO_CHAR(date_trunc('month', a.start_date), 'Mon') as month,
                LOWER(TRIM(a.activity_type)) as type,
                SUM(
                    COALESCE(a.attendees_count, 0) + 
                    (SELECT COUNT(DISTINCT ae4.employee_id) FROM activity_employees ae4 WHERE ae4.activity_id = a.id) + 
                    1
                ) as attendees
            FROM activities a
            ${yearWhereClause} AND (a.implementation_status ILIKE 'Implemented' OR a.approval_status ILIKE 'Approved')
            GROUP BY date_trunc('month', a.start_date), LOWER(TRIM(a.activity_type))
            ORDER BY date_trunc('month', a.start_date);
        `;

        const trendResult = await pool.query(trendQuery, yearParams);
        const participantsResult = await pool.query(participantsQuery, yearParams);

        res.status(200).json({
            status: 'success',
            records: recordsResult.rows,
            stats: {
                completionTrend: trendResult.rows,
                participantsByType: participantsResult.rows
            }
        });
    } catch (err) {
        console.error('Error fetching activity reports:', err);
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
        const { role_name, employee_id: managerEmployeeId } = req.user;

        if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
            return res.status(400).json({ message: 'employee_ids must be a non-empty array' });
        }

        // 1. Verify activity exists
        const activityRes = await client.query('SELECT id FROM activities WHERE id = $1', [activity_id]);
        if (activityRes.rowCount === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Employee primary keys are UUIDs (not integers)
        const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const ids = employee_ids.map((id) => String(id ?? '').trim()).filter((id) => uuidRe.test(id));
        if (ids.length !== employee_ids.length) {
            return res.status(400).json({ message: 'Invalid employee_ids' });
        }

        // Managers may only assign their direct reports
        if (role_name === 'Manager') {
            if (!managerEmployeeId) {
                return res.status(403).json({ message: 'Manager employee record required' });
            }
            const teamCheck = await client.query(
                `SELECT COUNT(*)::int AS cnt FROM employees
                 WHERE id = ANY($1::uuid[]) AND supervisor_id = $2::uuid`,
                [ids, managerEmployeeId]
            );
            const ok = (teamCheck.rows[0]?.cnt ?? 0) === ids.length;
            if (!ok) {
                return res.status(403).json({ message: 'You can only assign employees in your team' });
            }
        }

        await client.query('BEGIN');

        // 2. Assign employees
        for (const employee_id of ids) {
            await client.query(activityQueries.assignEmployeesToActivityQuery, [activity_id, employee_id]);
        }

        await client.query('COMMIT');

        res.status(200).json({
            status: 'success',
            message: `Successfully assigned ${ids.length} employee(s) to activity`
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in assignTeamToActivity:', err);
        res.status(500).json({ message: 'Error assigning team members', error: err.message });
    } finally {
        client.release();
    }
};


exports.autoImplementPastActivities = autoImplementPastActivities;
module.exports = exports;
