// modules
import express from "express";
const router = express.Router();

// controller
import * as roadmaps from "../../controllers/v1/roadmaps";

// middleware
import { authRequired } from "../../../middlewares/auth";
import { roadmapExists } from "../../../middlewares/roadmapExists";

router.post("/roadmaps", authRequired, roadmaps.create);

router.patch("/roadmaps", authRequired, roadmapExists, roadmaps.updateRoadmap);
router.patch("/roadmaps/sort", authRequired, roadmaps.sort);

router.delete("/roadmaps", authRequired, roadmapExists, roadmaps.deleteById);

export default router;
