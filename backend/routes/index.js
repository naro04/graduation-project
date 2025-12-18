const router = require('express').Router();

const profileRouter = require('./profile');
const userRouter = require('./users');
const dashboard = require('../controllers/dashboard');
const authRouter = require('./auth');
const rbacRouter = require('./rbac');
const deptRouter = require('./departments');
const employeeRouter = require('./employees');
const posRouter = require('./positions');

router.use('/profile', profileRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/rbac', rbacRouter);
router.use('/departments', deptRouter);
router.use('/employees', employeeRouter);
router.use('/positions', posRouter);
router.use('/', dashboard);

module.exports = router;