const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');
const { createUser, findUserByEmail, assignRole, retrieveUserPermissions, findRoleByName } = require('../database/data/queries/auth');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 24) * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    };

    res.cookie('token', token, cookieOptions);
    user.password_hash = undefined; // Hide password
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.register = async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, email, password, roleId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user exists
        const existingUser = await client.query(findUserByEmail, [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        await client.query('BEGIN');

        // Create user
        const newUserResult = await client.query(createUser, [name, email, hashedPassword]);
        const newUser = newUserResult.rows[0];

        // Assign Role
        let targetRoleId = roleId;
        if (!targetRoleId) {
            const defaultRole = await client.query(findRoleByName, ['Employee']);
            if (defaultRole.rows.length > 0) {
                targetRoleId = defaultRole.rows[0].id;
            }
        }

        if (targetRoleId) {
            await client.query(assignRole, [newUser.id, targetRoleId]);
        }

        // Create initial employee record
        const employee_code = `EMP-${Date.now()}`;
        const nameParts = name.split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

        await client.query(`
            INSERT INTO employees (user_id, email, first_name, last_name, full_name, employee_code)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [newUser.id, email, first_name, last_name, name, employee_code]);

        await client.query('COMMIT');

        createSendToken(newUser, 201, res);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Internal server error during registration', error: err.message });
    } finally {
        client.release();
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginId = (email || '').toLowerCase().trim();

        if (!loginId || !password) {
            return res.status(400).json({ message: 'Please provide email/ID and password' });
        }

        // Support both email and employee_code login for consistency
        const loginQuery = `
            SELECT u.*, r.name as role_name, r.id as role_id
            FROM users u 
            LEFT JOIN employees e ON u.id = e.user_id 
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = $1 OR e.employee_code = $1;
        `;
        const result = await pool.query(loginQuery, [loginId]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Fetch permissions for response
        const permResult = await pool.query(retrieveUserPermissions, [user.id]);
        user.permissions = permResult.rows.map(r => r.slug);

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error during login', error: err.message });
    }
};

exports.logout = (req, res) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success', message: 'Logged out' });
};

exports.getMe = async (req, res) => {
    // req.user is set by middleware (including role_name and permissions)
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};
