const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('../../routes/auth');
const pool = require('../../database/connection');
const jwt = require('jsonwebtoken');

// Mock the database connection
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

jest.mock('../../database/connection', () => ({
  query: jest.fn(),
  connect: jest.fn(() => Promise.resolve(mockClient)),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('Employees Router', () => {
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
    const employeesRouter = require('../../routes/employees');
    app.use('/api/v1/employees', employeesRouter);

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
        return Promise.resolve({ rows: [{ slug: 'manage_employees' }] });
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
  const setupProtectMocks = (permission = 'manage_employees', role = 'Admin', employeeId = 'manager-emp-id') => {
    setupJwtVerify();
    const currentUser = { ...testUser, role_name: role, employee_id: employeeId };

    const queryHandler = (query, params) => {
      // Auth middleware queries
      if (query.includes('FROM users u') && query.includes('WHERE u.id = $1')) {
        return Promise.resolve({ rows: [currentUser] });
      }
      if (query.includes('SELECT DISTINCT p.slug')) {
        return Promise.resolve({ rows: [{ slug: permission }] });
      }
      // Authorization Check query (Supervisor ID)
      if (query.includes('SELECT supervisor_id FROM employees WHERE id = $1')) {
        return Promise.resolve({ rows: [{ supervisor_id: employeeId }] }); // Default to authorized
      }
      return Promise.resolve({ rows: [] });
    };

    pool.query.mockImplementation(queryHandler);
    mockClient.query.mockImplementation(queryHandler);

    return currentUser;
  };

  describe('GET /api/v1/employees', () => {
    it('should return all employees successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks('view_employees');

      const mockEmployees = [
        { id: 'emp-1', full_name: 'John Doe', status: 'active' }
      ];

      const originalQuery = pool.query.getMockImplementation();
      pool.query.mockImplementation((query, params) => {
        if (query.includes('FROM employees')) {
          return Promise.resolve({ rows: mockEmployees });
        }
        return originalQuery(query, params);
      });

      const response = await request(app)
        .get('/api/v1/employees')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('length', 1);
    });

    it('should return 401 when no token is provided', async () => {
      await request(app)
        .get('/api/v1/employees')
        .expect(401);
    });
  });

  describe('POST /api/v1/employees', () => {
    it('should create a new employee successfully', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks('user_management:employees');

      const originalQuery = pool.query.getMockImplementation();
      pool.query.mockImplementation((query, params) => {
        if (query.includes('INSERT INTO employees')) {
          return Promise.resolve({ rows: [{ id: 'emp-3', first_name: 'Bob' }] });
        }
        return originalQuery(query, params);
      });

      const response = await request(app)
        .post('/api/v1/employees')
        .set('Cookie', `token=${token}`)
        .send({ first_name: 'Bob', last_name: 'Johnson' })
        .expect(201);

      expect(response.body.data).toHaveProperty('first_name', 'Bob');
    });
  });

  describe('PUT /api/v1/employees/:id', () => {
    it('should update an employee successfully (Admin)', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks('user_management:employees', 'Super Admin');

      const originalQuery = mockClient.query.getMockImplementation();
      mockClient.query.mockImplementation((query, params) => {
        if (query.includes('BEGIN') || query.includes('COMMIT')) return Promise.resolve();
        if (query.includes('UPDATE employees')) {
          return Promise.resolve({ rows: [{ id: 'emp-1', last_name: 'Updated' }] });
        }
        return originalQuery(query, params);
      });

      const response = await request(app)
        .put('/api/v1/employees/emp-1')
        .set('Cookie', `token=${token}`)
        .send({ first_name: 'John', last_name: 'Updated' })
        .expect(200);

      expect(response.body.data).toHaveProperty('last_name', 'Updated');
    });

    it('should block Manager from updating non-assigned employee', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks('user_management:employees', 'Manager', 'manager-1');

      const originalQuery = mockClient.query.getMockImplementation();
      mockClient.query.mockImplementation((query, params) => {
        if (query.includes('BEGIN') || query.includes('ROLLBACK')) return Promise.resolve();
        if (query.includes('SELECT supervisor_id FROM employees')) {
          return Promise.resolve({ rows: [{ supervisor_id: 'different-manager' }] });
        }
        return originalQuery(query, params);
      });

      await request(app)
        .put('/api/v1/employees/emp-1')
        .set('Cookie', `token=${token}`)
        .send({ first_name: 'John', last_name: 'Updated' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('should delete an employee successfully (Admin)', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks('user_management:employees', 'HR Admin');

      const originalQuery = pool.query.getMockImplementation();
      pool.query.mockImplementation((query, params) => {
        if (query.includes('DELETE FROM employees')) {
          return Promise.resolve({ rows: [{ id: 'emp-1' }] });
        }
        return originalQuery(query, params);
      });

      await request(app)
        .delete('/api/v1/employees/emp-1')
        .set('Cookie', `token=${token}`)
        .expect(200);
    });

    it('should block Manager from deleting non-assigned employee', async () => {
      const loginResponse = await loginUser();
      const cookies = loginResponse.headers['set-cookie'];
      const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

      setupProtectMocks('user_management:employees', 'Manager', 'manager-1');

      const originalQuery = pool.query.getMockImplementation();
      pool.query.mockImplementation((query, params) => {
        if (query.includes('SELECT supervisor_id FROM employees')) {
          return Promise.resolve({ rows: [{ supervisor_id: 'different-manager' }] });
        }
        return originalQuery(query, params);
      });

      await request(app)
        .delete('/api/v1/employees/emp-1')
        .set('Cookie', `token=${token}`)
        .expect(403);
    });
  });
});

