// modules
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// requiring all routes
const auth = require("./auth");
const posts = require("./posts");
const votes = require("./votes");
const users = require("./users");
const boards = require("./boards");
const settings = require("./settings");

router.use("/api/v1", auth);
router.use("/api/v1", posts);
router.use("/api/v1", votes);
router.use("/api/v1", users);
router.use("/api/v1", boards);
router.use("/api/v1", settings);

// content
router.use("/content/images", (req, res) => {
	fs.readFile(
		path.join(__dirname, "../../../content/images") + req.url,
		(err, data) => {
			if (err) {
				res.sendStatus(404);
			}
			if (data) {
				res.writeHead(200);
				res.end(data);
			}
		}
	);
});

router.get("/api", (req, res) => {
	res.send("👍");
});

module.exports = router;
