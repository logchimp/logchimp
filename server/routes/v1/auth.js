// modules
const express = require("express");
const router = express.Router();

// controller
const auth = require("../../controllers/auth");

router.post("/auth/signup", auth.signup);
router.post("/auth/login", auth.login);

router.get("/auth/setup", auth.isSiteSetup);

// email
router.post("/auth/email/verify", auth.email.verify);
router.post("/auth/email/validate", auth.email.validate);

// password
router.post("/auth/password/reset", auth.password.reset);
router.post("/auth/password/validateToken", auth.password.validateToken);
router.post("/auth/password/set", auth.password.set);

module.exports = router;
