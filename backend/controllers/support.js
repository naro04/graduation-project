const pool = require('../database/connection');

exports.getTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
        );

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching support tickets:', err);
        res.status(500).json({
            message: 'Internal server error while fetching support tickets',
            error: err.message
        });
    }
};

exports.createTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, category, message, attachment_url } = req.body;

        if (!subject || !category || !message) {
            return res.status(400).json({ message: 'Subject, category, and message are required' });
        }

        const result = await pool.query(
            'INSERT INTO support_tickets (user_id, subject, category, message, attachment_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, subject, category, message, attachment_url]
        );

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error creating support ticket:', err);
        res.status(500).json({
            message: 'Internal server error while creating support ticket',
            error: err.message
        });
    }
};
