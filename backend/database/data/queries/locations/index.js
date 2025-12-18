const getLocationsQuery = require('./getLocations');
const createLocationQuery = require('./createLocation');
const updateLocationQuery = require('./updateLocation');
const deleteLocationQuery = require('./deleteLocation');
const getLocationEmployeesQuery = require('./getLocationEmployees');
const getLocationActivitiesQuery = require('./getLocationActivities');

module.exports = {
  getLocationsQuery,
  createLocationQuery,
  updateLocationQuery,
  deleteLocationQuery,
  getLocationEmployeesQuery,
  getLocationActivitiesQuery
};

