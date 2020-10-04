// modules
const express = require("express");
const router = express.Router();

// controller
const settings = require("../../controllers/settings");

// middleware
const token = require("../../middlewares/token");

router.get("/site", settings.siteSettings);
router.patch("/site", token, settings.update);

module.exports = router;
