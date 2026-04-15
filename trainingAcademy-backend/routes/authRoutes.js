const express = require("express");
const router = express.Router();

const {register,login,autoLogin} = require("../controllers/authController");

router.post("/register",register);
router.post("/login",login);
router.post("/auto-login", autoLogin);

module.exports = router;