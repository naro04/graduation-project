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

describe('Location Management Router', () => {
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
    const locationTypeRouter = require('../../routes/locationTypes');
    const locationRouter = require('../../routes/locations');
    const locationAssignmentRouter = require('../../routes/locationAssignments');
    const locationActivitiesRouter = require('../../routes/locationActivities');
    app.use('/api/v1/location-types', locationTypeRouter);
    app.use('/api/v1/locations', locationRouter);
    app.use('/api/v1/location-assignments', locationAssignmentRouter);
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

  describe('Location Type Routes', () => {
    // Note: These tests assume routes exist at /api/v1/location-types
    // They will fail until the actual routes are implemented

    describe('GET /api/v1/location-types', () => {
      it('should return all location types successfully with valid token', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockLocationTypes = [
          {
            id: 'loc-type-1',
            name: 'Office',
            description: 'Office-based attendance',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'loc-type-2',
            name: 'Field',
            description: 'GPS-based attendance',
            status: 'active',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Location types query
          if (query.includes('location_types') || query.includes('location_type')) {
            return Promise.resolve({ rows: mockLocationTypes });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-types')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .get('/api/v1/location-types')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });

      it('should return 401 when token is invalid', async () => {
        jwt.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        const response = await request(app)
          .get('/api/v1/location-types')
          .set('Cookie', 'token=invalid-token')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, token failed', error: 'Invalid token' });
      });

      it('should return empty array when no location types exist', async () => {
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
          if (query.includes('location_types') || query.includes('location_type')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-types')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data).toEqual([]);
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
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          if (query.includes('location_types') || query.includes('location_type')) {
            throw new Error('Database error');
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-types')
          .set('Cookie', `token=${token}`)
          .expect(500);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('POST /api/v1/location-types', () => {
      it('should create location type successfully with valid data', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const newLocationType = {
          id: 'loc-type-3',
          name: 'Remote',
          description: 'Remote work location',
          status: 'active',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Create location type query
          if (query.includes('INSERT INTO') && query.includes('location_type')) {
            return Promise.resolve({ rows: [newLocationType] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .post('/api/v1/location-types')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Remote',
            description: 'Remote work location',
            status: 'active',
          })
          .expect(201);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Remote');
      });

      it('should return 400 when name is missing', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const response = await request(app)
          .post('/api/v1/location-types')
          .set('Cookie', `token=${token}`)
          .send({
            description: 'Remote work location',
            status: 'active',
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .post('/api/v1/location-types')
          .send({
            name: 'Remote',
            description: 'Remote work location',
            status: 'active',
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });

      it('should return 403 when user lacks permission', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        const nonAdminUser = {
          ...testUser,
          role_name: 'Employee', // Non-Admin user to test permission check
        };

        setupJwtVerify();
        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [nonAdminUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            // User doesn't have manage_locations permission
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .post('/api/v1/location-types')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Remote',
            description: 'Remote work location',
            status: 'active',
          })
          .expect(403);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('PUT /api/v1/location-types/:id', () => {
      it('should update location type successfully with valid data', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const updatedLocationType = {
          id: 'loc-type-1',
          name: 'Office',
          description: 'Updated office description',
          status: 'active',
          updated_at: '2024-01-02T00:00:00.000Z',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Update location type query
          if (query.includes('UPDATE') && query.includes('location_type')) {
            return Promise.resolve({ rows: [updatedLocationType] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/location-types/loc-type-1')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Office',
            description: 'Updated office description',
            status: 'active',
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('description', 'Updated office description');
      });

      it('should return 404 when location type not found', async () => {
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
          if (query.includes('UPDATE') && query.includes('location_type')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/location-types/non-existent-id')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Office',
            description: 'Updated description',
            status: 'active',
          })
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .put('/api/v1/location-types/loc-type-1')
          .send({
            name: 'Office',
            description: 'Updated description',
            status: 'active',
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('DELETE /api/v1/location-types/:id', () => {
      it('should delete location type successfully', async () => {
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
          // Delete location type query
          if (query.includes('DELETE') && query.includes('location_type')) {
            return Promise.resolve({ rows: [{ id: 'loc-type-1' }] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/location-types/loc-type-1')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message');
      });

      it('should return 404 when location type not found', async () => {
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
          if (query.includes('DELETE') && query.includes('location_type')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/location-types/non-existent-id')
          .set('Cookie', `token=${token}`)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .delete('/api/v1/location-types/loc-type-1')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });
  });

  describe('Location Routes', () => {
    // Note: These tests assume routes exist at /api/v1/locations
    // They will fail until the actual routes are implemented

    describe('GET /api/v1/locations', () => {
      it('should return all locations successfully with valid token', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockLocations = [
          {
            id: 'loc-1',
            name: 'Head Office',
            address: '123 Main St',
            latitude: 31.5000,
            longitude: 34.4667,
            location_type: 'Office',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'loc-2',
            name: 'Field Site A',
            address: '456 Field Rd',
            latitude: 31.5100,
            longitude: 34.4700,
            location_type: 'Field',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Locations query
          if (query.includes('FROM locations') && !query.includes('employee_locations')) {
            return Promise.resolve({ rows: mockLocations });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
      });

      it('should filter locations by status when status query param is provided', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockLocations = [
          {
            id: 'loc-1',
            name: 'Head Office',
            address: '123 Main St',
            location_type: 'Office',
            status: 'active',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          if (query.includes('FROM locations') && !query.includes('employee_locations')) {
            return Promise.resolve({ rows: mockLocations });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations?status=active')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data.length).toBe(1);
      });

      it('should search locations by name when search query param is provided', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockLocations = [
          {
            id: 'loc-1',
            name: 'Head Office',
            address: '123 Main St',
            location_type: 'Office',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          if (query.includes('FROM locations') && !query.includes('employee_locations')) {
            return Promise.resolve({ rows: mockLocations });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations?search=Office')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data.length).toBe(1);
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .get('/api/v1/locations')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('POST /api/v1/locations', () => {
      it('should create location successfully with valid data', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const newLocation = {
          id: 'loc-3',
          name: 'Branch Office',
          address: '789 Branch Ave',
          latitude: 31.5200,
          longitude: 34.4800,
          location_type: 'Office',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Create location query
          if (query.includes('INSERT INTO locations')) {
            return Promise.resolve({ rows: [newLocation] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .post('/api/v1/locations')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Branch Office',
            address: '789 Branch Ave',
            latitude: 31.5200,
            longitude: 34.4800,
            location_type: 'Office',
          })
          .expect(201);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Branch Office');
      });

      it('should return 400 when name is missing', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const response = await request(app)
          .post('/api/v1/locations')
          .set('Cookie', `token=${token}`)
          .send({
            address: '789 Branch Ave',
            latitude: 31.5200,
            longitude: 34.4800,
            location_type: 'Office',
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .post('/api/v1/locations')
          .send({
            name: 'Branch Office',
            address: '789 Branch Ave',
            location_type: 'Office',
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('PUT /api/v1/locations/:id', () => {
      it('should update location successfully with valid data', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const updatedLocation = {
          id: 'loc-1',
          name: 'Head Office Updated',
          address: '123 Main St Updated',
          latitude: 31.5000,
          longitude: 34.4667,
          location_type: 'Office',
          updated_at: '2024-01-02T00:00:00.000Z',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Update location query
          if (query.includes('UPDATE locations')) {
            return Promise.resolve({ rows: [updatedLocation] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/locations/loc-1')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Head Office Updated',
            address: '123 Main St Updated',
            location_type: 'Office',
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Head Office Updated');
      });

      it('should return 404 when location not found', async () => {
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
          if (query.includes('UPDATE locations')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/locations/non-existent-id')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Updated Location',
            address: 'Updated Address',
            location_type: 'Office',
          })
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .put('/api/v1/locations/loc-1')
          .send({
            name: 'Updated Location',
            address: 'Updated Address',
            location_type: 'Office',
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('DELETE /api/v1/locations/:id', () => {
      it('should delete location successfully', async () => {
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
          // Delete location query
          if (query.includes('DELETE FROM locations')) {
            return Promise.resolve({ rows: [{ id: 'loc-1' }] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/locations/loc-1')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message');
      });

      it('should return 404 when location not found', async () => {
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
          if (query.includes('DELETE FROM locations')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/locations/non-existent-id')
          .set('Cookie', `token=${token}`)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .delete('/api/v1/locations/loc-1')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });
  });

  describe('Location Assignment Routes', () => {
    // Note: These tests assume routes exist at /api/v1/location-assignments
    // They will fail until the actual routes are implemented

    describe('GET /api/v1/location-assignments', () => {
      it('should return all location assignments successfully with valid token', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockAssignments = [
          {
            employee_id: 'emp-1',
            employee_name: 'John Doe',
            employee_code: 'EMP001',
            location_id: 'loc-1',
            location_name: 'Head Office',
            location_type: 'Office',
            assigned_at: '2024-01-01T00:00:00.000Z',
          },
          {
            employee_id: 'emp-2',
            employee_name: 'Jane Smith',
            employee_code: 'EMP002',
            location_id: 'loc-2',
            location_name: 'Field Site A',
            location_type: 'Field',
            assigned_at: '2024-01-01T00:00:00.000Z',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Location assignments query
          if (query.includes('employee_locations') || query.includes('JOIN employees') && query.includes('JOIN locations')) {
            return Promise.resolve({ rows: mockAssignments });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-assignments')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
      });

      it('should filter assignments by employee_id when query param is provided', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockAssignments = [
          {
            employee_id: 'emp-1',
            employee_name: 'John Doe',
            location_id: 'loc-1',
            location_name: 'Head Office',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          if (query.includes('employee_locations') || query.includes('JOIN employees') && query.includes('JOIN locations')) {
            return Promise.resolve({ rows: mockAssignments });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-assignments?employee_id=emp-1')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].employee_id).toBe('emp-1');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .get('/api/v1/location-assignments')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('POST /api/v1/location-assignments', () => {
      it('should assign location to employee successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const newAssignment = {
          employee_id: 'emp-1',
          location_id: 'loc-1',
          assigned_at: '2024-01-01T00:00:00.000Z',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Create assignment query
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
        expect(response.body.data).toHaveProperty('location_id', 'loc-1');
      });

      it('should return 400 when employee_id is missing', async () => {
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

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 when location_id is missing', async () => {
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

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .post('/api/v1/location-assignments')
          .send({
            employee_id: 'emp-1',
            location_id: 'loc-1',
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('DELETE /api/v1/location-assignments/:employee_id/:location_id', () => {
      it('should unassign location from employee successfully', async () => {
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
          // Delete assignment query
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
        expect(response.body).toHaveProperty('message');
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
          .delete('/api/v1/location-assignments/emp-1/non-existent-loc')
          .set('Cookie', `token=${token}`)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .delete('/api/v1/location-assignments/emp-1/loc-1')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });
  });

  describe('Activity-Location Assignment Routes', () => {
    // Note: These tests assume routes exist for managing activities at locations
    // They will fail until the actual routes are implemented

    describe('POST /api/v1/location-activities', () => {
      it('should create activity at location successfully with valid data', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const newActivity = {
          id: 'activity-1',
          name: 'Team Building Workshop',
          location_id: 'loc-1',
          location_name: 'Gaza Office',
          employee_count: 10,
          start_date: '2025-12-14',
          end_date: '2025-12-16',
          activity_days: 3,
          created_at: '2024-01-01T00:00:00.000Z',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Create activity query
          if (query.includes('INSERT INTO activities')) {
            return Promise.resolve({ rows: [newActivity] });
          }
          // Assign employees to activity
          if (query.includes('INSERT INTO') && query.includes('activity_employees') || query.includes('employee_activities')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .post('/api/v1/location-activities')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Team Building Workshop',
            location_id: 'loc-1',
            employee_ids: ['emp-1', 'emp-2', 'emp-3'],
            activity_days: 3,
            dates: ['2025-12-14', '2025-12-15', '2025-12-16'],
          })
          .expect(201);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Team Building Workshop');
        expect(response.body.data).toHaveProperty('location_id', 'loc-1');
      });

      it('should return 400 when activity name is missing', async () => {
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
            activity_days: 1,
            dates: ['2025-12-14'],
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 when location_id is missing', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const response = await request(app)
          .post('/api/v1/location-activities')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Team Building Workshop',
            employee_ids: ['emp-1'],
            activity_days: 1,
            dates: ['2025-12-14'],
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 when employee_ids is empty', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const response = await request(app)
          .post('/api/v1/location-activities')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Team Building Workshop',
            location_id: 'loc-1',
            employee_ids: [],
            activity_days: 1,
            dates: ['2025-12-14'],
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 when dates array length does not match activity_days', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const response = await request(app)
          .post('/api/v1/location-activities')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Team Building Workshop',
            location_id: 'loc-1',
            employee_ids: ['emp-1'],
            activity_days: 3,
            dates: ['2025-12-14'], // Only 1 date but activity_days is 3
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .post('/api/v1/location-activities')
          .send({
            name: 'Team Building Workshop',
            location_id: 'loc-1',
            employee_ids: ['emp-1'],
            activity_days: 1,
            dates: ['2025-12-14'],
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('GET /api/v1/locations/:location_id/activities', () => {
      it('should return all activities at a location successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockActivities = [
          {
            id: 'activity-1',
            name: 'Team Building Workshop',
            location_id: 'loc-1',
            location_name: 'Gaza Office',
            employee_count: 10,
            start_date: '2025-12-14',
            end_date: '2025-12-16',
            status: 'Active',
          },
          {
            id: 'activity-2',
            name: 'Safety Training',
            location_id: 'loc-1',
            location_name: 'Gaza Office',
            employee_count: 5,
            start_date: '2025-12-19',
            end_date: '2025-12-20',
            status: 'Active',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Get activities at location query
          if (query.includes('activities') && query.includes('location_id')) {
            return Promise.resolve({ rows: mockActivities });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations/loc-1/activities')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
        expect(response.body.data[0]).toHaveProperty('name', 'Team Building Workshop');
      });

      it('should return empty array when no activities exist at location', async () => {
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
          if (query.includes('activities') && query.includes('location_id')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations/loc-1/activities')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .get('/api/v1/locations/loc-1/activities')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('PUT /api/v1/location-activities/:activity_id', () => {
      it('should update activity successfully with valid data', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const updatedActivity = {
          id: 'activity-2',
          name: 'Safety Training Updated',
          location_id: 'loc-1',
          employee_count: 5,
          start_date: '2025-12-19',
          end_date: '2025-12-20',
          activity_days: 2,
          updated_at: '2024-01-02T00:00:00.000Z',
        };

        const existingActivity = {
          id: 'activity-2',
          name: 'Safety Training',
          location_id: 'loc-1',
          start_date: '2025-12-19',
          end_date: '2025-12-20',
          activity_days: 2,
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Get existing activity query
          if (query.includes('SELECT') && query.includes('activities') && query.includes('WHERE')) {
            return Promise.resolve({ rows: [existingActivity] });
          }
          // Update activity query
          if (query.includes('UPDATE activities')) {
            return Promise.resolve({ rows: [updatedActivity] });
          }
          // Update employee assignments
          if (query.includes('DELETE FROM') && query.includes('activity_employees') || query.includes('employee_activities')) {
            return Promise.resolve({ rowCount: 1 });
          }
          if (query.includes('INSERT INTO') && query.includes('activity_employees') || query.includes('employee_activities')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/location-activities/activity-2')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Safety Training Updated',
            location_id: 'loc-1',
            employee_ids: ['emp-1', 'emp-2'],
            activity_days: 2,
            dates: ['2025-12-19', '2025-12-20'],
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Safety Training Updated');
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
          if (query.includes('UPDATE activities')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/location-activities/non-existent-id')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Updated Activity',
            location_id: 'loc-1',
            employee_ids: ['emp-1'],
            activity_days: 1,
            dates: ['2025-12-19'],
          })
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 when trying to edit activity with past end date', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const pastActivity = {
          id: 'activity-1',
          name: 'Past Activity',
          end_date: '2020-01-01', // Past date
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Get activity query
          if (query.includes('SELECT') && query.includes('activities') && query.includes('WHERE')) {
            return Promise.resolve({ rows: [pastActivity] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/location-activities/activity-1')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Updated Activity',
            location_id: 'loc-1',
            employee_ids: ['emp-1'],
            activity_days: 1,
            dates: ['2025-12-19'],
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .put('/api/v1/location-activities/activity-1')
          .send({
            name: 'Updated Activity',
            location_id: 'loc-1',
            employee_ids: ['emp-1'],
            activity_days: 1,
            dates: ['2025-12-19'],
          })
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('DELETE /api/v1/location-activities/:activity_id', () => {
      it('should delete activity successfully', async () => {
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
          // Delete activity query
          if (query.includes('DELETE FROM activities')) {
            return Promise.resolve({ rowCount: 1 });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/location-activities/activity-1')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message');
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
          if (query.includes('DELETE FROM activities')) {
            return Promise.resolve({ rowCount: 0 });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/location-activities/non-existent-id')
          .set('Cookie', `token=${token}`)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .delete('/api/v1/location-activities/activity-1')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('GET /api/v1/location-activities/:activity_id/employees', () => {
      it('should return employees in activity successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockEmployees = [
          {
            employee_id: 'emp-1',
            employee_name: 'Mohamed Ali',
            employee_code: 'EMP001',
            department: 'Office',
            position: 'Data Entry',
            avatar_url: 'https://example.com/avatar1.jpg',
          },
          {
            employee_id: 'emp-2',
            employee_name: 'Amal Ahmed',
            employee_code: 'EMP002',
            department: 'Field Operation',
            position: 'Trainer',
            avatar_url: 'https://example.com/avatar2.jpg',
          },
          {
            employee_id: 'emp-3',
            employee_name: 'Amjad Saeed',
            employee_code: 'EMP003',
            department: 'HR',
            position: 'HR Manager',
            avatar_url: 'https://example.com/avatar3.jpg',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Get employees in activity query
          if (query.includes('JOIN employees') && query.includes('activity_employees') || query.includes('employee_activities')) {
            return Promise.resolve({ rows: mockEmployees });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-activities/activity-1/employees')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(3);
        expect(response.body.data[0]).toHaveProperty('employee_name', 'Mohamed Ali');
        expect(response.body.data[0]).toHaveProperty('department', 'Office');
      });

      it('should return empty array when no employees assigned to activity', async () => {
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
          if (query.includes('JOIN employees') && query.includes('activity_employees') || query.includes('employee_activities')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/location-activities/activity-1/employees')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .get('/api/v1/location-activities/activity-1/employees')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });

    describe('GET /api/v1/locations/:location_id/employees', () => {
      it('should return employees at location successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();
        
        const mockEmployees = [
          {
            employee_id: 'emp-1',
            employee_name: 'Mohamed Ali',
            employee_code: 'EMP001',
            department: 'Office',
            position: 'Data Entry',
            avatar_url: 'https://example.com/avatar1.jpg',
          },
          {
            employee_id: 'emp-2',
            employee_name: 'Amal Ahmed',
            employee_code: 'EMP002',
            department: 'Field Operation',
            position: 'Trainer',
            avatar_url: 'https://example.com/avatar2.jpg',
          },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
          }
          // Get employees at location query
          if (query.includes('employee_locations') && query.includes('JOIN employees')) {
            return Promise.resolve({ rows: mockEmployees });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations/loc-1/employees')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
        expect(response.body.data[0]).toHaveProperty('employee_name');
        expect(response.body.data[0]).toHaveProperty('department');
      });

      it('should return empty array when no employees assigned to location', async () => {
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
          if (query.includes('employee_locations') && query.includes('JOIN employees')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/locations/loc-1/employees')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body.data).toEqual([]);
      });

      it('should return 401 when no token is provided', async () => {
        const response = await request(app)
          .get('/api/v1/locations/loc-1/employees')
          .expect(401);

        expect(response.body).toEqual({ message: 'Not authorized, please login' });
      });
    });
  });
});

