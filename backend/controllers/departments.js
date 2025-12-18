const pool = require('../database/connection');
const deptQueries = require('../database/data/queries/departments');

exports.getAllDepartments = async (req, res) => {
    try {
        const result = await pool.query(deptQueries.getDepartments);
        res.status(200).json({ status: 'success', results: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching departments', error: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        const result = await pool.query(deptQueries.createDepartment, [name, description, status || 'active']);
        res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error creating department', error: err.message });
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
        res.status(500).json({ message: 'Error updating department', error: err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(deptQueries.deleteDepartment, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ status: 'success', message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting department', error: err.message });
    }
};

exports.getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(deptQueries.getDepartmentById, [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Department not found' });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching department', error: err.message });
    }
}
