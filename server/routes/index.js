// modules
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// controller
const serveImages = require("../controllers/serveImages");

// v1 APIs
const v1 = require("./v1");

// server images
/**
 * limit rate limit for 15 minutes
 * each IP to 100 requests per windowMs
 */
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100
});
router.use("/content/images", limiter, serveImages);

router.get("/api", (req, res) => {
	res.send("👍");
});

router.use("/api/v1", v1);

module.exports = router;
