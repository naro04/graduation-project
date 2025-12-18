const pool = require('../database/connection');
const activityQueries = require('../database/data/queries/locationActivities');
const locationQueries = require('../database/data/queries/locations');

exports.createLocationActivity = async (req, res) => {
    try {
        const { name, location_id, employee_ids, activity_days, dates } = req.body;

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
            location_id,
            start_date,
            end_date,
            activity_days || dates.length,
            'Active'
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
        const { name, location_id, employee_ids, activity_days, dates } = req.body;

        // Check if activity exists and get its end_date
        const existingActivityResult = await pool.query(activityQueries.getActivityByIdQuery, [activity_id]);
        if (existingActivityResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        const existingActivity = existingActivityResult.rows[0];

        // Check if activity has past end date
        if (existingActivity.end_date && new Date(existingActivity.end_date) < new Date()) {
            return res.status(400).json({ message: 'Cannot edit activity with past end date' });
        }

        const start_date = dates ? dates[0] : existingActivity.start_date;
        const end_date = dates ? dates[dates.length - 1] : existingActivity.end_date;
        const final_activity_days = activity_days || (dates ? dates.length : existingActivity.activity_days);

        // Update activity
        const updateResult = await pool.query(activityQueries.updateLocationActivityQuery, [
            name || existingActivity.name,
            location_id || existingActivity.location_id,
            start_date,
            end_date,
            final_activity_days,
            activity_id
        ]);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Update employee assignments if provided
        if (employee_ids && Array.isArray(employee_ids)) {
            // Remove existing assignments
            await pool.query(activityQueries.removeEmployeesFromActivityQuery, [activity_id]);

            // Add new assignments
            for (const employee_id of employee_ids) {
                await pool.query(activityQueries.assignEmployeesToActivityQuery, [
                    activity_id,
                    employee_id
                ]);
            }
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

        const result = await pool.query(activityQueries.getActivityEmployeesQuery, [activity_id]);

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching activity employees', error: err.message });
    }
};

