// modules
const express = require("express");
const router = express.Router();

// controller
const roadmaps = require("../../controllers/roadmaps");

router.get("/roadmaps", roadmaps.filter);

module.exports = router;
