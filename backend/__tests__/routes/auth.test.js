const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('../../routes/auth');
const pool = require('../../database/connection');
const jwt = require('jsonwebtoken');

// Mock the database connection
jest.mock('../../database/connection', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('Auth Router', () => {
  let app;
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password_hash: '$2b$12$hashedpassword',
    role_name: 'Employee',
    role_id: 'role-id-1',
  };
  const testToken = 'test-jwt-token';

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    
    // Set up routes
    app.use('/api/v1/auth', authRouter);
    
    // Set default JWT secret
    process.env.JWT_SECRET = 'test-secret';
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Helper function to setup jwt.verify mock
  const setupJwtVerify = () => {
    jwt.verify.mockImplementation((token) => {
      if (token === 'invalid-token' || !token || token === 'loggedout') {
        throw new Error('Invalid token');
      }
      return { id: testUser.id };
    });
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
      };

      const defaultRole = {
        id: 'role-id-1',
      };

      const clientQuery = jest.fn().mockImplementation((query, params) => {
        // Handle transaction commands first
        if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') {
          return Promise.resolve({ rows: [] });
        }
        
        // Normalize query string (remove extra whitespace for matching)
        const normalizedQuery = typeof query === 'string' ? query.replace(/\s+/g, ' ').trim() : '';
        
        // Check if user exists by email - matches findUserByEmail query pattern
        // This is called on the client (inside transaction) but should match the same pattern
        if ((normalizedQuery.includes('SELECT') && normalizedQuery.includes('FROM users') && 
             normalizedQuery.includes('WHERE u.email = $1')) ||
            (normalizedQuery.includes('users') && normalizedQuery.includes('email') && 
             params && params[0] === 'newuser@example.com')) {
          return Promise.resolve({ rows: [] }); // User doesn't exist
        }
        
        // Create user - matches createUser query pattern
        if (normalizedQuery.includes('INSERT INTO users') && 
            normalizedQuery.includes('password_hash') &&
            normalizedQuery.includes('RETURNING')) {
          return Promise.resolve({ rows: [newUser] });
        }
        
        // Get role by name - matches findRoleByName query pattern
        // Check both by query pattern and by params as fallback
        if ((normalizedQuery.includes('SELECT id FROM roles WHERE name = $1') ||
             (normalizedQuery.includes('roles') && normalizedQuery.includes('name = $1'))) ||
            (params && params.length > 0 && params[0] === 'Employee')) {
          return Promise.resolve({ rows: [defaultRole] });
        }
        
        // Assign role - matches assignRole query pattern
        if (normalizedQuery.includes('INSERT INTO user_roles') && 
            normalizedQuery.includes('user_id') && normalizedQuery.includes('role_id')) {
          return Promise.resolve({ rows: [] });
        }
        
        // Create employee - matches the inline INSERT query
        if (normalizedQuery.includes('INSERT INTO employees') && 
            normalizedQuery.includes('employee_code')) {
          return Promise.resolve({ rows: [] });
        }
        
        return Promise.resolve({ rows: [] });
      });

      bcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');
      jwt.sign.mockReturnValue(testToken);
      setupJwtVerify();

      // Mock pool.query for the initial findUserByEmail call (before transaction)
      pool.query.mockImplementation((query, params) => {
        const normalizedQuery = typeof query === 'string' ? query.replace(/\s+/g, ' ').trim() : '';
        if (normalizedQuery.includes('SELECT') && normalizedQuery.includes('FROM users') && 
            normalizedQuery.includes('WHERE u.email = $1') && params && params[0] === 'newuser@example.com') {
          return Promise.resolve({ rows: [] }); // User doesn't exist
        }
        return Promise.resolve({ rows: [] });
      });

      // Mock pool.connect for transaction
      pool.connect = jest.fn().mockResolvedValue({
        query: clientQuery,
        release: jest.fn(),
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('newuser@example.com');
    });

    it('should return 400 if email already exists', async () => {
      pool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT') && query.includes('WHERE u.email')) {
          return Promise.resolve({ rows: [testUser] }); // User exists
        }
        return Promise.resolve({ rows: [] });
      });

      const clientQuery = jest.fn().mockImplementation((query, params) => {
        if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT') && query.includes('WHERE u.email')) {
          return Promise.resolve({ rows: [testUser] }); // User exists
        }
        return Promise.resolve({ rows: [] });
      });

      pool.connect = jest.fn().mockResolvedValue({
        query: clientQuery,
        release: jest.fn(),
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // Missing name and password
        })
        .expect(400);

      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      pool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT u.*, r.name as role_name')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(testToken);
      setupJwtVerify();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should login successfully with employee_code', async () => {
      const userWithEmployeeCode = {
        ...testUser,
        employee_code: 'EMP001',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT u.*, r.name as role_name')) {
          return Promise.resolve({ rows: [userWithEmployeeCode] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(testToken);
      setupJwtVerify();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'EMP001',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 401 with invalid credentials', async () => {
      pool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT u.*, r.name as role_name')) {
          return Promise.resolve({ rows: [] }); // User not found
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 with wrong password', async () => {
      pool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT u.*, r.name as role_name')) {
          return Promise.resolve({ rows: [testUser] });
        }
        return Promise.resolve({ rows: [] });
      });

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password
        })
        .expect(400);

      expect(response.body.message).toContain('email/ID and password');
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toBe('Logged out');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user info with valid token', async () => {
      setupJwtVerify();
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', `token=${testToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('user');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });

    it('should return 401 with invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', 'token=invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});

