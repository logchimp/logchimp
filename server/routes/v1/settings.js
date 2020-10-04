// modules
const express = require("express");
const router = express.Router();

// controller
const settings = require("../../controllers/settings");

// middleware
const token = require("../../middlewares/token");

router.get("/settings/site", settings.siteSettings);
router.patch("/settings/site", token, settings.update);

module.exports = router;
