const router = require('express').Router();
const { protect, requireActiveStatus } = require('../middleware/auth');

const profileRouter = require('./profile');
const userRouter = require('./users');
const dashboard = require('../controllers/dashboard');
const authRouter = require('./auth');
const rbacRouter = require('./rbac');
const deptRouter = require('./departments');
const employeeRouter = require('./employees');
const posRouter = require('./positions');
const locationTypesRouter = require('./locationTypes');
const locationsRouter = require('./locations');
const locationAssignmentsRouter = require('./locationAssignments');
const locationActivitiesRouter = require('./locationActivities');
const gpsVerificationRouter = require('./gpsVerification');
const attendanceRouter = require('./attendance');
const leaveRouter = require('./leaves');
const uploadsRouter = require('./uploads');
const notificationSettingsRouter = require('./notificationSettings');
const apiKeyRouter = require('./apiKey');
const helpRouter = require('./help');
const supportRouter = require('./support');
const systemSettingsRouter = require('./systemSettings');
const projectsRouter = require('./projects');

// Routes that don't require active status (accessible to inactive users)
router.use('/profile', profileRouter);
router.use('/auth', authRouter);
router.use('/', dashboard); // Dashboard is accessible to inactive users

// PROTECTED ROUTES SECTION
// First ensure user is logged in
router.use(protect);

// Then allow these routes even for inactive employees
router.use('/more/help', helpRouter); // Assuming help is accessible anyway
router.use('/more/support', supportRouter);

// Then require active status for everything else
router.use(requireActiveStatus);

router.use('/users', userRouter);
router.use('/rbac', rbacRouter);
router.use('/departments', deptRouter);
router.use('/employees', employeeRouter);
router.use('/positions', posRouter);
router.use('/location-types', locationTypesRouter);
router.use('/locations', locationsRouter);
router.use('/location-assignments', locationAssignmentsRouter);
router.use('/location-activities', locationActivitiesRouter);
router.use('/gps-verifications', gpsVerificationRouter);
router.use('/attendance', attendanceRouter);
router.use('/leaves', leaveRouter);
router.use('/uploads', uploadsRouter);
router.use('/notifications', notificationSettingsRouter);
router.use('/api-keys', apiKeyRouter);
router.use('/system-settings', systemSettingsRouter);
router.use('/projects', projectsRouter);

module.exports = router;