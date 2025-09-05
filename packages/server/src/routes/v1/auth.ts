// modules
import express from "express";
const router = express.Router();

// controller
import * as auth from "../../controllers/auth";

// middleware
import { userExists } from "../../middlewares/userExists";
import { mailConfigExists } from "../../middlewares/mailConfigExists";
import { validateEmailToken } from "../../middlewares/validateEmailToken";
import * as middleware from "../../middlewares";

router.post("/auth/signup", mailConfigExists, auth.signup);
router.post("/auth/login", userExists, auth.login);

router.post("/auth/setup", mailConfigExists, auth.setup);
router.get("/auth/setup", auth.isSiteSetup);

// email
router.post(
  "/auth/email/verify",
  mailConfigExists,
  middleware.apiAuth,
  userExists,
  auth.email.verify,
);
router.post(
  "/auth/email/validate",
  validateEmailToken,
  userExists,
  auth.email.validate,
);

// password
router.post(
  "/auth/password/reset",
  mailConfigExists,
  userExists,
  auth.password.reset,
);
router.post(
  "/auth/password/validateToken",
  validateEmailToken,
  userExists,
  auth.password.validateToken,
);
router.post(
  "/auth/password/set",
  validateEmailToken,
  userExists,
  auth.password.set,
);

export default router;
