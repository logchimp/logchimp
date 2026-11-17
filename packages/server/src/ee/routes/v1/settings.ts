// modules
import express from "express";
// controller
import * as settings from "../../../controllers/settings";
import * as settingsEE from "../../controllers/v1/settings";

// middleware
import { authOptional, authRequired } from "../../../middlewares/auth";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

const router = express.Router();

router.get(
  "/settings/site",
  authOptional,
  withLicenseGuard(settingsEE.getSiteSettings, {
    requiredPlan: ["pro", "business", "enterprise"],
  }),
);
router.patch("/settings/site", authRequired, settings.update);
// NOTE: Temporarily disable API-endpoint due to no file storage system implemented.
// router.post(
//   "/settings/update-logo",
//   authRequired,
//   settings.updateLogo,
// );
router.get("/settings/labs", settings.getLabs);
router.patch("/settings/labs", authRequired, settings.updateLabs);

export default router;
