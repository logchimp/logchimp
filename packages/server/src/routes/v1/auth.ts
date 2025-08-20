// modules
import express from "express";
const router = express.Router();

// controller
import * as auth from "../../controllers/auth";

// middleware
import { userExists } from "../../middlewares/userExists";
import { mailConfigExists } from "../../middlewares/mailConfigExists";
import { validateEmailToken } from "../../middlewares/validateEmailToken";
import { authRequired } from "../../middlewares/auth";
import { domainBlacklist } from "../../middlewares/domainBlacklist";

router.post("/auth/signup", domainBlacklist, mailConfigExists, auth.signup);
router.post("/auth/login", domainBlacklist, userExists, auth.login);

router.post("/auth/setup", domainBlacklist, mailConfigExists, auth.setup);
router.get("/auth/setup", auth.isSiteSetup);

// email
router.post(
  "/auth/email/verify",
  domainBlacklist,
  mailConfigExists,
  authRequired,
  userExists,
  auth.email.verify,
);
router.post(
  "/auth/email/validate",
  domainBlacklist,
  validateEmailToken,
  userExists,
  auth.email.validate,
);

// password
router.post(
  "/auth/password/reset",
  domainBlacklist,
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
  domainBlacklist,
  validateEmailToken,
  userExists,
  auth.password.set,
);

export default router;
