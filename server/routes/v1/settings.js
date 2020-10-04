// modules
const express = require("express");
const router = express.Router();

// controller
const settings = require("../../controllers/settings");

router.get("/site", settings.siteSettings);

module.exports = router;
