// modules
const express = require("express");
const router = express.Router();

// controller
const auth = require("../../controllers/auth");

router.post("/auth/signup", auth.signup);
router.post("/auth/login", auth.login);
router.get("/auth/isSetup", auth.isSetup);

// email
router.post("/auth/email/verify", auth.email.verify);

module.exports = router;
