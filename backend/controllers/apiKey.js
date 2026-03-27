const pool = require('../database/connection');
const crypto = require('crypto');

exports.getKeys = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching API keys:', err);
        res.status(500).json({
            message: 'Internal server error while fetching API keys',
            error: err.message
        });
    }
};

exports.createKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, permissions } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Key name is required' });
        }

        // Generate a random key: sk_live_...
        const randomString = crypto.randomBytes(24).toString('hex');
        const apiKey = `sk_live_${randomString}`;

        const result = await pool.query(
            'INSERT INTO api_keys (user_id, name, api_key, permissions) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, name, apiKey, permissions || ['read']]
        );

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating API key:', err);
        res.status(500).json({
            message: 'Internal server error while creating API key',
            error: err.message
        });
    }
};

exports.deleteKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'API key not found' });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        console.error('Error deleting API key:', err);
        res.status(500).json({
            message: 'Internal server error while deleting API key',
            error: err.message
        });
    }
};

exports.rotateKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Generate a new key value
        const randomString = crypto.randomBytes(24).toString('hex');
        const newApiKey = `sk_live_${randomString}`;

        const result = await pool.query(
            'UPDATE api_keys SET api_key = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
            [newApiKey, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'API key not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error rotating API key:', err);
        res.status(500).json({
            message: 'Internal server error while rotating API key',
            error: err.message
        });
    }
};
