const pool = require('../database/connection');
const employeeQueries = require('../database/data/queries/employees');
const activityQueries = require('../database/data/queries/locationActivities'); // Might need this for activity counts later

exports.getAllEmployees = async (req, res) => {
    try {
        const { departmentId, roleId, status, search } = req.query;

        console.log('📋 Fetching employees with filters:', { departmentId, roleId, status, search });

        // departmentId and roleId should be mapped to the query parameters
        // We pass them to the query in order: [departmentId, roleId, status, search]
        const result = await pool.query(employeeQueries.getEmployeesQuery, [
            departmentId || null,
            roleId || null,
            status || null,
            search || null
        ]);

        console.log(`✅ Found ${result.rows.length} employees`);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'An error occurred while fetching employees. Please try again.' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(employeeQueries.getEmployeeByIdQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'Employee not found' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({ message: 'An error occurred while fetching employee details. Please try again.' });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        let {
            user_id, employee_code, first_name, last_name, full_name,
            department_id, position_id, status, role_id, avatar_url
        } = req.body;


        // 1. Validation
        if (!first_name || !last_name) {
            return res.status(400).json({ status: 'fail', message: 'First name and last name are required' });
        }

        // 2. Auto-generate fields
        if (!full_name) {
            full_name = `${first_name} ${last_name}`;
        }

        if (!employee_code) {
            employee_code = `EMP-${Date.now()}`;
        }

        // 3. Database operation
        const result = await pool.query(employeeQueries.createEmployeeQuery, [
            user_id || null,
            employee_code,
            first_name,
            last_name,
            full_name,
            department_id || null,
            position_id || null,
            status || 'active',
            avatar_url || null,
            role_id || null
        ]);

        const newEmployee = result.rows[0];

        // 4. Handle Role (Optional - linking to user if user_id exists)
        if (role_id && user_id) {
            await pool.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user_id, role_id]);
        }


        res.status(201).json({
            status: 'success',
            data: newEmployee
        });
    } catch (err) {
        console.error('Error creating employee:', err);
        let message = 'An error occurred while creating the employee. Please try again.';
        if (err.code === '23505') {
            message = 'Employee code already exists.';
        }
        res.status(500).json({ message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        let {
            first_name, last_name, full_name,
            department_id, position_id, status, avatar_url, role_id
        } = req.body;

        if (!full_name && first_name && last_name) {
            full_name = `${first_name} ${last_name}`;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(employeeQueries.updateEmployeeQuery, [
                first_name,
                last_name,
                full_name,
                department_id || null,
                position_id || null,
                status,
                avatar_url || null,
                role_id || null,
                id
            ]);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ status: 'fail', message: 'Employee not found' });
            }

            // Update Role if provided
            if (role_id) {
                const employee = result.rows[0];
                if (employee.user_id) {
                    await client.query('DELETE FROM user_roles WHERE user_id = $1', [employee.user_id]);
                    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [employee.user_id, role_id]);
                }
            }

            await client.query('COMMIT');
            res.status(200).json({ status: 'success', data: result.rows[0] });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ message: 'An error occurred while updating the employee. Please try again.' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(employeeQueries.deleteEmployeeQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Employee deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ message: 'An error occurred while deleting the employee. Please try again.' });
    }
};

exports.bulkAction = async (req, res) => {
    try {
        const { ids, action } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'No IDs provided' });
        }

        let result;
        if (action === 'delete') {
            result = await pool.query(`DELETE FROM employees WHERE id = ANY($1::UUID[]) RETURNING *`, [ids]);
        } else if (action === 'review') {
            return res.status(400).json({ status: 'fail', message: 'Review action not implemented for employees' });
        } else {
            return res.status(400).json({ status: 'fail', message: 'Invalid action' });
        }

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error('Error performing bulk action:', err);
        let message = 'An error occurred while performing the bulk action.';
        if (err.code === '23503') {
            message = 'Cannot delete employees linked to other records (e.g., attendance, activities).';
        }
        res.status(500).json({ message });
    }
};

exports.getTeamMembers = async (req, res) => {
    try {
        const managerEmployeeId = req.user.employee_id;
        const { departmentId, roleId, status, search } = req.query;

        if (!managerEmployeeId) {
            return res.status(404).json({ message: 'Manager employee record not found' });
        }

        const query = `
            SELECT 
                e.id,
                e.employee_code,
                e.first_name,
                e.last_name,
                e.full_name,
                e.status,
                e.avatar_url,
                e.department_id,
                e.position_id,
                d.name as department_name,
                p.title as position_title,
                r.name as role_name
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN roles r ON e.role_id = r.id
            WHERE e.supervisor_id = $1
            AND ($2::UUID IS NULL OR e.department_id = $2)
            AND ($3::UUID IS NULL OR e.role_id = $3)
            AND ($4::TEXT IS NULL OR e.status = $4)
            AND ($5::TEXT IS NULL OR (
                e.full_name ILIKE '%' || $5 || '%' OR 
                e.employee_code ILIKE '%' || $5 || '%'
            ))
            ORDER BY e.created_at DESC;
        `;

        const result = await pool.query(query, [
            managerEmployeeId,
            departmentId && departmentId !== 'All Departments' ? departmentId : null,
            roleId && roleId !== 'All Roles' ? roleId : null,
            status && status !== 'All Status' ? status : null,
            search || null
        ]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching team members:', err);
        res.status(500).json({ message: 'An error occurred while fetching team members. Please try again.' });
    }
};

exports.getHRReports = async (req, res) => {
    try {
        let { departmentId, status, search } = req.query;

        // Ensure departmentId is null if it's not a valid UUID or is 'All Departments'
        if (departmentId === 'All Departments' || !departmentId) {
            departmentId = null;
        }

        const recordsResult = await pool.query(employeeQueries.getDetailedHRReportQuery, [
            departmentId,
            status && status !== 'All Status' ? status : null,
            search || null
        ]);

        const distributionResult = await pool.query(employeeQueries.getEmployeeDistributionQuery);
        const correlationResult = await pool.query(employeeQueries.getAttendanceLeaveCorrelationQuery);

        res.status(200).json({
            status: 'success',
            records: recordsResult.rows,
            stats: {
                distribution: distributionResult.rows,
                correlation: correlationResult.rows
            }
        });
    } catch (err) {
        console.error('Error fetching HR reports:', err);
        res.status(500).json({ message: 'An error occurred while fetching HR reports. Please try again.' });
    }
};
