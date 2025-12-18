const pool = require('../database/connection');
const locationQueries = require('../database/data/queries/locations');

exports.getAllLocations = async (req, res) => {
    try {
        const { status, search } = req.query;

        const result = await pool.query(locationQueries.getLocationsQuery, [
            status || null,
            search || null
        ]);

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching locations', error: err.message });
    }
};

exports.createLocation = async (req, res) => {
    try {
        const { name, address, latitude, longitude, location_type } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const result = await pool.query(locationQueries.createLocationQuery, [
            name,
            address || null,
            latitude || null,
            longitude || null,
            location_type || null
        ]);

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating location', error: err.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, latitude, longitude, location_type } = req.body;

        const result = await pool.query(locationQueries.updateLocationQuery, [
            name,
            address || null,
            latitude || null,
            longitude || null,
            location_type || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating location', error: err.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(locationQueries.deleteLocationQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Location deleted successfully'
        });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting location', error: err.message });
    }
};

exports.getLocationEmployees = async (req, res) => {
    try {
        const { location_id } = req.params;
        const result = await pool.query(locationQueries.getLocationEmployeesQuery, [location_id]);

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching location employees', error: err.message });
    }
};

exports.getLocationActivities = async (req, res) => {
    try {
        const { location_id } = req.params;
        const result = await pool.query(locationQueries.getLocationActivitiesQuery, [location_id]);

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching location activities', error: err.message });
    }
};

