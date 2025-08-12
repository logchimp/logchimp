import express from "express";

const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";
import * as middleware from "../../middlewares";
import { roadmapExists } from "../../middlewares/roadmapExists";

router.get("/roadmaps", roadmaps.filter);

router.get("/roadmaps/:url", roadmapExists, roadmaps.roadmapByUrl);
router.get(
  "/roadmaps/search/:name",
  middleware.apiAuth,
  roadmaps.searchRoadmap,
);

export default router;
