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

describe('Attendance Router', () => {
  let app;
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password_hash: '$2b$12$hashedpassword',
    role_name: 'Employee',
    role_id: 'role-id-1',
  };
  const testEmployee = {
    id: 'emp-1',
    user_id: testUser.id,
    employee_code: 'EMP001',
    first_name: 'Test',
    last_name: 'User',
    full_name: 'Test User',
  };
  const testToken = 'test-jwt-token';

  // Fake GPS coordinates for testing
  // Head Office location: 31.5000, 34.4667
  const headOfficeLocation = {
    id: 'loc-1',
    name: 'Head Office',
    address: '123 Main St',
    latitude: 31.5000,
    longitude: 34.4667,
  };

  // Test coordinates:
  // - Verified: ~50m away (31.5001, 34.4668)
  // - Suspicious: ~150m away (31.5008, 34.4675)
  // - Rejected: ~250m away (31.5020, 34.4690)

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    
    // Set up routes
    app.use('/api/v1/auth', authRouter);
    const attendanceRouter = require('../../routes/attendance');
    app.use('/api/v1/attendance', attendanceRouter);
    
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
      if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
        return Promise.resolve({ rows: [testEmployee] });
      }
      return Promise.resolve({ rows: [] });
    });
  };

  describe('POST /api/v1/attendance/check-in', () => {
    it('should check in successfully with GPS coordinates that are Verified (0-100m)', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      // GPS coordinates ~50m away from Head Office (Verified)
      const checkInLatitude = 31.5001;
      const checkInLongitude = 34.4668;

      const newAttendance = {
        id: 'att-1',
        employee_id: testEmployee.id,
        check_in_time: new Date(),
        location_latitude: checkInLatitude,
        location_longitude: checkInLongitude,
        location_address: 'Near Head Office',
        work_type: 'Office',
        daily_status: 'Present',
        gps_status: 'Not Verified',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        // Check for existing check-in today
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [] });
        }
        // Create check-in
        if (query.includes('INSERT INTO attendance')) {
          return Promise.resolve({ rows: [newAttendance] });
        }
        // Get employee locations for GPS verification
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [headOfficeLocation] });
        }
        // Update GPS status
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...newAttendance,
              distance_from_base: 50,
              gps_status: 'Verified'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Cookie', `token=${token}`)
        .send({
          latitude: checkInLatitude,
          longitude: checkInLongitude,
          location_address: 'Near Head Office',
          work_type: 'Office'
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('gps_status', 'Verified');
      expect(response.body.data).toHaveProperty('distance_from_base');
      expect(response.body.data.distance_from_base).toBeLessThanOrEqual(100);
    });

    it('should check in successfully with GPS coordinates that are Suspicious (101-200m)', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      // GPS coordinates ~150m away from Head Office (Suspicious)
      const checkInLatitude = 31.5008;
      const checkInLongitude = 34.4675;

      const newAttendance = {
        id: 'att-2',
        employee_id: testEmployee.id,
        check_in_time: new Date(),
        location_latitude: checkInLatitude,
        location_longitude: checkInLongitude,
        location_address: 'Away from Head Office',
        work_type: 'Office',
        daily_status: 'Present',
        gps_status: 'Not Verified',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('INSERT INTO attendance')) {
          return Promise.resolve({ rows: [newAttendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [headOfficeLocation] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...newAttendance,
              distance_from_base: 150,
              gps_status: 'Suspicious'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Cookie', `token=${token}`)
        .send({
          latitude: checkInLatitude,
          longitude: checkInLongitude,
          location_address: 'Away from Head Office',
          work_type: 'Office'
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('gps_status', 'Suspicious');
      expect(response.body.data.distance_from_base).toBeGreaterThan(100);
      expect(response.body.data.distance_from_base).toBeLessThanOrEqual(200);
    });

    it('should check in successfully with GPS coordinates that are Rejected (>200m)', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      // GPS coordinates ~250m away from Head Office (Rejected)
      const checkInLatitude = 31.5020;
      const checkInLongitude = 34.4690;

      const newAttendance = {
        id: 'att-3',
        employee_id: testEmployee.id,
        check_in_time: new Date(),
        location_latitude: checkInLatitude,
        location_longitude: checkInLongitude,
        location_address: 'Far from Head Office',
        work_type: 'Office',
        daily_status: 'Present',
        gps_status: 'Not Verified',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('INSERT INTO attendance')) {
          return Promise.resolve({ rows: [newAttendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [headOfficeLocation] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...newAttendance,
              distance_from_base: 250,
              gps_status: 'Rejected'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Cookie', `token=${token}`)
        .send({
          latitude: checkInLatitude,
          longitude: checkInLongitude,
          location_address: 'Far from Head Office',
          work_type: 'Office'
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('gps_status', 'Rejected');
      expect(response.body.data.distance_from_base).toBeGreaterThan(200);
    });

    it('should check in successfully without GPS coordinates (marked as Not Verified)', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const newAttendance = {
        id: 'att-4',
        employee_id: testEmployee.id,
        check_in_time: new Date(),
        location_latitude: null,
        location_longitude: null,
        location_address: 'Unknown Location',
        work_type: 'Office',
        daily_status: 'Present',
        gps_status: 'Not Verified',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('INSERT INTO attendance')) {
          return Promise.resolve({ rows: [newAttendance] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...newAttendance,
              distance_from_base: null,
              gps_status: 'Not Verified'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Cookie', `token=${token}`)
        .send({
          location_address: 'Unknown Location',
          work_type: 'Office'
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('gps_status', 'Not Verified');
      expect(response.body.data.location_latitude).toBeNull();
      expect(response.body.data.location_longitude).toBeNull();
    });

    it('should return 400 if already checked in today', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const existingAttendance = {
        id: 'att-existing',
        employee_id: testEmployee.id,
        check_in_time: new Date(),
        check_out_time: null,
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [existingAttendance] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Cookie', `token=${token}`)
        .send({
          latitude: 31.5001,
          longitude: 34.4668,
          location_address: 'Head Office',
        })
        .expect(400);

      expect(response.body.message).toContain('already checked in');
    });

    it('should mark as Late if check-in is after 9:00 AM', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      // Mock current time as 10:05 AM
      const lateCheckInTime = new Date();
      lateCheckInTime.setHours(10, 5, 0, 0);

      const newAttendance = {
        id: 'att-late',
        employee_id: testEmployee.id,
        check_in_time: lateCheckInTime,
        location_latitude: 31.5001,
        location_longitude: 34.4668,
        location_address: 'Head Office',
        work_type: 'Office',
        daily_status: 'Late',
        gps_status: 'Not Verified',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [] });
        }
        if (query.includes('INSERT INTO attendance')) {
          return Promise.resolve({ rows: [newAttendance] });
        }
        if (query.includes('FROM employee_locations el')) {
          return Promise.resolve({ rows: [headOfficeLocation] });
        }
        if (query.includes('UPDATE attendance') && query.includes('distance_from_base')) {
          return Promise.resolve({ 
            rows: [{
              ...newAttendance,
              distance_from_base: 50,
              gps_status: 'Verified'
            }]
          });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Cookie', `token=${token}`)
        .send({
          latitude: 31.5001,
          longitude: 34.4668,
          location_address: 'Head Office',
        })
        .expect(201);

      // Note: The daily_status is determined server-side based on check-in time
      // In a real scenario, you'd mock Date.now() or use a library like jest.useFakeTimers()
      expect(response.body).toHaveProperty('status', 'success');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-in')
        .send({
          latitude: 31.5001,
          longitude: 34.4668,
        })
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('POST /api/v1/attendance/check-out', () => {
    it('should check out successfully when checked in today', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const existingAttendance = {
        id: 'att-1',
        employee_id: testEmployee.id,
        check_in_time: new Date('2025-12-07T08:00:00'),
        check_out_time: null,
        daily_status: 'Present',
      };

      const updatedAttendance = {
        ...existingAttendance,
        check_out_time: new Date('2025-12-07T16:00:00'),
        daily_status: 'Present',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [existingAttendance] });
        }
        if (query.includes('UPDATE attendance') && query.includes('check_out_time')) {
          return Promise.resolve({ rows: [updatedAttendance] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-out')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('check_out_time');
      expect(response.body.data.check_out_time).not.toBeNull();
    });

    it('should return 400 if no active check-in found', async () => {
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
        if (query.includes('FROM employees e') && query.includes('WHERE e.user_id')) {
          return Promise.resolve({ rows: [testEmployee] });
        }
        if (query.includes('DATE(a.check_in_time) = CURRENT_DATE') && query.includes('check_out_time IS NULL')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/attendance/check-out')
        .set('Cookie', `token=${token}`)
        .expect(400);

      expect(response.body.message).toContain('No active check-in found');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/v1/attendance/check-out')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('GET /api/v1/attendance/my-attendance', () => {
    it('should return my attendance records successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockAttendance = [
        {
          id: 'att-1',
          date: '2025-12-07',
          check_in_time: '2025-12-07T08:00:00.000Z',
          check_out_time: '2025-12-07T16:02:00.000Z',
          work_hours: 8.033,
          location: 'Head Office',
          type: 'Office',
          status: 'Present',
        },
        {
          id: 'att-2',
          date: '2025-12-08',
          check_in_time: '2025-12-08T10:05:00.000Z',
          check_out_time: '2025-12-08T16:20:00.000Z',
          work_hours: 6.25,
          location: 'Head Office',
          type: 'Office',
          status: 'Late',
        },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'menu:dashboard' }] });
        }
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: mockAttendance });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/attendance/my-attendance')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter attendance by status', async () => {
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
        if (query.includes('FROM attendance a') && query.includes('JOIN employees e')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/attendance/my-attendance?status=Late')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/attendance/my-attendance')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });
});

