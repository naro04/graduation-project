const getMyAttendanceQuery = require('./getMyAttendance');
const getTodayAttendanceQuery = require('./getTodayAttendance');
const createCheckInQuery = require('./createCheckIn');
const updateCheckOutQuery = require('./updateCheckOut');
const getEmployeeByUserIdQuery = require('./getEmployeeByUserId');

module.exports = {
  getMyAttendanceQuery,
  getTodayAttendanceQuery,
  createCheckInQuery,
  updateCheckOutQuery,
  getEmployeeByUserIdQuery
};

