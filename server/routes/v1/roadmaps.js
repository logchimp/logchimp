// modules
const express = require("express");
const router = express.Router();

// controller
const roadmaps = require("../../controllers/roadmaps");

// middleware
const middleware = require("../../middlewares");
router.get("/roadmaps", roadmaps.filter);

router.post("/roadmaps", middleware.apiAuth, roadmaps.create);

router.patch("/roadmaps/sort", middleware.apiAuth, roadmaps.sort);

module.exports = router;
