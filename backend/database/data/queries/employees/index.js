const { getEmployeesQuery } = require('./getEmployees');
const { getEmployeeByIdQuery } = require('./getEmployeeById');
const { createEmployeeQuery } = require('./createEmployee');
const { updateEmployeeQuery } = require('./updateEmployee');
const { deleteEmployeeQuery } = require('./deleteEmployee');

module.exports = {
    getEmployeesQuery,
    getEmployeeByIdQuery,
    createEmployeeQuery,
    updateEmployeeQuery,
    deleteEmployeeQuery
};
