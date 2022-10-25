// modules
const express = require("express");
const router = express.Router();

// controller
const auth = require("../../controllers/auth");

// middleware
const exists = require("../../middlewares/userExists");
const mailConfigExists = require("../../middlewares/mailConfigExists");
const validateEmailToken = require("../../middlewares/validateEmailToken");

router.post("/auth/signup", mailConfigExists, auth.signup);
router.post("/auth/login", exists, auth.login);

router.post("/auth/setup", mailConfigExists, auth.setup);
router.get("/auth/setup", auth.isSiteSetup);

// email
router.post("/auth/email/verify", mailConfigExists, exists, auth.email.verify);
router.post(
  "/auth/email/validate",
  validateEmailToken,
  exists,
  auth.email.validate,
);

// password
router.post(
  "/auth/password/reset",
  mailConfigExists,
  exists,
  auth.password.reset,
);
router.post(
  "/auth/password/validateToken",
  validateEmailToken,
  exists,
  auth.password.validateToken,
);
router.post(
  "/auth/password/set",
  validateEmailToken,
  exists,
  auth.password.set,
);

module.exports = router;
