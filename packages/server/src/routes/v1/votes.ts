// modules
import express from "express";
const router = express.Router();

// controller
import * as votes from "../../controllers/votes";

// middleware
import { authRequired } from "../../middlewares/auth";
import { postExists } from "../../middlewares/postExists";

router.post("/votes", authRequired, postExists, votes.add);
router.delete("/votes", authRequired, postExists, votes.remove);

export default router;
