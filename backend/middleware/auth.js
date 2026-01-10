const jwt = require('jsonwebtoken');
const pool = require('../database/connection');
const { retrieveUserPermissions, findUserById } = require('../database/data/queries/auth');

const protect = async (req, res, next) => {

    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, please login' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Check if user still exists
        const userResult = await pool.query(findUserById, [decoded.id]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        const user = userResult.rows[0];

        // Fetch permissions
        const permResult = await pool.query(retrieveUserPermissions, [user.id]);
        user.permissions = permResult.rows.map(row => row.slug);

        // Prefer employee avatar over user avatar
        user.avatar_url = user.employee_avatar_url || user.avatar_url;

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
};

const restrictTo = (...requiredPermissions) => {
    return (req, res, next) => {
        // If user is Super Admin, bypass check
        if (req.user && req.user.role_name === 'Super Admin') {
            return next();
        }

        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }

        const hasPermission = requiredPermissions.some(perm => req.user.permissions.includes(perm));

        if (!hasPermission) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
