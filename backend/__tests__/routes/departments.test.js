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

describe('Departments Router', () => {
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
    const departmentsRouter = require('../../routes/departments');
    app.use('/api/v1/departments', departmentsRouter);
    
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
        return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
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
  const setupProtectMocks = (permission = 'manage_departments') => {
    setupJwtVerify();
    pool.query.mockImplementation((query, params) => {
      if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
        return Promise.resolve({ rows: [testUser] });
      }
      if (query.includes('SELECT DISTINCT p.slug')) {
        return Promise.resolve({ rows: [{ slug: permission }] });
      }
      return Promise.resolve({ rows: [] });
    });
  };

  describe('GET /api/v1/departments', () => {
    it('should return all departments successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockDepartments = [
        { id: 'dept-1', name: 'Engineering', description: 'Engineering Department', status: 'active' },
        { id: 'dept-2', name: 'HR', description: 'Human Resources', status: 'active' },
      ];

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('FROM departments')) {
          return Promise.resolve({ rows: mockDepartments });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/departments')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('results', 2);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/departments')
        .expect(401);

      expect(response.body).toEqual({ message: 'Not authorized, please login' });
    });
  });

  describe('GET /api/v1/departments/:id', () => {
    it('should return a single department successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const mockDepartment = {
        id: 'dept-1',
        name: 'Engineering',
        description: 'Engineering Department',
        status: 'active',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('FROM departments') && query.includes('WHERE id')) {
          return Promise.resolve({ rows: [mockDepartment] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/departments/dept-1')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'Engineering');
    });

    it('should return 404 when department not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('FROM departments') && query.includes('WHERE id')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .get('/api/v1/departments/non-existent-id')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.message).toBe('Department not found');
    });
  });

  describe('POST /api/v1/departments', () => {
    it('should create a new department successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const newDepartment = {
        id: 'dept-3',
        name: 'Marketing',
        description: 'Marketing Department',
        status: 'active',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('INSERT INTO departments')) {
          return Promise.resolve({ rows: [newDepartment] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/departments')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Marketing',
          description: 'Marketing Department',
          status: 'active',
        })
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'Marketing');
    });

    it('should return 403 when user lacks permission', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      // Use a non-Admin user for this test
      const nonAdminUser = { ...testUser, role_name: 'Employee' };
      setupJwtVerify();
      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [nonAdminUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'view_employees' }] }); // Different permission
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .post('/api/v1/departments')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Marketing',
          description: 'Marketing Department',
        })
        .expect(403);

      expect(response.body.message).toContain('permission');
    });
  });

  describe('PUT /api/v1/departments/:id', () => {
    it('should update a department successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      const updatedDepartment = {
        id: 'dept-1',
        name: 'Engineering Updated',
        description: 'Updated Engineering Department',
        status: 'active',
      };

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('UPDATE departments')) {
          return Promise.resolve({ rows: [updatedDepartment] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/departments/dept-1')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Engineering Updated',
          description: 'Updated Engineering Department',
          status: 'active',
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('name', 'Engineering Updated');
    });

    it('should return 404 when department not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('UPDATE departments')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .put('/api/v1/departments/non-existent-id')
        .set('Cookie', `token=${token}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);

      expect(response.body.message).toBe('Department not found');
    });
  });

  describe('DELETE /api/v1/departments/:id', () => {
    it('should delete a department successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('DELETE FROM departments')) {
          return Promise.resolve({ rows: [{ id: 'dept-1' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/departments/dept-1')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toBe('Department deleted');
    });

    it('should return 404 when department not found', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks();

      pool.query.mockImplementation((query, params) => {
        if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
          return Promise.resolve({ rows: [testUser] });
        }
        if (query.includes('SELECT DISTINCT p.slug')) {
          return Promise.resolve({ rows: [{ slug: 'manage_departments' }] });
        }
        if (query.includes('DELETE FROM departments')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const response = await request(app)
        .delete('/api/v1/departments/non-existent-id')
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.message).toBe('Department not found');
    });
  });
});

