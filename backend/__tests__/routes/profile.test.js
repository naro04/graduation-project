const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const profileRouter = require('../../routes/profile');
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

describe('Profile Router', () => {
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
    app.use('/api/v1/profile', profileRouter);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set default JWT secret
    process.env.JWT_SECRET = 'test-secret';
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

  // Helper function to login and get token
  const loginUser = async () => {
    // Mock login query
    pool.query.mockImplementation((query, params) => {
      if (query.includes('SELECT u.*, r.name as role_name')) {
        // Login query
        return Promise.resolve({
          rows: [testUser],
        });
      }
      if (query.includes('SELECT DISTINCT p.slug')) {
        // Permissions query
        return Promise.resolve({
          rows: [{ slug: 'menu:dashboard' }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue(testToken);
    setupJwtVerify(); // Setup jwt.verify for login

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'password123',
      });

    return loginResponse;
  };

  describe('GET /profile/me', () => {
    it('should return user profile successfully with valid token', async () => {
      // Login first
      const loginResponse = await loginUser();
      expect(loginResponse.status).toBe(200);
      
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      // Setup jwt.verify for protect middleware
      setupJwtVerify();
      
      pool.query.mockImplementation((query, params) => {
        // findUserById query (from protect middleware) - has user_roles but NOT employees
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({
            rows: [testUser],
          });
        }
        // Permissions query (from protect middleware)
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({
            rows: [{ slug: 'menu:dashboard' }],
          });
        }
        // getMe query - has employees join and positions join
        if (query.includes('LEFT JOIN employees e ON u.id = e.user_id') && query.includes('LEFT JOIN positions')) {
          return Promise.resolve({
            rows: [{
              id: testUser.id,
              email: testUser.email,
              name: testUser.name,
              avatar_url: 'https://example.com/avatar.jpg',
            }],
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/profile/me')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile/me')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });

    it('should return 401 when token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/v1/profile/me')
        .set('Cookie', 'token=invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 when profile not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      // Mock jwt.verify to return decoded token - must be set after loginUser
      jwt.verify.mockImplementation((token) => {
        if (token === 'invalid-token' || !token) {
          throw new Error('Invalid token');
        }
        return { id: testUser.id };
      });
      
      pool.query.mockImplementation((query, params) => {
        // findUserById query (from protect middleware) - has user_roles but NOT employees
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        // Permissions query (from protect middleware)
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getMe query - has employees join and positions join - return empty to simulate profile not found
        if (query.includes('LEFT JOIN employees e ON u.id = e.user_id') && query.includes('LEFT JOIN positions')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/profile/me')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body).toEqual({ message: 'Profile not found' });
    });

    it('should return 500 on database error', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      // Mock jwt.verify to return decoded token - must be set after loginUser
      jwt.verify.mockImplementation((token) => {
        if (token === 'invalid-token' || !token) {
          throw new Error('Invalid token');
        }
        return { id: testUser.id };
      });
      
      pool.query.mockImplementation((query, params) => {
        // findUserById query (from protect middleware) - has user_roles but NOT employees
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        // Permissions query (from protect middleware)
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getMe query - has employees join and positions join - throw error
        if (query.includes('LEFT JOIN employees e ON u.id = e.user_id') && query.includes('LEFT JOIN positions')) {
          throw new Error('Database error');
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/profile/me')
        .set('Cookie', `token=${token}`)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error fetching profile');
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('GET /profile/personal-info', () => {
    it('should return personal info successfully with valid token', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getPersonalInfoQuery
        return Promise.resolve({
          rows: [{
            id: 'emp-123',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            birth_date: '1990-01-01',
            gender: 'Male',
            marital_status: 'Single',
          }],
        });
      });

      const response = await request(app)
        .get('/api/v1/profile/personal-info')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('first_name');
      expect(response.body.first_name).toBe('John');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile/personal-info')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });

    it('should return 404 when employee not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/profile/personal-info')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body).toEqual({ message: 'Employee not found' });
    });
  });

  describe('GET /profile/job-info', () => {
    it('should return job info successfully with valid token', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getJobInfoQuery
        return Promise.resolve({
          rows: [{
            employee_code: 'EMP001',
            department_name: 'Engineering',
            position_title: 'Software Engineer',
            employment_type: 'Full-Time',
            status: 'active',
            hired_at: '2023-01-01',
          }],
        });
      });

      const response = await request(app)
        .get('/api/v1/profile/job-info')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('employee_code');
      expect(response.body.employee_code).toBe('EMP001');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile/job-info')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('GET /profile/emergency-contact', () => {
    it('should return emergency contacts successfully with valid token', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getEmergencyContactQuery
        return Promise.resolve({
          rows: [
            {
              id: 'contact-1',
              name: 'Jane Doe',
              relationship: 'Spouse',
              phone: '9876543210',
            },
            {
              id: 'contact-2',
              name: 'John Doe Sr',
              relationship: 'Father',
              phone: '9876543211',
            },
          ],
        });
      });

      const response = await request(app)
        .get('/api/v1/profile/emergency-contact')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile/emergency-contact')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('GET /profile/location', () => {
    it('should return locations successfully with valid token', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getLocationQuery
        return Promise.resolve({
          rows: [
            {
              id: 'loc-1',
              name: 'Head Office',
              address: '123 Main St',
              latitude: 31.5000,
              longitude: 34.4667,
              location_type: 'Office',
            },
          ],
        });
      });

      const response = await request(app)
        .get('/api/v1/profile/location')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile/location')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('GET /profile/work-schedule', () => {
    it('should return work schedule successfully with valid token and dates', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // getWorkScheduleQuery
        return Promise.resolve({
          rows: [
            {
              date: '2024-01-01',
              check_in_time: '2024-01-01 08:00:00',
              check_out_time: '2024-01-01 17:00:00',
              daily_status: 'Present',
            },
          ],
        });
      });

      const response = await request(app)
        .get('/api/v1/profile/work-schedule?startDate=2024-01-01&endDate=2024-01-31')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 when startDate is missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/profile/work-schedule?endDate=2024-01-31')
        .set('Cookie', `token=${token}`)
        .expect(400);

      expect(response.body).toEqual({
        message: 'startDate and endDate query parameters are required',
      });
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/profile/work-schedule?startDate=2024-01-01&endDate=2024-01-31')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('PUT /profile/account-security', () => {
    it('should update password successfully with valid token', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      bcrypt.hash.mockResolvedValue('$2b$12$newhashedpassword');
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // updateAccountSecurity query
        return Promise.resolve({
          rows: [{ id: testUser.id }],
        });
      });

      const response = await request(app)
        .put('/api/v1/profile/account-security')
        .set('Cookie', `token=${token}`)
        .send({ password: 'newPassword123' })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Account security updated successfully',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
    });

    it('should return 400 when password is missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      jwt.verify.mockReturnValue({ id: testUser.id });
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/profile/account-security')
        .set('Cookie', `token=${token}`)
        .send({})
        .expect(400);

      expect(response.body).toEqual({ message: 'Password is required' });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .put('/api/v1/profile/account-security')
        .send({ password: 'newPassword123' })
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });
});
