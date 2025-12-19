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

describe('Location Assignments Router', () => {
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
    const locationAssignmentsRouter = require('../../routes/locationAssignments');
    app.use('/api/v1/location-assignments', locationAssignmentsRouter);
    
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

  describe('GET /api/v1/location-assignments', () => {
    it('should return location assignments successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockAssignments = [
        {
          employee_id: 'emp-1',
          location_id: 'loc-1',
          employee_name: 'John Doe',
          location_name: 'School A',
        },
        {
          employee_id: 'emp-2',
          location_id: 'loc-2',
          employee_name: 'Jane Smith',
          location_name: 'School B',
        },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('FROM employee_locations')) {
          return Promise.resolve({ rows: mockAssignments });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/location-assignments')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter assignments by employee_id', async () => {
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
        if (query.includes('FROM employee_locations')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/location-assignments?employee_id=emp-1')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/v1/location-assignments', () => {
    it('should create a location assignment successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const newAssignment = {
        employee_id: 'emp-1',
        location_id: 'loc-1',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('INSERT INTO employee_locations')) {
          return Promise.resolve({ rows: [newAssignment] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/location-assignments')
        .set('Cookie', `token=${token}`)
        .send({
          employee_id: 'emp-1',
          location_id: 'loc-1',
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('employee_id', 'emp-1');
    });

    it('should return 400 if employee_id is missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const response = await request(app)
        .post('/api/v1/location-assignments')
        .set('Cookie', `token=${token}`)
        .send({
          location_id: 'loc-1',
        })
        .expect(400);

      expect(response.body.message).toContain('employee_id is required');
    });

    it('should return 400 if location_id is missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const response = await request(app)
        .post('/api/v1/location-assignments')
        .set('Cookie', `token=${token}`)
        .send({
          employee_id: 'emp-1',
        })
        .expect(400);

      expect(response.body.message).toContain('location_id is required');
    });

    it('should return 400 if assignment already exists', async () => {
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
        if (query.includes('INSERT INTO employee_locations')) {
          return Promise.resolve({ rows: [] }); // Empty result means conflict
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/location-assignments')
        .set('Cookie', `token=${token}`)
        .send({
          employee_id: 'emp-1',
          location_id: 'loc-1',
        })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('DELETE /api/v1/location-assignments/:employee_id/:location_id', () => {
    it('should delete a location assignment successfully', async () => {
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
        if (query.includes('DELETE FROM employee_locations')) {
          return Promise.resolve({ rowCount: 1 });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/location-assignments/emp-1/loc-1')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toBe('Location assignment deleted successfully');
    });

    it('should return 404 when assignment not found', async () => {
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
        if (query.includes('DELETE FROM employee_locations')) {
          return Promise.resolve({ rowCount: 0 });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/location-assignments/emp-1/loc-1')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.message).toBe('Location assignment not found');
    });
  });
});

