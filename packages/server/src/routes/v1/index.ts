import express from "express";
const router = express.Router();

import logger from "../../utils/logger";

import auth from "./auth";
import posts from "./posts";
import votes from "./votes";
import users from "./users";
import settings from "./settings";

router.use("/api/v1", posts, votes, users, settings);

let eeRoutesLoaded = false;
export async function initialiseEERoutes() {
  if (eeRoutesLoaded) return;
  try {
    const eeRouter = (await import("../../ee/routes/v1")).default;
    router.use("/api/v1", eeRouter);
    logger.info("✓ Enterprise features loaded");
    eeRoutesLoaded = true;
  } catch (_) {
    logger.info("Running in open source mode (EE features not available)");
    logger.info(
      "Upgrade to higher plan to access boards, roadmaps, and roles features.",
    );
    logger.info("Go to -> https://logchimp.app");
  }
}

export const ready = (async () => {
  await initialiseEERoutes();

  if (!eeRoutesLoaded) {
    router.use("/api/v1", auth);
  }
})();

export default router;
