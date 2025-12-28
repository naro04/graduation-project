const pool = require('../database/connection');
const employeeQueries = require('../database/data/queries/employees');

exports.getAllEmployees = async (req, res) => {
    try {
        const { departmentId, roleId, status, search } = req.query;

        // departmentId and roleId should be mapped to the query parameters
        // We pass them to the query in order: [departmentId, roleId, status, search]
        const result = await pool.query(employeeQueries.getEmployeesQuery, [
            departmentId || null,
            roleId || null,
            status || null,
            search || null
        ]);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching employees', error: err.message });
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
        res.status(500).json({ message: 'Error fetching employee', error: err.message });
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
            avatar_url || null
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
        res.status(500).json({
            status: 'error',
            message: 'Error creating employee',
            error: err.message,
            detail: err.detail // Useful for the user to see unique constraint violations etc.
        });
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
        res.status(500).json({
            status: 'error',
            message: 'Error updating employee',
            error: err.message,
            detail: err.detail
        });
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
        res.status(500).json({ message: 'Error deleting employee', error: err.message });
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
            // For employees, "review" might just be a placeholder or update is_reviewed if we add it
            // For now, let's just update status to 'active' or something similar if needed
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
        let message = 'Error performing bulk action';
        if (err.code === '23503') {
            message = 'Cannot delete employees linked to other records (e.g. attendance, activities)';
        }
        res.status(500).json({ message, error: err.message });
    }
};
