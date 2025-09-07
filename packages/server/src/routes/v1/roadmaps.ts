import express from "express";
import type { ISearchRoadmapRequestParam } from "@logchimp/types";

const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";
import { authOptional, authRequired } from "../../middlewares/auth";
import { roadmapExists } from "../../middlewares/roadmapExists";

router.get(
  "/roadmaps",
  authOptional,
  // @ts-expect-error
  roadmaps.filter,
);

router.get("/roadmaps/:url", roadmapExists, roadmaps.roadmapByUrl);
router.get<ISearchRoadmapRequestParam>(
  "/roadmaps/search/:name",
  // @ts-expect-error
  authRequired,
  roadmaps.searchRoadmap,
);

export default router;
