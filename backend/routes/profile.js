const router = require('express').Router();
const { protect } = require('../middleware/auth');

const {
  getPersonalInfo,
  getAccountSecurity,
  getJobInfo,
  getEmergencyContact,
  getLocation,
  getWorkSchedule,
  getMe,
  updateProfile
} = require('../controllers/profile');
const positionsController = require('../controllers/positions'); // Added positionsController

// All profile routes require authentication
router.use(protect);

// router.use("/employees", getEmployees);
router.get('/me', protect, getMe); // Modified: added protect middleware explicitly
router.patch('/me', protect, updateProfile); // Modified: added protect middleware explicitly
router.get('/personal-info', protect, getPersonalInfo); // Modified: changed from router.use to router.get, added protect
router.put('/personal-info', protect, updateProfile); // Added: update personal info route (assuming updateProfile handles this)
router.use('/account-security', getAccountSecurity); // Kept as is
router.get('/job-info', protect, getJobInfo); // Modified: changed from router.use to router.get, added protect
router.get('/emergency-contact', protect, getEmergencyContact); // Modified: changed from router.use to router.get, added protect
router.put('/emergency-contact', protect, updateProfile); // Added: update emergency contact route (assuming updateProfile handles this)
router.get('/positions', protect, positionsController.getAllPositions); // Added: positions route
router.use('/location', getLocation); // Kept as is
router.use('/work-schedule', getWorkSchedule); // Kept as is

module.exports = router;
