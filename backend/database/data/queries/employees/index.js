const { getEmployeesQuery } = require("./getEmployees");
const { getPersonalInfoQuery } = require("./getPersonalInfo");
const { getJobInfoQuery } = require("./getJobInfo");
const { getLocationQuery } = require("./getLocation");
const { getAccountSecuirtyQuery } = require("./getAccountSecuirty");
const { getWorkSchedualQuery } = require("./getWorkSchedual");
const { getEmergencyContactQuery } = require("./getEmergencyContact");


module.exports = {
    getEmployeesQuery,
    getPersonalInfoQuery,
    getJobInfoQuery,
    getLocationQuery,
    getAccountSecuirtyQuery,
    getWorkSchedualQuery,
    getEmergencyContactQuery
};
