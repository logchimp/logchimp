// modules
import express from "express";
const router = express.Router();

// requiring all routes
import auth from "./auth";
import posts from "./posts";
import votes from "./votes";
import users from "./users";
import settings from "./settings";

// EE routes
import eePosts from "../../ee/routes/v1/posts";
import roadmaps from "../../ee/routes/v1/roadmaps";
import boards from "../../ee/routes/v1/boards";
import roles from "../../ee/routes/v1/roles";
import license from "../../ee/routes/v1/license";
// import permissions from "../../ee/routes/v1/permissions";

router.use(
  "/api/v1",
  auth,
  posts,
  votes,
  users,
  settings,

  // EE
  eePosts,
  boards,
  roadmaps,
  roles,
  license,
);

export default router;
