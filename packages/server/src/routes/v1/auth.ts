// modules
import express from "express";
const router = express.Router();

// controller
import * as auth from "../../controllers/auth";

// middleware
import { mailConfigExists } from "../../middlewares/mailConfigExists";
import { validateEmailToken } from "../../middlewares/validateEmailToken";
import { authRequired } from "../../middlewares/auth";

router.get("/auth/me", authRequired, auth.me);

router.post("/auth/signup", mailConfigExists, auth.signup);
router.post("/auth/login", auth.passwordLogin);

router.post("/auth/setup", mailConfigExists, auth.setup);
router.get("/auth/setup", auth.isSiteSetup);

// email
router.post(
  "/auth/email/verify",
  mailConfigExists,
  authRequired,
  auth.email.verify,
);
router.post("/auth/email/validate", validateEmailToken, auth.email.validate);

// password
router.post("/auth/password/reset", mailConfigExists, auth.password.reset);
router.post(
  "/auth/password/validateToken",
  validateEmailToken,
  auth.password.validateToken,
);
router.post("/auth/password/set", validateEmailToken, auth.password.set);

router.get("/auth/oidc/login", auth.OIDCLogin);
router.get("/auth/oidc/callback", auth.OIDCLoginCallback);

export default router;
