// modules
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

// requiring all routes
const auth = require("./auth");
const posts = require("./posts");
const votes = require("./votes");
const users = require("./users");
const boards = require("./boards");
const settings = require("./settings");

const serveImages = require("../../controllers/serveImages");

router.use("/api/v1", auth);
router.use("/api/v1", posts);
router.use("/api/v1", votes);
router.use("/api/v1", users);
router.use("/api/v1", boards);
router.use("/api/v1", settings);

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

module.exports = router;
