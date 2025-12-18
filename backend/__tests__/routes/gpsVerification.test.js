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

describe('GPS Verification Router', () => {
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
    const gpsVerificationRouter = require('../../routes/gpsVerification');
    app.use('/api/v1/gps-verifications', gpsVerificationRouter);
    
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
        return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
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
        return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
      }
      return Promise.resolve({ rows: [] });
    });
  };

  describe('GET /api/v1/gps-verifications', () => {
    it('should return GPS verifications successfully with valid token', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const mockVerifications = [
        {
          id: 'att-1',
          check_in_time: '2025-12-07T08:00:00.000Z',
          location_latitude: 31.5000,
          location_longitude: 34.4667,
          location_address: 'Head Office',
          distance_from_base: 50,
          gps_status: 'Verified',
          employee_name: 'John Doe',
          employee_code: 'EMP001',
        },
        {
          id: 'att-2',
          check_in_time: '2025-12-07T09:00:00.000Z',
          location_latitude: 31.5005,
          location_longitude: 34.4670,
          location_address: 'School A',
          distance_from_base: 150,
          gps_status: 'Suspicious',
          employee_name: 'Jane Smith',
          employee_code: 'EMP002',
        },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a')) {
          return Promise.resolve({ rows: mockVerifications });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/gps-verifications')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter GPS verifications by date', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const mockVerifications = [
        {
          id: 'att-1',
          check_in_time: '2025-12-07T08:00:00.000Z',
          gps_status: 'Verified',
        },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a')) {
          return Promise.resolve({ rows: mockVerifications });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/gps-verifications?date=2025-12-07')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
    });

    it('should filter GPS verifications by status', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/gps-verifications?status=Verified')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/gps-verifications')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('GET /api/v1/gps-verifications/stats', () => {
    it('should return GPS statistics successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const mockStats = {
        total_logs: '27',
        verified_logs: '2',
        suspicious_logs: '1',
        rejected_logs: '0',
        not_verified_logs: '24',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('COUNT(*) as total_logs')) {
          return Promise.resolve({ rows: [mockStats] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/gps-verifications/stats')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('total_logs');
      expect(response.body.data).toHaveProperty('verified_logs');
    });
  });

  describe('POST /api/v1/gps-verifications/:attendance_id/verify', () => {
    it('should verify GPS and return Verified status for distance <= 100m', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const attendance = {
        id: 'att-1',
        employee_id: 'emp-1',
        location_latitude: 31.5000,
        location_longitude: 34.4667,
      };

      const assignedLocation = {
        id: 'loc-1',
        name: 'Head Office',
        address: '123 Main St',
        latitude: 31.5001,
        longitude: 34.4668,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [attendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [assignedLocation] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...attendance,
              distance_from_base: 50,
              gps_status: 'Verified'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/gps-verifications/att-1/verify')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('gps_status', 'Verified');
      expect(response.body.data).toHaveProperty('distance_from_base');
    });

    it('should verify GPS and return Suspicious status for distance 101-200m', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const attendance = {
        id: 'att-2',
        employee_id: 'emp-1',
        location_latitude: 31.5000,
        location_longitude: 34.4667,
      };

      const assignedLocation = {
        id: 'loc-1',
        name: 'Head Office',
        latitude: 31.5008,
        longitude: 34.4675,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [attendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [assignedLocation] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...attendance,
              distance_from_base: 150,
              gps_status: 'Suspicious'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/gps-verifications/att-2/verify')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('gps_status', 'Suspicious');
    });

    it('should verify GPS and return Rejected status for distance > 200m', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const attendance = {
        id: 'att-3',
        employee_id: 'emp-1',
        location_latitude: 31.5000,
        location_longitude: 34.4667,
      };

      const assignedLocation = {
        id: 'loc-1',
        name: 'Head Office',
        latitude: 31.5020,
        longitude: 34.4690,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [attendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [assignedLocation] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...attendance,
              distance_from_base: 250,
              gps_status: 'Rejected'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/gps-verifications/att-3/verify')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('gps_status', 'Rejected');
    });

    it('should mark as Not Verified when GPS coordinates are missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const attendance = {
        id: 'att-4',
        employee_id: 'emp-1',
        location_latitude: null,
        location_longitude: null,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [attendance] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...attendance,
              distance_from_base: null,
              gps_status: 'Not Verified'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/gps-verifications/att-4/verify')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('gps_status', 'Not Verified');
      expect(response.body.message).toContain('GPS coordinates are not available');
    });

    it('should return Not Verified when employee has no assigned locations', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const attendance = {
        id: 'att-5',
        employee_id: 'emp-1',
        location_latitude: 31.5000,
        location_longitude: 34.4667,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [attendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...attendance,
              distance_from_base: null,
              gps_status: 'Not Verified'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/gps-verifications/att-5/verify')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('gps_status', 'Not Verified');
      expect(response.body.message).toContain('No assigned locations found');
    });

    it('should return 404 when attendance record not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/gps-verifications/non-existent-id/verify')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/v1/gps-verifications/att-1/verify')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('PUT /api/v1/gps-verifications/:attendance_id/status', () => {
    it('should update GPS status successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      const attendance = {
        id: 'att-1',
        employee_id: 'emp-1',
        gps_status: 'Verified',
        distance_from_base: 50,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [attendance] });
        }
        if (query.includes('UPDATE attendance') && query.includes('gps_status')) {
          return Promise.resolve({ 
            rows: [{
              ...attendance,
              gps_status: 'Suspicious'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/gps-verifications/att-1/status')
        .set('Cookie', `token=${token}`)
        .send({ gps_status: 'Suspicious' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('gps_status', 'Suspicious');
    });

    it('should return 400 for invalid GPS status', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const response = await request(app)
        .put('/api/v1/gps-verifications/att-1/status')
        .set('Cookie', `token=${token}`)
        .send({ gps_status: 'InvalidStatus' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid GPS status');
    });

    it('should return 404 when attendance record not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();
      
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'verify_gps' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/gps-verifications/non-existent-id/status')
        .set('Cookie', `token=${token}`)
        .send({ gps_status: 'Verified' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});

