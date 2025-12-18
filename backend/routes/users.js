const router = require("express").Router();
const { signUp, login } = require("../controllers/users");

router.use("/", signUp);
router.use("/", login);

module.exports = router;
