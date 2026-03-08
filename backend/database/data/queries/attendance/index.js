const getMyAttendanceQuery = require('./getMyAttendance');
const getTodayAttendanceQuery = require('./getTodayAttendance');
const createCheckInQuery = require('./createCheckIn');
const updateCheckOutQuery = require('./updateCheckOut');
const getEmployeeByUserIdQuery = require('./getEmployeeByUserId');

const getAttendanceReportsQuery = require('./getAttendanceReports');

module.exports = {
  getAttendanceReportsQuery,
  getMyAttendanceQuery,
  getTodayAttendanceQuery,
  createCheckInQuery,
  updateCheckOutQuery,
  getEmployeeByUserIdQuery
};

