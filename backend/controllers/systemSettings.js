const pool = require('../database/connection');

const getSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_settings WHERE id = 1');
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Settings not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching system settings:', err);
        res.status(500).json({ message: 'Internal server error while fetching system settings' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        const fields = [];
        const values = [];
        let index = 1;

        // Extract description for history if provided
        const changeDescription = req.body._changeDescription || 'Updated system configuration';
        const changeType = req.body._changeType || 'General';
        
        // Remove internal fields from update
        delete settings._changeDescription;
        delete settings._changeType;

        for (const [key, value] of Object.entries(settings)) {
            // Validate key against allowed columns (optional but recommended)
            if (key !== 'id' && key !== 'updated_at') {
                fields.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Update settings
        const updateQuery = `
            UPDATE system_settings 
            SET ${fields.join(', ')}, updated_at = NOW() 
            WHERE id = 1 
            RETURNING *
        `;
        const result = await pool.query(updateQuery, values);

        // Add to history
        await pool.query(
            'INSERT INTO system_configuration_history (change_type, description, changed_by) VALUES ($1, $2, $3)',
            [changeType, changeDescription, req.user.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating system settings:', err);
        res.status(500).json({ message: 'Internal server error while updating system settings' });
    }
};

const getSettingsHistory = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, u.name as changed_by_name 
            FROM system_configuration_history h
            JOIN users u ON h.changed_by = u.id
            ORDER BY h.changed_at DESC
            LIMIT 20
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching settings history:', err);
        res.status(500).json({ message: 'Internal server error while fetching settings history' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getSettingsHistory
};

