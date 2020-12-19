// modules
const express = require("express");
const router = express.Router();

// controller
const auth = require("../../controllers/auth");

// middleware
const exists = require("../../middlewares/userExists");
const validateEmailToken = require("../../middlewares/validateEmailToken");

router.post("/auth/signup", auth.signup);
router.post("/auth/login", auth.login);

router.post("/auth/setup", auth.setup);
router.get("/auth/setup", auth.isSiteSetup);

// email
router.post("/auth/email/verify", exists, auth.email.verify);
router.post(
	"/auth/email/validate",
	validateEmailToken,
	exists,
	auth.email.validate
);

// password
router.post("/auth/password/reset", auth.password.reset);
router.post("/auth/password/validateToken", auth.password.validateToken);
router.post("/auth/password/set", auth.password.set);

module.exports = router;
