// modules
const express = require("express");
const router = express.Router();

// controller
const roadmaps = require("../../controllers/v1/roadmaps");

// middleware
const middleware = require("../../../middlewares");
const exists = require("../../../middlewares/roadmapExists");

router.post("/roadmaps", middleware.apiAuth, roadmaps.create);

router.patch("/roadmaps", middleware.apiAuth, exists, roadmaps.updateRoadmap);
router.patch("/roadmaps/sort", middleware.apiAuth, roadmaps.sort);

router.delete("/roadmaps", middleware.apiAuth, exists, roadmaps.deleteById);

module.exports = router;
