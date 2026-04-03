import express from "express";
const router = express.Router();

import * as auth from "../../../controllers/auth";
import { mailConfigExists } from "../../../middlewares/mailConfigExists";
import { withLicenseGuardWrapper } from "../../../middlewares/licenseGuardWrapper";
import { domainBlacklist } from "../../middleware/domainBlacklist";
import { userExists } from "../../../middlewares/userExists";
import { authRequired } from "../../../middlewares/auth";
import { validateEmailToken } from "../../../middlewares/validateEmailToken";

router.post(
  "/auth/signup",
  mailConfigExists,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  auth.signup,
);
router.post(
  "/auth/login",
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  userExists,
  auth.login,
);

router.post(
  "/auth/setup",
  mailConfigExists,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  auth.setup,
);
router.get("/auth/setup", auth.isSiteSetup);

// email
router.post(
  "/auth/email/verify",
  mailConfigExists,
  authRequired,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  userExists,
  auth.email.verify,
);
router.post(
  "/auth/email/validate",
  validateEmailToken,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  userExists,
  auth.email.validate,
);

// password
router.post(
  "/auth/password/reset",
  mailConfigExists,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
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
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  userExists,
  auth.password.set,
);

export default router;
