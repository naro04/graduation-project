const pool = require('../database/connection');
const positionQueries = require('../database/data/queries/positions');

exports.getAllPositions = async (req, res) => {
    try {
        const result = await pool.query(positionQueries.getPositionsQuery);
        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching positions:', err);
        res.status(500).json({ message: 'Error fetching positions', error: err.message });
    }
};

exports.createPosition = async (req, res) => {
    try {
        const { department_id, title, description } = req.body;

        if (!title) {
            return res.status(400).json({ status: 'fail', message: 'Title is required' });
        }

        const result = await pool.query(positionQueries.createPositionQuery, [
            department_id || null,
            title,
            description || null
        ]);

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating position:', err);
        res.status(500).json({ message: 'Error creating position', error: err.message });
    }
};

exports.updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_id, title, description } = req.body;

        const result = await pool.query(positionQueries.updatePositionQuery, [
            department_id || null,
            title,
            description || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'Position not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating position:', err);
        res.status(500).json({ message: 'Error updating position', error: err.message });
    }
};

exports.deletePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(positionQueries.deletePositionQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Position not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Position deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting position:', err);
        res.status(500).json({ message: 'Error deleting position', error: err.message });
    }
};
