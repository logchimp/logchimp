// modules
import express from "express";
const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";

// middleware
import middleware from "../../middlewares";
import exists from "../../middlewares/roadmapExists";

router.get("/roadmaps", roadmaps.filter);
router.get("/roadmaps/:url", exists, roadmaps.roadmapByUrl);
router.get(
  "/roadmaps/search/:name",
  middleware.apiAuth,
  roadmaps.searchRoadmap,
);

module.exports = router;
