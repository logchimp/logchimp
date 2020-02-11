// modules
const express = require("express");
const router = express.Router();

// requiring all routes
const auth = require("./auth");
const posts = require("./posts");
const voters = require("./voters");

router.use("/api/v1", auth);
router.use("/api/v1", posts);
router.use("/api/v1", voters);

module.exports = router;
