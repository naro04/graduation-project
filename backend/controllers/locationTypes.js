const pool = require('../database/connection');
const locationTypeQueries = require('../database/data/queries/locationTypes');

exports.getAllLocationTypes = async (req, res) => {
    try {
        const result = await pool.query(locationTypeQueries.getLocationTypesQuery);
        
        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching location types', error: err.message });
    }
};

exports.createLocationType = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const result = await pool.query(locationTypeQueries.createLocationTypeQuery, [
            name,
            description || null,
            status || 'active'
        ]);

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating location type', error: err.message });
    }
};

exports.updateLocationType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        const result = await pool.query(locationTypeQueries.updateLocationTypeQuery, [
            name,
            description || null,
            status || 'active',
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location type not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating location type', error: err.message });
    }
};

exports.deleteLocationType = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(locationTypeQueries.deleteLocationTypeQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location type not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Location type deleted successfully'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting location type', error: err.message });
    }
};
