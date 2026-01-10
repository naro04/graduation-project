const pool = require('../database/connection');
const activityQueries = require('../database/data/queries/locationActivities');
const locationQueries = require('../database/data/queries/locations');

exports.getAllActivities = async (req, res) => {
    try {
        const { date } = req.query;

        const result = await pool.query(activityQueries.getAllActivitiesQuery, [date || null]);

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
        const { name, activity_type, responsible_employee_id, location_id, employee_ids, activity_days, dates, description } = req.body;

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

        // Create activity
        const activityResult = await pool.query(activityQueries.createLocationActivityQuery, [
            name,
            activity_type || 'Workshop',
            responsible_employee_id || null,
            location_id,
            start_date,
            end_date,
            activity_days || dates.length,
            'Active',
            description || null
        ]);

        const activity = activityResult.rows[0];

        // Assign employees to activity
        for (const employee_id of employee_ids) {
            await pool.query(activityQueries.assignEmployeesToActivityQuery, [
                activity.id,
                employee_id
            ]);
        }

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
        res.status(500).json({ message: 'Error creating location activity', error: err.message });
    }
};

exports.updateLocationActivity = async (req, res) => {
    try {
        const { activity_id } = req.params;
        const { name, activity_type, responsible_employee_id, location_id, employee_ids, activity_days, dates, description } = req.body;

        console.log('Update activity request:', {
            activity_id,
            name,
            activity_type,
            responsible_employee_id,
            location_id,
            employee_ids,
            employee_ids_type: typeof employee_ids,
            employee_ids_isArray: Array.isArray(employee_ids),
            employee_ids_length: employee_ids?.length,
            activity_days,
            dates
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

        // Update activity
        const updateResult = await pool.query(activityQueries.updateLocationActivityQuery, [
            name || existingActivity.name,
            activity_type || existingActivity.activity_type || 'Workshop',
            responsible_employee_id || existingActivity.employee_id || null,
            location_id || existingActivity.location_id,
            start_date,
            end_date,
            final_activity_days,
            description !== undefined ? description : existingActivity.description,
            activity_id
        ]);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Update employee assignments if provided
        if (employee_ids && Array.isArray(employee_ids)) {
            console.log('Updating employee assignments for activity:', activity_id);
            console.log('Employee IDs to assign:', employee_ids);
            
            // Remove existing assignments
            const deleteResult = await pool.query(activityQueries.removeEmployeesFromActivityQuery, [activity_id]);
            console.log('Removed existing assignments:', deleteResult.rowCount);

            // Add new assignments
            for (const employee_id of employee_ids) {
                console.log('Assigning employee:', employee_id);
                const insertResult = await pool.query(activityQueries.assignEmployeesToActivityQuery, [
                    activity_id,
                    employee_id
                ]);
                console.log('Assignment result:', insertResult.rowCount);
            }
            console.log('Employee assignments updated successfully');
        } else {
            console.log('No employee_ids provided or not an array:', employee_ids);
        }

        res.status(200).json({
            status: 'success',
            data: updateResult.rows[0]
        });
    } catch (err) {
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

