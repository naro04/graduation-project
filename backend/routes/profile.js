const router = require("express").Router();

const { getPersonalInfo, getAccountSecurity,
    getJobInfo, getEmergencyContact,
    getLocation, getWorkSchedule, getMe,
    updateProfile
} = require("../controllers/profile");

const { protect } = require("../middleware/auth");

router.use(protect); // Secure all profile routes

router.use("/personal-info", getPersonalInfo);
router.use("/account-security", getAccountSecurity);
router.use("/job-info", getJobInfo);
router.use("/emergency-contact", getEmergencyContact);
router.use("/location", getLocation);
router.use("/work-schedule", getWorkSchedule);

module.exports = router;

