module.exports = {
    getMe: require('./getMe'),
    getPersonalInfo: require('./getPersonalInfo'),
    getAccountSecurity: require('./updateAccountSecurity').getAccountSecurity,
    updateAccountSecurity: require('./updateAccountSecurity').updateAccountSecurity,
    getJobInfo: require('./getJobInfo'),
    getEmergencyContact: require('./getEmergencyContact'),
    getLocation: require('./getLocation'),
    getWorkSchedule: require('./getWorkSchedule'),
    updateProfile: require('./updateProfile').updateProfile
};
