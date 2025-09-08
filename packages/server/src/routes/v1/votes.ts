// modules
import express from "express";
const router = express.Router();

// controller
import * as votes from "../../controllers/votes";

// middleware
import { authRequired } from "../../middlewares/auth";

router.post("/votes", authRequired, votes.add);
router.delete("/votes", authRequired, votes.remove);

export default router;
