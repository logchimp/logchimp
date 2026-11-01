import express from "express";
const router = express.Router();

import * as slack from "../../controllers/slack";
import { authRequired } from "../../../middlewares/auth";

// Slack signs the raw request body, so it must not be parsed before it is verified.
// The global `express.json()` ignores this content type.
router.post(
  "/integrations/slack/interactions",
  express.raw({ type: "application/x-www-form-urlencoded", limit: "1mb" }),
  slack.interactions,
);

router.get("/integrations/slack/settings", authRequired, slack.getSettings);
router.patch(
  "/integrations/slack/settings",
  authRequired,
  slack.updateSettings,
);
router.get("/integrations/slack/channels", authRequired, slack.getChannels);

export default router;
