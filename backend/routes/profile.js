const router = require("express").Router();

const { getPersonalInfo, getAccountSecurity,
    getJobInfo, getEmergencyContact,
    getLocation, getWorkSchedule, getMe
} = require("../controllers/profile");

// router.use("/employees", getEmployees);
router.use("/me", getMe);
router.use("/personal-info", getPersonalInfo);
router.use("/account-security", getAccountSecurity);
router.use("/job-info", getJobInfo);
router.use("/emergency-contact", getEmergencyContact);
router.use("/location", getLocation);
router.use("/work-schedule", getWorkSchedule);

module.exports = router;

