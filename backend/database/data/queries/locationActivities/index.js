const createLocationActivityQuery = require('./createLocationActivity');
const getActivityEmployeesQuery = require('./getActivityEmployees');
const getActivityByIdQuery = require('./getActivityById');
const updateLocationActivityQuery = require('./updateLocationActivity');
const deleteLocationActivityQuery = require('./deleteLocationActivity');
const assignEmployeesToActivityQuery = require('./assignEmployeesToActivity');
const removeEmployeesFromActivityQuery = require('./removeEmployeesFromActivity');

module.exports = {
  createLocationActivityQuery,
  getActivityEmployeesQuery,
  getActivityByIdQuery,
  updateLocationActivityQuery,
  deleteLocationActivityQuery,
  assignEmployeesToActivityQuery,
  removeEmployeesFromActivityQuery
};

