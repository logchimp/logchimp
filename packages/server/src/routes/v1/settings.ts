// modules
import express from "express";
const router = express.Router();

// controller
import * as settings from "../../controllers/settings";

// middleware
import * as middlewares from "../../middlewares";

router.get("/settings/site", settings.siteSettings);
router.patch("/settings/site", middlewares.apiAuth, settings.update);
// NOTE: Temporarily disable API-endpoint due to no file storage system implemented.
// router.post(
//   "/settings/update-logo",
//   middlewares.apiAuth,
//   settings.updateLogo,
// );
router.get("/settings/labs", settings.getLabs);
router.patch("/settings/labs", middlewares.apiAuth, settings.updateLabs);

export default router;
