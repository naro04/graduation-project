const pool = require('../database/connection');
const employeeQueries = require('../database/data/queries/employees');
const activityQueries = require('../database/data/queries/locationActivities'); // Might need this for activity counts later

exports.getAllEmployees = async (req, res) => {
    try {
        const { departmentId, roleId, status, search } = req.query;
        const { role_name, employee_id } = req.user;

        const isManager = role_name === 'Manager';
        const isAdmin = role_name === 'Super Admin' || role_name === 'HR Admin';
        const isEmployee = role_name === 'Officer' || role_name === 'Field Worker';

        // 1. Strict RBAC: Officers/Field Workers cannot list employees
        if (isEmployee) {
            return res.status(403).json({ 
                status: 'fail', 
                message: 'Access Denied: You do not have permission to view employee lists.' 
            });
        }

        console.log('📋 Fetching employees with filters:', { departmentId, roleId, status, search });

        // 2. Scoping: Managers only see their team
        const result = await pool.query(employeeQueries.getEmployeesQuery, [
            departmentId || null,
            roleId || null,
            status || null,
            search || null,
            isManager ? employee_id : null
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
        const { role_name, employee_id } = req.user;

        const isManager = role_name === 'Manager';
        const isAdmin = role_name === 'Super Admin' || role_name === 'HR Admin';
        const isEmployee = role_name === 'Officer' || role_name === 'Field Worker';

        // 1. Strict RBAC: Officers/Field Workers can only view THEIR OWN profile
        if (isEmployee && id !== employee_id) {
            return res.status(403).json({ 
                status: 'fail', 
                message: 'Access Denied: You are not authorized to view this employee profile.' 
            });
        }

        const result = await pool.query(employeeQueries.getEmployeeByIdQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'Employee not found' });
        }

        const employee = result.rows[0];

        // 2. Scoping check for Managers: Can only view team members
        if (isManager && employee.supervisor_id !== employee_id && employee.id !== employee_id) {
            return res.status(403).json({
                status: 'fail',
                message: 'Access Denied: You can only view employees assigned to you.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: employee
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
            department_id, position_id, status, role_id, avatar_url, avatarUrl
        } = req.body;

        const finalAvatarUrl = req.file ? req.file.path : (avatar_url || avatarUrl || null);


        // 1. Validation
        if (!first_name || !last_name) {
            return res.status(400).json({ status: 'fail', message: 'First name and last name are required' });
        }

        // 2. Auto-generate & Force Scoping
        if (!full_name) {
            full_name = `${first_name} ${last_name}`;
        }

        if (!employee_code) {
            employee_code = `EMP-${Date.now()}`;
        }

        const isManager = req.user.role_name === 'Manager';
        let finalSupervisorId = req.body.supervisor_id || null;

        // Force supervisor_id for Managers
        if (isManager) {
            finalSupervisorId = req.user.employee_id;
        }

        // 3. Database operation
        const result = await pool.query(`
            INSERT INTO employees (
                user_id, employee_code, first_name, last_name, full_name, 
                department_id, position_id, status, avatar_url, role_id, supervisor_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            user_id || null,
            employee_code,
            first_name,
            last_name,
            full_name,
            department_id || null,
            position_id || null,
            status || 'active',
            finalAvatarUrl,
            role_id || null,
            finalSupervisorId
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
        res.status(500).json({ message, error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        let {
            first_name, last_name, full_name,
            department_id, position_id, status, avatar_url, avatarUrl, role_id
        } = req.body;

        const finalAvatarUrl = req.file ? req.file.path : (avatar_url || avatarUrl || null);

        if (!full_name && first_name && last_name) {
            full_name = `${first_name} ${last_name}`;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Authorization Check
            const currentEmployeeResult = await client.query('SELECT supervisor_id FROM employees WHERE id = $1', [id]);
            if (currentEmployeeResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ status: 'fail', message: 'Employee not found' });
            }

            const employee = currentEmployeeResult.rows[0];
            const userRole = req.user.role_name;
            const isManager = req.user.role_name === 'Manager';
            const isAdmin = req.user.role_name === 'Super Admin' || req.user.role_name === 'HR Admin';

            if (isManager && employee.supervisor_id !== req.user.employee_id) {
                await client.query('ROLLBACK');
                return res.status(403).json({
                    status: 'fail',
                    message: 'Access Denied: You can only edit employees assigned to you.'
                });
            }

            if (!isAdmin && !isManager) {
                await client.query('ROLLBACK');
                return res.status(403).json({
                    status: 'fail',
                    message: 'Access Denied: You do not have permission to perform this action.'
                });
            }

            // 2. Database operation
            const result = await client.query(employeeQueries.updateEmployeeQuery, [
                first_name,
                last_name,
                full_name,
                department_id || null,
                position_id || null,
                status,
                finalAvatarUrl,
                role_id || null,
                req.body.supervisor_id || employee.supervisor_id || null,
                id
            ]);

            // Update Role if provided
            if (role_id) {
                const updatedEmployee = result.rows[0];
                if (updatedEmployee.user_id) {
                    await client.query('DELETE FROM user_roles WHERE user_id = $1', [updatedEmployee.user_id]);
                    await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [updatedEmployee.user_id, role_id]);
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
        res.status(500).json({
            message: 'An error occurred while updating the employee. Please try again.',
            error: err.message
        });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Authorization Check
        const currentEmployeeResult = await pool.query('SELECT supervisor_id FROM employees WHERE id = $1', [id]);
        if (currentEmployeeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const employee = currentEmployeeResult.rows[0];
        const isManager = req.user.role_name === 'Manager';
        const isAdmin = req.user.role_name === 'Super Admin' || req.user.role_name === 'HR Admin';

        if (isManager && employee.supervisor_id !== req.user.employee_id) {
            return res.status(403).json({
                status: 'fail',
                message: 'Access Denied: You can only delete employees assigned to you.'
            });
        }

        if (!isAdmin && !isManager) {
            return res.status(403).json({
                status: 'fail',
                message: 'Access Denied: You do not have permission to perform this action.'
            });
        }

        // 2. Database operation
        const result = await pool.query(employeeQueries.deleteEmployeeQuery, [id]);

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

        const result = await pool.query(employeeQueries.getTeamMembersQuery, [
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
