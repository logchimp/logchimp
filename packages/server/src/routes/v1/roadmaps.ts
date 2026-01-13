import express from "express";
import type {
  IGetRoadmapByUrlRequestParam,
  ISearchRoadmapRequestParam,
} from "@logchimp/types";

const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";
import { authOptional, authRequired } from "../../middlewares/auth";
import { roadmapExists } from "../../middlewares/roadmapExists";

router.get("/roadmaps", authOptional, roadmaps.filter);

router.get<IGetRoadmapByUrlRequestParam>(
  "/roadmaps/:url",
  roadmapExists,
  roadmaps.roadmapByUrl,
);
router.get<ISearchRoadmapRequestParam>(
  "/roadmaps/search/:name",
  // @ts-expect-error
  authRequired,
  roadmaps.searchRoadmap,
);

export default router;
