// modules
import express from "express";
const router = express.Router();

// requiring all routes
import auth from "./auth";
import posts from "./posts";
import votes from "./votes";
import users from "./users";
import settings from "./settings";

import roadmaps from "./roadmaps";

// EE routes
import eeRoadmaps from "../../ee/routes/v1/roadmaps";
import boards from "../../ee/routes/v1/boards";
import roles from "../../ee/routes/v1/roles";
// import permissions from "../../ee/routes/v1/permissions";

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

export default router;
