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

describe('Location Activities Router', () => {
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
    const locationActivitiesRouter = require('../../routes/locationActivities');
    app.use('/api/v1/location-activities', locationActivitiesRouter);
    
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
        return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
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
        return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
      }
      return Promise.resolve({ rows: [] });
    });
  };

  describe('POST /api/v1/location-activities', () => {
    it('should create a location activity successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const newActivity = {
        id: 'act-1',
        name: 'School Visit',
        location_id: 'loc-1',
        start_date: '2025-12-01',
        end_date: '2025-12-05',
        activity_days: 5,
        status: 'Active',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('INSERT INTO activities') || (query.includes('activities') && query.includes('INSERT') && query.includes('name'))) {
          return Promise.resolve({ rows: [newActivity] });
        }
        if (query.includes('activity_employees') && query.includes('INSERT')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('SELECT name FROM locations') || (query.includes('locations') && query.includes('name') && query.includes('WHERE id'))) {
          return Promise.resolve({ rows: [{ name: 'School A' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/location-activities')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'School Visit',
          location_id: 'loc-1',
          employee_ids: ['emp-1', 'emp-2'],
          dates: ['2025-12-01', '2025-12-02', '2025-12-03', '2025-12-04', '2025-12-05'],
          activity_days: 5,
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'School Visit');
      expect(response.body.data).toHaveProperty('employee_count', 2);
    });

    it('should return 400 if name is missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const response = await request(app)
        .post('/api/v1/location-activities')
        .set('Cookie', `token=${token}`)
        .send({
          location_id: 'loc-1',
          employee_ids: ['emp-1'],
          dates: ['2025-12-01'],
        })
        .expect(400);

      expect(response.body.message).toContain('name is required');
    });

    it('should return 400 if employee_ids is empty', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const response = await request(app)
        .post('/api/v1/location-activities')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'School Visit',
          location_id: 'loc-1',
          employee_ids: [],
          dates: ['2025-12-01'],
        })
        .expect(400);

      expect(response.body.message).toContain('employee_ids');
    });
  });

  describe('PUT /api/v1/location-activities/:activity_id', () => {
    it('should update a location activity successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      // Set end_date to a date in the future to avoid "past end date" validation error
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      const existingActivity = {
        id: 'act-1',
        name: 'School Visit',
        location_id: 'loc-1',
        start_date: '2025-12-01',
        end_date: futureDateStr,
        activity_days: 10,
      };

      const updatedActivity = {
        ...existingActivity,
        name: 'Updated School Visit',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if ((query.includes('SELECT') && query.includes('FROM activities') && query.includes('WHERE')) || 
            (query.includes('activities') && query.includes('a.id = $1'))) {
          return Promise.resolve({ rows: [existingActivity] });
        }
        if (query.includes('UPDATE activities') || (query.includes('activities') && query.includes('UPDATE'))) {
          return Promise.resolve({ rows: [updatedActivity] });
        }
        if (query.includes('DELETE FROM activity_employees')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('INSERT INTO activity_employees')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/location-activities/act-1')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Updated School Visit',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'Updated School Visit');
    });

    it('should return 404 when activity not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if ((query.includes('SELECT') && query.includes('FROM activities') && query.includes('WHERE')) || 
            (query.includes('activities') && query.includes('a.id = $1'))) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/location-activities/non-existent-id')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);

      expect(response.body.message).toBe('Activity not found');
    });
  });

  describe('DELETE /api/v1/location-activities/:activity_id', () => {
    it('should delete a location activity successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('DELETE FROM location_activities')) {
          return Promise.resolve({ rowCount: 1 });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/location-activities/act-1')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toBe('Activity deleted successfully');
    });

    it('should return 404 when activity not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('DELETE FROM activities') || (query.includes('activities') && query.includes('DELETE'))) {
          return Promise.resolve({ rowCount: 0 });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/location-activities/non-existent-id')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.message).toBe('Activity not found');
    });
  });

  describe('GET /api/v1/location-activities/:activity_id/employees', () => {
    it('should return employees for an activity successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockEmployees = [
        {
          employee_id: 'emp-1',
          employee_code: 'EMP001',
          full_name: 'John Doe',
        },
        {
          employee_id: 'emp-2',
          employee_code: 'EMP002',
          full_name: 'Jane Smith',
        },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('FROM activity_employees') || query.includes('JOIN employees')) {
          return Promise.resolve({ rows: mockEmployees });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/location-activities/act-1/employees')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveLength(2);
    });
  });
});

