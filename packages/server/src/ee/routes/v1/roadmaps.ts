// modules
import express from "express";
const router = express.Router();

// controller
import * as roadmaps from "../../controllers/v1/roadmaps";

// middleware
import * as middleware from "../../../middlewares";
import exists from "../../../middlewares/roadmapExists";

router.post("/roadmaps", middleware.apiAuth, roadmaps.create);

router.patch("/roadmaps", middleware.apiAuth, exists, roadmaps.updateRoadmap);
router.patch("/roadmaps/sort", middleware.apiAuth, roadmaps.sort);

router.delete("/roadmaps", middleware.apiAuth, exists, roadmaps.deleteById);

export default router;
