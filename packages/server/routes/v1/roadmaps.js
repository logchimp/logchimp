// modules
const express = require("express");
const router = express.Router();

// controller
const roadmaps = require("../../controllers/roadmaps");

// middleware
const middleware = require("../../middlewares");
const exists = require("../../middlewares/roadmapExists");

router.get("/roadmaps", roadmaps.filter);
router.get("/roadmaps/:url", exists, roadmaps.roadmapByUrl);
router.get(
  "/roadmaps/search/:name",
  middleware.apiAuth,
  roadmaps.searchRoadmap,
);

router.post("/roadmaps", middleware.apiAuth, roadmaps.create);

router.patch("/roadmaps", middleware.apiAuth, exists, roadmaps.updateRoadmap);
router.patch("/roadmaps/sort", middleware.apiAuth, roadmaps.sort);

router.delete("/roadmaps", middleware.apiAuth, exists, roadmaps.deleteById);

module.exports = router;
