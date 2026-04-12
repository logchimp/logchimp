import express from "express";

import auth from "./auth";
import posts from "./posts";
import roadmaps from "./roadmaps";
import boards from "./boards";
import roles from "./roles";
import license from "./license";
import votes from "./votes";

const router = express.Router();

router.use(auth);
router.use(posts);
router.use(roadmaps);
router.use(boards);
router.use(roles);
router.use(license);
router.use(votes);

export default router;
