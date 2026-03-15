const pool = require('../database/connection');
const assignmentQueries = require('../database/data/queries/locationAssignments');

exports.getLocationAssignments = async (req, res) => {
    try {
        const { employee_id } = req.query;

        const result = await pool.query(assignmentQueries.getLocationAssignmentsQuery, [
            employee_id || null
        ]);

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching location assignments', error: err.message });
    }
};

exports.createLocationAssignment = async (req, res) => {
    try {
        const { employee_id, location_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({ message: 'employee_id is required' });
        }

        if (!location_id) {
            return res.status(400).json({ message: 'location_id is required' });
        }

        const result = await pool.query(assignmentQueries.createLocationAssignmentQuery, [
            employee_id,
            location_id
        ]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Assignment already exists' });
        }

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating location assignment', error: err.message });
    }
};

exports.deleteLocationAssignment = async (req, res) => {
    try {
        const { employee_id, location_id } = req.params;

        // Start transaction
        await pool.query('BEGIN');

        // First, remove employee from any activities associated with this location
        await pool.query(`
            DELETE FROM activity_employees 
            WHERE employee_id = $1 
            AND activity_id IN (
                SELECT id FROM activities WHERE location_id = $2
            )
        `, [employee_id, location_id]);

        // Then remove the location assignment
        const result = await pool.query(assignmentQueries.deleteLocationAssignmentQuery, [
            employee_id,
            location_id
        ]);

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Location assignment not found' });
        }

        await pool.query('COMMIT');

        res.status(200).json({
            status: 'success',
            message: 'Location assignment and related activities deleted successfully'
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting location assignment', error: err.message });
    }
};

