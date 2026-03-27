const pool = require('../database/connection');

exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if settings exist
        const result = await pool.query(
            'SELECT * FROM user_notification_settings WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // Create default settings if they don't exist
            const insertResult = await pool.query(
                `INSERT INTO user_notification_settings (user_id) 
                 VALUES ($1) 
                 RETURNING *`,
                [userId]
            );
            return res.status(200).json({
                status: 'success',
                data: insertResult.rows[0]
            });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching notification settings:', err);
        res.status(500).json({
            message: 'Internal server error while fetching notification settings',
            error: err.message
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Build dynamic update query to prevent overwriting missing fields with defaults if not intended,
        // though for settings we usually send the whole object.
        const allowedFields = [
            'attendance_check_in_out_email', 'attendance_check_in_out_in_app',
            'attendance_late_arrival_email', 'attendance_late_arrival_in_app',
            'attendance_early_departure_email', 'attendance_early_departure_in_app',
            'leave_new_request_email', 'leave_new_request_in_app',
            'leave_request_approved_email', 'leave_request_approved_in_app',
            'leave_request_rejected_email', 'leave_request_rejected_in_app',
            'activity_new_assigned_email', 'activity_new_assigned_in_app',
            'activity_completed_email', 'activity_completed_in_app',
            'activity_overdue_email', 'activity_overdue_in_app'
        ];

        const setClauses = [];
        const values = [userId];
        let paramIdx = 2;

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = $${paramIdx}`);
                values.push(updates[field]);
                paramIdx++;
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const query = `
            UPDATE user_notification_settings 
            SET ${setClauses.join(', ')}, updated_at = NOW()
            WHERE user_id = $1
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            // If they didn't exist, create them now with the provided values
            const fields = ['user_id'];
            const placeholders = ['$1'];
            const insertValues = [userId];
            let insertIdx = 2;

            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    fields.push(field);
                    placeholders.push(`$${insertIdx}`);
                    insertValues.push(updates[field]);
                    insertIdx++;
                }
            }

            const insertQuery = `
                INSERT INTO user_notification_settings (${fields.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING *
            `;
            const insertResult = await pool.query(insertQuery, insertValues);

            return res.status(200).json({
                status: 'success',
                data: insertResult.rows[0]
            });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error updating notification settings:', err);
        res.status(500).json({
            message: 'Internal server error while updating notification settings',
            error: err.message
        });
    }
};
