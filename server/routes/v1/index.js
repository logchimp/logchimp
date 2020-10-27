// modules
const express = require("express");
const router = express.Router();

// requiring all routes
const auth = require("./auth");
const posts = require("./posts");
const votes = require("./votes");
const users = require("./users");
const boards = require("./boards");
const settings = require("./settings");

router.use("/api/v1", auth, posts, votes, users, boards, settings);

module.exports = router;
