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

describe('RBAC Router', () => {
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
    const rbacRouter = require('../../routes/rbac');
    app.use('/api/v1/rbac', rbacRouter);
    
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
  const loginUser = async (permission = 'manage_roles') => {
    pool.query.mockImplementation((query, params) => {
      if (query.includes('SELECT u.*, r.name as role_name')) {
        return Promise.resolve({ rows: [testUser] });
      }
      if (query.includes('SELECT DISTINCT p.slug')) {
        return Promise.resolve({ rows: [{ slug: permission }] });
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
  const setupProtectMocks = (permission = 'manage_roles') => {
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

  describe('Roles', () => {
    describe('GET /api/v1/rbac/roles', () => {
      it('should return all roles successfully', async () => {
        const loginResponse = await loginUser('view_roles');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('view_roles');

        const mockRoles = [
          { id: 'role-1', name: 'Admin', description: 'Administrator role' },
          { id: 'role-2', name: 'Employee', description: 'Employee role' },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'view_roles' }] });
          }
          if (query.includes('FROM roles')) {
            return Promise.resolve({ rows: mockRoles });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/rbac/roles')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveLength(2);
      });
    });

    describe('POST /api/v1/rbac/roles', () => {
      it('should create a new role successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const newRole = {
          id: 'role-3',
          name: 'Manager',
          description: 'Manager role',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_roles' }] });
          }
          if (query.includes('INSERT INTO roles')) {
            return Promise.resolve({ rows: [newRole] });
          }
          if (query.includes('INSERT INTO role_permissions')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .post('/api/v1/rbac/roles')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Manager',
            description: 'Manager role',
            permissionIds: ['perm-1', 'perm-2'],
          })
          .expect(201);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Manager');
      });
    });

    describe('PUT /api/v1/rbac/roles/:id', () => {
      it('should update a role successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        const updatedRole = {
          id: 'role-1',
          name: 'Admin Updated',
          description: 'Updated Administrator role',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_roles' }] });
          }
          if (query.includes('UPDATE roles') && !query.includes('DELETE')) {
            return Promise.resolve({ rows: [updatedRole] });
          }
          if (query.includes('DELETE FROM role_permissions')) {
            return Promise.resolve({ rows: [] });
          }
          if (query.includes('INSERT INTO role_permissions')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/rbac/roles/role-1')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Admin Updated',
            description: 'Updated Administrator role',
            permissionIds: ['perm-1'],
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('name', 'Admin Updated');
      });

      it('should return 404 when role not found', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_roles' }] });
          }
          if (query.includes('UPDATE roles')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/rbac/roles/non-existent-id')
          .set('Cookie', `token=${token}`)
          .send({
            name: 'Updated Name',
          })
          .expect(404);

        expect(response.body.message).toBe('Role not found');
      });
    });

    describe('DELETE /api/v1/rbac/roles/:id', () => {
      it('should delete a role successfully', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_roles' }] });
          }
          if (query.includes('DELETE FROM roles')) {
            return Promise.resolve({ rows: [{ id: 'role-1' }] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/rbac/roles/role-1')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.message).toBe('Role deleted');
      });

      it('should return 404 when role not found', async () => {
        const loginResponse = await loginUser();
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks();

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_roles' }] });
          }
          if (query.includes('DELETE FROM roles')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/rbac/roles/non-existent-id')
          .set('Cookie', `token=${token}`)
          .expect(404);

        expect(response.body.message).toBe('Role not found');
      });
    });
  });

  describe('Permissions', () => {
    describe('GET /api/v1/rbac/permissions', () => {
      it('should return all permissions successfully', async () => {
        const loginResponse = await loginUser('view_permissions');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('view_permissions');

        const mockPermissions = [
          { id: 'perm-1', description: 'Manage employees', resource: 'employees', action: 'manage', permission_type: 'action' },
          { id: 'perm-2', description: 'View employees', resource: 'employees', action: 'view', permission_type: 'action' },
        ];

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'view_permissions' }] });
          }
          if (query.includes('FROM permissions')) {
            return Promise.resolve({ rows: mockPermissions });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .get('/api/v1/rbac/permissions')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveLength(2);
      });
    });

    describe('POST /api/v1/rbac/permissions', () => {
      it('should create a new permission successfully', async () => {
        const loginResponse = await loginUser('manage_permissions');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('manage_permissions');

        const newPermission = {
          id: 'perm-3',
          description: 'Manage departments',
          resource: 'departments',
          action: 'manage',
          permission_type: 'action',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_permissions' }] });
          }
          if (query.includes('INSERT INTO permissions')) {
            return Promise.resolve({ rows: [newPermission] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .post('/api/v1/rbac/permissions')
          .set('Cookie', `token=${token}`)
          .send({
            description: 'Manage departments',
            resource: 'departments',
            action: 'manage',
            permission_type: 'action',
          })
          .expect(201);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('description', 'Manage departments');
      });
    });

    describe('PUT /api/v1/rbac/permissions/:id', () => {
      it('should update a permission successfully', async () => {
        const loginResponse = await loginUser('manage_permissions');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('manage_permissions');

        const updatedPermission = {
          id: 'perm-1',
          description: 'Updated Manage employees',
          resource: 'employees',
          action: 'manage',
          permission_type: 'action',
        };

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_permissions' }] });
          }
          if (query.includes('UPDATE permissions')) {
            return Promise.resolve({ rows: [updatedPermission] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/rbac/permissions/perm-1')
          .set('Cookie', `token=${token}`)
          .send({
            description: 'Updated Manage employees',
            resource: 'employees',
            action: 'manage',
            permission_type: 'action',
          })
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('description', 'Updated Manage employees');
      });

      it('should return 404 when permission not found', async () => {
        const loginResponse = await loginUser('manage_permissions');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('manage_permissions');

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_permissions' }] });
          }
          if (query.includes('UPDATE permissions')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .put('/api/v1/rbac/permissions/non-existent-id')
          .set('Cookie', `token=${token}`)
          .send({
            description: 'Updated Description',
          })
          .expect(404);

        expect(response.body.message).toBe('Permission not found');
      });
    });

    describe('DELETE /api/v1/rbac/permissions/:id', () => {
      it('should delete a permission successfully', async () => {
        const loginResponse = await loginUser('manage_permissions');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('manage_permissions');

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_permissions' }] });
          }
          if (query.includes('DELETE FROM permissions')) {
            return Promise.resolve({ rows: [{ id: 'perm-1' }] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/rbac/permissions/perm-1')
          .set('Cookie', `token=${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.message).toBe('Permission deleted');
      });

      it('should return 404 when permission not found', async () => {
        const loginResponse = await loginUser('manage_permissions');
        const cookies = loginResponse.headers['set-cookie'];
        const token = cookies ? cookies[0].split('=')[1].split(';')[0] : testToken;

        setupProtectMocks('manage_permissions');

        pool.query.mockImplementation((query, params) => {
          if (query.includes('WHERE u.id = $1') && query.includes('LEFT JOIN user_roles') && !query.includes('LEFT JOIN employees')) {
            return Promise.resolve({ rows: [testUser] });
          }
          if (query.includes('SELECT DISTINCT p.slug')) {
            return Promise.resolve({ rows: [{ slug: 'manage_permissions' }] });
          }
          if (query.includes('DELETE FROM permissions')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
          .delete('/api/v1/rbac/permissions/non-existent-id')
          .set('Cookie', `token=${token}`)
          .expect(404);

        expect(response.body.message).toBe('Permission not found');
      });
    });
  });
});

