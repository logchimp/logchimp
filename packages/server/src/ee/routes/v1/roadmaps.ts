// modules
import express from "express";
const router = express.Router();

// controller
import * as roadmaps from "../../controllers/v1/roadmaps";

// middleware
import * as middleware from "../../../middlewares";
import { roadmapExists } from "../../../middlewares/roadmapExists";

router.post("/roadmaps", middleware.apiAuth, roadmaps.create);

router.patch(
  "/roadmaps",
  middleware.apiAuth,
  roadmapExists,
  roadmaps.updateRoadmap,
);
router.patch("/roadmaps/sort", middleware.apiAuth, roadmaps.sort);

router.delete(
  "/roadmaps",
  middleware.apiAuth,
  roadmapExists,
  roadmaps.deleteById,
);

export default router;
