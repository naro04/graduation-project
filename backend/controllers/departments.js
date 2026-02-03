const pool = require('../database/connection');
const deptQueries = require('../database/data/queries/departments');

exports.getAllDepartments = async (req, res) => {
    try {
        const result = await pool.query(deptQueries.getDepartments);
        res.status(200).json({ status: 'success', results: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ message: 'An error occurred while fetching departments. Please try again.' });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const result = await pool.query(deptQueries.createDepartment, [name, description, status || 'active']);
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error creating department:', err);
        res.status(500).json({ message: 'An error occurred while creating the department. Please try again.' });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const result = await pool.query(deptQueries.updateDepartment, [name, description, status, id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error updating department:', err);
        res.status(500).json({ message: 'An error occurred while updating the department. Please try again.' });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(deptQueries.deleteDepartment, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ status: 'success', message: 'Department deleted' });
    } catch (err) {
        console.error('Error deleting department:', err);
        res.status(500).json({ message: 'An error occurred while deleting the department. Please try again.' });
    }
};

exports.getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(deptQueries.getDepartmentById, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        console.error('Error fetching department:', err);
        res.status(500).json({ message: 'An error occurred while fetching the department details. Please try again.' });
    }
};

exports.bulkAction = async (req, res) => {
    try {
        const { action, ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid or missing IDs' });
        }

        let result;
        if (action === 'delete') {
            result = await pool.query(deptQueries.bulkDeleteDepartments, [ids]);
        } else if (action === 'review') {
            result = await pool.query(deptQueries.bulkMarkAsReviewed, [ids]);
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        res.status(200).json({
            status: 'success',
            message: `Successfully performed ${action} on ${result.rowCount} items`,
            data: result.rows
        });
    } catch (err) {
        console.error('Error performing bulk action:', err);
        let message = 'An error occurred while performing the bulk action.';
        if (err.code === '23503') {
            message = 'Cannot delete departments that have linked employees or positions.';
        }
        res.status(500).json({ message });
    }
};
