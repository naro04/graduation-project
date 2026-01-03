const router = require('express').Router();

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

router.use('/profile', profileRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
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
router.use('/', dashboard);

module.exports = router;