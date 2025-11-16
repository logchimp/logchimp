// modules
import express from "express";
const router = express.Router();

// controller
import * as roadmaps from "../../controllers/v1/roadmaps";

// middleware
import { authRequired } from "../../../middlewares/auth";
import { roadmapExists } from "../../../middlewares/roadmapExists";
import { withLicenseGuard } from "../../do-not-remove/middleware/licenseGuard";

router.post(
  "/roadmaps",
  authRequired,
  withLicenseGuard(roadmaps.create, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

router.patch(
  "/roadmaps",
  authRequired,
  roadmapExists,
  withLicenseGuard(roadmaps.updateRoadmap, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);
router.patch(
  "/roadmaps/sort",
  authRequired,
  withLicenseGuard(roadmaps.sort, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

router.delete(
  "/roadmaps",
  authRequired,
  roadmapExists,
  withLicenseGuard(roadmaps.deleteById, {
    requiredPlan: ["starter", "growth", "enterprise"],
  }),
);

export default router;
