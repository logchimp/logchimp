// modules
import express from "express";
const router = express.Router();

// controller
import * as settings from "../../controllers/settings";

// middleware
import { authRequired } from "../../middlewares/auth";

router.get("/settings/site", settings.siteSettings);
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
