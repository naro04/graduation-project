const getGPSVerificationsQuery = require('./getGPSVerifications');
const getEmployeeLocationsQuery = require('./getEmployeeLocations');
const getAttendanceByIdQuery = require('./getAttendanceById');
const updateGPSStatusQuery = require('./updateGPSStatus');
const getGPSStatsQuery = require('./getGPSStats');

module.exports = {
  getGPSVerificationsQuery,
  getEmployeeLocationsQuery,
  getAttendanceByIdQuery,
  updateGPSStatusQuery,
  getGPSStatsQuery
};

