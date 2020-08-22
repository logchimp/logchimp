// modules
const express = require("express");
const router = express.Router();

// requiring all routes
const auth = require("./auth");
const posts = require("./posts");
const user = require("./user");

router.use("/api/v1", auth);
router.use("/api/v1", posts);
router.use("/api/v1", user);

module.exports = router;
