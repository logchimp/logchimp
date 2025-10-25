// modules
import express from "express";
const router = express.Router();

// controller
import * as roadmaps from "../../controllers/v1/roadmaps";

// middleware
import { authRequired } from "../../../middlewares/auth";
import { roadmapExists } from "../../../middlewares/roadmapExists";
import { licenseGuard } from "../../middleware/licenseGuard";

router.post("/roadmaps", licenseGuard, authRequired, roadmaps.create);

router.patch(
  "/roadmaps",
  licenseGuard,
  authRequired,
  roadmapExists,
  roadmaps.updateRoadmap,
);
router.patch("/roadmaps/sort", licenseGuard, authRequired, roadmaps.sort);

router.delete(
  "/roadmaps",
  licenseGuard,
  authRequired,
  roadmapExists,
  roadmaps.deleteById,
);

export default router;
