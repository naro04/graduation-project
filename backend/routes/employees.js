const router = require("express").Router();

const { getPersonalInfo, getAccountSecuirty,
    getJobInfo, getEmergencyContact,
    getLocation, getWorkSchedual, getEmployees
} = require("../controllers/employee");

router.get("/employees", getEmployees);
router.get("/personal-info/:id", getPersonalInfo);
router.get("/account-security/:id", getAccountSecuirty);
router.get("/job-info/:id", getJobInfo);
router.get("/emergency-contact/:id", getEmergencyContact);
router.get("/location/:id", getLocation);
router.get("/work-schedual/:id", getWorkSchedual);

module.exports = router;

