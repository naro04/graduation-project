const pool = require('../database/connection');

/**
 * Get notifications for the logged-in user
 */
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, limit]
        );

        const unreadCountResult = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            unreadCount: parseInt(unreadCountResult.rows[0].count),
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({
            message: 'Internal server error while fetching notifications',
            error: err.message
        });
    }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE, updated_at = NOW() 
             WHERE id = $1 AND user_id = $2 
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Notification not found or access denied'
            });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({
            message: 'Internal server error while updating notification',
            error: err.message
        });
    }
};

/**
 * Mark all notifications as read for the user
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await pool.query(
            'UPDATE notifications SET is_read = TRUE, updated_at = NOW() WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({
            message: 'Internal server error while updating notifications',
            error: err.message
        });
    }
};

/**
 * Helper function to create a notification (internal use)
 */
exports.createNotification = async (userId, type, title, message, link = null) => {
    try {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [userId, type, title, message, link]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error creating notification:', err);
        // We don't throw here to avoid breaking the main request
        return null;
    }
};
