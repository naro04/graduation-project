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

describe('Location Types Router', () => {
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
    const locationTypesRouter = require('../../routes/locationTypes');
    app.use('/api/v1/location-types', locationTypesRouter);
    
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

  describe('GET /api/v1/location-types', () => {
    it('should return all location types successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockLocationTypes = [
        { id: 'type-1', name: 'School', description: 'Educational institution', status: 'active' },
        { id: 'type-2', name: 'Office', description: 'Office building', status: 'active' },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('FROM location_types')) {
          return Promise.resolve({ rows: mockLocationTypes });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/location-types')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveLength(2);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/location-types')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('POST /api/v1/location-types', () => {
    it('should create a new location type successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const newLocationType = {
        id: 'type-3',
        name: 'Hospital',
        description: 'Medical facility',
        status: 'active',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('INSERT INTO location_types')) {
          return Promise.resolve({ rows: [newLocationType] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/location-types')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Hospital',
          description: 'Medical facility',
          status: 'active',
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'Hospital');
    });

    it('should return 400 if name is missing', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const response = await request(app)
        .post('/api/v1/location-types')
        .set('Cookie', `token=${token}`)
        .send({
          description: 'Medical facility',
        })
        .expect(400);

      expect(response.body.message).toContain('Name is required');
    });
  });

  describe('PUT /api/v1/location-types/:id', () => {
    it('should update a location type successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const updatedLocationType = {
        id: 'type-1',
        name: 'School Updated',
        description: 'Updated educational institution',
        status: 'active',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_locations' }] });
        }
        if (query.includes('UPDATE location_types')) {
          return Promise.resolve({ rows: [updatedLocationType] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/location-types/type-1')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'School Updated',
          description: 'Updated educational institution',
          status: 'active',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'School Updated');
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
        if (query.includes('UPDATE location_types')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/location-types/non-existent-id')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);

      expect(response.body.message).toBe('Location type not found');
    });
  });

  describe('DELETE /api/v1/location-types/:id', () => {
    it('should delete a location type successfully', async () => {
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
        if (query.includes('DELETE FROM location_types')) {
          return Promise.resolve({ rows: [{ id: 'type-1' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/location-types/type-1')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toBe('Location type deleted successfully');
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
        if (query.includes('DELETE FROM location_types')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/location-types/non-existent-id')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.message).toBe('Location type not found');
    });
  });
});

