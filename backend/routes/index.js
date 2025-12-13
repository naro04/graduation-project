const router = require('express').Router();

const employees = require('./employees');

router.use(employees);

module.exports = router;