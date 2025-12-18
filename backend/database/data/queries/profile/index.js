const { getEmployeesQuery } = require("./getEmployees");
const { getPersonalInfoQuery } = require("./getPersonalInfo");
const { getJobInfoQuery } = require("./getJobInfo");
const { getLocationQuery } = require("./getLocation");
const { getAccountSecurityQuery } = require("./getAccountSecurity");
const { getWorkScheduleQuery } = require("./getWorkSchedule");
const { getEmergencyContactQuery } = require("./getEmergencyContact");


module.exports = {
    getEmployeesQuery,
    getPersonalInfoQuery,
    getJobInfoQuery,
    getLocationQuery,
    getAccountSecurityQuery,
    getWorkScheduleQuery,
    getEmergencyContactQuery
};
