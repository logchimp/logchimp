import express from "express";
import type { ISearchRoadmapRequestParam } from "@logchimp/types";

const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";
import * as middleware from "../../middlewares";
import { roadmapExists } from "../../middlewares/roadmapExists";

router.get("/roadmaps", roadmaps.filter);

router.get("/roadmaps/:url", roadmapExists, roadmaps.roadmapByUrl);
router.get<ISearchRoadmapRequestParam>(
  "/roadmaps/search/:name",
  // @ts-expect-error
  middleware.apiAuth,
  roadmaps.searchRoadmap,
);

export default router;
