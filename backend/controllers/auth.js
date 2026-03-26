const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const pool = require('../database/connection');
const {
  createUser,
  findUserByEmail,
  assignRole,
  retrieveUserPermissions,
  findRoleByName,
  findUserById
} = require('../database/data/queries/auth');

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const sendEmail = async (options) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log('📨 Sending email via Resend API (HTTPS)...');

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(`Resend Error: ${error.message}`);
    }

    console.log('✅ Resend email sent successfully:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Resend API Exception:', err.message);
    throw err;
  }
};
//JWT Creation: generates the token.
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};
//jwt token creation and sending it to the client
const createSendToken = (user, statusCode, res, rememberMe = false) => {
  const token = signToken(user.id);

  // Set cookie expiration: 30 days if rememberMe is true, else based on env or default 24h
  const cookieExpiresInDays = rememberMe ? 30 : (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 24 / 24);
  //The token is placed inside an `httpOnly` cookie for secure storage.
  const cookieOptions = {
    expires: new Date(
      Date.now() +
      cookieExpiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  };
  // send the token to the client without the password
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
      return res.status(400).json({
        message: 'Please fill in all required fields'
      });
    }

    if (!req.body.privacyPolicyAgreement) {
      return res.status(400).json({
        message: 'You must agree to the privacy policy to continue.'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (confirm_password && password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    //check if the email already exists,Duplicate Check:
    //Queries the database using `findUserByEmail` to ensure the email is unique.
    const existingUser = await client.query(findUserByEmail, [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    //Hashes the password securely before saving
    const hashedPassword = await bcrypt.hash(password, 12);
    //transaction start to ensure atomicity
    await client.query('BEGIN');
    //Creates a new user record in the database using the `createUser` query.
    const newUserResult = await client.query(createUser, [
      name,
      email,
      hashedPassword
    ]);
    const newUser = newUserResult.rows[0];
    //Assigns a role to the newly created user,Role Assignment: If no specific
    //role is requested, it fetches the default 'Office Staff' role (`findRoleByName`)
    //and inserts it into `user_roles` via the `assignRole` query.
    let targetRoleId = roleId;
    if (!targetRoleId) {
      const defaultRole = await client.query(findRoleByName, ['Office Staff']);
      if (defaultRole.rows.length > 0) {
        targetRoleId = defaultRole.rows[0].id;
      }
    }
    //Inserts the role assignment into the `user_roles` junction table.
    if (targetRoleId) {
      await client.query(assignRole, [newUser.id, targetRoleId]);
    }
    //Creates a unique employee code for the new user.
    //Employee Creation: Automatically creates a linked record in 
    //the `employees` table, generating a unique `employee_code` (`EMP-{Date.now()}`)
    //and setting the initial status to 'Inactive'.
    const employee_code = `EMP-${Date.now()}`;
    const finalFirstName = first_name || name.split(' ')[0];
    const finalLastName =
      last_name ||
      (name.split(' ').length > 1
        ? name.split(' ').slice(1).join(' ')
        : 'User');
    const finalPhone = phone || null;
    //Inserts the employee record into the `employees` table.
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
    //Assigns the new employee ID to the user object.
    newUser.employee_id = empResult.rows[0].id;
    //Commits the transaction, making all changes permanent.
    await client.query('COMMIT');
    //Sends the newly created user object back to the client with a JWT token.
    createSendToken(newUser, 201, res);
  } catch (err) {
    //Rolls back the transaction if any error occurs.
    if (client) await client.query('ROLLBACK');
    console.error('Registration error:', err);
    //Sends an error response to the client.
    res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
  } finally {
    //Releases the client back to the pool.
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
    // If the password matches, it queries the DB (`retrieveUserPermissions`)
    // to get the permission slugs associated with the user's role.
    const permResult = await pool.query(retrieveUserPermissions, [user.id]);
    user.permissions = permResult.rows.map((r) => r.slug);

    createSendToken(user, 200, res, rememberMe);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'An error occurred during login. Please try again.' });
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

    console.log('🔍 Password reset request for:', email);
    console.log('👤 User found:', user ? 'Yes' : 'No');

    if (!user) {
      // For security, don't reveal if user exists. Just return success.
      return res.status(200).json({
        status: 'success',
        message: 'If this email is registered and allowed to reset passwords, you will receive a reset email shortly.'
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
      console.log('📧 Sending email via Resend API (HTTPS)...');
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
        html
      });
      console.log('✅ Email sent successfully to:', user.email);

      res.status(200).json({
        status: 'success',
        message: 'If this email is registered and allowed to reset passwords, you will receive a reset email shortly.'
      });
    } catch (err) {
      console.error('❌ Error sending email:', err);
      console.error('Email config check:', {
        resendKey: process.env.RESEND_API_KEY ? 'set' : 'missing',
        emailFrom: 'onboarding@resend.dev'
      });
      // If email fails, clear the token
      await pool.query(
        'UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1',
        [user.id]
      );
      return res.status(200).json({
        status: 'success',
        message: 'If this email is registered and allowed to reset passwords, you will receive a reset email shortly.'
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(200).json({
      status: 'success',
      message: 'If this email is registered and allowed to reset passwords, you will receive a reset email shortly.'
    });
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

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
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
    res.status(500).json({ message: 'An error occurred while resetting your password. Please try again.' });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success', message: 'Logged out' });
};
//Google Authentication: Handles OAuth 2.0 flow for Google Sign-In.
const { OAuth2Client } = require('google-auth-library');
//Creates a new OAuth2Client instance for Google authentication.
const client_google = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//Handles the Google OAuth 2.0 flow for user authentication.
exports.googleAuth = async (req, res) => {
  //Acquires a client from the pool for database operations.
  const client = await pool.connect();
  try {
    const { googleToken } = req.body;
    //Checks if the Google token is provided.
    if (!googleToken) {
      return res.status(400).json({ message: 'Google token is required' });
    }
    //Fetches user information from Google's OAuth 2.0 endpoint.
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
    const payload = await response.json();
    //Checks if the Google token is valid.
    if (!payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
    //Extracts user information from the payload.
    const { sub: googleId, email, name, picture } = payload;
    //Starts a database transaction.
    await client.query('BEGIN');
    //Checks if the user already exists in the database.
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];
    //If the user does not exist, creates a new user.
    if (!user) {
      // Create new user
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      //Inserts the new user into the database.
      const newUserResult = await client.query(
        'INSERT INTO users (name, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, hashedPassword, picture]
      );
      user = newUserResult.rows[0];

      // Assign default role ('Office Staff')
      const defaultRole = await client.query(findRoleByName, ['Office Staff']);
      if (defaultRole.rows.length > 0) {
        await client.query(assignRole, [user.id, defaultRole.rows[0].id]);
      }

      // Create employee record with Inactive status
      const employee_code = `EMP-G-${Date.now()}`;
      await client.query(
        'INSERT INTO employees (user_id, email, first_name, last_name, full_name, employee_code, status, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [user.id, email, name.split(' ')[0], name.split(' ').slice(1).join(' ') || 'User', name, employee_code, 'Inactive', picture]
      );
    }

    await client.query('COMMIT');

    // Fetch full user data including roles and employee status
    const fullUserResult = await pool.query(findUserById, [user.id]);
    const fullUser = fullUserResult.rows[0];

    createSendToken(fullUser, 200, res);
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed' });
  } finally {
    if (client) client.release();
  }
};
//Retrieves the currently logged-in user's information.
exports.getMe = async (req, res) => {
  // req.user is set by middleware (including role_name and permissions)
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};
