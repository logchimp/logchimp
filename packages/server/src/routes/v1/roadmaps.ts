import express from "express";
// Remove this: import { z } from "zod";
const router = express.Router();

import * as roadmaps from "../../controllers/roadmaps";
import * as middleware from "../../middlewares";
import { roadmapExists } from "../../middlewares/roadmapExists";

// Remove these lines:
// const querySchema = z.object({ ... });
// const validateQuery = (schema: z.ZodSchema) => { ... };

// Simplified route - controller handles its own validation
router.get("/roadmaps", roadmaps.filter);

router.get("/roadmaps/:url", roadmapExists, roadmaps.roadmapByUrl);
router.get(
  "/roadmaps/search/:name",
  middleware.apiAuth,
  roadmaps.searchRoadmap
);

export default router;
