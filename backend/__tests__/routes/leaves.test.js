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

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));

const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role_name: 'Admin',
    role_id: 'role-id-1',
};

const testToken = 'test-jwt-token';

describe('Leaves Router', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Set up routes
        app.use('/api/v1/auth', authRouter);
        const leavesRouter = require('../../routes/leaves');
        app.use('/api/v1/leaves', leavesRouter);

        process.env.JWT_SECRET = 'test-secret';
        jest.clearAllMocks();
    });

    const setupJwtVerify = () => {
        jwt.verify.mockImplementation(() => ({ id: testUser.id }));
    };

    const setupProtectMocks = () => {
        setupJwtVerify();
        pool.query.mockImplementation((query, params) => {
            if (query.includes('WHERE u.id = $1')) {
                return Promise.resolve({ rows: [testUser] });
            }
            return Promise.resolve({ rows: [] });
        });
    };

    describe('GET /api/v1/leaves', () => {
        it('should fetch all leaves successfully', async () => {
            setupProtectMocks();

            const mockLeaves = [
                { id: '1', employee_name: 'John Doe', leave_type: 'Sick', status: 'pending' }
            ];
            const mockStats = { pending_count: 1, approved_count: 0, rejected_count: 0 };

            pool.query.mockImplementation((query, params) => {
                if (query.includes('COUNT(CASE WHEN status = \'pending\'')) {
                    return Promise.resolve({ rows: [mockStats] });
                }
                if (query.includes('SELECT lr.*, e.full_name')) {
                    return Promise.resolve({ rows: mockLeaves });
                }
                if (query.includes('WHERE u.id = $1')) {
                    return Promise.resolve({ rows: [testUser] });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .get('/api/v1/leaves')
                .set('Cookie', `token=${testToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body.data).toHaveLength(1);
            expect(response.body.stats).toEqual(mockStats);
        });
    });

    describe('POST /api/v1/leaves', () => {
        it('should create a leave request successfully', async () => {
            setupProtectMocks();

            const newLeave = {
                id: '2',
                employee_id: 'emp-1',
                leave_type: 'Annual',
                start_date: '2024-01-01',
                end_date: '2024-01-05',
                status: 'pending'
            };

            pool.query.mockImplementation((query, params) => {
                if (query.includes('INSERT INTO leave_requests')) {
                    return Promise.resolve({ rows: [newLeave] });
                }
                if (query.includes('WHERE u.id = $1')) {
                    return Promise.resolve({ rows: [testUser] });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .post('/api/v1/leaves')
                .set('Cookie', `token=${testToken}`)
                .send({
                    employee_id: 'emp-1',
                    leave_type: 'Annual',
                    start_date: '2024-01-01',
                    end_date: '2024-01-05'
                })
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.leave_type).toBe('Annual');
        });
    });

    describe('PUT /api/v1/leaves/:id/status', () => {
        it('should approve a leave request successfully', async () => {
            setupProtectMocks();

            pool.query.mockImplementation((query, params) => {
                if (query.includes('UPDATE leave_requests SET status = $1')) {
                    return Promise.resolve({ rows: [{ id: '1', status: 'approved' }] });
                }
                if (query.includes('WHERE u.id = $1')) {
                    return Promise.resolve({ rows: [testUser] });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .put('/api/v1/leaves/1/status')
                .set('Cookie', `token=${testToken}`)
                .send({ status: 'approved', admin_notes: 'Enjoy your leave' })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('approved');
        });

        it('should fail to reject without admin_notes', async () => {
            setupProtectMocks();

            const response = await request(app)
                .put('/api/v1/leaves/1/status')
                .set('Cookie', `token=${testToken}`)
                .send({ status: 'rejected' })
                .expect(400);

            expect(response.body.message).toBe('Admin notes are required for rejection');
        });
    });

    describe('DELETE /api/v1/leaves', () => {
        it('should delete leaves in bulk', async () => {
            setupProtectMocks();

            pool.query.mockImplementation((query, params) => {
                if (query.includes('DELETE FROM leave_requests WHERE id = ANY($1)')) {
                    return Promise.resolve({ rowCount: 2 });
                }
                if (query.includes('WHERE u.id = $1')) {
                    return Promise.resolve({ rows: [testUser] });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .delete('/api/v1/leaves')
                .set('Cookie', `token=${testToken}`)
                .send({ ids: ['1', '2'] })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Successfully deleted 2 leave request(s)');
        });
    });
});
