// modules
const express = require("express");
const router = express.Router();

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

module.exports = router;
