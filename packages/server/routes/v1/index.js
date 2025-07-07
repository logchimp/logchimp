// modules
const express = require("express");
const router = express.Router();

// requiring all routes
const auth = require("./auth");
const posts = require("./posts");
const votes = require("./votes");
const users = require("./users");
const settings = require("./settings");

const roadmaps = require("./roadmaps");

// EE routes
const eeRoadmaps = require("./../../ee/routes/v1/roadmaps");
const boards = require("../../ee/routes/v1/boards");
const roles = require("../../ee/routes/v1/roles");
// const permissions = require("../../ee/routes/v1/permissions");

router.use(
  "/api/v1",
  auth,
  posts,
  votes,
  users,
  settings,
  roadmaps,

  // EE
  boards,
  eeRoadmaps,
  roles,
);

module.exports = router;
