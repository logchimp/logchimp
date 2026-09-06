import express from "express";
import * as auth from "../../../controllers/auth";
import { mailConfigExists } from "../../../middlewares/mailConfigExists";
import { withLicenseGuardWrapper } from "../../../middlewares/licenseGuardWrapper";
import { domainBlacklist } from "../../middleware/domainBlacklist";
import { authRequired } from "../../../middlewares/auth";
import { validateEmailToken } from "../../../middlewares/validateEmailToken";
import { OIDCLoginCallback } from "../../controllers/v1/auth";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

const router = express.Router();

router.get("/auth/me", authRequired, auth.me);

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
  auth.passwordLogin,
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
  auth.email.verify,
);
router.post(
  "/auth/email/validate",
  validateEmailToken,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
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
  auth.password.reset,
);
router.post(
  "/auth/password/validateToken",
  validateEmailToken,
  auth.password.validateToken,
);
router.post(
  "/auth/password/set",
  validateEmailToken,
  withLicenseGuardWrapper(domainBlacklist, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: true,
  }),
  auth.password.set,
);

router.get("/auth/oidc/login", auth.OIDCLogin);
router.get(
  "/auth/oidc/callback",
  withLicenseGuard(OIDCLoginCallback, {
    requiredPlan: ["pro", "business", "enterprise"],
    skipHandlerOnFailure: false,
  }),
);

export default router;
