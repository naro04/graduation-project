const createLocationActivityQuery = require('./createLocationActivity');
const getActivityEmployeesQuery = require('./getActivityEmployees');
const getActivityByIdQuery = require('./getActivityById');
const getAllActivitiesQuery = require('./getAllActivities');
const updateLocationActivityQuery = require('./updateLocationActivity');
const deleteLocationActivityQuery = require('./deleteLocationActivity');
const assignEmployeesToActivityQuery = require('./assignEmployeesToActivity');
const removeEmployeesFromActivityQuery = require('./removeEmployeesFromActivity');
const getActivityReports = require('./getActivityReports');

module.exports = {
  ...getActivityReports,
  createLocationActivityQuery,
  getActivityEmployeesQuery,
  getActivityByIdQuery,
  getAllActivitiesQuery,
  updateLocationActivityQuery,
  deleteLocationActivityQuery,
  assignEmployeesToActivityQuery,
  removeEmployeesFromActivityQuery
};

