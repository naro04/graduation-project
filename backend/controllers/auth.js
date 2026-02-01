const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../database/connection');
const {
  createUser,
  findUserByEmail,
  assignRole,
  retrieveUserPermissions,
  findRoleByName
} = require('../database/data/queries/auth');

const sendEmail = async (options) => {
  // 1) Create a transporter
  // Supports both Gmail and Outlook SMTP
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
  const isSecure = emailPort === 465;
  
  // Outlook uses smtp-mail.outlook.com or smtp.office365.com
  const isOutlook = emailHost.includes('outlook') || emailHost.includes('office365');
  
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Both Gmail and Outlook require TLS if not using secure port
    ...(isSecure ? {} : { requireTLS: true }),
    // Add connection timeout settings for Railway
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 20000,
    // Additional options for better connection handling
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates if needed
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: `HR System <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

const createSendToken = (user, statusCode, res, rememberMe = false) => {
  const token = signToken(user.id);
  
  // Set cookie expiration: 30 days if rememberMe is true, else based on env or default 24h
  const cookieExpiresInDays = rememberMe ? 30 : (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 24 / 24);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() +
      cookieExpiresInDays * 24 * 60 * 60 * 1000
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
      user
    }
  });
};

exports.register = async (req, res) => {
  const client = await pool.connect();
  try {
    let {
      name,
      first_name,
      last_name,
      email,
      password,
      confirm_password,
      phone,
      roleId
    } = req.body;

    // ... Handle Input Variations ... (existing logic)
    if (!first_name && req.body.firstName) first_name = req.body.firstName;
    if (!first_name && req.body['first-name']) first_name = req.body['first-name'];
    if (!last_name && req.body.lastName) last_name = req.body.lastName;
    if (!last_name && req.body['last-name']) last_name = req.body['last-name'];
    if (!confirm_password && req.body.confirmPassword) confirm_password = req.body.confirmPassword;
    if (!confirm_password && req.body['confirm-password'])
      confirm_password = req.body['confirm-password'];
    if (!phone && req.body.phone) phone = req.body.phone;

    if (!name && first_name && last_name) {
      name = `${first_name} ${last_name}`;
    }

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          message: 'First name, last name, email, and password are required'
        });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await client.query(findUserByEmail, [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await client.query('BEGIN');

    const newUserResult = await client.query(createUser, [
      name,
      email,
      hashedPassword
    ]);
    const newUser = newUserResult.rows[0];

    let targetRoleId = roleId;
    if (!targetRoleId) {
      const defaultRole = await client.query(findRoleByName, ['Office Staff']);
      if (defaultRole.rows.length > 0) {
        targetRoleId = defaultRole.rows[0].id;
      }
    }

    if (targetRoleId) {
      await client.query(assignRole, [newUser.id, targetRoleId]);
    }

    const employee_code = `EMP-${Date.now()}`;
    const finalFirstName = first_name || name.split(' ')[0];
    const finalLastName =
      last_name ||
      (name.split(' ').length > 1
        ? name.split(' ').slice(1).join(' ')
        : 'User');
    const finalPhone = phone || null;

    const empResult = await client.query(
      `
            INSERT INTO employees (user_id, email, first_name, last_name, full_name, phone, employee_code, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Inactive')
            RETURNING id
        `,
      [
        newUser.id,
        email,
        finalFirstName,
        finalLastName,
        name,
        finalPhone,
        employee_code
      ]
    );

    newUser.employee_id = empResult.rows[0].id;
    await client.query('COMMIT');

    createSendToken(newUser, 201, res);
  } catch (err) {
    await client.query('ROLLBACK');
    res
      .status(500)
      .json({
        message: 'Internal server error during registration',
        error: err.message
      });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email || req.body.emailOrId || req.body.identifier);
    const { email, emailOrId, identifier, password, rememberMe } = req.body;
    const loginId = (email || emailOrId || identifier || '')
      .toLowerCase()
      .trim();

    if (!loginId || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email/ID and password' });
    }

    const loginQuery = `
            SELECT u.*, e.id as employee_id, r.name as role_name, r.id as role_id
            FROM users u 
            LEFT JOIN employees e ON u.id = e.user_id 
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE LOWER(u.email) = $1 OR LOWER(e.employee_code) = $1;
        `;
    const result = await pool.query(loginQuery, [loginId]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const permResult = await pool.query(retrieveUserPermissions, [user.id]);
    user.permissions = permResult.rows.map((r) => r.slug);

    createSendToken(user, 200, res, rememberMe);
  } catch (err) {
    console.error("❌ Login error:", err.message);
    console.error("❌ Full error:", err);
    res
      .status(500)
      .json({
        message: 'Internal server error during login',
        error: err.message || err.toString()
      });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    // 1. Find user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      // For security, don't reveal if user exists. Just return success.
      return res.status(200).json({ 
        status: 'success', 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // 2. Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 3. Save to database
    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [hashedToken, expires, user.id]
    );

    // FOR TESTING: Log token to console
    console.log('--- PASSWORD RESET DEBUG ---');
    console.log('User:', email);
    console.log('Reset Token:', resetToken);
    console.log('----------------------------');

    // 4. Send real email
    // Point this to your FRONTEND URL (e.g., localhost:5173)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetURL = `${frontendURL}/reset-password?token=${resetToken}`;
    
    const message = `Forgot your password? Reset it here: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Hi,</p>
        <p>You requested a password reset for your account. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">Sent by HR System</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
        html
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to email'
      });
    } catch (err) {
      console.error('Error sending email:', err);
      console.error('Email config check:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER ? 'set' : 'missing',
        pass: process.env.EMAIL_PASS ? 'set' : 'missing',
        from: process.env.EMAIL_FROM
      });
      // If email fails, clear the token
      await pool.query(
        'UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1',
        [user.id]
      );
      return res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // 1. Find user with token that hasn't expired
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userResult = await pool.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [hashedToken]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // 2. Update password and clear token
    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully. You can now login.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success', message: 'Logged out' });
};

const { OAuth2Client } = require('google-auth-library');
const client_google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { googleToken } = req.body;
    
    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // 1. Fetch user info using the access token
    // Since we are getting an access_token from the frontend, we use it to call Google's userinfo API
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
    const payload = await response.json();

    if (!payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // 2. Check if user already exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];

    if (!user) {
      // 3. Create new user if they don't exist
      // Since it's Google Auth, we can use a random password or just mark it as social
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      
      const newUserResult = await pool.query(
        'INSERT INTO users (name, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, hashedPassword, picture]
      );
      user = newUserResult.rows[0];

      // Assign default role
      const defaultRole = await pool.query(findRoleByName, ['Office Staff']);
      if (defaultRole.rows.length > 0) {
        await pool.query(assignRole, [user.id, defaultRole.rows[0].id]);
      }

      // Create employee record with Inactive status
      const employee_code = `EMP-G-${Date.now()}`;
      await pool.query(
        'INSERT INTO employees (user_id, email, first_name, last_name, full_name, employee_code, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [user.id, email, name.split(' ')[0], name.split(' ').slice(1).join(' ') || 'User', name, employee_code, 'Inactive', picture]
      );
    }

    // 4. Send token
    createSendToken(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed. Please ensure GOOGLE_CLIENT_ID is set correctly in .env.' });
  }
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
