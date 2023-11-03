const express = require("express");
const router = express.Router();
const RegisterHandler = require("../handler/registerHandler");

router.post("/register", RegisterHandler.registerUser);
router.post("/login", RegisterHandler.loginUser);

module.exports = router;
