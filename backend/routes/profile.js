const router = require('express').Router();
const { protect } = require('../middleware/auth');

const {
  getPersonalInfo,
  getAccountSecurity,
  updateAccountSecurity,
  getJobInfo,
  getEmergencyContact,
  getLocation,
  getWorkSchedule,
  getMe,
  updateProfile
} = require('../controllers/profile');
const positionsController = require('../controllers/positions');

const upload = require('../middleware/upload');

// All profile routes require authentication
router.use(protect);

router.get('/me', getMe);
router.patch('/me', upload.single('avatar'), updateProfile);

router.get('/personal-info', getPersonalInfo);
router.put('/personal-info', upload.single('avatar'), updateProfile);

router.get('/account-security', getAccountSecurity);
router.put('/account-security', updateAccountSecurity);

router.get('/job-info', getJobInfo);
router.put('/job-info', updateProfile);

router.get('/emergency-contact', getEmergencyContact);
router.put('/emergency-contact', updateProfile);

router.get('/positions', positionsController.getAllPositions);

router.get('/location', getLocation);
router.get('/work-schedule', getWorkSchedule);

module.exports = router;
