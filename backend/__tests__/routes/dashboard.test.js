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

describe('Dashboard Router', () => {
  let app;
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password_hash: '$2b$12$hashedpassword',
    role_name: 'Admin',
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
    const dashboardRouter = require('../../routes/index');
    app.use('/api/v1', dashboardRouter);
    
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

  // Helper function to login and get token
  const loginUser = async () => {
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

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'password123',
      });

    return loginResponse;
  };

  // Helper to setup protect middleware mocks
  const setupProtectMocks = () => {
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
  };

  describe('GET /api/v1/dashboard', () => {
    it('should return dashboard metrics successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockMetrics = {
        totalEmployees: { total: 50 },
        attendance: {
          present: 45,
          late: 3,
          absent: 2,
        },
        leaveRequests: {
          pending: 5,
          approved: 10,
          rejected: 2,
        },
        activeLocations: { active_count: 8 },
        attendanceChart: [
          { date: '2025-12-01', count: 48 },
          { date: '2025-12-02', count: 47 },
        ],
        activityChart: [
          { date: '2025-12-01', count: 12 },
          { date: '2025-12-02', count: 15 },
        ],
        userMetrics: {
          total_users: 50,
          active_users: 45,
        },
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('COUNT(*) as total') && query.includes('FROM employees')) {
          return Promise.resolve({ rows: [mockMetrics.totalEmployees] });
        }
        if (query.includes('attendance') && query.includes('daily_status')) {
          return Promise.resolve({ rows: [mockMetrics.attendance] });
        }
        if (query.includes('leave_requests') || query.includes('leave requests')) {
          return Promise.resolve({ rows: [mockMetrics.leaveRequests] });
        }
        if (query.includes('active_count') || query.includes('FROM locations')) {
          return Promise.resolve({ rows: [mockMetrics.activeLocations] });
        }
        if (query.includes('attendance') && query.includes('date')) {
          return Promise.resolve({ rows: mockMetrics.attendanceChart });
        }
        if (query.includes('activity') || query.includes('location_activities')) {
          return Promise.resolve({ rows: mockMetrics.activityChart });
        }
        if (query.includes('users') || query.includes('user_metrics')) {
          return Promise.resolve({ rows: [mockMetrics.userMetrics] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEmployees');
      expect(response.body).toHaveProperty('attendance');
      expect(response.body).toHaveProperty('leaveRequests');
      expect(response.body).toHaveProperty('activeLocations');
      expect(response.body).toHaveProperty('charts');
      expect(response.body.charts).toHaveProperty('attendance');
      expect(response.body.charts).toHaveProperty('activities');
      expect(response.body).toHaveProperty('userMetrics');
    });

    it('should handle empty dashboard data', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // Return empty results for all dashboard queries
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEmployees', 0);
      expect(response.body).toHaveProperty('activeLocations', 0);
    });

    it('should return 500 on database error', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        // Simulate database error
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/v1/dashboard')
        .set('Cookie', `token=${token}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Error loading dashboard metrics');
    });
  });
});

