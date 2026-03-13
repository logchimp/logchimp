import express from "express";

import posts from "./posts";
import roadmaps from "./roadmaps";
import boards from "./boards";
import roles from "./roles";
import license from "./license";

const router = express.Router();

router.use(posts);
router.use(roadmaps);
router.use(boards);
router.use(roles);
router.use(license);

export default router;
