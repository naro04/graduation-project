const { getEmployeesQuery } = require('./getEmployees');
const { createEmployeeQuery } = require('./createEmployee');
const { updateEmployeeQuery } = require('./updateEmployee');
const { deleteEmployeeQuery } = require('./deleteEmployee');

module.exports = {
    getEmployeesQuery,
    createEmployeeQuery,
    updateEmployeeQuery,
    deleteEmployeeQuery
};
