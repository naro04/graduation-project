const router = require('express').Router();
const { requireActiveStatus } = require('../middleware/auth');

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

// Routes that require active status (restricted for inactive users)
router.use('/users', requireActiveStatus, userRouter);
router.use('/rbac', requireActiveStatus, rbacRouter);
router.use('/departments', requireActiveStatus, deptRouter);
router.use('/employees', requireActiveStatus, employeeRouter);
router.use('/positions', requireActiveStatus, posRouter);
router.use('/location-types', requireActiveStatus, locationTypesRouter);
router.use('/locations', requireActiveStatus, locationsRouter);
router.use('/location-assignments', requireActiveStatus, locationAssignmentsRouter);
router.use('/location-activities', requireActiveStatus, locationActivitiesRouter);
router.use('/gps-verifications', requireActiveStatus, gpsVerificationRouter);
router.use('/attendance', requireActiveStatus, attendanceRouter);
router.use('/leaves', requireActiveStatus, leaveRouter);
router.use('/uploads', requireActiveStatus, uploadsRouter);
router.use('/notifications', requireActiveStatus, notificationSettingsRouter);
router.use('/api-keys', requireActiveStatus, apiKeyRouter);
router.use('/help', requireActiveStatus, helpRouter);
router.use('/support', requireActiveStatus, supportRouter);
router.use('/system-settings', requireActiveStatus, systemSettingsRouter);
router.use('/projects', requireActiveStatus, projectsRouter);

module.exports = router;